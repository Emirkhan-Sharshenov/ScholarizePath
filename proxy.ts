import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authMiddleware } from "@/middleware/auth.middleware";
import { checkRateLimit } from "@/lib/simpleRateLimit";

// Pages/APIs reachable with NO token at all (exact match)
const PUBLIC_PATHS = new Set<string>(["/", "/login"]);

// Pages/APIs reachable with NO token at all (prefix match — covers nested paths too)
const PUBLIC_PATH_PREFIXES = ["/api/auth/login", "/api/auth/register", "/api/auth/verify"];

const PROFILE_SETUP_PATH = "/profile/setup";

// Paths that get rate-limited, and their own limit/window.
// These are typically unauthenticated, brute-force-able endpoints —
// authenticated routes are usually better protected by normal auth
// throttling/lockout instead of a blanket IP limit.
const RATE_LIMITED_PATHS: { prefix: string; limit: number; windowMs: number }[] = [
    { prefix: "/api/auth/login", limit: 3, windowMs: 40_000 },
    { prefix: "/api/auth/register", limit: 3, windowMs: 40_000 },
    { prefix: "/api/auth/verify", limit: 3, windowMs: 40_000 },
];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 0. Rate limiting — runs before anything else, including auth, since
    //    the whole point is to block excess requests before they cost
    //    anything (a DB lookup, a password hash comparison, etc).
    const rateLimitRule = RATE_LIMITED_PATHS.find((rule) => pathname.startsWith(rule.prefix));

    if (rateLimitRule) {
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
            request.headers.get("x-real-ip") ??
            "127.0.0.1";

        const { allowed, remaining } = await checkRateLimit(
            `${rateLimitRule.prefix}:${ip}`, // scoped per-route, so hammering /login doesn't also lock out /register
            rateLimitRule.limit,
            rateLimitRule.windowMs
        );

        if (!allowed) {
            return NextResponse.json(
                { success: false, message: "Too many requests. Try again later." },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": String(rateLimitRule.limit),
                        "X-RateLimit-Remaining": "0",
                    },
                }
            );
        }
    }

    const isPublicPath =
        PUBLIC_PATHS.has(pathname) ||
        PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    // Try to read the token regardless of whether the route is public,
    // because /login and "/" need to know if a valid session already exists.
    const authResult = await authMiddleware(request);
    const isAuthenticated = !(authResult instanceof NextResponse);

    // 1. Already-logged-in users can't go back to /login,
    //    and (once setup is done) can't land on "/" either
    if (isAuthenticated) {
        const { profileSetupComplete } = authResult;

        if (pathname === "/login") {
            const destination = profileSetupComplete ? "/dashboard" : PROFILE_SETUP_PATH;
            return NextResponse.redirect(new URL(destination, request.url));
        }

        if (profileSetupComplete && pathname === "/") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    // 2. Public routes pass straight through for anyone not caught by rule 1
    if (isPublicPath) {
        return NextResponse.next();
    }

    // 3. Everything else requires a valid token
    if (!isAuthenticated) {
        // authMiddleware already built a 401/500 JSON response.
        if (pathname.startsWith("/api")) {
            return authResult;
        }
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    const { userId, role, profileSetupComplete } = authResult;

    // 4. Profile setup is mandatory and one-time
    if (!profileSetupComplete && pathname !== PROFILE_SETUP_PATH) {
        // Hasn't finished setup yet — force them there no matter what else they try to load.
        if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth/profile")) {
            return NextResponse.json(
                { success: false, message: "Profile setup required" },
                { status: 403 }
            );
        }
        if (!pathname.startsWith("/api")) {
            return NextResponse.redirect(new URL(PROFILE_SETUP_PATH, request.url));
        }
    }

    if (profileSetupComplete && pathname === PROFILE_SETUP_PATH) {
        // Already done it once — can't come back and redo it.
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 5. /admin requires the admin role on top of authentication
    if (pathname.startsWith("/admin") && role !== "admin") {
        if (pathname.startsWith("/api")) {
            return NextResponse.json(
                { success: false, message: "Forbidden: admin access required" },
                { status: 403 }
            );
        }
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 6. Authenticated (and authorized, and past setup) — continue
    const response = NextResponse.next();
    response.headers.set("x-user-id", userId);
    return response;
}

// Run on every route except Next.js internals and static assets.
// Add any other public prefixes (e.g. "/api/public") to the negative lookahead as needed.
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|images|fonts|icons).*)"],
};