// Per-field verification of university data.
//
// A university document may carry
//   verification: { checkedAt, fields: { "<dotted.path>": { source: string[], checkedAt } } }
// written by scripts/db/import.mjs when a figure was confirmed against an
// official source. A check counts for 12 months; after that the figure is
// treated as unverified again (tuition, admissions stats etc. change yearly).

/** Figures shown on the university page that the "Verified" badge vouches for. */
export const KEY_FIELDS = [
    'ranking.global',
    'acceptanceRate',
    'students.total',
    'students.international',
    'tuition.bachelor',
    'tuition.master',
    'tuition.phd',
    'livingCostUSD.min',
    'livingCostUSD.max',
    'admissionRequirements.gpa.min',
    'admissionRequirements.ielts.min',
    'admissionRequirements.toefl.min',
    'admissionRequirements.sat.min',
    'website',
] as const;

export type KeyField = (typeof KEY_FIELDS)[number];

const VALIDITY_MS = 365 * 24 * 60 * 60 * 1000;
/** A badge needs at least this many confirmed figures — a record where
 *  everything is "No data" apart from its website shouldn't look vetted. */
const MIN_VERIFIED_FIGURES = 3;

interface FieldCheck {
    source?: string[];
    checkedAt?: string;
}

interface VerificationRecord {
    checkedAt?: string;
    fields?: Record<string, FieldCheck>;
}

const getPath = (doc: unknown, path: string): unknown =>
    path.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), doc);

const hasValue = (v: unknown) => v !== null && v !== undefined && v !== '' && v !== 'N/A';

const isFresh = (checkedAt?: string, now = Date.now()) => {
    if (!checkedAt) return false;
    const t = new Date(checkedAt).getTime();
    return !Number.isNaN(t) && now - t < VALIDITY_MS;
};

export interface VerificationState {
    /** Key fields confirmed within the last 12 months. */
    verified: Set<string>;
    /** True when every key figure shown on the page is confirmed (and there are enough of them). */
    isVerified: boolean;
    /** Date of the check, for the badge ("Verified · Sep 2026"). */
    checkedAt: string | null;
    /** Whether a given field has a value that is NOT confirmed — used for the "Unverified" hint. */
    isUnverified: (field: KeyField) => boolean;
}

export function getVerification(university: unknown): VerificationState {
    const record = getPath(university, 'verification') as VerificationRecord | undefined;
    const fields = record?.fields ?? {};

    const verified = new Set<string>(
        KEY_FIELDS.filter((f) => hasValue(getPath(university, f)) && isFresh(fields[f]?.checkedAt))
    );
    const shown = KEY_FIELDS.filter((f) => hasValue(getPath(university, f)));
    const figures = [...verified].filter((f) => f !== 'website');

    return {
        verified,
        isVerified: figures.length >= MIN_VERIFIED_FIGURES && shown.every((f) => verified.has(f)),
        checkedAt: record?.checkedAt ?? null,
        isUnverified: (field) => hasValue(getPath(university, field)) && !verified.has(field),
    };
}

export function formatCheckedAt(checkedAt: string | null, intlLocale = 'en-US'): string {
    if (!checkedAt) return '';
    const d = new Date(checkedAt);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(intlLocale, { month: 'short', year: 'numeric' });
}
