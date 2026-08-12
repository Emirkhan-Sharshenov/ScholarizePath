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
            englishTest,
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

        user.profile = {
            ...user.profile,
            age,
            nationality,
            gpa,
            sat,
            englishTest,
            preferredField,
            preferredCountry,
            programLevel,
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