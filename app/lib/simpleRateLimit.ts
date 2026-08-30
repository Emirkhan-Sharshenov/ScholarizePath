

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
            analytics: true, 
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