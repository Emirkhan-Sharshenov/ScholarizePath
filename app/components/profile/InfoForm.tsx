'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function AdditionalInfoForm() {
    const [formData, setFormData] = useState({
        age: '',
        nationality: 'United States',
        gpa: '',
        satScore: '',
        englishScore: '',
        fieldOfStudy: '',
        country: '',
        programLevel: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitted Data:', formData);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F8F9FC] px-4 py-12">
            <div className="w-full max-w-2xl text-center">
                {/* Header */}
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    Collecting Additional Information
                </h1>
                <p className="mt-2 text-sm text-slate-500 sm:text-base">
                    Please provide your academic details below.
                </p>

                {/* Card Container */}
                <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm border border-slate-100/80 text-left sm:p-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Row 1: Age & Nationality */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="age" className="block text-sm font-semibold text-slate-900 mb-2">
                                    Age
                                </label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition duration-150 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>

                            <div>
                                <label htmlFor="nationality" className="block text-sm font-semibold text-slate-900 mb-2">
                                    Nationality
                                </label>
                                <div className="relative">
                                    <select
                                        id="nationality"
                                        name="nationality"
                                        value={formData.nationality}
                                        onChange={handleChange}
                                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-150 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                                    >
                                        <option value="United States">United States</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Canada">Canada</option>
                                        <option value="Germany">Germany</option>
                                        <option value="Uzbekistan">Uzbekistan</option>
                                        <option value="Kazakhstan">Kazakhstan</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: GPA & SAT Score */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="gpa" className="block text-sm font-semibold text-slate-900 mb-2">
                                    GPA
                                </label>
                                <input
                                    type="text"
                                    id="gpa"
                                    name="gpa"
                                    value={formData.gpa}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition duration-150 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                                <span className="mt-1.5 block text-xs text-slate-400 font-normal">
                                    Scale: 4.0 and e.g., 4.0
                                </span>
                            </div>

                            <div>
                                <label htmlFor="satScore" className="block text-sm font-semibold text-slate-900 mb-2">
                                    SAT Score
                                </label>
                                <input
                                    type="text"
                                    id="satScore"
                                    name="satScore"
                                    value={formData.satScore}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition duration-150 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>
                        </div>

                        {/* Row 3: IELTS/TOEFL & Preferred Field of Study */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="englishScore" className="block text-sm font-semibold text-slate-900 mb-2">
                                    IELTS or TOEFL Score
                                </label>
                                <input
                                    type="text"
                                    id="englishScore"
                                    name="englishScore"
                                    value={formData.englishScore}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition duration-150 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>

                            <div>
                                <label htmlFor="fieldOfStudy" className="block text-sm font-semibold text-slate-900 mb-2">
                                    Preferred Field of Study <span className="font-normal text-slate-500">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    id="fieldOfStudy"
                                    name="fieldOfStudy"
                                    value={formData.fieldOfStudy}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition duration-150 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>
                        </div>

                        {/* Row 4: Preferred Country */}
                        <div>
                            <label htmlFor="country" className="block text-sm font-semibold text-slate-900 mb-2">
                                Preferred Country <span className="font-normal text-slate-500">(Optional)</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-150 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                                >
                                    <option value="">Select country...</option>
                                    <option value="United States">United States</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="Germany">Germany</option>
                                    <option value="Australia">Australia</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            </div>
                        </div>

                        {/* Row 5: Program Level */}
                        <div>
                            <label htmlFor="programLevel" className="block text-sm font-semibold text-slate-900 mb-2">
                                Program Level <span className="font-normal text-slate-500">(Optional)</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="programLevel"
                                    name="programLevel"
                                    value={formData.programLevel}
                                    onChange={handleChange}
                                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-150 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                                >
                                    <option value="">Select level...</option>
                                    <option value="Bachelor">Bachelor</option>
                                    <option value="Master">Master</option>
                                    <option value="PhD">PhD</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full rounded-xl bg-[#0D57C6] py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#0947a5] active:scale-[0.99]"
                            >
                                Check Eligibility
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}