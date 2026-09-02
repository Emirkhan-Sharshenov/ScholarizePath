"use client";

import { useState, type FormEvent } from "react";

export default function BugReportCard() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;

        setIsSubmitting(true);
        setMessage("");
        setError("");

        const formData = new FormData(form);

        const data = {
            type: "bug",
            title: formData.get("title"),
            description: formData.get("description"),
            steps: formData.get("steps"),
        };

        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to submit bug report"
                );
            }

            setMessage("Bug report submitted successfully!");

            form.reset();
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
            <div>
                <h2 className="mb-1 text-2xl font-bold text-slate-800">
                    Report a Bug
                </h2>

                <p className="mb-6 text-sm text-slate-500">
                    Found an issue? Let us know so we can fix it.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm text-slate-700">
                            Bug Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            required
                            placeholder="Briefly describe the issue..."
                            className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-slate-700">
                            Bug Description
                        </label>

                        <textarea
                            name="description"
                            required
                            rows={4}
                            placeholder="Describe what went wrong..."
                            className="w-full resize-none rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-slate-700">
                            Steps to Reproduce
                        </label>

                        <textarea
                            name="steps"
                            required
                            rows={4}
                            placeholder={"1. Go to page...\n2. Click on..."}
                            className="w-full resize-none rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {message && (
                        <p className="text-sm text-green-600">
                            {message}
                        </p>
                    )}

                    {error && (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                    >
                        {isSubmitting
                            ? "Submitting..."
                            : "Submit Bug Report"}
                    </button>
                </form>
            </div>
        </div>
    );
}


