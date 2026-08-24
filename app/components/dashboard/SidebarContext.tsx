"use client";

import { createContext, useContext, useMemo, useState } from "react";

type SidebarContextType = {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    // Memoize so consumers only re-render when `collapsed` actually changes,
    // not on every render of SidebarProvider / its parents.
    const value = useMemo(() => ({ collapsed, setCollapsed }), [collapsed]);

    return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within SidebarProvider");
    }
    return context;
}