import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

export type AuthPayload = {
    userId: string;
    role?: string; 
    profileSetupComplete: boolean; 
};

export async function authMiddleware(request: NextRequest): Promise<AuthPayload | NextResponse> {
    if (!JWT_SECRET) {
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
        const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized: Invalid token payload" },
                { status: 401 }
            );
        }

        return decoded;
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            return NextResponse.json(
                { success: false, message: "Token expired" },
                { status: 401 }
            );
        }

        if (error instanceof JsonWebTokenError) {
            return NextResponse.json(
                { success: false, message: "Invalid token" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Authentication failed" },
            { status: 401 }
        );
    }
}