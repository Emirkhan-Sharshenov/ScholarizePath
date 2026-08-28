import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/Users";
import { authMiddleware } from "@/middleware/auth.middleware";
import { AuthRequest } from "@/types/auth";

export async function POST(request: AuthRequest) {
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
        const {
            age,
            nationality,
            gpa,
            sat,
            englishTest, // expected shape: { type: "IELTS" | "TOEFL", score: number }
            preferredField,
            preferredCountry,
            programLevel,
        } = body;

        // Core academic fields are mandatory; preferredField/preferredCountry/programLevel
        // are optional and can be filled in later from the profile page.
        const missing: string[] = [];
        if (age === undefined || age === null) missing.push("age");
        if (!nationality) missing.push("nationality");
        if (gpa === undefined || gpa === null) missing.push("gpa");
        if (sat === undefined || sat === null) missing.push("sat");
        if (!englishTest || !englishTest.type || englishTest.score === undefined || englishTest.score === null) {
            missing.push("englishTest");
        }

        if (missing.length > 0) {
            return NextResponse.json(
                { success: false, message: `Missing required fields: ${missing.join(", ")}` },
                { status: 400 }
            );
        }

        if (englishTest.type !== "IELTS" && englishTest.type !== "TOEFL") {
            return NextResponse.json(
                { success: false, message: "englishTest.type must be IELTS or TOEFL" },
                { status: 400 }
            );
        }

        const user = await User.findById(auth.userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Already done once — don't let it be redone through this endpoint either.
        if (user.profileSetupComplete) {
            return NextResponse.json(
                { success: false, message: "Profile setup has already been completed" },
                { status: 409 }
            );
        }

        user.profile = {
            age,
            nationality,
            gpa,
            sat,
            englishTest: {
                type: englishTest.type,
                score: englishTest.score,
            },
            preferredField: preferredField || null,
            preferredCountry: preferredCountry || null,
            programLevel: programLevel || null,
        };
        user.profileSetupComplete = true;

        await user.save();

        // Reissue the auth token with the updated flag — otherwise the old cookie
        // still says profileSetupComplete: false and proxy.ts will keep bouncing
        // the user back to /profile/setup forever.
        const authToken = jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role,
                profileSetupComplete: user.profileSetupComplete,
            },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "7d" }
        );

        const response = NextResponse.json(
            {
                success: true,
                message: "Profile setup complete",
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    profile: user.profile,
                    profileSetupComplete: user.profileSetupComplete,
                },
            },
            { status: 200 }
        );

        response.cookies.set({
            name: "token",
            value: authToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Profile setup POST error:", error);

        return NextResponse.json(
            { success: false, message: "Failed to complete profile setup" },
            { status: 500 }
        );
    }
}