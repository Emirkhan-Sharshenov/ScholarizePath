import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { checkRateLimit } from "@/lib/simpleRateLimit";
import User from "@/models/Users";
import Application from "@/models/Application";
import ReminderLog from "@/models/ReminderLog";
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

// Permanently deletes the signed-in account and everything tied to it
// (tracker entries, sent-reminder log). Feedback is stored without a user
// link, so there is nothing to remove there. The caller re-confirms with
// their password, or with their email for Google accounts, which have none.
export async function DELETE(request: AuthRequest) {
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

        // Caps password guessing with a stolen session. Fails open on a
        // Redis error, like the sign-in limits in proxy.ts.
        try {
            const { allowed } = await checkRateLimit(`delete-account:${auth.userId}`, 5, 15 * 60_000);
            if (!allowed) {
                return NextResponse.json(
                    { success: false, message: "Too many attempts. Please try again in 15 minutes." },
                    { status: 429 }
                );
            }
        } catch (error) {
            console.error("Delete account rate limit error:", error);
        }

        const body = await request.json().catch(() => ({}));
        const user = await User.findById(auth.userId).select("email password role");

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        if (user.password) {
            const ok = typeof body.password === "string" && (await bcrypt.compare(body.password, user.password));
            if (!ok) {
                return NextResponse.json(
                    { success: false, message: "Incorrect password." },
                    { status: 403 }
                );
            }
        } else if (typeof body.email !== "string" || body.email.trim().toLowerCase() !== user.email) {
            return NextResponse.json(
                { success: false, message: "That email doesn't match your account." },
                { status: 403 }
            );
        }

        if (user.role === "admin" && (await User.countDocuments({ role: "admin" })) <= 1) {
            return NextResponse.json(
                { success: false, message: "You're the only admin. Make someone else an admin first." },
                { status: 409 }
            );
        }

        const userId = String(user._id);
        await Promise.all([
            Application.deleteMany({ userId }),
            ReminderLog.deleteMany({ userId }),
        ]);
        await User.deleteOne({ _id: user._id });

        const response = NextResponse.json(
            { success: true, message: "Account deleted" },
            { status: 200 }
        );
        response.cookies.set({
            name: "token",
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            path: "/",
        });
        return response;
    } catch (error) {
        console.error("Self API DELETE error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to delete account" },
            { status: 500 }
        );
    }
}
