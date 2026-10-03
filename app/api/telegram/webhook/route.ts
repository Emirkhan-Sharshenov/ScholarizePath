import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/Users";
import { getMessages } from "@/i18n/messages";
import { isLocale, localeFromAcceptLanguage, type Locale } from "@/i18n/config";
import { APP_URL, hashLinkToken, isTelegramRequest, sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";

interface TelegramUpdate {
    message?: {
        text?: string;
        chat?: { id?: number; type?: string };
        from?: { username?: string; language_code?: string };
    };
}

const PROFILE_URL = `${APP_URL}/student`;

// Telegram calls this for every message to the bot (public in proxy.ts;
// authenticated by the secret token set with setWebhook). It always answers
// 200 — anything else makes Telegram retry the same update.
export async function POST(request: NextRequest) {
    if (!isTelegramRequest(request.headers.get("x-telegram-bot-api-secret-token"))) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    try {
        const update = (await request.json().catch(() => ({}))) as TelegramUpdate;
        const message = update.message;
        const chatId = message?.chat?.id;
        // Private chats only: a group shouldn't receive one student's reminders.
        if (!message?.text || chatId === undefined || message.chat?.type !== "private") {
            return NextResponse.json({ ok: true });
        }

        await connectDB();
        const chat = String(chatId);
        const [command, payload] = message.text.trim().split(/\s+/, 2);
        const languageOf = (saved?: string): Locale => (isLocale(saved) ? saved : localeFromAcceptLanguage(message.from?.language_code));

        if (command === "/start" && payload) {
            const user = await User.findOne({ "telegramLink.tokenHash": hashLinkToken(payload) })
                .select({ telegramLink: 1 })
                .lean<{ _id: string; telegramLink?: { expiresAt?: Date; locale?: string } }>();
            const locale = languageOf(user?.telegramLink?.locale);
            const m = getMessages(locale).telegram;

            if (!user || !user.telegramLink?.expiresAt || new Date(user.telegramLink.expiresAt) < new Date()) {
                await sendTelegramMessage(chat, m.linkExpired, { text: m.profile, url: PROFILE_URL });
                return NextResponse.json({ ok: true });
            }

            // One chat belongs to one account: connecting it here disconnects it elsewhere.
            await User.updateMany({ "telegram.chatId": chat, _id: { $ne: user._id } }, { $unset: { telegram: 1 } });
            await User.findByIdAndUpdate(user._id, {
                telegram: { chatId: chat, username: message.from?.username ?? null, locale, linkedAt: new Date() },
                $unset: { telegramLink: 1 },
            });
            await sendTelegramMessage(chat, m.linked);
            return NextResponse.json({ ok: true });
        }

        if (command === "/stop") {
            const user = await User.findOneAndUpdate({ "telegram.chatId": chat }, { $unset: { telegram: 1 } })
                .select({ telegram: 1 })
                .lean<{ telegram?: { locale?: string } }>();
            const m = getMessages(languageOf(user?.telegram?.locale)).telegram;
            await sendTelegramMessage(chat, m.stopped, { text: m.profile, url: PROFILE_URL });
            return NextResponse.json({ ok: true });
        }

        // /start without a token, or anything else.
        const m = getMessages(languageOf()).telegram;
        await sendTelegramMessage(chat, m.welcome, { text: m.profile, url: PROFILE_URL });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Telegram webhook error:", error);
        return NextResponse.json({ ok: true });
    }
}
