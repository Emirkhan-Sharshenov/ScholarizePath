'use client';

import { useState } from 'react';
import { BellRing } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { TelegramConnect } from './TelegramConnect';

interface NotificationSettingsProps {
    deadlineReminders: boolean;
    telegram?: { chatId?: string | null; username?: string | null } | null;
}

export function NotificationSettings({ deadlineReminders, telegram }: NotificationSettingsProps) {
    const [enabled, setEnabled] = useState(deadlineReminders);
    const [saving, setSaving] = useState(false);
    const { t } = useI18n();

    const handleToggle = async () => {
        const next = !enabled;
        setEnabled(next);
        setSaving(true);

        try {
            const res = await fetch('/api/auth/self', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ deadlineReminders: next }),
            });

            if (!res.ok) {
                setEnabled(!next);
            }
        } catch (err) {
            console.error('Failed to update notification settings:', err);
            setEnabled(!next);
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-6">
            <h3 className="mb-5 flex items-center gap-3 font-display text-lg font-semibold text-ink">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand">
                    <BellRing aria-hidden="true" className="h-5 w-5" />
                </span>
                {t.student.notifications}
            </h3>

            <div className="flex items-start justify-between gap-4">
                <div>
                    <p id="deadline-reminders-label" className="font-semibold text-ink">{t.student.reminders}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {t.student.remindersText}
                    </p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-labelledby="deadline-reminders-label"
                    onClick={handleToggle}
                    disabled={saving}
                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${enabled ? 'bg-brand' : 'bg-slate-300'}`}
                >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            <TelegramConnect telegram={telegram} />
        </section>
    );
}
