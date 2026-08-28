// lib/getBaseUrl.ts
//
// Используется ТОЛЬКО в Server Components / Route Handlers для запросов
// "сервер -> сам к себе". Никогда не импортируй это в "use client" компонент —
// там оно не нужно (там всегда нужен относительный путь "/api/...").

export function getBaseUrl(): string {
    // 1. Явно заданный адрес (задай в .env, если у тебя свой сервер/VPS)
    if (process.env.INTERNAL_API_URL) {
        return process.env.INTERNAL_API_URL;
    }

    // 2. Vercel сам прокидывает этот env при деплое
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // 3. Локальная разработка
    return "http://localhost:3000";
}