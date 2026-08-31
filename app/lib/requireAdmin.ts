import { NextResponse } from "next/server";
import { authMiddleware } from "@/middleware/auth.middleware";
import { connectDB } from "@/lib/mongodb";
import Users from "@/models/Users";
import { AuthRequest } from "@/types/auth";

export async function requireAdmin(request: AuthRequest): Promise<string | NextResponse> {
    const auth = await authMiddleware(request);

    if (auth instanceof NextResponse) {
        return auth;
    }

    if (!auth) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    // auth — это объект AuthPayload, а не сам id. Достаём id безопасно,
    // пока не уточнена точная форма AuthPayload (userId / id / _id).
    const userId = String(
        (auth as any).userId ?? (auth as any).id ?? (auth as any)._id ?? ""
    );

    if (!userId) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    await connectDB();

    const user = await Users.findById(userId).select({ role: 1 }).lean();

    if (!user || (user as any).role !== "admin") {
        return NextResponse.json(
            { success: false, message: "Forbidden: admin access required" },
            { status: 403 }
        );
    }

    return userId;
}