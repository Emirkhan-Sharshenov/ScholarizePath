'use client';

import { useState } from 'react';

interface NotificationSettingsProps {
    deadlineReminders: boolean;
}

export function NotificationSettings({ deadlineReminders }: NotificationSettingsProps) {
    const [enabled, setEnabled] = useState(deadlineReminders);
    const [saving, setSaving] = useState(false);

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
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Notifications</h3>

            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-slate-50">
                <div>
                    <span className="font-semibold text-gray-800 block">Deadline email reminders</span>
                    <span className="text-xs text-gray-400">
                        Get an email 7 days and 1 day before deadlines of your favorited scholarships and universities.
                    </span>
                </div>

                <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    disabled={saving}
                    onClick={handleToggle}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                        enabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>
        </div>
    );
}
