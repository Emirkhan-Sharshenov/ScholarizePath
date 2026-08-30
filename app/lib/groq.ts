import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY environment variable");
}

export const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const AI_MODEL = "openai/gpt-oss-120b";