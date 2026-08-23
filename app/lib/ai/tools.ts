import { connectDB } from "@/lib/mongodb";
import Universities from "@/models/Universities";
import Scholarship from "@/models/Scholarship";
import type { UniversityCardData, ScholarshipCardData } from "./types";

// ---------------------------------------------------------------------------
// Tool schemas (OpenAI/Groq function-calling format).
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
                    country: { type: "string", description: "Filter by country, e.g. 'Canada', 'USA', 'UK'." },
                    degreeLevel: { type: "string", description: "e.g. 'Bachelor', 'Master', 'PhD'." },
                    maxTuitionUSD: {
                        type: ["number", "string"],
                        description: "Maximum yearly tuition in USD, as a plain number (e.g. 30000).",
                    },
                    limit: {
                        type: ["number", "string"],
                        description: "Max results to return, as a plain number (e.g. 5-10). Default 8.",
                    },
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
                    country: { type: "string", description: "e.g. 'Canada', 'USA', 'UK'." },
                    studyLevel: { type: "string", description: "e.g. \"Master's\", 'PhD', 'Undergraduate'." },
                    fieldOfStudy: { type: "string" },
                    fullyFundedOnly: { type: ["boolean", "string"], description: "true/false" },
                    limit: {
                        type: ["number", "string"],
                        description: "Max results to return, as a plain number (e.g. 5-10). Default 8.",
                    },
                },
            },
        },
    },
] as const;

// ---------------------------------------------------------------------------
// Defensive coercion helpers — the model doesn't always send the exact type
// declared in the schema (numbers as strings, booleans as "true"/"false",
// out-of-range limits, etc). None of these should ever throw.
// ---------------------------------------------------------------------------
function toNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === "") return undefined;
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : undefined;
}

function toBoolean(value: unknown): boolean | undefined {
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value === "boolean") return value;
    const s = String(value).trim().toLowerCase();
    if (["true", "yes", "1"].includes(s)) return true;
    if (["false", "no", "0"].includes(s)) return false;
    return undefined;
}

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

function resolvedLimit(value: unknown, fallback = 8) {
    const n = toNumber(value);
    return clamp(n ?? fallback, 1, 20);
}

// ---------------------------------------------------------------------------
// Text matching: OR-match on individual meaningful words, so multi-topic
// queries like "art or computer science" find EITHER field instead of
// requiring the literal phrase to appear.
// ---------------------------------------------------------------------------
const STOPWORDS = new Set([
    "a", "an", "the", "and", "or", "of", "in", "for", "to", "with", "on",
    "related", "study", "studies", "program", "programs", "degree", "field",
]);

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

function matchesText(haystack: string, needle?: string) {
    if (!needle) return true;
    const terms = tokenize(needle);
    if (terms.length === 0) return true;
    const lowerHaystack = haystack.toLowerCase();
    return terms.some((term) => lowerHaystack.includes(term));
}

// ---------------------------------------------------------------------------
// Country matching: normalize common aliases + bidirectional substring, so
// "USA"/"US"/"America" all match a DB value of "United States" and vice versa.
// ---------------------------------------------------------------------------
const COUNTRY_ALIASES: Record<string, string> = {
    usa: "united states",
    us: "united states",
    "u.s.": "united states",
    "u.s.a.": "united states",
    "united states of america": "united states",
    america: "united states",
    uk: "united kingdom",
    "u.k.": "united kingdom",
    england: "united kingdom",
    britain: "united kingdom",
    "great britain": "united kingdom",
    uae: "united arab emirates",
    "south korea": "korea",
    "republic of korea": "korea",
};

function normalizeCountry(c?: string): string | undefined {
    if (!c) return undefined;
    const lower = c.trim().toLowerCase();
    return COUNTRY_ALIASES[lower] ?? lower;
}

function countryMatches(dbCountry?: string, queryCountry?: string): boolean {
    if (!queryCountry) return true;
    if (!dbCountry) return true; // don't hide records with unknown country
    const a = normalizeCountry(dbCountry)!;
    const b = normalizeCountry(queryCountry)!;
    return a === b || a.includes(b) || b.includes(a);
}

// ---------------------------------------------------------------------------
// Degree/study level matching: normalize common variants ("Masters", "MS",
// "MSc", "Master's", "Graduate") to a canonical bucket, then match
// bidirectionally so either side can be the more specific string.
// ---------------------------------------------------------------------------
const LEVEL_ALIASES: Record<string, string> = {
    bachelor: "bachelor",
    bachelors: "bachelor",
    "bachelor's": "bachelor",
    undergrad: "bachelor",
    undergraduate: "bachelor",
    bs: "bachelor",
    ba: "bachelor",
    bsc: "bachelor",
    master: "master",
    masters: "master",
    "master's": "master",
    graduate: "master",
    postgraduate: "master",
    ms: "master",
    ma: "master",
    msc: "master",
    mba: "master",
    phd: "phd",
    "ph.d.": "phd",
    "ph.d": "phd",
    doctorate: "phd",
    doctoral: "phd",
};

