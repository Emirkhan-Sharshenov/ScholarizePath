"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Bug, CheckCircle2, ChevronDown, CircleDot, Lightbulb, Loader2, MessageSquare, Trash2, XCircle } from "lucide-react";

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

type Filter = "all" | "bug" | "suggestion";

const STATUS_STYLES = {
    open: { label: "Open", className: "bg-blue-50 text-brand", icon: CircleDot },
    in_progress: { label: "In progress", className: "bg-amber-50 text-amber-700", icon: Loader2 },
    resolved: { label: "Resolved", className: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
    closed: { label: "Closed", className: "bg-slate-100 text-slate-500", icon: XCircle },
};

async function deleteRequest(body: { id: string } | { type: "bug" | "suggestion" }) {
    const res = await fetch("/api/feedback", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.message || "Failed to delete feedback");
}

export default function AdminFeedback() {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("all");
    const [expanded, setExpanded] = useState<string | null>(null);
    // Id of a single item, or "all-bug" / "all-suggestion", awaiting confirmation or being deleted.
    const [confirming, setConfirming] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/feedback");
                const json = await res.json();
                if (json.success) setFeedback(json.feedback);
            } catch (err) {
                console.error("Failed to load feedback:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const bugs = feedback.filter((f) => f.type === "bug").length;
    const suggestions = feedback.filter((f) => f.type === "suggestion").length;
    const open = feedback.filter((f) => f.status === "open").length;
    const visible = filter === "all" ? feedback : feedback.filter((f) => f.type === filter);

    const run = async (key: string, body: { id: string } | { type: "bug" | "suggestion" }, remove: (f: Feedback) => boolean) => {
        setDeleting(key);
        setError(null);
        try {
            await deleteRequest(body);
            setFeedback((current) => current.filter((f) => !remove(f)));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete feedback");
        } finally {
            setDeleting(null);
            setConfirming(null);
        }
    };

    const bulkButton = (type: "bug" | "suggestion") => {
        const key = `all-${type}`;
        const count = type === "bug" ? bugs : suggestions;
        const label = type === "bug" ? (count === 1 ? "bug report" : "bug reports") : (count === 1 ? "suggestion" : "suggestions");
        return (
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setConfirming(confirming === key ? null : key)}
                    disabled={count === 0 || deleting !== null}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {deleting === key ? <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" /> : <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />}
                    Delete all {type === "bug" ? "bugs" : "suggestions"}
                </button>
                {confirming === key && (
                    <div role="alertdialog" aria-label={`Delete all ${label}`} className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl bg-ink p-4 text-left text-sm text-white shadow-xl">
                        <p className="flex items-center gap-2 font-semibold"><AlertTriangle aria-hidden="true" className="h-4 w-4 text-rose-300" /> Delete {count} {label}?</p>
                        <p className="mt-1 text-xs text-white/70">This can&apos;t be undone.</p>
                        <div className="mt-3 flex justify-end gap-2">
                            <button type="button" onClick={() => setConfirming(null)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10">Cancel</button>
                            <button type="button" onClick={() => run(key, { type }, (f) => f.type === type)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold hover:bg-rose-700">Delete</button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const tabs: [Filter, string, number][] = [["all", "All", feedback.length], ["bug", "Bugs", bugs], ["suggestion", "Suggestions", suggestions]];

    return (
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-bold text-ink">Feedback</h2>
                        {!loading && (
                            <>
                                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600">Bug reports ({bugs})</span>
                                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Suggestions ({suggestions})</span>
                                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-brand">Open ({open})</span>
                            </>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Bugs and suggestions submitted by users.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {bulkButton("bug")}
                    {bulkButton("suggestion")}
                </div>
            </div>

            <div role="tablist" aria-label="Feedback type" className="mt-5 flex gap-1 overflow-x-auto">
                {tabs.map(([key, label, count]) => (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={filter === key}
                        onClick={() => setFilter(key)}
                        className={`h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${filter === key ? "bg-brand text-white" : "text-slate-500 hover:bg-slate-100 hover:text-ink"}`}
                    >
                        {label} ({count})
                    </button>
                ))}
            </div>

            {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</p>}

            <div className="mt-4">
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}
                    </div>
                ) : visible.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><MessageSquare aria-hidden="true" className="h-5 w-5" /></span>
                        <p className="mt-3 font-semibold text-ink">No feedback yet</p>
                        <p className="mt-0.5 text-sm text-slate-500">Submissions from the Feedback page appear here.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {visible.map((item) => {
                            const status = STATUS_STYLES[item.status] ?? STATUS_STYLES.open;
                            const isBug = item.type === "bug";
                            const isOpen = expanded === item._id;
                            const body = isBug ? item.description : item.suggestion;
                            const extra = isBug ? item.steps : item.benefit;
                            return (
                                <li key={item._id} className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 transition-colors hover:border-slate-300">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isBug ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>
                                            {isBug ? <Bug aria-hidden="true" className="h-5 w-5" /> : <Lightbulb aria-hidden="true" className="h-5 w-5" />}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${isBug ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700"}`}>{isBug ? "Bug" : "Suggestion"}</span>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.className}`}><status.icon aria-hidden="true" className="h-3 w-3" /> {status.label}</span>
                                                <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                            </div>
                                            <button type="button" onClick={() => setExpanded(isOpen ? null : item._id)} aria-expanded={isOpen} className="mt-1.5 flex w-full items-start justify-between gap-2 text-left">
                                                <span className="font-semibold text-ink">{item.title}</span>
                                                <ChevronDown aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                            </button>
                                            {body && <p className={`mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 ${isOpen ? "" : "line-clamp-2"}`}>{body}</p>}
                                            {isOpen && extra && (
                                                <div className="mt-3 rounded-xl bg-white px-3.5 py-3 text-sm">
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{isBug ? "Steps to reproduce" : "Why it would help"}</p>
                                                    <p className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-600">{extra}</p>
                                                </div>
                                            )}
                                        </div>
                                        {confirming === item._id ? (
                                            <span className="flex shrink-0 flex-col items-end gap-1 text-xs sm:flex-row sm:items-center sm:gap-2">
                                                <button type="button" onClick={() => setConfirming(null)} className="font-semibold text-slate-500 hover:text-ink">Cancel</button>
                                                <button type="button" onClick={() => run(item._id, { id: item._id }, (f) => f._id === item._id)} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 font-semibold text-white hover:bg-rose-700">
                                                    {deleting === item._id && <Loader2 aria-hidden="true" className="h-3 w-3 animate-spin" />} Delete
                                                </button>
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setConfirming(item._id)}
                                                disabled={deleting !== null}
                                                aria-label={`Delete “${item.title}”`}
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                                            >
                                                <Trash2 aria-hidden="true" className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}
