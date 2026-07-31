"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";

export function Providers({ children }: { children: React.ReactNode }) {
    return <AppRouterCacheProvider>{children}</AppRouterCacheProvider>;
}