import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Universities from "@/models/Universities";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;

        console.log("REQUESTED UNIVERSITY ID:", id);

        const university = await Universities
            .findOne({ _id: id })
            .lean();

        console.log("FOUND UNIVERSITY:", university);

        if (!university) {
            return NextResponse.json(
                { message: "University not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(university);

    } catch (error) {
        console.error("University API error:", error);

        return NextResponse.json(
            { message: "Failed to fetch university" },
            { status: 500 }
        );
    }
}