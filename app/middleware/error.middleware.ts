import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type RouteHandler = (request: NextRequest) => Promise<NextResponse>;

// HOC-обёртка для route-хендлеров: login, logout, register, verify
export function withErrorHandler(handler: RouteHandler): RouteHandler {
    return async (request: NextRequest) => {
        try {
            return await handler(request);
        } catch (err) {
            console.error("API Error:", err);
            return NextResponse.json(
                {
                    success: false,
                    message: "Internal Server Error",
                },
                { status: 500 }
            );
        }
    };
}

// Старая middleware-обёртка (request, next) — оставлена как есть,
// если используется где-то ещё в проекте
export async function errorMiddleware(
    request: NextRequest,
    next: () => Promise<NextResponse>
): Promise<NextResponse> {
    try {
        return await next();
    } catch (err) {
        console.error("Middleware Error:", err);
        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
            },
            {
                status: 500,
            }
        );
    }
}