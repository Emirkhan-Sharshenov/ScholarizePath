'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2 } from 'lucide-react';

const COUNTRY_LIST = [
    { name: 'Afghanistan', flag: '🇦🇫' },
    { name: 'Albania', flag: '🇦🇱' },
    { name: 'Algeria', flag: '🇩🇿' },
    { name: 'Andorra', flag: '🇦🇩' },
    { name: 'Angola', flag: '🇦🇴' },
    { name: 'Argentina', flag: '🇦🇷' },
    { name: 'Armenia', flag: '🇦🇲' },
    { name: 'Australia', flag: '🇦🇺' },
    { name: 'Austria', flag: '🇦🇹' },
    { name: 'Azerbaijan', flag: '🇦🇿' },
    { name: 'Bahamas', flag: '🇧🇸' },
    { name: 'Bahrain', flag: '🇧🇭' },
    { name: 'Bangladesh', flag: '🇧🇩' },
    { name: 'Belarus', flag: '🇧🇾' },
    { name: 'Belgium', flag: '🇧🇪' },
    { name: 'Belize', flag: '🇧🇿' },
    { name: 'Benin', flag: '🇧🇯' },
    { name: 'Bhutan', flag: '🇧🇹' },
    { name: 'Bolivia', flag: '🇧🇴' },
    { name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
    { name: 'Botswana', flag: '🇧🇼' },
    { name: 'Brazil', flag: '🇧🇷' },
    { name: 'Brunei', flag: '🇧🇳' },
    { name: 'Bulgaria', flag: '🇧🇬' },
    { name: 'Burkina Faso', flag: '🇧🇫' },
    { name: 'Burundi', flag: '🇧🇮' },
    { name: 'Cambodia', flag: '🇰🇭' },
    { name: 'Cameroon', flag: '🇨🇲' },
    { name: 'Canada', flag: '🇨🇦' },
    { name: 'Chile', flag: '🇨🇱' },
    { name: 'China', flag: '🇨🇳' },
    { name: 'Colombia', flag: '🇨🇴' },
    { name: 'Costa Rica', flag: '🇨🇷' },
    { name: 'Croatia', flag: '🇭🇷' },
    { name: 'Cuba', flag: '🇨🇺' },
    { name: 'Cyprus', flag: '🇨🇾' },
    { name: 'Czechia', flag: '🇨🇿' },
    { name: 'Denmark', flag: '🇩🇰' },
    { name: 'Dominican Republic', flag: '🇩🇴' },
    { name: 'Ecuador', flag: '🇪🇨' },
    { name: 'Egypt', flag: '🇪🇬' },
    { name: 'El Salvador', flag: '🇸🇻' },
    { name: 'Estonia', flag: '🇪🇪' },
    { name: 'Ethiopia', flag: '🇪🇹' },
    { name: 'Finland', flag: '🇫🇮' },
    { name: 'France', flag: '🇫🇷' },
    { name: 'Georgia', flag: '🇬🇪' },
    { name: 'Germany', flag: '🇩🇪' },
    { name: 'Ghana', flag: '🇬🇭' },
    { name: 'Greece', flag: '🇬🇷' },
    { name: 'Guatemala', flag: '🇬🇹' },
    { name: 'Honduras', flag: '🇭🇳' },
    { name: 'Hungary', flag: '🇭🇺' },
    { name: 'Iceland', flag: '🇮🇸' },
    { name: 'India', flag: '🇮🇳' },
    { name: 'Indonesia', flag: '🇮🇩' },
    { name: 'Iran', flag: '🇮🇷' },
    { name: 'Iraq', flag: '🇮🇶' },
    { name: 'Ireland', flag: '🇮🇪' },
    { name: 'Israel', flag: '🇮🇱' },
    { name: 'Italy', flag: '🇮🇹' },
    { name: 'Jamaica', flag: '🇯🇲' },
    { name: 'Japan', flag: '🇯🇵' },
    { name: 'Jordan', flag: '🇯🇴' },
    { name: 'Kazakhstan', flag: '🇰🇿' },
    { name: 'Kenya', flag: '🇰🇪' },
    { name: 'Kuwait', flag: '🇰🇼' },
    { name: 'Kyrgyzstan', flag: '🇰🇬' },
    { name: 'Latvia', flag: '🇱🇻' },
    { name: 'Lebanon', flag: '🇱🇧' },
    { name: 'Libya', flag: '🇱🇾' },
    { name: 'Lithuania', flag: '🇱🇹' },
    { name: 'Luxembourg', flag: '🇱🇺' },
    { name: 'Malaysia', flag: '🇲🇾' },
    { name: 'Maldives', flag: '🇲🇻' },
    { name: 'Mexico', flag: '🇲🇽' },
    { name: 'Moldova', flag: '🇲🇩' },
    { name: 'Monaco', flag: '🇲🇨' },
    { name: 'Mongolia', flag: '🇲🇳' },
    { name: 'Montenegro', flag: '🇲🇪' },
    { name: 'Morocco', flag: '🇲🇦' },
    { name: 'Nepal', flag: '🇳🇵' },
    { name: 'Netherlands', flag: '🇳🇱' },
    { name: 'New Zealand', flag: '🇳🇿' },
    { name: 'Nicaragua', flag: '🇳🇮' },
    { name: 'Nigeria', flag: '🇳🇬' },
    { name: 'North Macedonia', flag: '🇲🇰' },
    { name: 'Norway', flag: '🇳🇴' },
    { name: 'Oman', flag: '🇴🇲' },
    { name: 'Pakistan', flag: '🇵🇰' },
    { name: 'Panama', flag: '🇵🇦' },
    { name: 'Paraguay', flag: '🇵🇾' },
    { name: 'Peru', flag: '🇵🇪' },
    { name: 'Philippines', flag: '🇵🇭' },
    { name: 'Poland', flag: '🇵🇱' },
    { name: 'Portugal', flag: '🇵🇹' },
    { name: 'Qatar', flag: '🇶🇦' },
    { name: 'Romania', flag: '🇷🇴' },
    { name: 'Russia', flag: '🇷🇺' },
    { name: 'Rwanda', flag: '🇷🇼' },
    { name: 'Saudi Arabia', flag: '🇸🇦' },
    { name: 'Serbia', flag: '🇷🇸' },
    { name: 'Singapore', flag: '🇸🇬' },
    { name: 'Slovakia', flag: '🇸🇰' },
    { name: 'Slovenia', flag: '🇸🇮' },
    { name: 'South Africa', flag: '🇿🇦' },
    { name: 'South Korea', flag: '🇰🇷' },
    { name: 'Spain', flag: '🇪🇸' },
    { name: 'Sri Lanka', flag: '🇱🇰' },
    { name: 'Sudan', flag: '🇸🇩' },
    { name: 'Sweden', flag: '🇸🇪' },
    { name: 'Switzerland', flag: '🇨🇭' },
    { name: 'Syria', flag: '🇸🇾' },
    { name: 'Taiwan', flag: '🇹🇼' },
    { name: 'Tajikistan', flag: '🇹🇯' },
    { name: 'Tanzania', flag: '🇹🇿' },
    { name: 'Thailand', flag: '🇹🇭' },
    { name: 'Tunisia', flag: '🇹🇳' },
    { name: 'Turkey', flag: '🇹🇷' },
    { name: 'Turkmenistan', flag: '🇹🇲' },
    { name: 'Uganda', flag: '🇺🇬' },
    { name: 'Ukraine', flag: '🇺🇦' },
    { name: 'United Arab Emirates', flag: '🇦🇪' },
    { name: 'United Kingdom', flag: '🇬🇧' },
    { name: 'United States', flag: '🇺🇸' },
    { name: 'Uruguay', flag: '🇺🇾' },
    { name: 'Uzbekistan', flag: '🇺🇿' },
    { name: 'Venezuela', flag: '🇻🇪' },
    { name: 'Vietnam', flag: '🇻🇳' },
    { name: 'Yemen', flag: '🇾🇪' },
    { name: 'Zambia', flag: '🇿🇲' },
    { name: 'Zimbabwe', flag: '🇿🇼' },
];

export default function AdditionalInfoForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [englishTestType, setEnglishTestType] = useState<'ielts' | 'toefl'>('ielts');

    const [formData, setFormData] = useState({
        age: '',
        nationality: 'Kyrgyzstan',
        gpa: '',
        satScore: '',
        englishScore: '',
        fieldOfStudy: '',
        country: '',
        programLevel: '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTestTypeChange = (type: 'ielts' | 'toefl') => {
        setEnglishTestType(type);
        setFormData((prev) => ({ ...prev, englishScore: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Shape must match what POST /api/profile/setup expects:
        // englishTest is a nested { type, score } object, and type must be
        // uppercase "IELTS"/"TOEFL" to satisfy the Mongoose schema enum.
        const payload = {
            age: formData.age ? Number(formData.age) : null,
            nationality: formData.nationality || null,
            gpa: formData.gpa ? Number(formData.gpa) : null,
            sat: formData.satScore ? Number(formData.satScore) : null,
            englishTest: {
                type: englishTestType.toUpperCase(), // "IELTS" | "TOEFL"
                score: formData.englishScore ? Number(formData.englishScore) : null,
            },
            preferredField: formData.fieldOfStudy || null,
            preferredCountry: formData.country || null,
            programLevel: formData.programLevel || null,
        };

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to submit form');
            }

            router.push('/dashboard');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[rgb(246,247,251)] px-4 py-12 font-sans">
            <div className="w-full max-w-[580px]">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
                        Collecting Additional Information
                    </h1>
                    <p className="mt-1.5 text-sm text-slate-500">
                        Please provide your academic details below.
                    </p>
                </div>

                {/* Card Container */}
                <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-3.5 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Row 1: Age & Nationality */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="age" className="mb-1.5 block text-sm font-semibold text-slate-900">
                                    Age
                                </label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    min="10"
                                    max="100"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>

                            <div>
                                <label htmlFor="nationality" className="mb-1.5 block text-sm font-semibold text-slate-900">
                                    Nationality
                                </label>
                                <div className="relative">
                                    <select
                                        id="nationality"
                                        name="nationality"
                                        value={formData.nationality}
                                        onChange={handleChange}
                                        className="w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                    >
                                        {COUNTRY_LIST.map((c) => (
                                            <option key={`nat-${c.name}`} value={c.name}>
                                                {c.flag} {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: GPA & SAT Score */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="gpa" className="mb-1.5 block text-sm font-semibold text-slate-900">
                                    GPA
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="4.0"
                                    id="gpa"
                                    name="gpa"
                                    value={formData.gpa}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                                <span className="mt-1 block text-xs font-normal text-slate-400">
                                    Scale: 4.0 and e.g., 4.0
                                </span>
                            </div>

                            <div>
                                <label htmlFor="satScore" className="mb-1.5 block text-sm font-semibold text-slate-900">
                                    SAT Score
                                </label>
                                <input
                                    type="number"
                                    min="400"
                                    max="1600"
                                    id="satScore"
                                    name="satScore"
                                    value={formData.satScore}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>
                        </div>

                        {/* Row 3: IELTS / TOEFL Toggle + Score & Field of Study */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-900">
                                        English Proficiency
                                    </span>
                                    <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
                                        <button
                                            type="button"
                                            onClick={() => handleTestTypeChange('ielts')}
                                            className={`rounded-md px-2.5 py-0.5 text-xs font-semibold transition ${englishTestType === 'ielts'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800'
                                                }`}
                                        >
                                            IELTS
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTestTypeChange('toefl')}
                                            className={`rounded-md px-2.5 py-0.5 text-xs font-semibold transition ${englishTestType === 'toefl'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800'
                                                }`}
                                        >
                                            TOEFL
                                        </button>
                                    </div>
                                </div>

                                <input
                                    type="number"
                                    step={englishTestType === 'ielts' ? '0.5' : '1'}
                                    min="0"
                                    max={englishTestType === 'ielts' ? '9.0' : '120'}
                                    id="englishScore"
                                    name="englishScore"
                                    placeholder={
                                        englishTestType === 'ielts' ? 'e.g. 7.5' : 'e.g. 100'
                                    }
                                    value={formData.englishScore}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>

                            <div>
                                <label htmlFor="fieldOfStudy" className="mb-1.5 block text-sm font-semibold text-slate-900">
                                    Preferred Field of Study <span className="font-normal text-slate-500">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    id="fieldOfStudy"
                                    name="fieldOfStudy"
                                    value={formData.fieldOfStudy}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>
                        </div>

                        {/* Preferred Country */}
                        <div>
                            <label htmlFor="country" className="mb-1.5 block text-sm font-semibold text-slate-900">
                                Preferred Country <span className="font-normal text-slate-500">(Optional)</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                >
                                    <option value="">Select country...</option>
                                    {COUNTRY_LIST.map((c) => (
                                        <option key={`pref-${c.name}`} value={c.name}>
                                            {c.flag} {c.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            </div>
                        </div>

                        {/* Program Level */}
                        <div>
                            <label htmlFor="programLevel" className="mb-1.5 block text-sm font-semibold text-slate-900">
                                Program Level <span className="font-normal text-slate-500">(Optional)</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="programLevel"
                                    name="programLevel"
                                    value={formData.programLevel}
                                    onChange={handleChange}
                                    className="w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                >
                                    <option value="">Select level...</option>
                                    <option value="Bachelor">Bachelor</option>
                                    <option value="Master">Master</option>
                                    <option value="PhD">PhD</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center rounded-lg bg-[#0F52BA] py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B4399] active:scale-[0.99] disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    'Check Eligibility'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}