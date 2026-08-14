export interface StudentProfile {
    _id: string;
    name?: string;
    email?: string;
    fieldOfInterest?: string;
    preferredCountries?: string[];
    degreeLevel?: string;
    gpa?: number;
    budgetUSD?: number;
    languageTests?: { test: string; score: number }[];
    [key: string]: any;
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface ScholarshipCardData {
    id: string;
    title: string;
    amount: string;
    level: string;
}

export interface UniversityCardData {
    id: string;
    name: string;
    location: string;
    rankBadge: string;
}

export interface AIChatResponse {
    reply: string;
    scholarships: ScholarshipCardData[];
    universities: UniversityCardData[];
}