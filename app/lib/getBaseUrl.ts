

export function getBaseUrl(): string {
  
    if (process.env.INTERNAL_API_URL) {
        return process.env.INTERNAL_API_URL;
    }

  
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // 3. Локальная разработка
    return "http://localhost:3000";
}