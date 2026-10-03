import { connectDB } from "@/lib/mongodb";
import Universities from "@/models/Universities";
import Scholarship from "@/models/Scholarship";
import type { UniversityCardData, ScholarshipCardData } from "./types";
import { formatAmount, getDeadlineInfo } from "@/lib/scholarshipDisplay";

const ENGLISH_ARGS = "Always in English — translate the student's words (e.g. 'информатика' → 'computer science').";

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
                        description: `Free-text keywords: program name, university name, or subject. ${ENGLISH_ARGS}`,
                    },
                    country: { type: "string", description: "Filter by country in English, e.g. 'Canada', 'USA', 'UK'." },
                    degreeLevel: { type: "string", description: "'Bachelor', 'Master' or 'PhD'." },
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
                    query: { type: "string", description: `Free-text keywords: field of study, scholarship name, provider. ${ENGLISH_ARGS}` },
                    country: { type: "string", description: "Host country in English, e.g. 'Canada', 'USA', 'UK'." },
                    studyLevel: { type: "string", description: "\"Bachelor's\", \"Master's\" or 'PhD'." },
                    fieldOfStudy: { type: "string", description: ENGLISH_ARGS },
                    fullyFundedOnly: { type: ["boolean", "string"], description: "true/false" },
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
            name: "get_details",
            description:
                "Full details of ONE university or scholarship by its id (ids come from search results and from the cards already shown in this chat): requirements, required documents, deadlines, costs, programs, how to apply. Use it for follow-up questions about a specific item instead of guessing.",
            parameters: {
                type: "object",
                properties: {
                    kind: { type: "string", enum: ["university", "scholarship"] },
                    id: { type: "string" },
                },
                required: ["kind", "id"],
            },
        },
    },
] as const;

/** A search hit: the card shown in the UI plus the facts the model reasons over. */
export interface Hit<Card> {
    card: Card;
    facts: Record<string, unknown>;
}

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

const truncate = (s: unknown, max: number) => {
    const text = typeof s === "string" ? s.trim() : "";
    return text.length > max ? `${text.slice(0, max)}…` : text;
};

/** Drops empty values so the model isn't fed nulls and blank strings. */
function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) =>
            v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0) &&
            !(typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length === 0)
        )
    ) as Partial<T>;
}

const STOPWORDS = new Set([
    "a", "an", "the", "and", "or", "of", "in", "for", "to", "with", "on", "at", "by",
    "related", "study", "studies", "program", "programs", "degree", "field", "university", "universities",
    "scholarship", "scholarships",
]);

// Unicode-aware, so a query that slips through in Russian still searches by its words.
function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/**
 * How many query terms appear in the text. Short terms ("ai", "art", "law")
 * must match a whole word so "art" doesn't match "department"; longer ones
 * match inside words so "engineer" finds "engineering".
 */
function termMatches(haystack: string, terms: string[]): number {
    const lower = haystack.toLowerCase();
    const words = new Set(tokenize(lower));
    return terms.filter((t) => (t.length <= 3 ? words.has(t) : lower.includes(t))).length;
}

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
    scotland: "united kingdom",
    britain: "united kingdom",
    "great britain": "united kingdom",
    uae: "united arab emirates",
    "south korea": "korea",
    "republic of korea": "korea",
    holland: "netherlands",
    "the netherlands": "netherlands",
    czechia: "czech republic",
    türkiye: "turkey",
    turkiye: "turkey",
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

// ── Universities ────────────────────────────────────────────────────────────

const TUITION_LEVELS = ["bachelor", "master", "phd"] as const;
type TuitionLevel = (typeof TUITION_LEVELS)[number];

/** Yearly tuition for a degree level (or the first level on file), in `tuition.currency`. */
function tuitionFor(u: any, level?: string): { value: number; level?: TuitionLevel } | undefined {
    if (typeof u.tuition === "number") return { value: u.tuition };
    const wanted = level ? normalizeLevel(level) : undefined;
    const order = TUITION_LEVELS.filter((l) => l === wanted).concat(TUITION_LEVELS.filter((l) => l !== wanted));
    for (const l of order) {
        const value = toNumber(u.tuition?.[l]);
        if (value !== undefined) return { value, level: l };
    }
    return undefined;
}

function universityCard(u: any): UniversityCardData {
    return {
        id: String(u._id),
        name: String(u.name),
        location: [u.location?.city, u.location?.country].filter(Boolean).join(", "),
        country: u.location?.country ?? "",
        // World rank first; a national rank is labelled as such. Unranked → "".
        rankBadge: u.ranking?.global
            ? `World #${u.ranking.global}`
            : u.ranking?.national
                ? `National #${u.ranking.national}`
                : "",
    };
}

