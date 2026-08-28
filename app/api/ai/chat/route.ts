import { NextRequest, NextResponse } from "next/server";
import { groq, AI_MODEL } from "@/lib/groq";
import { aiTools, searchUniversities, searchScholarships } from "@/lib/ai/tools";
import { authMiddleware } from "@/middleware/auth.middleware";
import { checkRateLimit } from "@/lib/simpleRateLimit";
import type { AuthRequest } from "@/types/auth";
import type {
    StudentProfile,
    ChatMessage,
    AIChatResponse,
    ScholarshipCardData,
    UniversityCardData,
} from "@/lib/ai/types";

export const runtime = "nodejs";

const MAX_HISTORY_MESSAGES = 12; // keep token usage/cost bounded on long chats
const MAX_TOOL_TURNS = 4;
const MAX_TRANSIENT_RETRIES = 2;

// Каждый вызов делает до нескольких запросов к платному Groq API —
// без лимита и без обязательной авторизации кто угодно мог бы
// написать скрипт и спамить этот эндпоинт, сжигая бюджет.
const CHAT_RATE_LIMIT = 15; // сообщений
const CHAT_RATE_WINDOW_MS = 60 * 1000; // за 1 минуту, на юзера

const FALLBACK_RESPONSE: AIChatResponse = {
    reply:
        "Sorry, something went wrong while looking that up. Please try again in a moment, or rephrase your question.",
    scholarships: [],
    universities: [],
};

