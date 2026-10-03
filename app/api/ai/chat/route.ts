import { getLocale } from "@/i18n/server";
import type { Locale } from "@/i18n/config";
import { NextRequest, NextResponse } from "next/server";
import { groq, AI_MODEL } from "@/lib/groq";
import { aiTools, getDetails, searchUniversities, searchScholarships } from "@/lib/ai/tools";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/Users";
import { authMiddleware } from "@/middleware/auth.middleware";
import { checkRateLimit } from "@/lib/simpleRateLimit";
import type { AuthRequest } from "@/types/auth";
import type {
    StudentProfile,
    ChatMessage,
    ShownItem,
    AIChatResponse,
    ScholarshipCardData,
    UniversityCardData,
} from "@/lib/ai/types";

export const runtime = "nodejs";

const MAX_HISTORY_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 1000; // same as the chat input's maxLength
const MAX_HISTORY_CHARS = 4000;
const MAX_SHOWN_PER_MESSAGE = 12;
const MAX_TOOL_TURNS = 5;
const MAX_TRANSIENT_RETRIES = 2;

const CHAT_RATE_LIMIT = 8;
const CHAT_RATE_WINDOW_MS = 60 * 1000;

const CHAT_DAILY_LIMIT = 3;
const CHAT_DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;

const FALLBACK_REPLY: Record<Locale, { found: string }> = {
    en: { found: "I found some matches for you — take a look at the cards below." },
    ru: { found: "Я нашёл несколько вариантов — посмотрите карточки ниже." },
};

/** Keeps **bold** and "- " lists (the chat renders them); drops links, headings and tables. */
function sanitizeReply(reply: string): string {
    return reply
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^\s*\|.*\|\s*$/gm, "")
        .replace(/^(\s*)[*•]\s+/gm, "$1- ")
        .replace(/\n{3,}/g, "\n\n")
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

async function getStudentProfile(userId: string): Promise<StudentProfile | null> {
    try {
        await connectDB();
        const user: any = await User.findById(userId).select({ firstName: 1, profile: 1 }).lean();
        if (!user) return null;
        const p = user.profile ?? {};
        const profile: StudentProfile = {
            firstName: user.firstName || undefined,
            nationality: p.nationality || undefined,
            age: p.age ?? undefined,
            gpa: p.gpa ?? undefined,
            sat: p.sat ?? undefined,
            englishTest: p.englishTest?.type && p.englishTest?.score != null ? { type: p.englishTest.type, score: p.englishTest.score } : undefined,
            preferredField: p.preferredField || undefined,
            preferredCountry: p.preferredCountry || undefined,
            programLevel: p.programLevel || undefined,
        };
        return profile;
    } catch {
        return null;
    }
}

function describeProfile(p: StudentProfile | null): string {
    const lines = p
        ? [
            p.firstName && `- Name: ${p.firstName}`,
            p.nationality && `- Nationality: ${p.nationality}`,
            p.age && `- Age: ${p.age}`,
            p.programLevel && `- Wants to study at: ${p.programLevel} level`,
            p.preferredField && `- Field of interest: ${p.preferredField}`,
            p.preferredCountry && `- Preferred country: ${p.preferredCountry}`,
            p.gpa && `- GPA: ${p.gpa} / 4.0`,
            p.sat && `- SAT: ${p.sat}`,
            p.englishTest && `- English test: ${p.englishTest.type} ${p.englishTest.score}`,
        ].filter(Boolean)
        : [];
    return lines.length
        ? `Student profile (soft defaults only — see rule 2):\n${lines.join("\n")}`
        : "The student hasn't filled in a profile. Work from what they ask.";
}

