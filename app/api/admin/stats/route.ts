import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Users from "@/models/Users";
import Universities from "@/models/Universities";
import Scholarship from "@/models/Scholarship";

export async function GET() {
    try {
        await connectDB();

        // countDocuments() never loads the documents themselves — it's a
        // metadata-only query, so this stays cheap even at tens of thousands
        // of records, unlike fetching the full list and reading .length.
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