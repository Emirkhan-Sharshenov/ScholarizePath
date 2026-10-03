import type { MetadataRoute } from "next";

// Crawlable without a session (see proxy.ts): "/", "/top", "/privacy", "/support"
// and the scholarship and university catalogue. The list pages load their data
// client-side from /api/scholarships and /api/universities, so crawlers that
// render JavaScript need those too. Everything else redirects a visitor
// without a session to /login, so there's no point letting crawlers spend
// budget on it.
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: ["/", "/top", "/login", "/privacy", "/support", "/scholarships", "/universities", "/api/scholarships", "/api/universities"],
            disallow: [
                "/api/",
                "/dashboard",
                "/compare",
                "/student",
                "/favourites",
                "/unilist",
                "/suggestions",
                "/aibot",
                "/admin",
                "/profile/setup",
                "/tracker",
                "/calculator",
            ],
        },
        sitemap: "https://scholarizepath.xyz/sitemap.xml",
    };
}
