"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import {
  NAV_ITEMS,
  isNavItemActive,
  useCurrentUser,
  useLogout,
  userDisplayName,
  userInitials,
  type NavItem,
} from "./navigation";

// Desktop-only sidebar (md and up). On phones navigation lives in the bottom
// tab bar rendered by MainContent instead.
export default function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const { logout, loggingOut } = useLogout();
  const user = useCurrentUser();

  const mainItems = NAV_ITEMS.filter((item) => !item.secondary);
  const secondaryItems = NAV_ITEMS.filter((item) => item.secondary);

  const renderItem = ({ href, label, icon: Icon }: NavItem) => {
    const isActive = isNavItemActive(pathname, href);
    return (
      <Link
        key={href}
        href={href}
        title={collapsed ? label : undefined}
        aria-current={isActive ? "page" : undefined}
        className={`group flex h-11 items-center rounded-xl text-[15px] font-medium transition-colors ${isActive
          ? "bg-brand text-white shadow-[0_6px_16px_rgba(0,88,189,0.25)]"
          : "text-slate-600 hover:bg-slate-100 hover:text-ink"
          }`}
      >
        <span className="flex h-11 w-14 shrink-0 items-center justify-center">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <span className={`whitespace-nowrap transition-opacity duration-150 ${collapsed ? "pointer-events-none opacity-0" : "opacity-100"}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 hidden h-screen flex-col overflow-hidden border-r border-slate-200/70 bg-white font-body md:flex
        transform-gpu [contain:layout_paint] transition-[width] duration-200 ease-out
        ${collapsed ? "w-20" : "w-64"}`}
    >
      <div className="flex h-[72px] shrink-0 items-center justify-between px-3">
        <Link href="/dashboard" className="flex min-w-0 items-center" title="ScholarizePath">
          <span className="flex h-11 w-14 shrink-0 items-center justify-center">
            <Image
              src="/images/logo-icon.png"
              alt="ScholarizePath"
              width={498}
              height={386}
              priority
              className="h-8 w-auto object-contain"
            />
          </span>
          <span className={`whitespace-nowrap font-display text-lg font-bold tracking-tight text-ink transition-opacity duration-150 ${collapsed ? "pointer-events-none opacity-0" : "opacity-100"}`}>
            ScholarizePath
          </span>
        </Link>
      </div>

      <nav aria-label="App navigation" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-3 py-2">
        {mainItems.map(renderItem)}
        <div className="mx-2 my-3 h-px shrink-0 bg-slate-200" />
        {secondaryItems.map(renderItem)}
      </nav>

      <div className="shrink-0 border-t border-slate-200/70 p-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="mb-2 flex h-10 w-full items-center rounded-xl text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
        >
          <span className="flex h-10 w-14 shrink-0 items-center justify-center">
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </span>
          <span className={`whitespace-nowrap transition-opacity duration-150 ${collapsed ? "pointer-events-none opacity-0" : "opacity-100"}`}>
            Collapse
          </span>
        </button>

        {collapsed ? (
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            aria-label="Log out"
            title="Log out"
            className="flex h-11 w-14 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {loggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
          </button>
        ) : (
          <div className="flex items-center rounded-xl bg-slate-50">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-display text-xs font-bold text-white">
                {userInitials(user)}
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{userDisplayName(user)}</span>
              {user?.email && <span className="block truncate text-xs text-slate-500">{user.email}</span>}
            </span>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              aria-label="Log out"
              title="Log out"
              className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {loggingOut ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <LogOut className="h-[18px] w-[18px]" />}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