// Safety net: strip stray markdown the model might add (links, bullets).
function sanitizeReply(reply: string): string {
    return reply
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
        .replace(/^[\s]*(?:[-*•]|\d+\.)\s+/gm, "")
        .trim();
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
    const seen = new Set<string>();
    return items.filter((item) => {
        if (!item?.id || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });
}

async function getStudentProfile(baseUrl: string, cookie?: string): Promise<StudentProfile | null> {
    try {
        const res = await fetch(`${baseUrl}/api/auth/self`, {
            headers: cookie ? { cookie } : undefined,
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data && typeof data === "object" ? data : null;
    } catch {
        return null; // unauthenticated / timed out / malformed — proceed without a profile
    }
}

function buildSystemPrompt(profile: StudentProfile | null) {
    const profileSummary = profile
        ? `Student profile (background context ONLY — see rule 2 below for how to use it):\n${JSON.stringify(profile, null, 2)}`
        : "No student profile is available. Just answer based on what the student asks.";

    return `You are an AI study-abroad advisor embedded in a scholarships/universities platform.

${profileSummary}

You have two tools that query the platform's LIVE database:
- search_universities
- search_scholarships

Rules:
1. Never invent universities or scholarships — always call a tool before recommending anything specific.
2. The student's CURRENT MESSAGE is what drives your search — always search for exactly what
   they're asking right now (country, field, level, budget, etc. as stated in the message).
   Do NOT silently filter or narrow results using their stored profile preferences instead of
   what they typed — e.g. if they ask for "top universities in the USA," search the USA even
   if their profile says they prefer Canada. Only fall back to the profile to fill in details
   the student's message leaves unspecified (e.g. they just say "find me scholarships" with no
   other detail) — and even then, treat it as a soft default, not a hard filter: if it returns
   nothing, drop it and search more broadly rather than reporting no results.
3. Call tools as many times as needed (different filters, both tools) but stop once you have enough good matches.
4. If a search with a country/degree filter returns nothing, don't give up — retry with a
   broader query (e.g. drop the country filter, or just search by field/keyword) before
   concluding there are no matches. Only tell the student nothing was found after trying at
   least one broader search.
5. For "top" or "best" requests, ask for more results (limit 8-10) so there's a real list to show.
6. When the student mentions multiple distinct topics/fields (e.g. "art or computer science"),
   search separately for each one (e.g. one call with query "computer science", another with
   query "art") rather than combining them into a single query string — this finds matches for
   each topic instead of requiring both words to appear together.
7. Write a genuinely helpful, warm reply (2-4 sentences) in plain text — no markdown syntax
   (no [text](url) links, no #/*, no numbered or bulleted lines). You CAN mention what stands
   out (e.g. "a couple of these are fully funded", "one is ranked in the global top 20", a
   country or field pattern you noticed) — just don't turn it into a list of every single
   name/amount, since the full detail is already shown right below in the result cards. Think
   "a knowledgeable friend giving you the highlights," not "a legal disclaimer."`;
}

function isTransientGroqError(err: any): boolean {
    const status = err?.status;
    return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function isToolValidationError(err: any): boolean {
    return err?.status === 400 && err?.error?.error?.code === "tool_use_failed";
}

async function withRetries<T>(fn: () => Promise<T>, retries = MAX_TRANSIENT_RETRIES): Promise<T> {
    let lastErr: any;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            if (!isTransientGroqError(err) || attempt === retries) throw err;
            await new Promise((r) => setTimeout(r, 400 * (attempt + 1))); // small backoff
        }
    }
    throw lastErr;
}

export async function POST(req: NextRequest) {
    try {
        // Раньше этот эндпоинт был доступен без логина вообще —
        // getStudentProfile() просто тихо возвращал null для анонимов,
        // но сам чат при этом отрабатывал и тратил токены Groq.
        // Теперь AI-бот доступен только залогиненным пользователям.
        const auth = await authMiddleware(req as AuthRequest);
        if (auth instanceof NextResponse) {
            return auth;
        }
        if (!auth) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }
        const userId = auth;

        const { allowed } = checkRateLimit(userId, CHAT_RATE_LIMIT, CHAT_RATE_WINDOW_MS);
        if (!allowed) {
            return NextResponse.json(
                { success: false, message: "Too many messages — please slow down and try again in a minute." },
                { status: 429 }
            );
        }

        let body: { message?: string; history?: ChatMessage[] };
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const message = typeof body.message === "string" ? body.message.trim() : "";
        if (!message) {
            return NextResponse.json({ error: "message is required" }, { status: 400 });
        }

        const rawHistory = Array.isArray(body.history) ? body.history : [];
        const history = rawHistory
            .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
            .slice(-MAX_HISTORY_MESSAGES);

        const baseUrl = req.nextUrl.origin;
        const cookie = req.headers.get("cookie") ?? undefined;

        const profile = await getStudentProfile(baseUrl, cookie);

        const messages: any[] = [
            { role: "system", content: buildSystemPrompt(profile) },
            ...history.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: message },
        ];

        // ---- Tool-calling loop ----
        // Results are collected here directly from tool executions, never
        // reconstructed by the model afterward — that's what makes the cards
        // reliable even if the model's own summarization is imperfect.
        const foundScholarships: ScholarshipCardData[] = [];
        const foundUniversities: UniversityCardData[] = [];

        for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
            let completion;
            try {
                completion = await withRetries(() =>
                    groq.chat.completions.create({
                        model: AI_MODEL,
                        messages,
                        tools: aiTools as any,
                        tool_choice: "auto",
                        temperature: 0.4,
                    })
                );
            } catch (err: any) {
                if (isToolValidationError(err)) {
                    // Model sent badly-typed arguments — ask it to retry with correct types.
                    messages.push({
                        role: "user",
                        content:
                            "Your last tool call had invalid argument types (e.g. a number field sent as a string, or a malformed value). Retry the same search with correctly typed arguments.",
                    });
                    continue;
                }
                // Any other error (auth, quota, persistent 5xx) — stop researching,
                // fall through to whatever we've already found (possibly nothing).
                console.error("[ai/chat] Groq completion failed:", err?.message ?? err);
                break;
            }

            const choice = completion.choices[0]?.message;
            if (!choice) break;
            messages.push(choice as any);

            if (!choice.tool_calls || choice.tool_calls.length === 0) {
                break; // model is done researching
            }

            for (const call of choice.tool_calls) {
                let args: Record<string, unknown> = {};
                try {
                    args = JSON.parse(call.function.arguments || "{}");
                } catch {
                    args = {};
                }

                let result: unknown;
                try {
                    if (call.function.name === "search_universities") {
                        const unis = await searchUniversities(args as any, baseUrl, cookie);
                        foundUniversities.push(...unis);
                        result = unis;
                    } else if (call.function.name === "search_scholarships") {
                        const scholarships = await searchScholarships(args as any, baseUrl, cookie);
                        foundScholarships.push(...scholarships);
                        result = scholarships;
                    } else {
                        result = { error: `Unknown tool ${call.function.name}` };
                    }
                } catch (err: any) {
                    console.error(`[ai/chat] Tool ${call.function.name} failed:`, err?.message ?? err);
                    result = { error: "This search is temporarily unavailable. Try a different query." };
                }

                messages.push({
                    role: "tool",
                    tool_call_id: call.id,
                    content: JSON.stringify(result),
                });
            }
        }

        const scholarships = dedupeById(foundScholarships).slice(0, 8);
        const universities = dedupeById(foundUniversities).slice(0, 8);

        // ---- Final reply: plain text only ----
        let reply = "Here's what I found — check the recommendations panel!";
        try {
            const finalCompletion = await withRetries(() =>
                groq.chat.completions.create({
                    model: AI_MODEL,
                    temperature: 0.5,
                    messages: [
                        ...messages,
                        {
                            role: "user",
                            content: `Write your final reply to the student now: 2-4 warm, genuinely helpful
plain-text sentences — no markdown (no links, no lists). ${scholarships.length === 0 && universities.length === 0
                                    ? "No matches were found in the database even after broadening the search — say so honestly, and suggest 1-2 concrete ways they could adjust their request (different country, broader field, etc.)."
                                    : `You found ${scholarships.length} scholarship(s) and ${universities.length} university match(es) — feel free to mention what's notable about them (fully-funded options, strong rankings, a good fit for their field/budget, etc.) without listing every single name, since the cards below already show full details.`
                                }`,
                        },
                    ],
                })
            );
            const content = finalCompletion.choices[0]?.message?.content;
            if (content) reply = sanitizeReply(content);
        } catch (err: any) {
            console.error("[ai/chat] Final reply generation failed:", err?.message ?? err);
            reply =
                scholarships.length || universities.length
                    ? "I found some matches for you — take a look at the recommendations panel!"
                    : "I couldn't complete that search right now — please try again in a moment.";
        }

        const response: AIChatResponse = { reply, scholarships, universities };
        return NextResponse.json(response);
    } catch (err: any) {
        // Absolute last resort — never let an uncaught error surface as a raw 500
        // with no usable body, since the frontend can't gracefully handle that.
        console.error("[ai/chat] Unhandled error:", err?.message ?? err);
        return NextResponse.json(FALLBACK_RESPONSE, { status: 200 });
    }
}