import "server-only";
import Scholarship from "@/models/Scholarship";
import Universities from "@/models/Universities";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import { MAX_DOCUMENTS, MAX_DOCUMENT_NAME, type ApplicationDocument } from "@/components/tracker/trackerConstants";

/**
 * Validates a checklist sent by the client. Returns null when it isn't a list
 * of { name, done } items; blank names are dropped and names are trimmed.
 */
export function cleanDocuments(raw: unknown): ApplicationDocument[] | null {
    if (!Array.isArray(raw) || raw.length > MAX_DOCUMENTS) return null;
    const documents: ApplicationDocument[] = [];
    for (const item of raw) {
        if (!item || typeof item.name !== "string" || typeof item.done !== "boolean") return null;
        const name = item.name.trim().slice(0, MAX_DOCUMENT_NAME);
        if (name) documents.push({ name, done: item.done });
    }
    return documents;
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

// The fields read here; the collections are schema-less, so anything may be missing.
interface ScholarshipDocs {
    requiredDocuments?: unknown;
}
interface UniversityRequirements {
    admissionRequirements?: {
        ielts?: { min?: unknown };
        toefl?: { min?: unknown };
        sat?: { min?: unknown; max?: unknown };
        otherExams?: unknown;
    };
}

/**
 * The checklist a new application starts with: a scholarship's own
 * requiredDocuments, or, for a university, what its admission requirements
 * ask for. Empty when the record lists nothing.
 */
export async function suggestedDocuments(
    itemType: "university" | "scholarship",
    itemId: string,
    locale: Locale
): Promise<ApplicationDocument[]> {
    const names: string[] = [];

    if (itemType === "scholarship") {
        const s = await Scholarship.findById(itemId).select({ requiredDocuments: 1 }).lean<ScholarshipDocs>();
        if (Array.isArray(s?.requiredDocuments)) {
            names.push(...s.requiredDocuments.filter((d: unknown): d is string => typeof d === "string"));
        }
    } else {
        const u = await Universities.findById(itemId).select({ admissionRequirements: 1 }).lean<UniversityRequirements>();
        const req = u?.admissionRequirements;
        if (u) {
            const m = getMessages(locale).tracker;
            names.push(m.docPassport, m.docTranscript);
            const ielts = num(req?.ielts?.min);
            const toefl = num(req?.toefl?.min);
            const tests = [ielts !== null && `IELTS ${ielts}+`, toefl !== null && `TOEFL ${toefl}+`].filter(Boolean).join(" / ");
            if (tests) names.push(m.docEnglish(tests));
            const satMin = num(req?.sat?.min);
            const satMax = num(req?.sat?.max);
            if (satMin !== null) names.push(m.docSat(satMax !== null ? `${satMin}–${satMax}` : `${satMin}+`));
            if (Array.isArray(req?.otherExams)) {
                names.push(...req.otherExams.filter((e: unknown): e is string => typeof e === "string"));
            }
        }
    }

    const seen = new Set<string>();
    return names
        .map((n) => n.trim().slice(0, MAX_DOCUMENT_NAME))
        .filter((n) => n && !seen.has(n.toLowerCase()) && seen.add(n.toLowerCase()))
        .slice(0, MAX_DOCUMENTS)
        .map((name) => ({ name, done: false }));
}
