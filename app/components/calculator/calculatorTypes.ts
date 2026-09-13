export interface UniversitySummary {
    id: string;
    name: string;
    location?: string;
}

export interface UniversityCostDetail {
    id: string;
    name: string;
    location?: string;
    tuitionBachelor: number;
    tuitionMaster: number;
    livingMin: number;
    livingMax: number;
}

export interface ScholarshipOffset {
    id: string;
    name: string;
    coversTuition: boolean;
    estimatedMin: number;
    estimatedMax: number;
}

export type ProgramLevel = 'bachelor' | 'master';

export const DEFAULT_DURATION: Record<ProgramLevel, number> = {
    bachelor: 4,
    master: 2,
};

function pickNumber(...values: unknown[]): number {
    for (const v of values) {
        if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v;
    }
    return 0;
}

export function extractUniversityCostDetail(raw: any): UniversityCostDetail {
    const uni = raw?.university || raw;
    const location = uni?.location
        ? [uni.location.city, uni.location.country].filter(Boolean).join(', ')
        : undefined;

    return {
        id: uni?._id || uni?.id,
        name: uni?.name || 'University',
        location,
        tuitionBachelor: pickNumber(uni?.tuition?.bachelor, uni?.tuition_fee, typeof uni?.tuition === 'number' ? uni.tuition : undefined),
        tuitionMaster: pickNumber(uni?.tuition?.master, uni?.tuition?.bachelor, uni?.tuition_fee),
        livingMin: pickNumber(uni?.livingCostUSD?.min, uni?.living_cost_min),
        livingMax: pickNumber(uni?.livingCostUSD?.max, uni?.living_cost_max, uni?.livingCostUSD?.min, uni?.living_cost_min),
    };
}

export function extractScholarshipOffset(raw: any): ScholarshipOffset {
    const sch = raw?.scholarship || raw;
    return {
        id: sch?._id || sch?.id,
        name: sch?.scholarshipName || sch?.title || 'Scholarship',
        coversTuition: Boolean(sch?.award?.tuition),
        estimatedMin: pickNumber(sch?.award?.estimatedValue?.min),
        estimatedMax: pickNumber(sch?.award?.estimatedValue?.max, sch?.award?.estimatedValue?.min),
    };
}
