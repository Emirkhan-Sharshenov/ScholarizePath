/**
 * Простой rate limiter в памяти процесса.
 *
 * ОГРАНИЧЕНИЕ: если приложение развёрнуто на serverless (Vercel) с несколькими
 * инстансами, у каждого инстанса будет СВОЙ Map — то есть лимит будет
 * "мягким" (условно x2-x5 от заданного числа при большом трафике), а не строгим.
 * Для дева и небольших нагрузок этого достаточно. Когда трафик вырастет —
 * замени на Upstash Redis (@upstash/ratelimit), это займёт 10 минут.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1 };
    }

    if (bucket.count >= limit) {
        return { allowed: false, remaining: 0 };
    }

    bucket.count += 1;
    return { allowed: true, remaining: limit - bucket.count };
}