import type { MetadataRoute } from "next";

// Only "/", "/top" and "/login" are reachable without a session (see
// proxy.ts PUBLIC_PATHS) — everything else redirects an unauthenticated
// visitor to /login anyway, so there's no point letting crawlers spend
// budget on it.
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: ["/", "/top", "/login"],
            disallow: [
                "/api/",
                "/dashboard",
                "/scholarships",
                "/universities",
                "/compare",
                "/student",
                "/favourites",
                "/unilist",
                "/suggestions",
                "/aibot",
                "/admin",
                "/profile/setup",
            ],
        },
        sitemap: "https://scholarizepath.xyz/sitemap.xml",
    };
}
