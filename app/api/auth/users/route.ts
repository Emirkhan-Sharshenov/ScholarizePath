import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/Users";
import { requireAdmin } from "@/lib/requireAdmin";
import { AuthRequest } from "@/types/auth";

export async function GET(request: AuthRequest) {
    // ВАЖНО: раньше здесь проверялось только "залогинен ли вообще кто-то" —
    // то есть любой обычный студент мог выгрузить данные ВСЕХ пользователей.
    // Теперь список пользователей доступен только admin.
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) {
        return auth;
    }

    try {
        await connectDB();

        const users = await User.find()
            .select("-password")
            .lean();

        return NextResponse.json(
            {
                success: true,
                users,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Users API GET error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch users",
            },
            { status: 500 }
        );
    }
}