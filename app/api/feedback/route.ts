import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Feedback from "@/models/Feedback";

export async function POST(request: Request) {
    try {
        await connectDB();

        const body = await request.json();

        const {
            type,
            title,
            description,
            steps,
            suggestion,
            benefit,
        } = body;

        if (type !== "bug" && type !== "suggestion") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid feedback type",
                },
                { status: 400 }
            );
        }

        if (!title || typeof title !== "string" || !title.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Title is required",
                },
                { status: 400 }
            );
        }

        if (type === "bug") {
            if (
                !description ||
                typeof description !== "string" ||
                !description.trim()
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Bug description is required",
                    },
                    { status: 400 }
                );
            }

            if (
                !steps ||
                typeof steps !== "string" ||
                !steps.trim()
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Steps to reproduce are required",
                    },
                    { status: 400 }
                );
            }
        }

        if (type === "suggestion") {
            if (
                !suggestion ||
                typeof suggestion !== "string" ||
                !suggestion.trim()
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Suggestion is required",
                    },
                    { status: 400 }
                );
            }

            if (
                !benefit ||
                typeof benefit !== "string" ||
                !benefit.trim()
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Benefit is required",
                    },
                    { status: 400 }
                );
            }
        }

        const feedback = await Feedback.create({
            _id: crypto.randomUUID(),

            type,
            title: title.trim(),

            description:
                type === "bug"
                    ? description.trim()
                    : undefined,

            steps:
                type === "bug"
                    ? steps.trim()
                    : undefined,

            suggestion:
                type === "suggestion"
                    ? suggestion.trim()
                    : undefined,

            benefit:
                type === "suggestion"
                    ? benefit.trim()
                    : undefined,

            status: "open",
        });

        return NextResponse.json(
            {
                success: true,
                message: "Feedback submitted successfully",
                feedbackId: feedback._id,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Feedback POST error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to submit feedback",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectDB();

        const feedback = await Feedback.find()
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(
            {
                success: true,
                feedback,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Feedback GET error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch feedback",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        await connectDB();

        const body = await request.json();

        const { id, type } = body;

        // Delete one specific feedback
        if (id) {
            const deleted = await Feedback.findByIdAndDelete(id);

            if (!deleted) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Feedback not found",
                    },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                message: "Feedback deleted successfully",
            });
        }

        // Delete all feedback of a specific type
        if (type === "bug" || type === "suggestion") {
            const result = await Feedback.deleteMany({ type });

            return NextResponse.json({
                success: true,
                message: `Deleted ${result.deletedCount} ${type}(s)`,
                deletedCount: result.deletedCount,
            });
        }

        return NextResponse.json(
            {
                success: false,
                message: "Provide either id or type",
            },
            { status: 400 }
        );
    } catch (error) {
        console.error("Feedback DELETE error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete feedback",
            },
            { status: 500 }
        );
    }
}



