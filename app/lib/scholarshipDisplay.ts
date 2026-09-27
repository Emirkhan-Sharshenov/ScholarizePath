// Display helpers shared by the scholarship detail banner and the list cards.

/** Amount in the scholarship's own currency (€, HK$, CHF…), not always "$ USD". */
export function formatAmount(value: number, currency?: string | null): string {
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(value);
    } catch {
        return `${currency ?? ''} ${value.toLocaleString('en-US')}`.trim();
    }
}

// Only exact dates count — "2026-12-01 (varies by program)" or "2027-01-10 to
// 2027-02-20 (approximate)" are estimates and are shown as such, not as a deadline.
export const toIsoDate = (raw: unknown): string | null => {
    if (!raw) return null;
    if (typeof raw === 'string') return /^\d{4}-\d{2}-\d{2}$/.test(raw.trim()) ? raw.trim() : null;
    const d = new Date(raw as string | number | Date);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
};

export interface DeadlineInfo {
    /** Next upcoming deadline, or the most recent past one; null when none is known. */
    date: string | null;
    passed: boolean;
    daysLeft: number | null;
    /** Free-text estimate ("varies by university, typically Sept–Oct 2026") when no exact date exists. */
    approxText: string | null;
}

/** Whole days from today (UTC) to an ISO date; negative once it has passed. */
export function daysUntil(isoDate: string, now = new Date()): number {
    const today = now.toISOString().split('T')[0];
    return Math.round((new Date(isoDate).getTime() - new Date(today).getTime()) / 86_400_000);
}

/** Picks the deadline to show. "Application Opens"-style entries are not deadlines. */
export function getDeadlineInfo(deadlines: Array<{ name?: string; date?: unknown }> | undefined, now = new Date()): DeadlineInfo {
    const today = now.toISOString().split('T')[0];
    const dates = (deadlines ?? [])
        .filter((d) => !/open/i.test(d?.name ?? ''))
        .map((d) => toIsoDate(d?.date))
        .filter((d): d is string => Boolean(d))
        .sort();
    const date = dates.find((d) => d >= today) ?? dates[dates.length - 1] ?? null;
    if (!date) {
        const text = (deadlines ?? [])
            .filter((d) => !/open/i.test(d?.name ?? ''))
            .map((d) => d?.date)
            .find((d): d is string => typeof d === 'string' && d.trim() !== '');
        return { date: null, passed: false, daysLeft: null, approxText: text ?? null };
    }
    const passed = date < today;
    const daysLeft = passed ? null : Math.ceil((new Date(date).getTime() - new Date(today).getTime()) / 86_400_000);
    return { date, passed, daysLeft, approxText: null };
}
