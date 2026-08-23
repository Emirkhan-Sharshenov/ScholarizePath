import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/Users";
import { authMiddleware } from "@/middleware/auth.middleware";
import { AuthRequest } from "@/types/auth";

export async function GET(request: AuthRequest) {
    try {
        await connectDB();

        const auth = await authMiddleware(request);

        if (auth instanceof NextResponse) {
            return auth;
        }

        if (!auth) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const users = await User.find()
            .select("-password")
            .lean();

        return NextResponse.json(
            {
                success: true,
                users,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Users API GET error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch users",
            },
            { status: 500 }
        );
    }
}