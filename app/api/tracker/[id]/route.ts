import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Application, { APPLICATION_STATUS_VALUES } from "@/models/Application";
import { authMiddleware } from "@/middleware/auth.middleware";
import { AuthRequest } from "@/types/auth";
import { cleanDocuments, suggestedDocuments } from "@/lib/applicationDocuments";
import { getLocale } from "@/i18n/server";

export async function PATCH(
    request: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const auth = await authMiddleware(request);
        if (auth instanceof NextResponse) return auth;

        const { id } = await params;
        const body = await request.json();

        const update: Record<string, unknown> = {};

        if ("status" in body) {
            if (!APPLICATION_STATUS_VALUES.includes(body.status)) {
                return NextResponse.json(
                    { success: false, message: "Invalid status" },
                    { status: 400 }
                );
            }
            update.status = body.status;
        }

        if ("deadline" in body) {
            update.deadline = body.deadline ? new Date(body.deadline) : null;
        }

        if ("notes" in body && typeof body.notes === "string") {
            update.notes = body.notes;
        }

        if ("documents" in body) {
            const documents = cleanDocuments(body.documents);
            if (!documents) {
                return NextResponse.json(
                    { success: false, message: "Invalid documents" },
                    { status: 400 }
                );
            }
            update.documents = documents;
        }

        // Fills an empty checklist from the scholarship/university record —
        // for applications tracked before checklists existed.
        if (body.prefillDocuments === true) {
            const current = await Application.findOne({ _id: id, userId: auth.userId }).select({ itemType: 1, itemId: 1 }).lean<{ itemType: "university" | "scholarship"; itemId: string }>();
            if (!current) {
                return NextResponse.json(
                    { success: false, message: "Tracked application not found" },
                    { status: 404 }
                );
            }
            update.documents = await suggestedDocuments(current.itemType, current.itemId, await getLocale());
        }

        if (Object.keys(update).length === 0) {
            return NextResponse.json(
                { success: false, message: "Nothing to update" },
                { status: 400 }
            );
        }

        const application = await Application.findOneAndUpdate(
            { _id: id, userId: auth.userId },
            update,
            { new: true, runValidators: true }
        ).lean();

        if (!application) {
            return NextResponse.json(
                { success: false, message: "Tracked application not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, application });
    } catch (error) {
        console.error("Tracker PATCH error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update tracked application" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: AuthRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const auth = await authMiddleware(request);
        if (auth instanceof NextResponse) return auth;

        const { id } = await params;

        const deleted = await Application.findOneAndDelete({ _id: id, userId: auth.userId });

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: "Tracked application not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Tracker DELETE error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to remove tracked application" },
            { status: 500 }
        );
    }
}
