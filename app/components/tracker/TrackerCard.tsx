'use client';

import { Award, Building2, CalendarClock, GripVertical } from 'lucide-react';
import { deadlineChip, type TrackedApplication } from './trackerConstants';
import { useI18n } from '@/i18n/I18nProvider';

interface TrackerCardProps {
    application: TrackedApplication;
    onOpen: (application: TrackedApplication) => void;
    /** Desktop board only: cards can be dragged between columns. */
    draggable?: boolean;
}

export default function TrackerCard({ application, onOpen, draggable = false }: TrackerCardProps) {
    const isUniversity = application.itemType === 'university';
    const Icon = isUniversity ? Building2 : Award;
    const { t, locale } = useI18n();
    const chip = deadlineChip(application, t.tracker, locale);

    return (
        <button
            type="button"
            onClick={() => onOpen(application)}
            draggable={draggable}
            onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', application._id);
                e.dataTransfer.effectAllowed = 'move';
            }}
            className="group block w-full rounded-2xl border border-slate-200/80 bg-white p-3.5 text-left shadow-[0_2px_8px_rgba(10,26,63,0.04)] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_8px_20px_rgba(10,26,63,0.08)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15"
        >
            <div className="flex items-start gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isUniversity ? 'bg-blue-50 text-brand' : 'bg-violet-50 text-violet-600'}`}>
                    <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{application.itemName}</p>
                    {application.itemSubtitle && <p className="mt-0.5 truncate text-xs text-slate-500">{application.itemSubtitle}</p>}
                </div>
                {draggable && <GripVertical aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />}
            </div>

            <span className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${chip.className}`}>
                <CalendarClock aria-hidden="true" className="h-3.5 w-3.5" /> {chip.label}
            </span>

            {application.notes && (
                <p className="mt-2.5 line-clamp-2 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">{application.notes}</p>
            )}

            <p className={`mt-2.5 text-[11px] font-semibold uppercase tracking-wider ${isUniversity ? 'text-blue-400' : 'text-violet-400'}`}>
                {isUniversity ? t.tracker.university : t.tracker.scholarship}
            </p>
        </button>
    );
}
