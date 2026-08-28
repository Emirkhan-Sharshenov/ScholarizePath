import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Users from "@/models/Users";
import Universities from "@/models/Universities";
import Scholarship from "@/models/Scholarship";
import { requireAdmin } from "@/lib/requireAdmin";
import { AuthRequest } from "@/types/auth";

export async function GET(request: AuthRequest) {
    // Только для admin — до этого момента эндпоинт был открыт всем без исключения.
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) {
        return auth;
    }

    try {
        await connectDB();

        const [totalUsers, totalUniversities, totalScholarships, openScholarships] =
            await Promise.all([
                Users.countDocuments(),
                Universities.countDocuments(),
                Scholarship.countDocuments(),
                Scholarship.countDocuments({ isOpen: true }),
            ]);

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers,
                totalUniversities,
                totalScholarships,
                openScholarships,
            },
        });
    } catch (error) {
        console.error("Admin stats API error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}