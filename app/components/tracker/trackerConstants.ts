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
}

export interface StatusColumn {
    id: ApplicationStatus;
    label: string;
    dotClass: string;
}

export const STATUS_COLUMNS: StatusColumn[] = [
    { id: "not_started", label: "Not Started", dotClass: "bg-slate-400" },
    { id: "in_progress", label: "In Progress", dotClass: "bg-blue-500" },
    { id: "submitted", label: "Submitted", dotClass: "bg-indigo-500" },
    { id: "waiting", label: "Waiting", dotClass: "bg-amber-500" },
    { id: "accepted", label: "Accepted", dotClass: "bg-emerald-500" },
    { id: "rejected", label: "Rejected", dotClass: "bg-rose-500" },
];

export function daysUntil(dateStr?: string | null): number | null {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    if (Number.isNaN(target.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDeadline(dateStr?: string | null): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
