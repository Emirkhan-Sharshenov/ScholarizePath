// Points the Telegram bot at the site's webhook and sets its command menu.
// Run once after creating the bot (and again if the domain or secret changes):
//
//   TELEGRAM_BOT_TOKEN=... TELEGRAM_WEBHOOK_SECRET=... node scripts/telegram-webhook.mjs
//
// Optional: APP_URL=https://staging.example.com to point it somewhere else.

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const appUrl = (process.env.APP_URL || "https://scholarizepath.xyz").replace(/\/$/, "");

if (!token || !secret) {
    console.error("Set TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET first.");
    process.exit(1);
}
if (!/^[A-Za-z0-9_-]{1,256}$/.test(secret)) {
    console.error("TELEGRAM_WEBHOOK_SECRET may only contain A-Z, a-z, 0-9, _ and - (up to 256 characters).");
    process.exit(1);
}

async function call(method, body) {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(`${method}: ${data.description}`);
    return data.result;
}

await call("setWebhook", {
    url: `${appUrl}/api/telegram/webhook`,
    secret_token: secret,
    allowed_updates: ["message"],
    drop_pending_updates: true,
});

await call("setMyCommands", { commands: [{ command: "stop", description: "Stop deadline reminders" }] });
await call("setMyCommands", { commands: [{ command: "stop", description: "Отключить напоминания" }], language_code: "ru" });
await call("setMyDescription", {
    description: "Deadline reminders for the scholarships and universities you save on ScholarizePath.",
});
await call("setMyDescription", {
    description: "Напоминания о дедлайнах стипендий и вузов, которые вы сохранили на ScholarizePath.",
    language_code: "ru",
});

const info = await call("getWebhookInfo", {});
console.log(`Webhook set: ${info.url}`);
