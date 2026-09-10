import { NextRequest, NextResponse } from "next/server";

import { sendDeadlineReminders } from "@/services/reminders.service";
import { withErrorHandler } from "@/middleware/error.middleware";

async function handler(request: NextRequest) {
    const authHeader = request.headers.get("authorization");

    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    const summary = await sendDeadlineReminders();

    return NextResponse.json({ success: true, ...summary });
}

export const GET = withErrorHandler(handler);
