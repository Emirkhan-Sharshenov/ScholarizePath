import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import Scholarship from "@/models/Scholarship";
import Universities from "@/models/Universities";

// The public routes worth indexing — kept in sync by hand with app/robots.ts's
// `allow` list — plus every scholarship and university page.
// Rebuilt at most once an hour (crawlers get the cached copy instantly), so
// new records show up within the hour without a redeploy.
export const revalidate = 3600;

const BASE = "https://scholarizepath.xyz";

async function catalogue(): Promise<MetadataRoute.Sitemap> {
    try {
        await connectDB();
        const [scholarships, universities] = await Promise.all([
            Scholarship.find({}, { _id: 1, "verification.checkedAt": 1 }).lean(),
            Universities.find({}, { _id: 1, "verification.checkedAt": 1 }).lean(),
        ]);
        // Last fact-check date when there is one; search engines ignore a lastModified that's always "now".
        const lastModified = (doc: any) => {
            const d = doc?.verification?.checkedAt ? new Date(doc.verification.checkedAt) : null;
            return d && !Number.isNaN(d.getTime()) ? d : undefined;
        };
        return [
            ...scholarships.map((s: any) => ({
                url: `${BASE}/scholarships/${encodeURIComponent(String(s._id))}`,
                lastModified: lastModified(s),
                changeFrequency: "weekly" as const,
                priority: 0.7,
            })),
            ...universities.map((u: any) => ({
                url: `${BASE}/universities/${encodeURIComponent(String(u._id))}`,
                lastModified: lastModified(u),
                changeFrequency: "monthly" as const,
                priority: 0.6,
            })),
        ];
    } catch (err) {
        console.error("[sitemap] Failed to list scholarships and universities:", err);
        // During an hourly rebuild, failing keeps the last good sitemap cached
        // instead of replacing it with one that lists no scholarships. At build
        // time there's nothing cached yet, so a short sitemap beats a failed
        // deploy; the next rebuild fills it in.
        if (process.env.NEXT_PHASE === "phase-production-build") return [];
        throw err;
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    return [
        { url: `${BASE}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
        { url: `${BASE}/scholarships`, changeFrequency: "daily", priority: 0.9 },
        { url: `${BASE}/universities`, changeFrequency: "weekly", priority: 0.9 },
        { url: `${BASE}/top`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
        { url: `${BASE}/support`, changeFrequency: "monthly", priority: 0.3 },
        { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
        ...(await catalogue()),
    ];
}
