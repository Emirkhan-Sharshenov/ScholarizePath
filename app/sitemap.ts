import type { MetadataRoute } from "next";

// Kept in sync by hand with app/robots.ts's `allow` list — the only three
// routes reachable without a session.
export default function sitemap(): MetadataRoute.Sitemap {
    const base = "https://scholarizepath.xyz";

    return [
        { url: `${base}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
        { url: `${base}/top`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
        { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ];
}
