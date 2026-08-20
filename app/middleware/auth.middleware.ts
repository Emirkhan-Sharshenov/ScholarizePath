import jwt from "jsonwebtoken";
import { NextResponse, NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function authMiddleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized",
            },
            { status: 401 }
        );
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
        };

        return decoded.userId;
    } catch {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid token",
            },
            { status: 401 }
        );
    }
}