/** The parts of a student's profile the advisor uses — no email, ids or account data. */
export interface StudentProfile {
    firstName?: string;
    nationality?: string;
    age?: number;
    gpa?: number;
    sat?: number;
    englishTest?: { type: string; score: number };
    preferredField?: string;
    preferredCountry?: string;
    programLevel?: string;
}

/** A university or scholarship card shown under an assistant reply. */
export interface ShownItem {
    kind: "university" | "scholarship";
    id: string;
    name: string;
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    /** Assistant turns only: the cards shown with the reply, so follow-ups can refer to them. */
    shown?: ShownItem[];
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
