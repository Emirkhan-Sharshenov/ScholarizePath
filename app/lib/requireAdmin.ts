import { NextResponse } from "next/server";
import { authMiddleware } from "@/middleware/auth.middleware";
import { connectDB } from "@/lib/mongodb";
import Users from "@/models/Users";
import { AuthRequest } from "@/types/auth";

/**
 * Проверяет, что запрос пришёл от залогиненного пользователя С РОЛЬЮ admin.
 *
 * ВАЖНО: этот хелпер предполагает, что в схеме модели Users есть поле `role`
 * (например role: "student" | "admin"). Если такого поля пока нет —
 * добавь его в модель и вручную проставь role: "admin" своему аккаунту
 * в базе, иначе НИКТО не сможет пройти эту проверку, включая тебя.
 *
 * Возвращает:
 *  - userId (string), если это подтверждённый админ
 *  - NextResponse с 401/403, если нет — просто верни этот response из route handler
 */
export async function requireAdmin(request: AuthRequest): Promise<string | NextResponse> {
    const auth = await authMiddleware(request);

    if (auth instanceof NextResponse) {
        return auth; // authMiddleware уже вернул 401 (нет токена / просрочен / невалиден)
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