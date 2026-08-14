
import { NextRequest, NextResponse } from "next/server";
import { groq, AI_MODEL } from "@/lib/groq";
import { aiTools, searchUniversities, searchScholarships } from "@/lib/ai/tools";
import type { StudentProfile, ChatMessage, AIChatResponse } from "@/lib/ai/types";

export const runtime = "nodejs";

async function getStudentProfile(baseUrl: string, cookie?: string): Promise<StudentProfile | null> {
    try {
        const res = await fetch(`${baseUrl}/api/auth/self`, {
            headers: cookie ? { cookie } : undefined,
            cache: "no-store",
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

function buildSystemPrompt(profile: StudentProfile | null) {
    const profileSummary = profile
        ? `Student profile (use this to personalize recommendations):\n${JSON.stringify(profile, null, 2)}`
        : "No student profile is available. Still try to help, but ask a clarifying question if the request is too vague.";

    return `You are an AI study-abroad advisor embedded in a scholarships/universities platform.
 
${profileSummary}
 
You have two tools that query the platform's LIVE database:
- search_universities
- search_scholarships
 
Rules:
1. Never invent universities or scholarships — always call a tool before recommending anything specific.
2. Prefer matches that fit the student's field of interest, target country, degree level, and budget when known.
3. Call tools as many times as needed (different filters, both tools) but stop once you have enough good matches.
4. Keep your final "reply" text short (2-4 sentences), warm, and specific to what the student asked.`;
}

export async function POST(req: NextRequest) {
    let body: { message?: string; history?: ChatMessage[] };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { message, history = [] } = body;
    if (!message || typeof message !== "string") {
        return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const baseUrl = req.nextUrl.origin;
    const cookie = req.headers.get("cookie") ?? undefined;

    const profile = await getStudentProfile(baseUrl, cookie);

    const messages: any[] = [
        { role: "system", content: buildSystemPrompt(profile) },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
    ];

    // ---- Tool-calling loop ----
    const MAX_TURNS = 4;
    for (let turn = 0; turn < MAX_TURNS; turn++) {
        const completion = await groq.chat.completions.create({
            model: AI_MODEL,
            messages,
            tools: aiTools as any,
            tool_choice: "auto",
            temperature: 0.4,
        });

        const choice = completion.choices[0].message;
        messages.push(choice as any);

        if (!choice.tool_calls || choice.tool_calls.length === 0) {
            break; // model is done researching, ready for a final answer
        }

        for (const call of choice.tool_calls) {
            const args = JSON.parse(call.function.arguments || "{}");
            let result: unknown;
            try {
                if (call.function.name === "search_universities") {
                    result = await searchUniversities(args, baseUrl, cookie);
                } else if (call.function.name === "search_scholarships") {
                    result = await searchScholarships(args, baseUrl, cookie);
                } else {
                    result = { error: `Unknown tool ${call.function.name}` };
                }
            } catch (err: any) {
                result = { error: err.message };
            }

            messages.push({
                role: "tool",
                tool_call_id: call.id,
                content: JSON.stringify(result),
            });
        }
    }

    // ---- Final structured answer, shaped for AIRecommendationsCard ----
    const finalCompletion = await groq.chat.completions.create({
        model: AI_MODEL,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
            ...messages,
            {
                role: "user",
                content: `Based on everything above, respond ONLY with JSON matching exactly this shape (no markdown fences, no extra keys):
{
  "reply": string,
  "scholarships": [{ "id": string, "title": string, "amount": string, "level": string }],
  "universities": [{ "id": string, "name": string, "location": string, "rankBadge": string }]
}
Use the real ids/titles/amounts found via the tools. If nothing relevant was found, return empty arrays and explain why in "reply".`,
            },
        ],
    });

    let parsed: AIChatResponse;
    try {
        parsed = JSON.parse(finalCompletion.choices[0].message.content ?? "{}");
    } catch {
        parsed = {
            reply: "Sorry, I had trouble putting that together — could you try rephrasing?",
            scholarships: [],
            universities: [],
        };
    }

    return NextResponse.json(parsed);
}