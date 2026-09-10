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
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }


        const user = await User.findById(auth.userId).select("-password").lean();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                user,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Self API GET error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch current user",
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: AuthRequest) {
    try {
        await connectDB();

        const auth = await authMiddleware(request);

        if (auth instanceof NextResponse) {
            return auth;
        }

        if (!auth) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Allowlist, not a blocklist: only fields the current UI actually
        // needs to self-update. Anything else (role, password, isVerified,
        // googleId, profileSetupComplete, ...) is silently dropped rather
        // than trusted from client input — a PUT here used to pass the
        // whole body straight to findByIdAndUpdate, which let any logged-in
        // user grant themselves admin via {"role":"admin"}.
        const ALLOWED_FIELDS = [
            "firstName",
            "lastName",
            "email",
            "profile",
            "deadlineReminders",
            "favoriteUniversities",
            "favoriteScholarships",
        ] as const;

        const updateData: Record<string, unknown> = {};
        for (const field of ALLOWED_FIELDS) {
            if (field in body) updateData[field] = body[field];
        }

        const updatedUser = await User.findByIdAndUpdate(auth.userId, updateData, {
            new: true,
            runValidators: true,
        })
            .select("-password")
            .lean();

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, user: updatedUser },
            { status: 200 }
        );
    } catch (error) {
        console.error("Self API PUT error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to update user profile" },
            { status: 500 }
        );
    }
}