function normalizeLevel(level: string): string {
    const cleaned = level.trim().toLowerCase().replace(/[.']/g, "");
    return LEVEL_ALIASES[cleaned] ?? LEVEL_ALIASES[level.trim().toLowerCase()] ?? cleaned;
}

function levelMatches(dbLevel: string, queryLevel: string): boolean {
    const a = normalizeLevel(dbLevel);
    const b = normalizeLevel(queryLevel);
    return a === b || a.includes(b) || b.includes(a);
}

function anyLevelMatches(dbLevels: unknown, queryLevel?: string): boolean {
    if (!queryLevel) return true;
    if (!Array.isArray(dbLevels) || dbLevels.length === 0) return true; // don't hide unknown data
    return dbLevels.some((d) => typeof d === "string" && levelMatches(d, queryLevel));
}

// ---------------------------------------------------------------------------
// searchUniversities — queries MongoDB directly instead of the paginated
// public API, so the AI's own matching logic (aliases, tokenized search)
// runs over the FULL dataset, not just one page of 5-50 results.
// ---------------------------------------------------------------------------
export async function searchUniversities(
    args: {
        query?: string;
        country?: string;
        degreeLevel?: string;
        maxTuitionUSD?: unknown;
        limit?: unknown;
    },
    _baseUrl: string,
    _cookie?: string
): Promise<UniversityCardData[]> {
    const maxTuitionUSD = toNumber(args.maxTuitionUSD);
    const limit = resolvedLimit(args.limit);

    await connectDB();

    // Slim projection — only fields this function actually reads. Keeps the
    // full-collection fetch cheap even at 1200+ documents.
    const list = await Universities.find()
        .select({
            name: 1,
            description: 1,
            programs: 1,
            searchKeywords: 1,
            location: 1,
            degreeLevels: 1,
            tuition: 1,
            ranking: 1,
        })
        .lean();

    const filtered = list.filter((u: any) => {
        if (!u || typeof u !== "object") return false;

        const programsText = Array.isArray(u.programs)
            ? u.programs.map((p: any) => (typeof p === "string" ? p : p?.name ?? "")).join(" ")
            : "";
        const text = `${u.name ?? ""} ${u.description ?? ""} ${programsText} ${(u.searchKeywords ?? []).join(" ")}`;
        if (!matchesText(text, args.query)) return false;

        if (!countryMatches(u.location?.country, args.country)) return false;

        if (args.degreeLevel && !anyLevelMatches(u.degreeLevels, args.degreeLevel)) return false;

        // Tuition field name varies by dataset — check the common variants
        // defensively rather than assuming one exact shape.
        const tuitionValue =
            toNumber(u.tuition?.internationalUSD) ??
            toNumber(u.tuition?.international) ??
            toNumber(u.tuition?.usdPerYear) ??
            toNumber(u.tuition?.yearly) ??
            toNumber(u.tuition?.bachelor);
        if (maxTuitionUSD !== undefined && tuitionValue !== undefined && tuitionValue > maxTuitionUSD) return false;

        return true;
    });

    // Sort by ranking when available so "top universities" surfaces the best first.
    filtered.sort((a: any, b: any) => {
        const rankA = toNumber(a?.ranking?.national) ?? toNumber(a?.ranking?.global) ?? Infinity;
        const rankB = toNumber(b?.ranking?.national) ?? toNumber(b?.ranking?.global) ?? Infinity;
        return rankA - rankB;
    });

    return filtered
        .filter((u: any) => u?._id && u?.name) // never surface a card we can't link/name
        .slice(0, limit)
        .map((u: any) => ({
            id: String(u._id),
            name: String(u.name),
            location: [u.location?.city, u.location?.country].filter(Boolean).join(", ") || "Location TBD",
            rankBadge: u.ranking?.national
                ? `#${u.ranking.national} in ${u.location?.country ?? ""}`
                : u.ranking?.global
                    ? `#${u.ranking.global} Global`
                    : "Ranked",
        }));
}

// ---------------------------------------------------------------------------
// searchScholarships — same direct-DB approach.
// ---------------------------------------------------------------------------
export async function searchScholarships(
    args: {
        query?: string;
        country?: string;
        studyLevel?: string;
        fieldOfStudy?: string;
        fullyFundedOnly?: unknown;
        limit?: unknown;
    },
    _baseUrl: string,
    _cookie?: string
): Promise<ScholarshipCardData[]> {
    const limit = resolvedLimit(args.limit);
    const fullyFundedOnly = toBoolean(args.fullyFundedOnly) ?? false;

    await connectDB();

    const list = await Scholarship.find()
        .select({
            scholarshipName: 1,
            description: 1,
            searchKeywords: 1,
            fieldOfStudy: 1,
            country: 1,
            studyLevel: 1,
            award: 1,
            isOpen: 1,
        })
        .lean();

    const filtered = list.filter((s: any) => {
        if (!s || typeof s !== "object") return false;

        const text = `${s.scholarshipName ?? ""} ${s.description ?? ""} ${(s.searchKeywords ?? []).join(" ")} ${s.fieldOfStudy ?? ""
            }`;
        if (!matchesText(text, args.query)) return false;

        if (!countryMatches(s.country, args.country)) return false;

        if (args.studyLevel && !anyLevelMatches(s.studyLevel, args.studyLevel)) return false;

        if (args.fieldOfStudy && s.fieldOfStudy && s.fieldOfStudy !== "All fields") {
            if (!matchesText(s.fieldOfStudy, args.fieldOfStudy)) return false;
        }

        if (fullyFundedOnly && s.award?.type !== "Fully Funded") return false;

        if (s.isOpen === false) return false;

        return true;
    });

    return filtered
        .filter((s: any) => s?._id && s?.scholarshipName)
        .slice(0, limit)
        .map((s: any) => {
            const val = s.award?.estimatedValue;
            const min = toNumber(val?.min);
            const max = toNumber(val?.max);
            const amount =
                val && min !== undefined && max !== undefined
                    ? `${val.currency ?? ""} ${min.toLocaleString()}–${max.toLocaleString()}`.trim()
                    : s.award?.type ?? "Amount varies";
            return {
                id: String(s._id),
                title: String(s.scholarshipName),
                amount,
                level: Array.isArray(s.studyLevel) ? s.studyLevel.join(", ") : s.studyLevel ?? "",
            };
        });
}