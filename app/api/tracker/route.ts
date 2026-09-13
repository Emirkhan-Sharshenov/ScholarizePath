import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Application from "@/models/Application";
import { authMiddleware } from "@/middleware/auth.middleware";
import { AuthRequest } from "@/types/auth";

export async function GET(request: AuthRequest) {
    try {
        await connectDB();

        const auth = await authMiddleware(request);
        if (auth instanceof NextResponse) return auth;

        const applications = await Application.find({ userId: auth.userId })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, applications });
    } catch (error) {
        console.error("Tracker GET error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch tracked applications" },
            { status: 500 }
        );
    }
}

export async function POST(request: AuthRequest) {
    try {
        await connectDB();

        const auth = await authMiddleware(request);
        if (auth instanceof NextResponse) return auth;

        const body = await request.json();
        const { itemType, itemId, itemName, itemSubtitle, deadline } = body;

        if (itemType !== "university" && itemType !== "scholarship") {
            return NextResponse.json(
                { success: false, message: "itemType must be 'university' or 'scholarship'" },
                { status: 400 }
            );
        }

        if (!itemId || typeof itemId !== "string") {
            return NextResponse.json(
                { success: false, message: "itemId is required" },
                { status: 400 }
            );
        }

        if (!itemName || typeof itemName !== "string" || !itemName.trim()) {
            return NextResponse.json(
                { success: false, message: "itemName is required" },
                { status: 400 }
            );
        }

        const application = await Application.create({
            _id: crypto.randomUUID(),
            userId: auth.userId,
            itemType,
            itemId,
            itemName: itemName.trim(),
            itemSubtitle: typeof itemSubtitle === "string" ? itemSubtitle.trim() : null,
            deadline: deadline ? new Date(deadline) : null,
            status: "not_started",
            notes: "",
        });

        return NextResponse.json({ success: true, application }, { status: 201 });
    } catch (error: unknown) {
        // Duplicate (userId, itemType, itemId) — already being tracked.
        if (typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000) {
            return NextResponse.json(
                { success: false, message: "This item is already being tracked" },
                { status: 409 }
            );
        }

        console.error("Tracker POST error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to track application" },
            { status: 500 }
        );
    }
}
