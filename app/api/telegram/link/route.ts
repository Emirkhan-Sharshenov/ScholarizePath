import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/Users";
import { authMiddleware } from "@/middleware/auth.middleware";
import { checkRateLimit } from "@/lib/simpleRateLimit";
import { getLocale } from "@/i18n/server";
import { LINK_TTL_MS, botLink, newLinkToken, telegramConfigured } from "@/lib/telegram";
import type { AuthRequest } from "@/types/auth";

const notConfigured = () =>
    NextResponse.json({ success: false, message: "Telegram reminders aren't set up yet" }, { status: 503 });

// "Connect Telegram": a one-time t.me link. Opening it sends /start <token>
// to the bot, and the webhook ties that chat to this account.
export async function POST(request: AuthRequest) {
    try {
        if (!telegramConfigured()) return notConfigured();

        const auth = await authMiddleware(request);
        if (auth instanceof NextResponse) return auth;

        try {
            const { allowed } = await checkRateLimit(`telegram-link:${auth.userId}`, 10, 15 * 60_000);
            if (!allowed) {
                return NextResponse.json(
                    { success: false, message: "Too many requests. Try again later." },
                    { status: 429 }
                );
            }
        } catch (error) {
            console.error("Telegram link rate limit error:", error);
        }

        await connectDB();
        const { token, hash } = newLinkToken();
        const updated = await User.findByIdAndUpdate(auth.userId, {
            telegramLink: { tokenHash: hash, expiresAt: new Date(Date.now() + LINK_TTL_MS), locale: await getLocale() },
        });
        if (!updated) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, url: botLink(token) });
    } catch (error) {
        console.error("Telegram link POST error:", error);
        return NextResponse.json({ success: false, message: "Failed to create the Telegram link" }, { status: 500 });
    }
}

// "Disconnect": forget the chat. The bot simply stops writing.
export async function DELETE(request: AuthRequest) {
    try {
        const auth = await authMiddleware(request);
        if (auth instanceof NextResponse) return auth;

        await connectDB();
        await User.findByIdAndUpdate(auth.userId, { $unset: { telegram: 1, telegramLink: 1 } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Telegram link DELETE error:", error);
        return NextResponse.json({ success: false, message: "Failed to disconnect Telegram" }, { status: 500 });
    }
}
