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
    /** In the scholarship's own currency; "" when no amount is on file. */
    amount: string;
    level: string;
    country?: string;
}

export interface UniversityCardData {
    id: string;
    name: string;
    /** "City, Country"; "" when unknown. */
    location: string;
    /** "World #7" or "National #42"; "" when unranked. */
    rankBadge: string;
    country?: string;
}

export interface AIChatResponse {
    reply: string;
    scholarships: ScholarshipCardData[];
    universities: UniversityCardData[];
}