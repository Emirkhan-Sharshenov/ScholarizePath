'use client';

import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { COUNTRY_LIST, flagFor } from '@/components/profile/countryList';

interface PersonalPreferencesProps {
    firstName: string;
    lastName: string;
    age?: number | null;
    nationality?: string | null;
    preferredField?: string | null;
    preferredCountry?: string | null;
    programLevel?: string | null;
    isEditing: boolean;
    onChange: (path: string, value: unknown) => void;
}

const PROGRAM_LEVELS = ['Bachelor', 'Master', 'PhD'];

const inputClass =
    'h-12 w-full rounded-[10px] border border-slate-200 bg-white px-4 text-[15px] text-ink shadow-sm focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10';

function Row({ label, value, children, isEditing }: { label: string; value: React.ReactNode; children: React.ReactNode; isEditing: boolean }) {
    return (
        <div>
            <p className="mb-1.5 text-sm font-medium text-slate-500">{label}</p>
            {isEditing ? children : (
                <p className="flex h-12 items-center rounded-[10px] bg-slate-50 px-4 text-[15px] font-medium text-ink">
                    {value || <span className="font-normal text-slate-400">Not added</span>}
                </p>
            )}
        </div>
    );
}

function CountrySelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
    return (
        <div className="relative">
            <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} appearance-none pr-10`}>
                <option value="">Select…</option>
                {COUNTRY_LIST.map((c) => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
    );
}

export function PersonalPreferences({ firstName, lastName, age, nationality, preferredField, preferredCountry, programLevel, isEditing, onChange }: PersonalPreferencesProps) {
    return (
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-6">
            <h3 className="mb-5 flex items-center gap-3 font-display text-lg font-semibold text-ink">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand">
                    <SlidersHorizontal aria-hidden="true" className="h-5 w-5" />
                </span>
                Personal &amp; preferences
            </h3>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <Row label="First name" value={firstName} isEditing={isEditing}>
                        <input aria-label="First name" value={firstName} onChange={(e) => onChange('firstName', e.target.value)} className={inputClass} />
                    </Row>
                    <Row label="Last name" value={lastName} isEditing={isEditing}>
                        <input aria-label="Last name" value={lastName} onChange={(e) => onChange('lastName', e.target.value)} className={inputClass} />
                    </Row>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Row label="Age" value={age ? String(age) : ''} isEditing={isEditing}>
                        <input aria-label="Age" type="number" min={10} max={100} value={age ?? ''} onChange={(e) => onChange('profile.age', e.target.value === '' ? null : Number(e.target.value))} className={inputClass} />
                    </Row>
                    <Row label="Nationality" value={nationality ? `${flagFor(nationality)} ${nationality}` : ''} isEditing={isEditing}>
                        <CountrySelect label="Nationality" value={nationality ?? ''} onChange={(v) => onChange('profile.nationality', v || null)} />
                    </Row>
                </div>

                <Row label="Preferred field" value={preferredField} isEditing={isEditing}>
                    <input aria-label="Preferred field" placeholder="e.g. Computer Science" value={preferredField ?? ''} onChange={(e) => onChange('profile.preferredField', e.target.value)} className={inputClass} />
                </Row>

                <Row label="Target country" value={preferredCountry ? `${flagFor(preferredCountry)} ${preferredCountry}` : ''} isEditing={isEditing}>
                    <CountrySelect label="Target country" value={preferredCountry ?? ''} onChange={(v) => onChange('profile.preferredCountry', v || null)} />
                </Row>

                <div>
                    <p className="mb-1.5 text-sm font-medium text-slate-500">Program level</p>
                    <div className="grid grid-cols-3 gap-2" role={isEditing ? 'radiogroup' : undefined} aria-label="Program level">
                        {PROGRAM_LEVELS.map((level) => {
                            const selected = programLevel === level;
                            return (
                                <button
                                    key={level}
                                    type="button"
                                    disabled={!isEditing}
                                    aria-pressed={selected}
                                    onClick={() => onChange('profile.programLevel', level)}
                                    className={`h-11 rounded-[10px] text-sm font-semibold transition-colors ${selected ? 'bg-brand text-white shadow-sm' : 'bg-slate-50 text-slate-600'} ${isEditing && !selected ? 'hover:bg-slate-100' : ''} disabled:cursor-default`}
                                >
                                    {level}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
