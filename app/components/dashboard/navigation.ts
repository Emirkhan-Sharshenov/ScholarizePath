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

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the phone bottom tab bar; everything else lives in the "More" sheet. */
  tab?: boolean;
  /** Rendered under a divider in the desktop sidebar. */
  secondary?: boolean;
  /** One-line description for the "More" sheet tiles. */
  hint?: string;
}

// Single source for the app's navigation — the desktop sidebar, the phone
// bottom tab bar, and the "More" sheet all render from this list.
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tab: true },
  { href: "/scholarships", label: "Scholarships", icon: GraduationCap, tab: true },
  { href: "/universities", label: "Universities", icon: University, tab: true },
  { href: "/aibot", label: "AI Bot", icon: Bot, tab: true },
  { href: "/compare", label: "Compare", icon: Scale, hint: "Universities side by side" },
  { href: "/tracker", label: "Tracker", icon: ClipboardList, hint: "Your applications" },
  { href: "/calculator", label: "Calculator", icon: Calculator, hint: "Study cost estimate" },
  { href: "/student", label: "Student", icon: BookOpen, hint: "Profile and scores" },
  { href: "/favourites", label: "Favourites", icon: Heart, hint: "Saved universities" },
  { href: "/unilist", label: "Uni List", icon: SquareText, hint: "Build your shortlist" },
  { href: "/suggestions", label: "Suggestions", icon: Flag, secondary: true, hint: "Ideas and bug reports" },
  { href: "/support", label: "Support Us", icon: HeartHandshake, secondary: true, hint: "Help keep it running" },
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

export function userDisplayName(user: CurrentUser | null): string {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  return name || "My account";
}

export function userInitials(user: CurrentUser | null): string {
  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((part) => part!.trim()[0]?.toUpperCase())
    .join("");
  return initials || "SP";
}