function universityFacts(u: any, degreeLevel?: string, terms: string[] = []) {
    const tuition = tuitionFor(u, degreeLevel);
    const currency = u.tuition?.currency || "USD";
    const programs: string[] = Array.isArray(u.programs)
        ? u.programs.map((p: any) => (typeof p === "string" ? p : p?.name ?? "")).filter(Boolean)
        : [];
    return compact({
        id: String(u._id),
        name: u.name,
        location: [u.location?.city, u.location?.country].filter(Boolean).join(", "),
        worldRank: toNumber(u.ranking?.global),
        nationalRank: toNumber(u.ranking?.national),
        tuitionPerYear: tuition
            ? `${tuition.value === 0 ? "free" : formatAmount(tuition.value, currency)}${tuition.level ? ` (${tuition.level})` : ""}`
            : undefined,
        acceptanceRate: toNumber(u.acceptanceRate) !== undefined ? `${u.acceptanceRate}%` : undefined,
        degreeLevels: Array.isArray(u.degreeLevels) ? u.degreeLevels : undefined,
        matchingPrograms: terms.length ? programs.filter((p) => termMatches(p, terms) > 0).slice(0, 5) : undefined,
    });
}

export async function searchUniversities(args: {
    query?: string;
    country?: string;
    degreeLevel?: string;
    maxTuitionUSD?: unknown;
    limit?: unknown;
}): Promise<Hit<UniversityCardData>[]> {
    const maxTuitionUSD = toNumber(args.maxTuitionUSD);
    const limit = resolvedLimit(args.limit);
    const terms = tokenize(args.query ?? "");

    await connectDB();

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
            acceptanceRate: 1,
        })
        .lean();

    const scored = list.flatMap((u: any) => {
        if (!u?._id || !u?.name) return [];

        const programsText = Array.isArray(u.programs)
            ? u.programs.map((p: any) => (typeof p === "string" ? p : p?.name ?? "")).join(" ")
            : "";
        const text = `${u.name ?? ""} ${u.description ?? ""} ${programsText} ${(u.searchKeywords ?? []).join(" ")}`;
        const score = terms.length ? termMatches(text, terms) : 0;
        if (terms.length && score === 0) return [];

        if (!countryMatches(u.location?.country, args.country)) return [];
        if (args.degreeLevel && !anyLevelMatches(u.degreeLevels, args.degreeLevel)) return [];

        // Tuition is stored converted to `tuition.currency` (USD for almost all records).
        const tuition = tuitionFor(u, args.degreeLevel);
        const inUSD = !u.tuition?.currency || u.tuition.currency === "USD";
        if (maxTuitionUSD !== undefined && tuition && inUSD && tuition.value > maxTuitionUSD) return [];

        return [{ u, score }];
    });

    // Most query terms matched first, then world rank, then national rank.
    const rank = (u: any) => [toNumber(u.ranking?.global) ?? Infinity, toNumber(u.ranking?.national) ?? Infinity];
    scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const [ga, na] = rank(a.u);
        const [gb, nb] = rank(b.u);
        return ga !== gb ? ga - gb : na - nb;
    });

    return scored.slice(0, limit).map(({ u }) => ({
        card: universityCard(u),
        facts: universityFacts(u, args.degreeLevel, terms),
    }));
}

// ── Scholarships ───────────────────────────────────────────────────────────

function scholarshipAmount(s: any): string {
    const val = s.award?.estimatedValue;
    const min = toNumber(val?.min);
    const max = toNumber(val?.max);
    const top = max ?? min;
    if (top === undefined || top <= 0) return "";
    return min !== undefined && max !== undefined && min !== max
        ? `${formatAmount(min, val?.currency)} – ${formatAmount(max, val?.currency)}`
        : formatAmount(top, val?.currency);
}

function scholarshipCard(s: any): ScholarshipCardData {
    return {
        id: String(s._id),
        title: String(s.scholarshipName),
        amount: scholarshipAmount(s),
        level: Array.isArray(s.studyLevel) ? s.studyLevel.join(", ") : s.studyLevel ?? "",
        country: s.country ?? "",
    };
}

function deadlineFact(s: any) {
    const info = getDeadlineInfo(s.deadlines);
    if (info.date && !info.passed) return `${info.date} (${info.daysLeft} days left)`;
    if (info.date && info.passed) return `${info.date} (passed — next round not announced yet)`;
    return info.approxText ? `approximately: ${info.approxText}` : undefined;
}

const COVERS = ["tuition", "stipend", "travel", "insurance", "arrivalAllowance"] as const;

function scholarshipFacts(s: any) {
    return compact({
        id: String(s._id),
        name: s.scholarshipName,
        provider: s.provider?.name ?? s.fundingOrganization,
        country: s.country,
        studyLevels: s.studyLevel,
        fieldOfStudy: s.fieldOfStudy,
        funding: s.award?.type,
        covers: COVERS.filter((c) => s.award?.[c] === true),
        amount: scholarshipAmount(s) || undefined,
        deadline: deadlineFact(s),
    });
}

