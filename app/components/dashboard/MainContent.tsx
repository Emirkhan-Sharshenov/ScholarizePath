
"use client";

import { useSidebar } from "./SidebarContext";

export default function MainContent({ children }: { children: React.ReactNode }) {
    const { collapsed } = useSidebar();

    return (
        <main
            className={`flex-1 transition-[margin-left] duration-300 ease-in-out ${collapsed ? "ml-20" : "ml-64"
                }`}
        >
            {children}
        </main>
    );
}