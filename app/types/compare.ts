export interface UniversityComparisonData {
    id: string;
    name: string;
    logo: string;
    globalRanking: string;
    location: string;
    tuitionAnnual: string;
    acceptanceRate: string;
    acceptanceRateStatus: "good" | "strict";
    popularPrograms: string;
    popularProgramsStatus: "good" | "strict";
    studentFacultyRatio: string;
    ratioStatus: "good" | "strict";
}