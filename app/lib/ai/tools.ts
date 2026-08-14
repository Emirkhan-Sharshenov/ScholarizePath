
import type { UniversityCardData, ScholarshipCardData } from "./types";

// ---------------------------------------------------------------------------
// Tool schemas (OpenAI/Groq function-calling format). Groq's model reads
// these to decide when and how to call search_universities / search_scholarships.
// ---------------------------------------------------------------------------
export const aiTools = [
    {
        type: "function",
        function: {
            name: "search_universities",
            description:
                "Search the platform's university database. Use whenever the student asks about universities, programs, majors, or where to study.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Free-text keywords: program name, university name, or subject.",
                    },
                    country: { type: "string", description: "Filter by country, e.g. 'Canada'." },
                    degreeLevel: { type: "string", description: "e.g. 'Bachelor', 'Master', 'PhD'." },
                    maxTuitionUSD: { type: "number", description: "Maximum yearly tuition in USD." },
                    limit: { type: "number", description: "Max results to return, default 5." },
                },
            },
        },
    },
    {
        type: "function",
        function: {
            name: "search_scholarships",
            description:
                "Search the platform's scholarship database. Use whenever the student asks about scholarships, funding, or financial aid.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Free-text keywords: field of study, scholarship name, country." },
                    country: { type: "string" },
                    studyLevel: { type: "string", description: "e.g. \"Master's\", 'PhD', 'Undergraduate'." },
                    fieldOfStudy: { type: "string" },
                    fullyFundedOnly: { type: "boolean" },
                    limit: { type: "number", description: "Max results to return, default 5." },
                },
            },
        },
    },
] as const;

// ---------------------------------------------------------------------------
// Tool implementations. These call your EXISTING /api/universities and
// /api/scholarships endpoints and filter in-memory, so nothing about those
// routes has to change. If your dataset grows large, replace the fetch +
// filter below with a real DB query (Mongo/Prisma) using the same args.
// ---------------------------------------------------------------------------
async function fetchJSON(url: string, cookie?: string) {
    const res = await fetch(url, {
        headers: cookie ? { cookie } : undefined,
        cache: "no-store",
    });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.json();
}

function matchesText(haystack: string, needle?: string) {
    if (!needle) return true;
    return haystack.toLowerCase().includes(needle.toLowerCase());
}

export async function searchUniversities(
    args: { query?: string; country?: string; degreeLevel?: string; maxTuitionUSD?: number; limit?: number },
    baseUrl: string,
    cookie?: string
): Promise<UniversityCardData[]> {
    const raw = await fetchJSON(`${baseUrl}/api/universities`, cookie);
    const list: any[] = Array.isArray(raw) ? raw : raw.universities ?? [];

    const filtered = list.filter((u) => {
        const text = `${u.name} ${u.description ?? ""} ${(u.searchKeywords ?? []).join(" ")}`;
        if (!matchesText(text, args.query)) return false;
        if (
            args.country &&
            u.location?.country &&
            u.location.country.toLowerCase() !== args.country.toLowerCase()
        )
            return false;
        if (
            args.degreeLevel &&
            Array.isArray(u.degreeLevels) &&
            !u.degreeLevels.some((d: string) => d.toLowerCase().includes(args.degreeLevel!.toLowerCase()))
        )
            return false;
        if (args.maxTuitionUSD && u.tuition?.internationalUSD && u.tuition.internationalUSD > args.maxTuitionUSD)
            return false;
        return true;
    });

    const limit = args.limit ?? 5;
    return filtered.slice(0, limit).map((u) => ({
        id: u._id,
        name: u.name,
        location: [u.location?.city, u.location?.country].filter(Boolean).join(", "),
        rankBadge: u.ranking?.national
            ? `#${u.ranking.national} in ${u.location?.country ?? ""}`
            : u.ranking?.global
                ? `#${u.ranking.global} Global`
                : "Ranked",
    }));
}

export async function searchScholarships(
    args: {
        query?: string;
        country?: string;
        studyLevel?: string;
        fieldOfStudy?: string;
        fullyFundedOnly?: boolean;
        limit?: number;
    },
    baseUrl: string,
    cookie?: string
): Promise<ScholarshipCardData[]> {
    const raw = await fetchJSON(`${baseUrl}/api/scholarships`, cookie);
    const list: any[] = Array.isArray(raw) ? raw : raw.scholarships ?? [];

    const filtered = list.filter((s) => {
        const text = `${s.scholarshipName} ${s.description ?? ""} ${(s.searchKeywords ?? []).join(" ")} ${s.fieldOfStudy ?? ""
            }`;
        if (!matchesText(text, args.query)) return false;
        if (args.country && s.country && s.country.toLowerCase() !== args.country.toLowerCase()) return false;
        if (
            args.studyLevel &&
            Array.isArray(s.studyLevel) &&
            !s.studyLevel.some((lvl: string) => lvl.toLowerCase().includes(args.studyLevel!.toLowerCase()))
        )
            return false;
        if (
            args.fieldOfStudy &&
            s.fieldOfStudy &&
            s.fieldOfStudy !== "All fields" &&
            !s.fieldOfStudy.toLowerCase().includes(args.fieldOfStudy.toLowerCase())
        )
            return false;
        if (args.fullyFundedOnly && s.award?.type !== "Fully Funded") return false;
        if (s.isOpen === false) return false;
        return true;
    });

    const limit = args.limit ?? 5;
    return filtered.slice(0, limit).map((s) => {
        const val = s.award?.estimatedValue;
        const amount = val
            ? `${val.currency} ${val.min?.toLocaleString()}–${val.max?.toLocaleString()}`
            : s.award?.type ?? "Amount varies";
        return {
            id: s._id,
            title: s.scholarshipName,
            amount,
            level: Array.isArray(s.studyLevel) ? s.studyLevel.join(", ") : s.studyLevel ?? "",
        };
    });
}