function buildSystemPrompt(profile: StudentProfile | null, locale: Locale) {
    const today = new Date().toISOString().split("T")[0];
    const language = locale === "ru"
        ? "Reply in Russian — it's the student's interface language — unless the student clearly writes in another language; then reply in that language."
        : "Reply in the language the student writes in.";

    return `You are the study-abroad advisor on ScholarizePath, a platform with a database of universities and scholarships. Today is ${today}.

${describeProfile(profile)}

Tools (the platform's live database): search_universities, search_scholarships, get_details.

How to work:
1. Never invent universities, scholarships, amounts, deadlines or requirements. Recommend specific ones only from tool results, and call get_details before answering detailed questions about one.
2. The student's CURRENT message drives the search: search for exactly what they ask (country, field, level, budget). Use the profile only to fill gaps the message leaves open, as a soft default — if that returns nothing, drop it and search more broadly. Never override what they typed with profile preferences.
3. Tool arguments are always in English, whatever language the student writes in.
4. If a filtered search returns nothing, retry with a broader one (drop the country or level, simpler keywords) before saying nothing was found.
5. Different topics or fields in one message ("art or computer science") get separate searches.
6. For "top"/"best" requests ask for 8-10 results.
7. Follow-ups about items shown earlier ("the second one", "tell me more about Chevening", "what documents do I need for it") refer to the cards listed in the conversation — use their ids with get_details.
8. General questions (language tests, documents, motivation letters, visas, timelines, how admissions work) don't need a search — answer from general knowledge and mention that exact requirements vary by program.
9. A deadline is upcoming only if the result says days are left; never present a passed deadline as open.
10. If the request is too vague to search (e.g. just "help me"), ask one short clarifying question — unless the profile fills the gaps, then search first and ask afterwards.

Reply style:
- Warm and direct, like a knowledgeable friend. No filler, no repeated greetings, no disclaimers beyond what's useful.
- After a search: 2-4 sentences with the highlights — fully funded options, the soonest deadline, strong rankings, how it fits their profile. Don't list every result: cards with full details are shown right below your reply.
- Explanations and detail answers: up to about 180 words. You may use short "- " bullet lists and **bold** for key facts. No headings, tables or markdown links; an official website may be given as a plain URL.
- ${language}`;
}

function shownNote(shown: ShownItem[] | undefined): string {
    if (!shown?.length) return "";
    const list = shown.map((s) => `${s.kind} "${s.name}" (id: ${s.id})`).join("; ");
    return `\n\n[Cards shown with this reply: ${list}]`;
}

