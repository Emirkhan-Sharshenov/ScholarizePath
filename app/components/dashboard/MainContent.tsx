"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, LayoutGrid, Loader2, LogOut, X } from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";
import { useSidebar } from "./SidebarContext";
import {
    NAV_ITEMS,
    isNavItemActive,
    useCurrentUser,
    useLogout,
    userDisplayName,
    userInitials,
} from "./navigation";

const TAB_ITEMS = NAV_ITEMS.filter((item) => item.tab);
const MORE_ITEMS = NAV_ITEMS.filter((item) => !item.tab);

function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const user = useCurrentUser();
    const { logout, loggingOut } = useLogout();
    const { t } = useI18n();

    useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="more-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-end bg-slate-900/50 backdrop-blur-[2px] md:hidden"
                    onClick={onClose}
                >
                    <motion.div
                        key="more-sheet"
                        role="dialog"
                        aria-modal="true"
                        aria-label={t.nav.moreSections}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-[#f7f9fc] px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 font-body"
                    >
                        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-300" />

                        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand font-display text-sm font-bold text-white">
                                {userInitials(user)}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-display text-base font-semibold text-ink">{userDisplayName(user, t.nav.myAccount)}</span>
                                {user?.email && <span className="block truncate text-sm text-slate-500">{user.email}</span>}
                            </span>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label={t.nav.close}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                            >
                                <X className="h-[18px] w-[18px]" />
                            </button>
                        </div>

                        <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.nav.moreSections}</p>
                        <div className="grid grid-cols-2 gap-3">
                            {MORE_ITEMS.map(({ href, key, icon: Icon }) => {
                                const isActive = isNavItemActive(pathname, href);
                                const { label, hint } = t.nav.items[key];
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={onClose}
                                        aria-current={isActive ? "page" : undefined}
                                        className={`flex flex-col rounded-2xl border bg-white p-4 transition-colors ${isActive ? "border-brand ring-1 ring-brand" : "border-slate-200/80 active:bg-slate-50"}`}
                                    >
                                        <span className="flex items-start justify-between">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand">
                                                <Icon aria-hidden="true" className="h-5 w-5" />
                                            </span>
                                            <ChevronRight aria-hidden="true" className="h-4 w-4 text-slate-300" />
                                        </span>
                                        <span className="mt-3 font-display text-[15px] font-semibold text-ink">{label}</span>
                                        {hint && <span className="mt-0.5 text-xs leading-snug text-slate-500">{hint}</span>}
                                    </Link>
                                );
                            })}
                        </div>

                        <LanguageSwitcher variant="full" className="mt-5 flex w-full bg-white ring-1 ring-slate-200/80" />

                        <button
                            type="button"
                            onClick={logout}
                            disabled={loggingOut}
                            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-50 text-[15px] font-semibold text-red-600 transition-colors active:bg-red-100 disabled:opacity-60"
                        >
                            {loggingOut ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <LogOut className="h-[18px] w-[18px]" />}
                            {t.nav.logOut}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function MainContent({ children }: { children: React.ReactNode }) {
    const { collapsed } = useSidebar();
    const pathname = usePathname();
    const [moreOpen, setMoreOpen] = useState(false);
    const { t } = useI18n();
    const closeMore = useCallback(() => setMoreOpen(false), []);

    const currentItem = NAV_ITEMS.find((item) => isNavItemActive(pathname, item.href));
    const moreActive = MORE_ITEMS.some((item) => isNavItemActive(pathname, item.href));

    return (
        <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-slate-200/70 bg-white/85 px-4 font-body backdrop-blur-md md:hidden">
                <Link href="/dashboard" className="flex shrink-0 items-center" aria-label={t.nav.homeLabel}>
                    <BrandLogo variant="mark" decorative className="text-[30px]" />
                </Link>
                <span className="min-w-0 flex-1 truncate font-display text-base font-semibold text-ink">
                    {currentItem ? t.nav.items[currentItem.key].label : "ScholarizePath"}
                </span>
            </header>

            <main
                className={`min-w-0 flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] [contain:layout] transition-[margin-left] duration-200 ease-out md:pb-0 ${collapsed ? "md:ml-20" : "md:ml-64"}`}
            >
                {children}
            </main>

            <nav
                aria-label={t.nav.appNavigation}
                className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] font-body backdrop-blur-md md:hidden"
            >
                <ul className="grid grid-cols-5">
                    {TAB_ITEMS.map(({ href, key, icon: Icon }) => {
                        const isActive = isNavItemActive(pathname, href);
                        const label = t.nav.items[key].short;
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${isActive ? "text-brand" : "text-slate-500"}`}
                                >
                                    <Icon aria-hidden="true" className="h-[22px] w-[22px]" />
                                    <span className="max-w-full truncate px-0.5">{label}</span>
                                </Link>
                            </li>
                        );
                    })}
                    <li>
                        <button
                            type="button"
                            onClick={() => setMoreOpen(true)}
                            aria-haspopup="dialog"
                            className={`flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${moreActive || moreOpen ? "text-brand" : "text-slate-500"}`}
                        >
                            <LayoutGrid aria-hidden="true" className="h-[22px] w-[22px]" />
                            {t.nav.more}
                        </button>
                    </li>
                </ul>
            </nav>

            <MoreSheet open={moreOpen} onClose={closeMore} />
        </div>
    );
}
