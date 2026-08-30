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

    await connectDB();

    const user = await Users.findById(auth).select({ role: 1 }).lean();

    if (!user || (user as any).role !== "admin") {
        return NextResponse.json(
            { success: false, message: "Forbidden: admin access required" },
            { status: 403 }
        );
    }

    return auth;
}