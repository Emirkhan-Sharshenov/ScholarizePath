'use client';

import { useState, useEffect } from 'react';
import { ProfileHeader } from '@/components/student/ProfileHeader';
import { AcademicScores } from '@/components/student/AcademicScores';
import { PersonalPreferences } from '@/components/student/PersonalPreferences';

export interface ProfileData {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profile: {
        age: number;
        nationality: string;
        gpa: number;
        sat: number;
        englishTest: {
            type: string;
            score: number;
        };
        preferredField: string;
        preferredCountry: string;
        programLevel: string;
    };
}

export default function ProfilePage() {
    const [data, setData] = useState<ProfileData | null>(null);
    const [formData, setFormData] = useState<ProfileData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

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

    const handleChange = (path: string, value: any) => {
        if (!formData) return;
        const keys = path.split('.');

        setFormData((prev) => {
            if (!prev) return null;
            const updated = structuredClone(prev);

            if (keys.length === 1) {
                (updated as any)[keys[0]] = value;
            } else if (keys.length === 2) {
                (updated as any)[keys[0]][keys[1]] = value;
            } else if (keys.length === 3) {
                (updated as any)[keys[0]][keys[1]][keys[2]] = value;
            }
            return updated;
        });
    };

    const handleSave = async () => {
        try {
            const res = await fetch('/api/auth/self', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setData(formData);
                setIsEditing(false);
            }
        } catch (err) {
            console.error('Failed to update:', err);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!formData) return <div className="p-8 text-center text-red-500">Failed to load user profile.</div>;

    return (
        <main className="min-h-screen bg-[rgb(246,247,251)] p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Navigation & Action Bar */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

                    {isEditing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setFormData(data); setIsEditing(false); }}
                                className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* Components */}
                <ProfileHeader
                    firstName={formData.firstName}
                    lastName={formData.lastName}
                    email={formData.email}
                    nationality={formData.profile?.nationality || ''}
                    age={formData.profile?.age || 0}
                />

                <AcademicScores
                    gpa={formData.profile?.gpa || 0}
                    sat={formData.profile?.sat || 0}
                    englishTest={formData.profile?.englishTest || { type: 'IELTS', score: 0 }}
                    isEditing={isEditing}
                    onChange={handleChange}
                />

                <PersonalPreferences
                    firstName={formData.firstName}
                    lastName={formData.lastName}
                    preferredField={formData.profile?.preferredField || ''}
                    preferredCountry={formData.profile?.preferredCountry || ''}
                    programLevel={formData.profile?.programLevel || ''}
                    isEditing={isEditing}
                    onChange={handleChange}
                />
            </div>
        </main>
    );
}