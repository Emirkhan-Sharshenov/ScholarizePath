export interface Scholarship {
    _id: string;
    scholarshipName: string;
    description: string;
    fieldOfStudy: string;
    studyLevel: string | string[];
    country: string;
    award?: {
        type?: string;
        tuition?: boolean;
        stipend?: boolean;
        travel?: boolean;
        insurance?: boolean;
        arrivalAllowance?: boolean;
        estimatedValue?: {
            currency: string;
            min?: number;
            max?: number;
        };
    };
    deadlines?: Array<{ name: string; date: string }>;
    requirements?: {
        education?: { minimumDegree?: string };
        language?: { test?: string | null; minimumScore?: string | null; description?: string };
        gpa?: { minimum?: number; description?: string };
        age?: { max?: number; description?: string };
        other?: string[];
    };
    status?: string;
    isOpen?: boolean;
    provider?: { name?: string; type?: string };
    fundingOrganization?: string;
    officialWebsite?: string;
    applicationLink?: string;
    applicationProcess?: string[];
    requiredDocuments?: string[];
    duration?: string;
    intake?: string;
    verified?: boolean;
}