import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function apiProtectionMiddleware(request: NextRequest): NextResponse | null {
 
    const acceptHeader = request.headers.get("accept") || "";
    const fetchDest = request.headers.get("sec-fetch-dest");

    if (fetchDest === "document" || acceptHeader.includes("text/html")) {
        return NextResponse.json(
            { success: false, message: "Forbidden: Direct browser access is not allowed" },
            { status: 403 }
        );
    }

  
    const apiKey = request.headers.get("x-api-key");
    const secretKey = process.env.API_SECRET_KEY;

    if (!secretKey) {
        console.error("CRITICAL: API_SECRET_KEY is not defined");
        return NextResponse.json(
            { success: false, message: "Server configuration error" },
            { status: 500 }
        );
    }

    if (apiKey !== secretKey) {
        return NextResponse.json(
            { success: false, message: "Unauthorized: Server key invalid or missing" },
            { status: 401 }
        );
    }

    
    return null;
}