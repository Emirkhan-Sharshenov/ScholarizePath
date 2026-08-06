import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Scholarship from "@/models/Scholarship";

export async function GET() {
    try {
        await connectDB()

        const scholarships = await Scholarship.find()

        return NextResponse.json(scholarships)
    } catch (error) {
        console.error("Failed to fetch")

        return NextResponse.json(
            { message: "Failed to fetch scholarships" },
            { status: 500 }
        )
    }
}