export async function searchScholarships(args: {
    query?: string;
    country?: string;
    studyLevel?: string;
    fieldOfStudy?: string;
    fullyFundedOnly?: unknown;
    limit?: unknown;
}): Promise<Hit<ScholarshipCardData>[]> {
    const limit = resolvedLimit(args.limit);
    const fullyFundedOnly = toBoolean(args.fullyFundedOnly) ?? false;
    const terms = tokenize(args.query ?? "");
    const fieldTerms = tokenize(args.fieldOfStudy ?? "");

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
            deadlines: 1,
            provider: 1,
            fundingOrganization: 1,
        })
        .lean();

    const today = new Date().toISOString().split("T")[0];

    const scored = list.flatMap((s: any) => {
        if (!s?._id || !s?.scholarshipName || s.isOpen === false) return [];

        const text = `${s.scholarshipName ?? ""} ${s.description ?? ""} ${(s.searchKeywords ?? []).join(" ")} ${s.fieldOfStudy ?? ""} ${s.provider?.name ?? ""}`;
        const score = terms.length ? termMatches(text, terms) : 0;
        if (terms.length && score === 0) return [];

        if (!countryMatches(s.country, args.country)) return [];
        if (args.studyLevel && !anyLevelMatches(s.studyLevel, args.studyLevel)) return [];
        if (fieldTerms.length && s.fieldOfStudy && !/all fields/i.test(s.fieldOfStudy) && termMatches(s.fieldOfStudy, fieldTerms) === 0) {
            return [];
        }
        if (fullyFundedOnly && !/fully/i.test(s.award?.type ?? "")) return [];

        const deadline = getDeadlineInfo(s.deadlines);
        // Upcoming exact deadlines first (soonest first), then estimates, then passed ones.
        const urgency = deadline.date && !deadline.passed ? 0 : deadline.passed ? 2 : 1;
        return [{ s, score, urgency, date: deadline.date ?? today }];
    });

    scored.sort((a, b) => b.score - a.score || a.urgency - b.urgency || a.date.localeCompare(b.date));

    return scored.slice(0, limit).map(({ s }) => ({ card: scholarshipCard(s), facts: scholarshipFacts(s) }));
}

// ── Details ────────────────────────────────────────────────────────────────

export type DetailsResult =
    | { kind: "university"; card: UniversityCardData; facts: Record<string, unknown> }
    | { kind: "scholarship"; card: ScholarshipCardData; facts: Record<string, unknown> }
    | null;

export async function getDetails(args: { kind?: string; id?: string }): Promise<DetailsResult> {
    const id = typeof args.id === "string" ? args.id.trim() : "";
    if (!id || id.length > 100) return null;

    await connectDB();

    if (args.kind === "university") {
        const u: any = await Universities.findById(id).lean();
        if (!u?.name) return null;
        const req = u.admissionRequirements ?? {};
        const currency = u.tuition?.currency || "USD";
        const money = (v: unknown) => {
            const n = toNumber(v);
            return n === undefined ? undefined : n === 0 ? "free" : formatAmount(n, currency);
        };
        return {
            kind: "university",
            card: universityCard(u),
            facts: compact({
                ...universityFacts(u),
                type: [u.type, u.institutionType].filter(Boolean).join(" "),
                description: truncate(u.description, 600),
                tuitionPerYear: compact({ bachelor: money(u.tuition?.bachelor), master: money(u.tuition?.master), phd: money(u.tuition?.phd) }),
                livingCostPerYearUSD:
                    toNumber(u.livingCostUSD?.min) !== undefined ? `${u.livingCostUSD.min}–${u.livingCostUSD.max ?? u.livingCostUSD.min}` : undefined,
                students: compact({ total: toNumber(u.students?.total), international: toNumber(u.students?.international) }),
                languagesOfInstruction: u.languages,
                admissionRequirements: compact({
                    gpaMin: toNumber(req.gpa?.min) !== undefined ? `${req.gpa.min} / ${req.gpa?.scale ?? 4}` : undefined,
                    ieltsMin: toNumber(req.ielts?.min),
                    toeflMin: toNumber(req.toefl?.min),
                    satRange: toNumber(req.sat?.min) !== undefined ? [req.sat.min, req.sat?.max].filter(Boolean).join("–") : undefined,
                    otherExams: req.otherExams,
                }),
                applicationDeadlines: Array.isArray(u.applicationDeadlines) ? u.applicationDeadlines.slice(0, 6) : undefined,
                programs: Array.isArray(u.programs)
                    ? u.programs.map((p: any) => (typeof p === "string" ? p : p?.name)).filter(Boolean).slice(0, 40)
                    : undefined,
                website: u.website,
                applicationLink: u.applicationLink,
            }),
        };
    }

    if (args.kind === "scholarship") {
        const s: any = await Scholarship.findById(id).lean();
        if (!s?.scholarshipName) return null;
        return {
            kind: "scholarship",
            card: scholarshipCard(s),
            facts: compact({
                ...scholarshipFacts(s),
                description: truncate(s.description, 800),
                allDeadlines: Array.isArray(s.deadlines) ? s.deadlines.slice(0, 6) : undefined,
                requirements: s.requirements,
                requiredDocuments: s.requiredDocuments,
                applicationProcess: s.applicationProcess,
                duration: s.duration,
                intake: s.intake,
                officialWebsite: s.officialWebsite,
                applicationLink: s.applicationLink,
            }),
        };
    }

    return null;
}
