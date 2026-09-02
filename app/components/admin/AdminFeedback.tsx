"use client";

import { useEffect, useState } from "react";
import {
    Bug,
    Lightbulb,
    Clock,
    CheckCircle2,
    CircleDot,
    Loader2,
    XCircle,
    Trash2,
    MessageSquare,
} from "lucide-react";

interface Feedback {
    _id: string;
    type: "bug" | "suggestion";
    title: string;
    description?: string;
    steps?: string;
    suggestion?: string;
    benefit?: string;
    status: "open" | "in_progress" | "resolved" | "closed";
    createdAt: string;
}

const STATUS_STYLES = {
    open: {
        label: "Open",
        bg: "bg-blue-50",
        color: "text-blue-600",
        icon: CircleDot,
    },
    in_progress: {
        label: "In Progress",
        bg: "bg-amber-50",
        color: "text-amber-600",
        icon: Loader2,
    },
    resolved: {
        label: "Resolved",
        bg: "bg-emerald-50",
        color: "text-emerald-600",
        icon: CheckCircle2,
    },
    closed: {
        label: "Closed",
        bg: "bg-slate-100",
        color: "text-slate-500",
        icon: XCircle,
    },
};

export default function AdminFeedback() {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    async function fetchFeedback() {
        try {
            const res = await fetch("/api/feedback");
            const json = await res.json();

            if (json.success) {
                setFeedback(json.feedback);
            }
        } catch (err) {
            console.error("Failed to load feedback:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchFeedback();
    }, []);

    const bugs = feedback.filter(
        (item) => item.type === "bug"
    ).length;

    const suggestions = feedback.filter(
        (item) => item.type === "suggestion"
    ).length;

    const open = feedback.filter(
        (item) => item.status === "open"
    ).length;

    async function deleteFeedback(id: string) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this feedback?"
        );

        if (!confirmed) return;

        try {
            setDeleting(id);

            const response = await fetch("/api/feedback", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to delete feedback"
                );
            }

            setFeedback((current) =>
                current.filter((item) => item._id !== id)
            );
        } catch (error) {
            console.error(error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to delete feedback"
            );
        } finally {
            setDeleting(null);
        }
    }

    async function deleteByType(
        type: "bug" | "suggestion"
    ) {
        const count =
            type === "bug"
                ? bugs
                : suggestions;

        if (count === 0) return;

        const label =
            type === "bug"
                ? "bug reports"
                : "suggestions";

        const confirmed = window.confirm(
            `Are you sure you want to delete all ${count} ${label}? This cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setDeleting(`all-${type}`);

            const response = await fetch("/api/feedback", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ type }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    `Failed to delete ${label}`
                );
            }

            setFeedback((current) =>
                current.filter((item) => item.type !== type)
            );
        } catch (error) {
            console.error(error);

            alert(
                error instanceof Error
                    ? error.message
                    : `Failed to delete ${label}`
            );
        } finally {
            setDeleting(null);
        }
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-400">
                                Total Feedback
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {loading
                                    ? "—"
                                    : feedback.length}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-100/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-400">
                                Bug Reports
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {loading ? "—" : bugs}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <Bug className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-100/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-400">
                                Suggestions
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {loading
                                    ? "—"
                                    : suggestions}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <Lightbulb className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback */}
            <div className="rounded-2xl border border-slate-100/80 bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            User Feedback
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Bugs and suggestions submitted by users.
                        </p>
                    </div>

                    {/* Delete buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                deleteByType("bug")
                            }
                            disabled={
                                bugs === 0 ||
                                deleting !== null
                            }
                            className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Trash2 className="h-3.5 w-3.5" />

                            Delete Bugs
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                deleteByType("suggestion")
                            }
                            disabled={
                                suggestions === 0 ||
                                deleting !== null
                            }
                            className="flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-600 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Trash2 className="h-3.5 w-3.5" />

                            Delete Suggestions
                        </button>
                    </div>
                </div>

                <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Clock className="h-4 w-4" />

                    {loading
                        ? "Loading..."
                        : `${open} open`}
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map(
                            (_, i) => (
                                <div
                                    key={i}
                                    className="flex animate-pulse items-center gap-4 rounded-xl border border-slate-100 p-4"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-slate-100" />

                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-1/3 rounded bg-slate-100" />

                                        <div className="h-2.5 w-2/3 rounded bg-slate-100" />
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                ) : feedback.length === 0 ? (
                    <div className="py-12 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                            <MessageSquare className="h-5 w-5" />
                        </div>

                        <p className="mt-3 text-sm font-medium text-slate-600">
                            No feedback yet
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            User feedback will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {feedback.map((item) => {
                            const status =
                                STATUS_STYLES[
                                item.status
                                ] ??
                                STATUS_STYLES.open;

                            const StatusIcon =
                                status.icon;

                            const isBug =
                                item.type === "bug";

                            return (
                                <div
                                    key={item._id}
                                    className="rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 hover:shadow-sm"
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isBug
                                                    ? "bg-red-50 text-red-600"
                                                    : "bg-violet-50 text-violet-600"
                                                }`}
                                        >
                                            {isBug ? (
                                                <Bug className="h-5 w-5" />
                                            ) : (
                                                <Lightbulb className="h-5 w-5" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${isBug
                                                            ? "bg-red-50 text-red-600"
                                                            : "bg-violet-50 text-violet-600"
                                                        }`}
                                                >
                                                    {isBug
                                                        ? "Bug Report"
                                                        : "Suggestion"}
                                                </span>

                                                <span
                                                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.bg} ${status.color}`}
                                                >
                                                    <StatusIcon className="h-3 w-3" />

                                                    {status.label}
                                                </span>
                                            </div>

                                            <h4 className="mt-2 text-sm font-bold text-slate-900">
                                                {item.title}
                                            </h4>

                                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                                {isBug
                                                    ? item.description
                                                    : item.suggestion}
                                            </p>

                                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                                                <span className="text-[11px] text-slate-400">
                                                    {new Date(
                                                        item.createdAt
                                                    ).toLocaleString()}
                                                </span>

                                                {isBug &&
                                                    item.steps && (
                                                        <span className="text-[11px] font-medium text-slate-400">
                                                            Steps to reproduce
                                                            included
                                                        </span>
                                                    )}

                                                {!isBug &&
                                                    item.benefit && (
                                                        <span className="text-[11px] font-medium text-slate-400">
                                                            Benefit provided
                                                        </span>
                                                    )}
                                            </div>
                                        </div>

                                        {/* Delete one */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteFeedback(
                                                    item._id
                                                )
                                            }
                                            disabled={
                                                deleting !== null
                                            }
                                            title="Delete feedback"
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}