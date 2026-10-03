import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// Deadline reminders over a Telegram bot. Needs three env vars:
//   TELEGRAM_BOT_TOKEN       — from @BotFather
//   TELEGRAM_BOT_USERNAME    — the bot's @username, without the @
//   TELEGRAM_WEBHOOK_SECRET  — any long random string; Telegram sends it back
//                              on every webhook call (see scripts/telegram-webhook.mjs)

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://scholarizepath.xyz";

/** How long a "Connect Telegram" link stays valid. */
export const LINK_TTL_MS = 15 * 60 * 1000;

export function telegramConfigured(): boolean {
    return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_USERNAME && process.env.TELEGRAM_WEBHOOK_SECRET);
}

/** A one-time token for t.me/<bot>?start=<token> (Telegram allows A–Z, a–z, 0–9, _ and -, up to 64). */
export function newLinkToken(): { token: string; hash: string } {
    const token = randomBytes(24).toString("base64url");
    return { token, hash: hashLinkToken(token) };
}

export function hashLinkToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export function botLink(token: string): string {
    return `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${token}`;
}

/** Checks the X-Telegram-Bot-Api-Secret-Token header Telegram sends with each update. */
export function isTelegramRequest(header: string | null): boolean {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!secret || !header) return false;
    const a = Buffer.from(header);
    const b = Buffer.from(secret);
    return a.length === b.length && timingSafeEqual(a, b);
}

export function escapeHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * "blocked" means the student blocked the bot or deleted the chat — the
 * caller should forget their chat id rather than keep trying.
 */
export type SendResult = "sent" | "blocked" | "failed";

export async function sendTelegramMessage(
    chatId: string,
    html: string,
    button?: { text: string; url: string }
): Promise<SendResult> {
    try {
        const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: html,
                parse_mode: "HTML",
                link_preview_options: { is_disabled: true },
                ...(button && { reply_markup: { inline_keyboard: [[{ text: button.text, url: button.url }]] } }),
            }),
            signal: AbortSignal.timeout(10_000),
        });
        if (res.ok) return "sent";
        if (res.status === 403) return "blocked";
        const body = await res.json().catch(() => null);
        if (res.status === 400 && /chat not found/i.test(body?.description ?? "")) return "blocked";
        console.error("Telegram sendMessage failed:", res.status, body?.description);
        return "failed";
    } catch (err) {
        console.error("Telegram sendMessage error:", err);
        return "failed";
    }
}
