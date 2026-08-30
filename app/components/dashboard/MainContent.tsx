"use client";

import { useSidebar } from "./SidebarContext";
import { Menu } from "lucide-react";

export default function MainContent({ children }: { children: React.ReactNode }) {
    const { collapsed, setCollapsed } = useSidebar();

    return (
        <div className="flex flex-1 flex-col min-w-0 w-full min-h-screen">
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-30">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    aria-label="Open sidebar"
                >
                    <Menu className="h-5 w-5 text-slate-700" />
                </button>
                <span className="font-semibold text-slate-800 text-sm">Dashboard</span>
                <div className="w-9" />
            </div>

            
            <main
                className={`flex-1 min-w-0 [contain:layout] will-change-[margin-left] transition-[margin-left] duration-200 ease-out ${collapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-64"
                    }`}
            >
                {children}
            </main>
        </div>
    );
}