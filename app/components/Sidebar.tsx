"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, GraduationCap, BookOpen, Trophy, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/scholarships", label: "Scholarships", icon: GraduationCap },
  { href: "/tasks", label: "Tasks", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`left-0 top-0 h-screen bg-[rgb(252,253,255)] flex flex-col items-start transition-all duration-300 ${collapsed ? "w-20" : "w-62"
        }`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle sidebar"
        className={`mt-4 mb-4 flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 ${collapsed ? "ml-[22px]" : "ml-4"
          }`}
      >
        <span
          className={`block h-0.5 w-5 rounded-full bg-black transition-all duration-300 ${!collapsed ? "translate-y-2 rotate-45" : ""
            }`}
        />
        <span
          className={`block h-0.5 w-5 rounded-full bg-black transition-all duration-300 ${!collapsed ? "opacity-0" : "opacity-100"
            }`}
        />
        <span
          className={`block h-0.5 w-5 rounded-full bg-black transition-all duration-300 ${!collapsed ? "-translate-y-2 -rotate-45" : ""
            }`}
        />
      </button>

      <nav className="flex w-full flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-start rounded-xl py-2 pl-[18px] pr-3 transition-all duration-300 ${isActive
                  ? "bg-[rgb(2,76,209)] text-white"
                  : "text-gray-700 hover:bg-gray-100"
                } ${collapsed ? "gap-0" : "gap-3"}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
                  }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}