function cleanShown(raw: unknown): ShownItem[] | undefined {
    if (!Array.isArray(raw)) return undefined;
    return raw
        .filter((s): s is ShownItem =>
            s && (s.kind === "university" || s.kind === "scholarship") &&
            typeof s.id === "string" && s.id.length <= 100 &&
            typeof s.name === "string" && s.name.length <= 200
        )
        .slice(0, MAX_SHOWN_PER_MESSAGE);
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
        const userId = auth.userId;

        // Validate before touching the limits, so a malformed request doesn't use up a question.
        let body: { message?: string; history?: ChatMessage[] };
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE_CHARS) : "";
        if (!message) {
            return NextResponse.json({ error: "message is required" }, { status: 400 });
        }

        const { allowed } = await checkRateLimit(`chat:minute:${userId}`, CHAT_RATE_LIMIT, CHAT_RATE_WINDOW_MS);
        if (!allowed) {
            return NextResponse.json(
                { success: false, message: "Too many messages — please slow down and try again in a minute." },
                { status: 429 }
            );
        }

        const { allowed: dailyAllowed, remaining: dailyRemaining } = await checkRateLimit(
            `chat:daily:${userId}`,
            CHAT_DAILY_LIMIT,
            CHAT_DAILY_WINDOW_MS
        );
        if (!dailyAllowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You've reached your daily limit of AI messages. Please come back tomorrow.",
                },
                { status: 429, headers: { "X-RateLimit-Daily-Remaining": "0" } }
            );
        }

        const rawHistory = Array.isArray(body.history) ? body.history : [];
        const history = rawHistory
            .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
            .slice(-MAX_HISTORY_MESSAGES)
            .map((m) =>
                m.role === "user"
                    ? { role: "user", content: m.content.slice(0, MAX_MESSAGE_CHARS) }
                    : { role: "assistant", content: m.content.slice(0, MAX_HISTORY_CHARS) + shownNote(cleanShown(m.shown)) }
            );

        const locale = await getLocale();
        const profile = await getStudentProfile(userId);

        const messages: any[] = [
            { role: "system", content: buildSystemPrompt(profile, locale) },
            ...history,
            { role: "user", content: message },
        ];

        const foundScholarships: ScholarshipCardData[] = [];
        const foundUniversities: UniversityCardData[] = [];
        let reply = "";
        let usedTools = false;
        let modelFailed = false;

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
                    messages.push({
                        role: "user",
                        content:
                            "Your last tool call had invalid argument types (e.g. a number field sent as a string, or a malformed value). Retry the same search with correctly typed arguments.",
                    });
                    continue;
                }
                console.error("[ai/chat] Groq completion failed:", err?.message ?? err);
                modelFailed = true;
                break;
            }

            const choice = completion.choices[0]?.message;
            if (!choice) break;
            messages.push(choice as any);

            // No tool calls means this is the answer — no second round-trip needed.
            if (!choice.tool_calls || choice.tool_calls.length === 0) {
                reply = choice.content ?? "";
                break;
            }
            usedTools = true;

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
                        const hits = await searchUniversities(args as any);
                        foundUniversities.push(...hits.map((h) => h.card));
                        result = hits.length ? { results: hits.map((h) => h.facts) } : { results: [], note: "No matches. Try broader filters." };
                    } else if (call.function.name === "search_scholarships") {
                        const hits = await searchScholarships(args as any);
                        foundScholarships.push(...hits.map((h) => h.card));
                        result = hits.length ? { results: hits.map((h) => h.facts) } : { results: [], note: "No matches. Try broader filters." };
                    } else if (call.function.name === "get_details") {
                        const details = await getDetails(args as any);
                        if (details?.kind === "university") foundUniversities.push(details.card);
                        if (details?.kind === "scholarship") foundScholarships.push(details.card);
                        result = details ? details.facts : { error: "Not found. Search for it by name instead." };
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

        // The loop ran out of turns (or the model returned no text) — ask for the answer explicitly.
        if (!reply.trim() && !modelFailed) {
            const found = scholarships.length + universities.length;
            try {
                const finalCompletion = await withRetries(() =>
                    groq.chat.completions.create({
                        model: AI_MODEL,
                        temperature: 0.5,
                        messages: [
                            ...messages,
                            {
                                role: "user",
                                content: `Write your reply to the student now, following the reply style. ${usedTools && found === 0
                                    ? "Nothing matched in the database even after broadening — say so honestly and suggest 1-2 concrete ways to adjust the request."
                                    : found > 0
                                        ? `You found ${scholarships.length} scholarship(s) and ${universities.length} university match(es); the cards are shown below your reply.`
                                        : ""
                                    }`,
                            },
                        ],
                    })
                );
                reply = finalCompletion.choices[0]?.message?.content ?? "";
            } catch (err: any) {
                console.error("[ai/chat] Final reply generation failed:", err?.message ?? err);
            }
        }

        reply = sanitizeReply(reply);
        if (!reply) {
            // Show the cards if there are any; otherwise let the chat offer a retry.
            if (scholarships.length + universities.length === 0) {
                return NextResponse.json({ success: false, message: "The AI advisor is unavailable right now." }, { status: 503 });
            }
            reply = FALLBACK_REPLY[locale].found;
        }

        const response: AIChatResponse = { reply, scholarships, universities };
        return NextResponse.json(response, {
            headers: {
                "X-RateLimit-Daily-Limit": String(CHAT_DAILY_LIMIT),
                "X-RateLimit-Daily-Remaining": String(dailyRemaining),
            },
        });
    } catch (err: any) {
        console.error("[ai/chat] Unhandled error:", err?.message ?? err);
        return NextResponse.json({ success: false, message: "The AI advisor is unavailable right now." }, { status: 500 });
    }
}
