"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  BookOpen,
  Calculator,
  ClipboardList,
  Flag,
  GraduationCap,
  Heart,
  HeartHandshake,
  LayoutDashboard,
  Scale,
  SquareText,
  University,
  type LucideIcon,
} from "lucide-react";
import type { Messages } from "@/i18n/messages";

export type NavKey = keyof Messages["nav"]["items"];

export interface NavItem {
  href: string;
  /** Looks up the label and hint in the `nav.items` messages. */
  key: NavKey;
  icon: LucideIcon;
  /** Shown in the phone bottom tab bar; everything else lives in the "More" sheet. */
  tab?: boolean;
  /** Rendered under a divider in the desktop sidebar. */
  secondary?: boolean;
}

// Single source for the app's navigation — the desktop sidebar, the phone
// bottom tab bar, and the "More" sheet all render from this list.
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard, tab: true },
  { href: "/scholarships", key: "scholarships", icon: GraduationCap, tab: true },
  { href: "/universities", key: "universities", icon: University, tab: true },
  { href: "/aibot", key: "aibot", icon: Bot, tab: true },
  { href: "/compare", key: "compare", icon: Scale },
  { href: "/tracker", key: "tracker", icon: ClipboardList },
  { href: "/calculator", key: "calculator", icon: Calculator },
  { href: "/student", key: "student", icon: BookOpen },
  { href: "/favourites", key: "favourites", icon: Heart },
  { href: "/unilist", key: "unilist", icon: SquareText },
  { href: "/suggestions", key: "suggestions", icon: Flag, secondary: true },
  { href: "/support", key: "support", icon: HeartHandshake, secondary: true },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function useLogout() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  }, [router]);

  return { logout, loggingOut };
}

export interface CurrentUser {
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Name/email for the account block in the sidebar and the "More" sheet.
// Purely cosmetic — if the request fails the block just shows a generic label.
export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/self")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.user) setUser(data.user);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return user;
}

export function userDisplayName(user: CurrentUser | null, fallback: string): string {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  return name || fallback;
}

export function userInitials(user: CurrentUser | null): string {
  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((part) => part!.trim()[0]?.toUpperCase())
    .join("");
  return initials || "SP";
}
