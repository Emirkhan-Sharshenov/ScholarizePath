'use client';

import { GraduationCap, Mail, Pencil, X } from 'lucide-react';
import { flagFor } from '@/components/profile/countryList';

interface ProfileHeaderProps {
    firstName: string;
    lastName: string;
    email: string;
    preferredCountry?: string | null;
    programLevel?: string | null;
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
}

export function ProfileHeader({ firstName, lastName, email, preferredCountry, programLevel, isEditing, onEdit, onCancel }: ProfileHeaderProps) {
    const initials = [firstName, lastName].filter(Boolean).map((p) => p.trim()[0]?.toUpperCase()).join('') || '?';

    return (
        <section className="flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:flex-row sm:items-center sm:p-7">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-[#2f7cf6] font-display text-xl font-bold text-white shadow-sm sm:h-20 sm:w-20 sm:text-2xl">
                {initials}
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
                        {[firstName, lastName].filter(Boolean).join(' ') || 'Your name'}
                    </h2>
                    {preferredCountry && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-brand">
                            {flagFor(preferredCountry)} {preferredCountry}
                        </span>
                    )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                        <Mail aria-hidden="true" className="h-4 w-4 shrink-0" />
                        <span className="truncate">{email}</span>
                    </span>
                    {programLevel && (
                        <span className="inline-flex items-center gap-1.5">
                            <GraduationCap aria-hidden="true" className="h-4 w-4 shrink-0" />
                            {programLevel} applicant
                        </span>
                    )}
                </div>
            </div>

            {isEditing ? (
                <button type="button" onClick={onCancel} className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
                    <X aria-hidden="true" className="h-4 w-4" /> Cancel editing
                </button>
            ) : (
                <button type="button" onClick={onEdit} className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-blue-50 px-5 text-sm font-semibold text-brand transition-colors hover:bg-blue-100">
                    <Pencil aria-hidden="true" className="h-4 w-4" /> Edit profile
                </button>
            )}
        </section>
    );
}
