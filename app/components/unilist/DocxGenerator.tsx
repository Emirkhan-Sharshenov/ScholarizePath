"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Trash2, GraduationCap, Award, FileDown, Loader2, Share2 } from "lucide-react";
import { useUniList } from "@/lib/useUniList";

const DOCX_MIME =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function DocxGenerator() {
    const { universities, scholarships, list, removeFromList, clearList } = useUniList();
    const [canShareFiles, setCanShareFiles] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [shareError, setShareError] = useState<string | null>(null);

    const totalItems = list.length;

    useEffect(() => {
        setCanShareFiles(
            typeof navigator !== "undefined" && "share" in navigator && "canShare" in navigator
        );
    }, []);

    const reportHref = useMemo(() => {
        if (totalItems === 0) return null;
        const items = list.map((i) => ({ id: i.id, type: i.type }));
        const params = new URLSearchParams({ items: JSON.stringify(items) });
        return `/api/unilist/report?${params.toString()}`;
    }, [list, totalItems]);

    async function handleShare() {
        if (!reportHref) return;
        setSharing(true);
        setShareError(null);
        try {
            const res = await fetch(reportHref, { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to generate report");
            const blob = await res.blob();
            const filename = "unilist-report.docx";
            const file = new File([blob], filename, { type: DOCX_MIME });
            // @ts-ignore - canShare typing varies across TS lib versions
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: filename });
            } else {
                window.location.href = reportHref;
            }
        } catch (err: any) {
            if (err?.name !== "AbortError") {
                console.error(err);
                setShareError("Couldn't share the file. Use the download button instead.");
            }
        } finally {
            setSharing(false);
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Generate DOCX Report</h1>

            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                <h2 className="text-sm sm:text-base font-bold text-gray-900">Your List</h2>
                <p className="text-xs text-gray-400 mt-0.5 mb-4">
                    Items you&apos;ve added from university and scholarship pages.
                </p>

                {totalItems === 0 ? (
                    <p className="text-sm text-gray-500 py-6 text-center">
                        Your list is empty. Add universities or scholarships using the &quot;Add to List&quot; button on their pages.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {universities.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
                                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                                    <span>Universities ({universities.length})</span>
                                </div>
                                <div className="space-y-1.5">
                                    {universities.map((item) => (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2.5 sm:py-2"
                                        >
                                            <span className="text-sm text-gray-700 break-words min-w-0 flex-1">{item.name}</span>
                                            <button
                                                onClick={() => removeFromList(item.id, item.type)}
                                                className="shrink-0 -m-2 p-2 text-gray-400 hover:text-rose-500 active:text-rose-500 transition-colors"
                                                aria-label="Remove"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {scholarships.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
                                    <Award className="w-3.5 h-3.5 shrink-0" />
                                    <span>Scholarships ({scholarships.length})</span>
                                </div>
                                <div className="space-y-1.5">
                                    {scholarships.map((item) => (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2.5 sm:py-2"
                                        >
                                            <span className="text-sm text-gray-700 break-words min-w-0 flex-1">{item.name}</span>
                                            <button
                                                onClick={() => removeFromList(item.id, item.type)}
                                                className="shrink-0 -m-2 p-2 text-gray-400 hover:text-rose-500 active:text-rose-500 transition-colors"
                                                aria-label="Remove"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={clearList}
                            className="text-xs font-medium text-gray-400 hover:text-rose-500 active:text-rose-500 transition-colors py-1"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm space-y-4">
                <h2 className="text-sm sm:text-base font-bold text-gray-900">Report Options</h2>
                <p className="text-xs text-gray-500">
                    Format: <span className="font-semibold text-gray-700">DOCX</span> — includes full details for every item in your list.
                </p>

                {shareError && <p className="text-xs text-rose-500 break-words">{shareError}</p>}

                <div className="space-y-2">
                
                    <a
                        href={reportHref ?? undefined}
                        aria-disabled={!reportHref}
                        download
                        className={`w-full flex items-center justify-center gap-2 font-medium py-3.5 sm:py-3 px-4 rounded-xl transition-colors shadow-sm text-sm min-h-[48px] ${reportHref
                                ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-700 text-white"
                                : "bg-gray-300 text-white pointer-events-none cursor-not-allowed"
                            }`}
                    >
                        <FileDown className="w-4 h-4 shrink-0" />
                        <span className="truncate">Download DOCX{totalItems > 0 ? ` (${totalItems})` : ""}</span>
                    </a>
                </div>
            </div>
        </div>
    );
}