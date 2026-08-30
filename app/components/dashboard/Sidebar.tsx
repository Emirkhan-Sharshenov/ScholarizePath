"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Home, GraduationCap, University, Bot, Scale, BookOpen, Heart, SquareText, LogOut, Loader2 } from "lucide-react";
import { useSidebar } from "./SidebarContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/scholarships", label: "Scholarships", icon: GraduationCap },
  { href: "/universities", label: "University", icon: University },
  { href: "/aibot", label: "AI Bot", icon: Bot },
  { href: "/compare", label: "Compare", icon: Scale },
  { href: "/student", label: "Student", icon: BookOpen },
  { href: "/favourites", label: "Favourites", icon: Heart },
  { href: "/unilist", label: "Uni List", icon: SquareText },
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
      <div
        onClick={() => setCollapsed(true)}
        aria-hidden={collapsed}
        className={`fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity duration-200 ease-out ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
          }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-screen bg-[rgb(252,253,255)] flex flex-col items-start overflow-hidden
          transform-gpu will-change-[width,transform] [contain:layout_paint]
          transition-[width,transform] duration-200 ease-out
          ${collapsed ? "-translate-x-full md:translate-x-0 md:w-20" : "translate-x-0 w-64"}`}
      >
        <Link
          href="/dashboard"
          className="mt-4 flex h-11 w-full shrink-0 items-center px-3"
        >
          <div className="flex h-11 w-14 shrink-0 items-center justify-center">
            <Image
              src="/images/logo-icon.png"
              alt="ScholarizePath"
              width={498}
              height={386}
              priority
              className="h-8 w-auto object-contain"
            />
          </div>
          <span
            className={`ml-2 whitespace-nowrap text-lg font-bold tracking-tight text-[rgb(18,26,59)] transition-opacity duration-150 ease-out ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
          >
            ScholarizePath
          </span>
        </Link>

        <div className="mb-4 mt-2 w-full px-3 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
            className="flex h-11 w-14 flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-gray-100"
          >
            <span className={`block h-0.5 w-5 rounded-full bg-black transform-gpu transition-transform duration-200 ease-out ${!collapsed ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-black transition-opacity duration-150 ease-out ${!collapsed ? "opacity-0" : "opacity-100"}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-black transform-gpu transition-transform duration-200 ease-out ${!collapsed ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>

        <nav className="flex w-full flex-col gap-1 px-3 shrink-0">
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
                className={`relative flex h-11 items-center rounded-xl ${isActive ? "bg-[rgb(2,76,209)] text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <div className="flex h-11 w-14 shrink-0 items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>

                <span
                  className={`whitespace-nowrap font-medium transition-opacity duration-150 ease-out ${collapsed ? "opacity-0 md:opacity-0 pointer-events-none" : "opacity-100"
                    }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto mb-4 w-full px-3 shrink-0">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex h-11 w-full items-center rounded-xl text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <div className="flex h-11 w-14 shrink-0 items-center justify-center">
              {loggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
            </div>

            <span
              className={`whitespace-nowrap font-medium transition-opacity duration-150 ease-out ${collapsed ? "opacity-0 md:opacity-0 pointer-events-none" : "opacity-100"
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