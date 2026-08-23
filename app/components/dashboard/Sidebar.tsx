"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, GraduationCap, University, Bot, Scale, BookOpen, Heart, SquareText, LogOut, Loader2, Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/scholarships", label: "Scholarships", icon: GraduationCap },
  { href: "/universities", label: "University", icon: University },
  { href: "/aibot", label: "AI Bot", icon: Bot },
  { href: "/compare", label: "Compare", icon: Scale },
  { href: "/student", label: "Student", icon: BookOpen },
  { href: "/favourites", label: "Favourites", icon: Heart },
  { href: "/unilist", label: "Uni List", icon: SquareText }
];

export default function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Background Overlay on Mobile */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen bg-[rgb(252,253,255)] flex flex-col items-start transition-[width,transform] duration-300 ease-in-out ${collapsed
            ? "-translate-x-full md:translate-x-0 md:w-20"
            : "translate-x-0 w-64"
          }`}
      >
        <div className="mt-4 mb-4 w-full px-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
            className="flex h-11 w-14 flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className={`block h-0.5 w-5 rounded-full bg-black transition-transform duration-300 ${!collapsed ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-black transition-opacity duration-300 ${!collapsed ? "opacity-0" : "opacity-100"}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-black transition-transform duration-300 ${!collapsed ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>

        <nav className="flex w-full flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    setCollapsed(true);
                  }
                }}
                className={`relative flex h-11 items-center rounded-xl transition-colors duration-200 ${isActive ? "text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-xl bg-[rgb(2,76,209)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    style={{ zIndex: 0 }}
                  />
                )}

                <div className="relative z-10 flex h-11 w-14 shrink-0 items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>

                <span
                  className={`relative z-10 whitespace-nowrap font-medium transition-all duration-200 ease-in-out ${collapsed ? "pointer-events-none -translate-x-2 opacity-0" : "translate-x-0 opacity-100"
                    }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto mb-4 w-full px-3">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex h-11 w-full items-center rounded-xl text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:opacity-50"
          >
            <div className="flex h-11 w-14 shrink-0 items-center justify-center">
              {loggingOut ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogOut className="h-5 w-5" />
              )}
            </div>

            <span
              className={`whitespace-nowrap font-medium transition-all duration-200 ease-in-out ${collapsed ? "pointer-events-none -translate-x-2 opacity-0" : "translate-x-0 opacity-100"
                }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}