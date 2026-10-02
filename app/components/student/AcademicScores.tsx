'use client';

import { GraduationCap } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

interface AcademicScoresProps {
    gpa?: number | null;
    sat?: number | null;
    englishTest?: { type?: string | null; score?: number | null } | null;
    isEditing: boolean;
    onChange: (path: string, value: unknown) => void;
    onEdit: () => void;
}

const hasScore = (v?: number | null) => typeof v === 'number' && v > 0;
const toNumberOrNull = (v: string) => (v === '' ? null : Number(v));

const tileInput =
    'mt-1 h-11 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-lg font-semibold text-ink focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10';

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            {children}
        </div>
    );
}

function NotAdded({ onEdit }: { onEdit: () => void }) {
    const { t } = useI18n();
    return (
        <p className="mt-1.5 text-sm text-slate-500">
            {t.student.notAdded}{' '}
            <button type="button" onClick={onEdit} className="font-semibold text-brand hover:underline">{t.student.add}</button>
        </p>
    );
}

export function AcademicScores({ gpa, sat, englishTest, isEditing, onChange, onEdit }: AcademicScoresProps) {
    const testType = (englishTest?.type || 'IELTS').toUpperCase();
    const { t } = useI18n();
    const m = t.student;

    return (
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-6">
            <h3 className="mb-5 flex items-center gap-3 font-display text-lg font-semibold text-ink">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand">
                    <GraduationCap aria-hidden="true" className="h-5 w-5" />
                </span>
                {m.scores}
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Tile label={m.gpa}>
                    {isEditing ? (
                        <input type="number" step="0.01" min={0} max={4} aria-label={m.gpa} value={gpa ?? ''} onChange={(e) => onChange('profile.gpa', toNumberOrNull(e.target.value))} className={tileInput} />
                    ) : hasScore(gpa) ? (
                        <p className="mt-1.5 font-display text-3xl font-bold text-ink">{gpa}<span className="ml-1 text-sm font-medium text-slate-400">/ 4.0</span></p>
                    ) : <NotAdded onEdit={onEdit} />}
                </Tile>

                <Tile label={m.sat}>
                    {isEditing ? (
                        <input type="number" min={400} max={1600} aria-label={m.satScore} value={sat ?? ''} onChange={(e) => onChange('profile.sat', toNumberOrNull(e.target.value))} className={tileInput} />
                    ) : hasScore(sat) ? (
                        <p className="mt-1.5 font-display text-3xl font-bold text-ink">{sat}<span className="ml-1 text-sm font-medium text-slate-400">/ 1600</span></p>
                    ) : <NotAdded onEdit={onEdit} />}
                </Tile>

                <div className="sm:col-span-2">
                    <Tile label={m.englishTest}>
                        {isEditing ? (
                            <div className="mt-1 grid grid-cols-[auto_1fr] gap-3">
                                <div role="radiogroup" aria-label={m.englishTest} className="grid h-11 grid-cols-2 rounded-[10px] bg-white p-1 ring-1 ring-slate-200">
                                    {['IELTS', 'TOEFL'].map((test) => (
                                        <button
                                            key={test}
                                            type="button"
                                            role="radio"
                                            aria-checked={testType === test}
                                            onClick={() => onChange('profile.englishTest.type', test)}
                                            className={`rounded-lg px-3 text-xs font-semibold transition-colors ${testType === test ? 'bg-brand text-white' : 'text-slate-500 hover:text-ink'}`}
                                        >
                                            {test}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    step={testType === 'IELTS' ? '0.5' : '1'}
                                    min={0}
                                    max={testType === 'IELTS' ? 9 : 120}
                                    aria-label={m.englishScore}
                                    value={englishTest?.score ?? ''}
                                    onChange={(e) => onChange('profile.englishTest.score', toNumberOrNull(e.target.value))}
                                    className={tileInput.replace('mt-1 ', '')}
                                />
                            </div>
                        ) : hasScore(englishTest?.score) ? (
                            <p className="mt-1.5 font-display text-3xl font-bold text-ink">
                                <span className="mr-2 text-base font-semibold text-slate-500">{testType}</span>
                                {englishTest?.score}
                                <span className="ml-1 text-sm font-medium text-slate-400">/ {testType === 'IELTS' ? '9.0' : '120'}</span>
                            </p>
                        ) : <NotAdded onEdit={onEdit} />}
                    </Tile>
                </div>
            </div>
        </section>
    );
}
