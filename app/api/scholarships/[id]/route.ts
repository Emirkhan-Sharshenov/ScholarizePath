import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Scholarships from "@/models/Scholarship";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;

        console.log("REQUESTED SCHOLARSHIP ID:", id);

        const scholarship = await Scholarships
            .findOne({ _id: id })
            .lean();

        console.log("FOUND SCHOLARSHIP:", scholarship);

        if (!scholarship) {
            return NextResponse.json(
                { message: "Scholarship not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(scholarship);

    } catch (error) {
        console.error("Scholarship API error:", error);

        return NextResponse.json(
            { message: "Failed to fetch scholarship" },
            { status: 500 }
        );
    }
}