import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Universities from "@/models/Universities";

export async function GET() {
    try {
        await connectDB()

        const universities = await Universities.find()

        return NextResponse.json(universities)
    } catch (error) {
        console.error("Universities API error:", error);

        return NextResponse.json(
            { message: "Failed to fetch universities" },
            { status: 500 }
        );
    }
}