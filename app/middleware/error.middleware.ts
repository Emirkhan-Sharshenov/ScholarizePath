import { NextResponse } from "next/server";

export function withErrorHandler(handler: Function) {
    return async (request: Request) => {
        try {
            return await handler(request)
        } catch (err) {
            console.error(err)
        }


        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error"
            },
            {
                status: 500
            }
        )
    }
}