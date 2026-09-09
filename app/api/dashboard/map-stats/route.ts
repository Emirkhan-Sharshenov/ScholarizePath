import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Universities from "@/models/Universities";
import Scholarship from "@/models/Scholarship";

export async function GET() {
    try {
        await connectDB();

        const [universityCounts, scholarshipCounts] = await Promise.all([
            Universities.aggregate([
                { $match: { "location.country": { $type: "string", $ne: "" } } },
                { $group: { _id: "$location.country", count: { $sum: 1 } } },
            ]),
            Scholarship.aggregate([
                { $match: { country: { $type: "string", $ne: "" } } },
                { $group: { _id: "$country", count: { $sum: 1 } } },
            ]),
        ]);

        const universities: Record<string, number> = {};
        for (const { _id, count } of universityCounts) universities[_id] = count;

        const scholarships: Record<string, number> = {};
        for (const { _id, count } of scholarshipCounts) scholarships[_id] = count;

        return NextResponse.json({ universities, scholarships });
    } catch (error) {
        console.error("Map stats API error:", error);
        return NextResponse.json(
            { message: "Failed to fetch map statistics" },
            { status: 500 }
        );
    }
}
