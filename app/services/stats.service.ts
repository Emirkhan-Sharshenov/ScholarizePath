import { connectDB } from "../lib/mongodb";
import Scholarships from "../models/Scholarship";
import Universities from "../models/Universities";
import Users from "../models/Users";

interface LocationObject {
    country?: string;
    city?: string;
    region?: string;
}

interface RankedUniversity {
    id: string;
    name: string;
    location: string;
    favoriteCount: number;
}

interface RankedScholarship {
    id: string;
    name: string;
    country: string;
    favoriteCount: number;
}

// Mirrors the field-shape normalization already used for university cards in
// app/components/dashboard/TopUniversitiesCard.tsx — the `Universities`
// collection is `strict: false`, so `name`/`location` vary between documents.
function formatUniversityName(doc: Record<string, unknown>): string {
    const name = doc.name;
    if (typeof name === "string") return name;
    if (name && typeof name === "object") {
        const n = name as { name?: string; en?: string };
        return n.name || n.en || "University";
    }
    return "University";
}

function formatUniversityLocation(doc: Record<string, unknown>): string {
    const location = doc.location;
    if (typeof location === "string") return location;
    if (typeof doc.country === "string") return doc.country;

    const locObj = (typeof location === "object" ? location : doc.country) as
        | LocationObject
        | undefined;
    if (locObj && typeof locObj === "object") {
        const parts = [locObj.city, locObj.country].filter(
            (p) => typeof p === "string" && p.trim() !== ""
        );
        if (parts.length > 0) return parts.join(", ");
    }

    return "Worldwide";
}

async function getTopUniversities(limit: number): Promise<RankedUniversity[]> {
    const counts = await Users.aggregate([
        { $unwind: "$favoriteUniversities" },
        { $group: { _id: "$favoriteUniversities", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
    ]);

    if (counts.length === 0) return [];

    const docs = await Universities.find(
        { _id: { $in: counts.map((c) => c._id) } },
        { name: 1, location: 1, country: 1 }
    ).lean<Record<string, unknown>[]>();

    const docsById = new Map(docs.map((doc) => [String(doc._id), doc]));

    return counts
        .map(({ _id, count }) => {
            const doc = docsById.get(String(_id));
            if (!doc) return null;
            return {
                id: String(_id),
                name: formatUniversityName(doc),
                location: formatUniversityLocation(doc),
                favoriteCount: count as number,
            };
        })
        .filter((item): item is RankedUniversity => item !== null);
}

async function getTopScholarships(limit: number): Promise<RankedScholarship[]> {
    const counts = await Users.aggregate([
        { $unwind: "$favoriteScholarships" },
        { $group: { _id: "$favoriteScholarships", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
    ]);

    if (counts.length === 0) return [];

    const docs = await Scholarships.find(
        { _id: { $in: counts.map((c) => c._id) } },
        { scholarshipName: 1, country: 1 }
    ).lean<Record<string, unknown>[]>();

    const docsById = new Map(docs.map((doc) => [String(doc._id), doc]));

    return counts
        .map(({ _id, count }) => {
            const doc = docsById.get(String(_id));
            if (!doc) return null;
            return {
                id: String(_id),
                name: (doc.scholarshipName as string) || "Scholarship",
                country: (doc.country as string) || "Worldwide",
                favoriteCount: count as number,
            };
        })
        .filter((item): item is RankedScholarship => item !== null);
}

export async function getTopStats(limit = 8) {
    await connectDB();

    const [topUniversities, topScholarships] = await Promise.all([
        getTopUniversities(limit),
        getTopScholarships(limit),
    ]);

    return { topUniversities, topScholarships };
}
