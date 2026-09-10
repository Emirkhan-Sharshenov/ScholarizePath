import { NextRequest, NextResponse } from "next/server";

import { groq, AI_MODEL } from "@/lib/groq";
import { authMiddleware } from "@/middleware/auth.middleware";
import { checkRateLimit } from "@/lib/simpleRateLimit";
import { connectDB } from "@/lib/mongodb";
import Scholarships from "@/models/Scholarship";
import Users from "@/models/Users";
import type { AuthRequest } from "@/types/auth";

export const runtime = "nodejs";

const MAX_TRANSIENT_RETRIES = 2;

const ELIGIBILITY_MINUTE_LIMIT = 5;
const ELIGIBILITY_MINUTE_WINDOW_MS = 60 * 1000;

const ELIGIBILITY_DAILY_LIMIT = 20;
const ELIGIBILITY_DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;

type CriterionStatus = "match" | "partial" | "mismatch";
type Verdict = "high" | "moderate" | "low";

interface EligibilityExplanation {
    verdict: Verdict;
    summary: string;
    criteria: Array<{ label: string; status: CriterionStatus; explanation: string }>;
}

function isTransientGroqError(err: unknown): boolean {
    const status = (err as { status?: number } | null)?.status;
    return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

async function withRetries<T>(fn: () => Promise<T>, retries = MAX_TRANSIENT_RETRIES): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            if (!isTransientGroqError(err) || attempt === retries) throw err;
            await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        }
    }
    throw lastErr;
}

function buildSystemPrompt(): string {
    return `You are an eligibility-assessment assistant for ScholarizePath, a scholarship discovery platform.

You will be given a scholarship's eligibility requirements and a student's profile, both as JSON.
Assess ONLY the criteria that are actually present in the requirements — never invent a criterion
that isn't listed, and never assume something is required when it wasn't specified.

Respond with ONLY a JSON object matching exactly this schema, no prose outside the JSON:
{
  "verdict": "high" | "moderate" | "low",
  "summary": "1-2 sentence plain-language overall verdict",
  "criteria": [
    { "label": string, "status": "match" | "partial" | "mismatch", "explanation": string }
  ]
}

Rules:
- One "criteria" entry per requirement field actually present (gpa, age, language, education.minimumDegree,
  and each item in "other" if present).
- "status": "match" if the student's data clearly satisfies the requirement, "mismatch" if it clearly
  doesn't, "partial" if the student's profile is missing the relevant data or it's a genuinely close call.
- Be specific in "explanation" (max ~20 words) — cite the actual numbers/values you compared, e.g.
  "Your GPA 3.4 meets the 3.0 minimum."
- Never fabricate scholarship requirements or student data beyond what is given below.`;
}

function isValidExplanation(value: unknown): value is EligibilityExplanation {
    if (!value || typeof value !== "object") return false;
    const v = value as Record<string, unknown>;

    if (v.verdict !== "high" && v.verdict !== "moderate" && v.verdict !== "low") return false;
    if (typeof v.summary !== "string") return false;
    if (!Array.isArray(v.criteria)) return false;

    return v.criteria.every((c) => {
        if (!c || typeof c !== "object") return false;
        const criterion = c as Record<string, unknown>;
        return (
            typeof criterion.label === "string" &&
            typeof criterion.status === "string" &&
            ["match", "partial", "mismatch"].includes(criterion.status) &&
            typeof criterion.explanation === "string"
        );
    });
}

export async function POST(req: NextRequest) {
    try {
        const auth = await authMiddleware(req as AuthRequest);
        if (auth instanceof NextResponse) return auth;
        if (!auth) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const userId = auth.userId;

        const { allowed: dailyAllowed } = await checkRateLimit(
            `eligibility:daily:${userId}`,
            ELIGIBILITY_DAILY_LIMIT,
            ELIGIBILITY_DAILY_WINDOW_MS
        );
        if (!dailyAllowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You've reached your daily limit of AI eligibility checks. Please come back tomorrow.",
                },
                { status: 429 }
            );
        }

        const { allowed: minuteAllowed } = await checkRateLimit(
            `eligibility:minute:${userId}`,
            ELIGIBILITY_MINUTE_LIMIT,
            ELIGIBILITY_MINUTE_WINDOW_MS
        );
        if (!minuteAllowed) {
            return NextResponse.json(
                { success: false, message: "Too many requests — please slow down and try again in a minute." },
                { status: 429 }
            );
        }

        let body: { scholarshipId?: string };
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
        }

        const scholarshipId = typeof body.scholarshipId === "string" ? body.scholarshipId.trim() : "";
        if (!scholarshipId) {
            return NextResponse.json(
                { success: false, message: "scholarshipId is required" },
                { status: 400 }
            );
        }

        await connectDB();

        const [scholarship, user] = await Promise.all([
            Scholarships.findById(scholarshipId, {
                scholarshipName: 1,
                country: 1,
                requirements: 1,
            }).lean<Record<string, unknown>>(),
            Users.findById(userId, { profile: 1 }).lean<Record<string, unknown>>(),
        ]);

        if (!scholarship) {
            return NextResponse.json(
                { success: false, message: "Scholarship not found" },
                { status: 404 }
            );
        }

        const userMessage = JSON.stringify(
            {
                scholarship: {
                    name: scholarship.scholarshipName,
                    country: scholarship.country,
                    requirements: scholarship.requirements || {},
                },
                studentProfile: user?.profile || {},
            },
            null,
            2
        );

        let completion;
        try {
            completion = await withRetries(() =>
                groq.chat.completions.create({
                    model: AI_MODEL,
                    temperature: 0.3,
                    response_format: { type: "json_object" },
                    messages: [
                        { role: "system", content: buildSystemPrompt() },
                        { role: "user", content: userMessage },
                    ],
                })
            );
        } catch (err) {
            const message = err instanceof Error ? err.message : err;
            console.error("[ai/eligibility] Groq completion failed:", message);
            return NextResponse.json(
                { success: false, message: "Couldn't generate an explanation right now. Please try again." },
                { status: 500 }
            );
        }

        const content = completion.choices[0]?.message?.content;
        let parsed: unknown;
        try {
            parsed = content ? JSON.parse(content) : null;
        } catch {
            parsed = null;
        }

        if (!isValidExplanation(parsed)) {
            console.error("[ai/eligibility] Model returned an unexpected shape:", content);
            return NextResponse.json(
                { success: false, message: "Couldn't generate an explanation right now. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, ...parsed });
    } catch (err) {
        const message = err instanceof Error ? err.message : err;
        console.error("[ai/eligibility] Unhandled error:", message);
        return NextResponse.json(
            { success: false, message: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
