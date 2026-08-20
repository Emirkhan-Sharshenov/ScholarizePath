import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY environment variable");
}

export const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// llama-3.3-70b-versatile was deprecated by Groq (June 2026). Using their
// recommended replacement: openai/gpt-oss-120b — full tool-calling + JSON
// mode support, faster inference. Swap to "openai/gpt-oss-20b" for a
// cheaper/faster option if 120b is more than you need.
export const AI_MODEL = "openai/gpt-oss-120b";