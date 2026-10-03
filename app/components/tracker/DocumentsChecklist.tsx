'use client';

import { useRef, useState } from 'react';
import { FileCheck2, Loader2, Plus, Sparkles, X } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { MAX_DOCUMENTS, MAX_DOCUMENT_NAME, type ApplicationDocument, type TrackedApplication } from './trackerConstants';

interface DocumentsChecklistProps {
    application: TrackedApplication;
    /** Saves the whole list; resolves false when the save failed. */
    onChange: (documents: ApplicationDocument[]) => Promise<boolean>;
    /** Fills an empty list from the scholarship/university record. */
    onPrefill: () => Promise<ApplicationDocument[] | null>;
}

/** What to send for this application. Every change saves straight away. */
export default function DocumentsChecklist({ application, onChange, onPrefill }: DocumentsChecklistProps) {
    const [documents, setDocuments] = useState<ApplicationDocument[]>(application.documents ?? []);
    const [draft, setDraft] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [prefilling, setPrefilling] = useState(false);
    const [prefillEmpty, setPrefillEmpty] = useState(false);
    // Saves go out one at a time, newest list last: parallel requests can
    // reach the server out of order, and an older list would win.
    const saved = useRef<ApplicationDocument[]>(application.documents ?? []);
    const queued = useRef<ApplicationDocument[] | null>(null);
    const saving = useRef(false);
    const { t } = useI18n();
    const m = t.tracker;

    const done = documents.filter((d) => d.done).length;
    const isUniversity = application.itemType === 'university';

    const drain = async () => {
        saving.current = true;
        while (queued.current) {
            const next = queued.current;
            queued.current = null;
            if (await onChange(next)) {
                saved.current = next;
            } else if (!queued.current) {
                // Nothing newer to send: show what's actually stored.
                setDocuments(saved.current);
                setError(m.documentsSaveError);
            }
        }
        saving.current = false;
    };

    const commit = (next: ApplicationDocument[]) => {
        setDocuments(next);
        setError(null);
        queued.current = next;
        if (!saving.current) void drain();
    };

    const add = () => {
        const name = draft.trim().slice(0, MAX_DOCUMENT_NAME);
        if (!name || documents.length >= MAX_DOCUMENTS) return;
        setDraft('');
        commit([...documents, { name, done: false }]);
    };

    const prefill = async () => {
        setPrefilling(true);
        setError(null);
        const result = await onPrefill();
        setPrefilling(false);
        if (result === null) setError(m.documentsSaveError);
        else if (result.length === 0) setPrefillEmpty(true);
        else {
            saved.current = result;
            setDocuments(result);
        }
    };

    return (
        <section aria-labelledby="documents-title">
            <div className="mb-2 flex items-baseline justify-between gap-3">
                <h3 id="documents-title" className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <FileCheck2 aria-hidden="true" className="h-4 w-4 text-brand" /> {m.documents}
                </h3>
                {documents.length > 0 && (
                    <span className={`text-xs font-semibold ${done === documents.length ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {m.documentsProgress(done, documents.length)}
                    </span>
                )}
            </div>

            {documents.length > 0 ? (
                <>
                    <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                        <div
                            className={`h-full rounded-full transition-[width] duration-300 ${done === documents.length ? 'bg-emerald-500' : 'bg-brand'}`}
                            style={{ width: `${(done / documents.length) * 100}%` }}
                        />
                    </div>
                    <ul className="space-y-1">
                        {documents.map((doc, i) => (
                            <li key={`${i}-${doc.name}`} className="group flex items-start gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-50">
                                <input
                                    id={`document-${i}`}
                                    type="checkbox"
                                    checked={doc.done}
                                    onChange={() => commit(documents.map((d, j) => (j === i ? { ...d, done: !d.done } : d)))}
                                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-brand"
                                />
                                <label
                                    htmlFor={`document-${i}`}
                                    className={`min-w-0 flex-1 cursor-pointer break-words text-sm leading-snug ${doc.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                                >
                                    {doc.name}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => commit(documents.filter((_, j) => j !== i))}
                                    aria-label={m.removeDocument(doc.name)}
                                    title={m.removeDocument(doc.name)}
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                                >
                                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <div className="rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-500">
                    <p>{prefillEmpty ? m.prefillNone : m.documentsEmpty}</p>
                    {!prefillEmpty && (
                        <button
                            type="button"
                            onClick={prefill}
                            disabled={prefilling}
                            className="mt-2 inline-flex items-center gap-1.5 font-semibold text-brand hover:underline disabled:opacity-60"
                        >
                            {prefilling ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Sparkles aria-hidden="true" className="h-4 w-4" />}
                            {isUniversity ? m.prefillUniversity : m.prefillScholarship}
                        </button>
                    )}
                </div>
            )}

            {documents.length < MAX_DOCUMENTS && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        add();
                    }}
                    className="mt-2 flex gap-2"
                >
                    <label htmlFor="new-document" className="sr-only">{m.addDocumentLabel}</label>
                    <input
                        id="new-document"
                        value={draft}
                        maxLength={MAX_DOCUMENT_NAME}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={m.addDocumentPlaceholder}
                        className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                    />
                    <button
                        type="submit"
                        disabled={!draft.trim()}
                        className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-brand transition-colors hover:bg-blue-50 disabled:text-slate-300 disabled:hover:bg-transparent"
                    >
                        <Plus aria-hidden="true" className="h-4 w-4" /> {m.addDocument}
                    </button>
                </form>
            )}

            {error ? (
                <p role="alert" className="mt-2 text-sm font-medium text-rose-600">{error}</p>
            ) : (
                documents.length > 0 && <p className="mt-2 text-xs text-slate-400">{m.documentsSaved}</p>
            )}
        </section>
    );
}
