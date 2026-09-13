'use client';

import { Building2, Award, Calendar, Trash2 } from 'lucide-react';
import {
    STATUS_COLUMNS,
    TrackedApplication,
    ApplicationStatus,
    daysUntil,
    formatDeadline,
} from './trackerConstants';

interface TrackerCardProps {
    application: TrackedApplication;
    onStatusChange: (id: string, status: ApplicationStatus) => void;
    onDelete: (id: string) => void;
}

export default function TrackerCard({ application, onStatusChange, onDelete }: TrackerCardProps) {
    const remaining = daysUntil(application.deadline);
    const isUrgent = remaining !== null && remaining <= 7 && remaining >= 0;
    const isOverdue = remaining !== null && remaining < 0;
    const ItemIcon = application.itemType === 'university' ? Building2 : Award;

    return (
        <div className="group rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand">
                        <ItemIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                            {application.itemName}
                        </h4>
                        {application.itemSubtitle && (
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{application.itemSubtitle}</p>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => onDelete(application._id)}
                    aria-label="Stop tracking"
                    className="shrink-0 rounded-lg p-1 text-slate-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {application.deadline && (
                <div
                    className={`mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold ${isOverdue
                            ? 'text-red-500'
                            : isUrgent
                                ? 'text-amber-600'
                                : 'text-slate-400'
                        }`}
                >
                    <Calendar className="h-3 w-3" />
                    <span>
                        {formatDeadline(application.deadline)}
                        {isOverdue && ' · overdue'}
                        {isUrgent && ` · ${remaining === 0 ? 'today' : `${remaining}d left`}`}
                    </span>
                </div>
            )}

            <select
                value={application.status}
                onChange={(e) => onStatusChange(application._id, e.target.value as ApplicationStatus)}
                className="mt-3 w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {STATUS_COLUMNS.map((col) => (
                    <option key={col.id} value={col.id}>
                        Move to: {col.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
