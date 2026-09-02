"use client";

import { useState, type FormEvent } from "react";

export default function SuggestionCard() {
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
            type: "suggestion",
            title: formData.get("title"),
            suggestion: formData.get("suggestion"),
            benefit: formData.get("benefit"),
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
                    result.message || "Failed to submit suggestion"
                );
            }

            setMessage("Suggestion submitted successfully!");

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
                    Share Your Suggestions
                </h2>

                <p className="mb-6 text-sm text-slate-500">
                    Have an idea to improve ScholarizePath?
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm text-slate-700">
                            Suggestion Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            required
                            placeholder="Briefly describe your idea..."
                            className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-slate-700">
                            Your Suggestion
                        </label>

                        <textarea
                            name="suggestion"
                            required
                            rows={4}
                            placeholder="What feature would you like to see?"
                            className="w-full resize-none rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-slate-700">
                            How It Helps
                        </label>

                        <textarea
                            name="benefit"
                            required
                            rows={4}
                            placeholder="Explain why this feature would be beneficial..."
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
                            : "Submit Suggestion"}
                    </button>
                </form>
            </div>
        </div>
    );
}



