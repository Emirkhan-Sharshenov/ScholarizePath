export type ApplicationStatus =
    | "not_started"
    | "in_progress"
    | "submitted"
    | "waiting"
    | "accepted"
    | "rejected";

export interface TrackedApplication {
    _id: string;
    itemType: "university" | "scholarship";
    itemId: string;
    itemName: string;
    itemSubtitle?: string | null;
    status: ApplicationStatus;
    deadline?: string | null;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface StatusColumn {
    id: ApplicationStatus;
    label: string;
    dotClass: string;
    /** Filled chip for the selected status tab on phones. */
    activeClass: string;
}

export const STATUS_COLUMNS: StatusColumn[] = [
    { id: "not_started", label: "Not started", dotClass: "bg-slate-400", activeClass: "bg-slate-600 text-white" },
    { id: "in_progress", label: "In progress", dotClass: "bg-blue-500", activeClass: "bg-brand text-white" },
    { id: "submitted", label: "Submitted", dotClass: "bg-indigo-500", activeClass: "bg-indigo-600 text-white" },
    { id: "waiting", label: "Waiting", dotClass: "bg-amber-500", activeClass: "bg-amber-500 text-white" },
    { id: "accepted", label: "Accepted", dotClass: "bg-emerald-500", activeClass: "bg-emerald-600 text-white" },
    { id: "rejected", label: "Rejected", dotClass: "bg-rose-500", activeClass: "bg-rose-600 text-white" },
];

/** Statuses where a deadline still matters — once submitted, it's no longer "due". */
export const OPEN_STATUSES: ApplicationStatus[] = ["not_started", "in_progress"];

// Deadlines are stored as UTC midnight of the chosen day, so both helpers work
// on the UTC calendar date — local time would shift it by a day west of UTC.
const utcDay = (dateStr?: string | null): string | null => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

export function daysUntil(dateStr?: string | null): number | null {
    const day = utcDay(dateStr);
    if (!day) return null;
    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((new Date(day).getTime() - today) / 86_400_000);
}

export function formatDeadline(dateStr?: string | null): string {
    const day = utcDay(dateStr);
    if (!day) return "";
    return new Date(day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** "YYYY-MM-DD" for an <input type="date">. */
export const toDateInput = (dateStr?: string | null): string => utcDay(dateStr) ?? "";

export function deadlineChip(application: Pick<TrackedApplication, "deadline" | "status">): { label: string; className: string } {
    const days = daysUntil(application.deadline);
    if (days === null) return { label: "No deadline", className: "bg-slate-100 text-slate-500" };
    const date = formatDeadline(application.deadline);
    if (!OPEN_STATUSES.includes(application.status)) return { label: `Deadline ${date}`, className: "bg-slate-100 text-slate-500" };
    if (days < 0) return { label: `Overdue by ${-days} day${days === -1 ? "" : "s"}`, className: "bg-rose-50 text-rose-600" };
    if (days === 0) return { label: "Due today", className: "bg-red-50 text-red-600" };
    if (days <= 7) return { label: `Due in ${days} day${days === 1 ? "" : "s"}`, className: "bg-red-50 text-red-600" };
    return { label: `Due ${date}`, className: "bg-blue-50 text-brand" };
}

export function isDueSoon(application: TrackedApplication): boolean {
    const days = daysUntil(application.deadline);
    return days !== null && days >= 0 && days <= 7 && OPEN_STATUSES.includes(application.status);
}
