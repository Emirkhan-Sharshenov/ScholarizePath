import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY environment variable");
}

export const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// llama-3.3-70b-versatile: good quality + full tool-calling support on Groq.
// Swap to "openai/gpt-oss-120b" if you want stronger reasoning at similar speed.
export const AI_MODEL = "llama-3.3-70b-versatile";