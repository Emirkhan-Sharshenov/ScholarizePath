import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Users from "@/models/Users";
import { AuthRequest } from "@/types/auth";
import { authMiddleware } from "@/middleware/auth.middleware";

export async function PATCH(request: AuthRequest) {
    try {
        await connectDB();

        const auth = await authMiddleware(request);

        if (auth instanceof NextResponse) {
            return auth;
        }

        const body = await request.json();

        const {
            age,
            nationality,
            gpa,
            sat,
            englishTestType, // 'ielts' | 'toefl' from AdditionalInfoForm
            englishScore,
            preferredField,
            preferredCountry,
            programLevel,
        } = body;

        const user = await Users.findById(auth);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        // Schema enum only accepts "IELTS" / "TOEFL" (uppercase); the form
        // sends lowercase 'ielts' / 'toefl' — normalize here so it actually
        // matches the enum instead of silently failing validation.
        const normalizedTestType =
            englishTestType === "ielts"
                ? "IELTS"
                : englishTestType === "toefl"
                    ? "TOEFL"
                    : user.profile?.englishTest?.type ?? null;

        user.profile = {
            ...user.profile,
            age: age ?? user.profile?.age ?? null,
            nationality: nationality ?? user.profile?.nationality ?? null,
            gpa: gpa ?? user.profile?.gpa ?? null,
            sat: sat ?? user.profile?.sat ?? null,
            englishTest: {
                type: normalizedTestType,
                score: englishScore ?? user.profile?.englishTest?.score ?? null,
            },
            preferredField: preferredField ?? user.profile?.preferredField ?? null,
            preferredCountry: preferredCountry ?? user.profile?.preferredCountry ?? null,
            programLevel: programLevel ?? user.profile?.programLevel ?? null,
        };

        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: "Profile saved successfully",
                profile: user.profile,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Profile API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to save profile",
            },
            { status: 500 }
        );
    }
}