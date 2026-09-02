import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export type AuthPayload = {
    userId: string;
    role?: string;
    profileSetupComplete: boolean;
};

export async function authMiddleware(request: NextRequest): Promise<AuthPayload | NextResponse> {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error("CRITICAL: JWT_SECRET is not defined in environment variables.");
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }

    let token = request.cookies.get("token")?.value;

    if (!token) {
        const authHeader = request.headers.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
    }

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized: Token missing" },
            { status: 401 }
        );
    }

    try {
        // jose работает через Web Crypto API — единственный вариант,
        // который гарантированно поддерживается в Edge Runtime
        // (jsonwebtoken тянет Node-only crypto и тут не годится).
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

        if (!payload || typeof payload.userId !== "string") {
            return NextResponse.json(
                { success: false, message: "Unauthorized: Invalid token payload" },
                { status: 401 }
            );
        }

        return {
            userId: payload.userId,
            role: typeof payload.role === "string" ? payload.role : undefined,
            profileSetupComplete: Boolean(payload.profileSetupComplete),
        };
    } catch (error: any) {
        if (error?.code === "ERR_JWT_EXPIRED") {
            return NextResponse.json(
                { success: false, message: "Token expired" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Invalid token" },
            { status: 401 }
        );
    }
}