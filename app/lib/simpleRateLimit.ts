/**
 * Rate limiter на Upstash Redis.
 *
 * Лимит общий для всех serverless-инстансов (Vercel), потому что счётчик
 * хранится в Redis, а не в памяти отдельного процесса — лимит строгий.
 *
 * Ratelimit-объекты кешируются по (limit, windowMs), чтобы не создавать
 * новый инстанс на каждый вызов — библиотека рекомендует переиспользовать.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const limiterCache = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit {
    const cacheKey = `${limit}:${windowMs}`;
    let limiter = limiterCache.get(cacheKey);

    if (!limiter) {
        limiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
            analytics: true, // графики в Upstash Console → твоя база → вкладка Ratelimit
        });
        limiterCache.set(cacheKey, limiter);
    }

    return limiter;
}

export async function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
    const limiter = getLimiter(limit, windowMs);
    const { success, remaining } = await limiter.limit(key);

    return { allowed: success, remaining };
}