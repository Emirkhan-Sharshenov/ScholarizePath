/* eslint-disable @typescript-eslint/no-explicit-any -- university/scholarship documents are schemaless */
import { formatAmount } from '@/lib/scholarshipDisplay';

export type ProgramLevel = 'bachelor' | 'master' | 'phd';

export const LEVELS: [ProgramLevel, string][] = [['bachelor', 'Bachelor'], ['master', 'Master'], ['phd', 'PhD']];

export const DEFAULT_DURATION: Record<ProgramLevel, number> = {
    bachelor: 4,
    master: 2,
    phd: 4,
};

/** A search result or favourite in a picker. */
export interface PickerItem {
    id: string;
    name: string;
    subtitle?: string;
}

export interface UniversityCostDetail {
    id: string;
    name: string;
    location?: string;
    country?: string;
    currency: string;
    /** null = not published; 0 = genuinely free. */
    tuition: Record<ProgramLevel, number | null>;
    /** The figure in its original currency when tuition was converted to USD. */
    original?: { amount: number; currency: string; per?: string } | null;
    livingMin: number | null;
    livingMax: number | null;
}

export interface ScholarshipOffset {
    id: string;
    name: string;
    /** true / false when stated, null when the record doesn't say. */
    coversTuition: boolean | null;
    fundingType?: string | null;
    /** Award in its own currency, e.g. "CHF 1,920"; null when not on file. */
    amountText: string | null;
    currency?: string | null;
}

// `??`-style: 0 is a real value (free tuition), only null/undefined/NaN mean unknown.
const numOrNull = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null);

export function extractUniversityCostDetail(raw: any): UniversityCostDetail {
    const uni = raw?.university || raw;
    const original = uni?.tuition?.original;
    return {
        id: String(uni?._id ?? uni?.id ?? ''),
        name: uni?.name || 'University',
        location: [uni?.location?.city, uni?.location?.country].filter(Boolean).join(', ') || undefined,
        country: uni?.location?.country,
        currency: uni?.tuition?.currency || 'USD',
        tuition: {
            bachelor: numOrNull(uni?.tuition?.bachelor),
            master: numOrNull(uni?.tuition?.master),
            phd: numOrNull(uni?.tuition?.phd),
        },
        original: original?.amount && original?.currency ? { amount: original.amount, currency: original.currency, per: original.per } : null,
        livingMin: numOrNull(uni?.livingCostUSD?.min),
        livingMax: numOrNull(uni?.livingCostUSD?.max ?? uni?.livingCostUSD?.min),
    };
}

export function extractScholarshipOffset(raw: any): ScholarshipOffset {
    const sch = raw?.scholarship || raw;
    const v = sch?.award?.estimatedValue;
    const min = numOrNull(v?.min);
    const max = numOrNull(v?.max);
    const top = max ?? min;
    const amountText = top === null || top === 0
        ? null
        : min !== null && max !== null && min !== max
            ? `${formatAmount(min, v?.currency)} – ${formatAmount(max, v?.currency)}`
            : formatAmount(top, v?.currency);
    return {
        id: String(sch?._id ?? sch?.id ?? ''),
        name: sch?.scholarshipName || sch?.title || 'Scholarship',
        coversTuition: typeof sch?.award?.tuition === 'boolean' ? sch.award.tuition : null,
        fundingType: sch?.award?.type ?? null,
        amountText,
        currency: v?.currency ?? null,
    };
}
