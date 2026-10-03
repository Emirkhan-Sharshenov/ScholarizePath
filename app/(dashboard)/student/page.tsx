'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { ProfileHeader } from '@/components/student/ProfileHeader';
import { AcademicScores } from '@/components/student/AcademicScores';
import { PersonalPreferences } from '@/components/student/PersonalPreferences';
import { NotificationSettings } from '@/components/student/NotificationSettings';
import { DeleteAccount } from '@/components/student/DeleteAccount';
import { useI18n } from '@/i18n/I18nProvider';

export interface ProfileData {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    authProvider?: 'local' | 'google';
    deadlineReminders?: boolean;
    profile?: {
        age?: number | null;
        nationality?: string | null;
        gpa?: number | null;
        sat?: number | null;
        englishTest?: {
            type?: string | null;
            score?: number | null;
        } | null;
        preferredField?: string | null;
        preferredCountry?: string | null;
        programLevel?: string | null;
    };
}

// Sets a dotted path ("profile.englishTest.score") on a copy of the profile,
// creating missing intermediate objects — a user who skipped the English test
// during setup has englishTest: null.
function setPath(obj: ProfileData, path: string, value: unknown): ProfileData {
    const copy = structuredClone(obj) as unknown as Record<string, unknown>;
    const keys = path.split('.');
    let node = copy;
    for (const key of keys.slice(0, -1)) {
        if (node[key] == null || typeof node[key] !== 'object') node[key] = {};
        node = node[key] as Record<string, unknown>;
    }
    node[keys[keys.length - 1]] = value;
    return copy as unknown as ProfileData;
}

export default function ProfilePage() {
    const [data, setData] = useState<ProfileData | null>(null);
    const [formData, setFormData] = useState<ProfileData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [savedToast, setSavedToast] = useState(false);
    const { t } = useI18n();
    const m = t.student;

    useEffect(() => {
        fetch('/api/auth/self', {
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((resData) => {
                if (resData.success) {
                    setData(resData.user);
                    setFormData(resData.user);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!savedToast) return;
        const t = setTimeout(() => setSavedToast(false), 3000);
        return () => clearTimeout(t);
    }, [savedToast]);

    const handleChange = (path: string, value: unknown) => {
        setFormData((prev) => (prev ? setPath(prev, path, value) : prev));
    };

    const startEditing = () => {
        setSaveError(null);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setFormData(data);
        setSaveError(null);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!formData) return;
        setSaving(true);
        setSaveError(null);
        try {
            const res = await fetch('/api/auth/self', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                // Only what this page edits — the API allow-lists fields anyway.
                body: JSON.stringify({ firstName: formData.firstName, lastName: formData.lastName, profile: formData.profile }),
            });
            if (!res.ok) throw new Error(`Request failed: ${res.status}`);
            setData(formData);
            setIsEditing(false);
            setSavedToast(true);
        } catch (err) {
            console.error('Failed to update:', err);
            setSaveError(m.saveError);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center gap-2 font-body text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" /> {m.loading}
            </div>
        );
    }
    if (!formData) return <div className="p-8 text-center font-body text-red-600">{m.loadFailed}</div>;

    const profile = formData.profile ?? {};
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(data);

    return (
        <main className={`min-h-screen bg-[#f7f9fc] px-4 pt-5 font-body text-ink sm:px-6 md:px-10 md:pt-8 ${isEditing ? 'pb-40 md:pb-28' : 'pb-12'}`}>
            <div className="mx-auto max-w-5xl space-y-5">
                <h1 className="font-display text-2xl font-bold tracking-tight md:text-4xl">{m.title}</h1>

                <ProfileHeader
                    firstName={formData.firstName}
                    lastName={formData.lastName}
                    email={formData.email}
                    preferredCountry={profile.preferredCountry}
                    programLevel={profile.programLevel}
                    isEditing={isEditing}
                    onEdit={startEditing}
                    onCancel={cancelEditing}
                />

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <AcademicScores
                        gpa={profile.gpa}
                        sat={profile.sat}
                        englishTest={profile.englishTest}
                        isEditing={isEditing}
                        onChange={handleChange}
                        onEdit={startEditing}
                    />
                    <PersonalPreferences
                        firstName={formData.firstName}
                        lastName={formData.lastName}
                        age={profile.age}
                        nationality={profile.nationality}
                        preferredField={profile.preferredField}
                        preferredCountry={profile.preferredCountry}
                        programLevel={profile.programLevel}
                        isEditing={isEditing}
                        onChange={handleChange}
                    />
                </div>

                <NotificationSettings deadlineReminders={formData.deadlineReminders !== false} />

                <DeleteAccount email={data?.email ?? formData.email} authProvider={formData.authProvider} />
            </div>

            {/* Save bar and toast are portalled into <body>: the dashboard shell's
                `contain: layout` and page-transition transform would otherwise make
                `position: fixed` relative to the page, not the screen. */}
            {createPortal(<>
            {/* Save bar — above the phone tab bar, at the bottom of the screen on desktop */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 font-body border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md md:bottom-0 md:left-auto md:right-6 md:mb-6 md:w-auto md:rounded-2xl md:border md:shadow-[0_20px_40px_rgba(10,26,63,0.12)]"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <p className="hidden items-center gap-2 text-sm text-slate-600 sm:flex">
                                <span className={`h-2 w-2 rounded-full ${saveError ? 'bg-red-500' : hasChanges ? 'bg-amber-500' : 'bg-slate-300'}`} />
                                {saveError ?? (hasChanges ? m.unsaved : m.noChanges)}
                            </p>
                            <div className="flex flex-1 gap-2 sm:flex-none">
                                <button type="button" onClick={cancelEditing} className="h-11 flex-1 rounded-[10px] px-5 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:flex-none">
                                    {m.cancel}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving || !hasChanges}
                                    className="inline-flex h-11 flex-[2] items-center justify-center gap-2 rounded-[10px] bg-brand px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#004a9f] disabled:opacity-50 sm:flex-none"
                                >
                                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {m.saveChanges}
                                </button>
                            </div>
                        </div>
                        {saveError && <p className="mt-2 text-sm text-red-600 sm:hidden">{saveError}</p>}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {savedToast && (
                    <motion.div
                        role="status"
                        initial={{ y: -12, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -12, opacity: 0 }}
                        className="fixed right-4 top-20 z-40 font-body flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg md:top-6"
                    >
                        <CheckCircle2 className="h-5 w-5" /> {m.saved}
                    </motion.div>
                )}
            </AnimatePresence>
            </>, document.body)}
        </main>
    );
}
