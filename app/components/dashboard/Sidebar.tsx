"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, GraduationCap, University, Bot, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/scholarships", label: "Scholarships", icon: GraduationCap },
  { href: "/universities", label: "University", icon: University },
  { href: "/aibot", label: "AI Bot", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`left-0 top-0 h-screen bg-[rgb(252,253,255)] flex flex-col items-start transition-[width] duration-300 ease-in-out ${collapsed ? "w-20" : "w-64"
        }`}
    >
      {/* Кнопка Hamburger */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label="Toggle sidebar"
        className="mt-4 mb-4 ml-4 flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span
          className={`block h-0.5 w-5 rounded-full bg-black transition-transform duration-300 ${!collapsed ? "translate-y-2 rotate-45" : ""
            }`}
        />
        <span
          className={`block h-0.5 w-5 rounded-full bg-black transition-opacity duration-300 ${!collapsed ? "opacity-0" : "opacity-100"
            }`}
        />
        <span
          className={`block h-0.5 w-5 rounded-full bg-black transition-transform duration-300 ${!collapsed ? "-translate-y-2 -rotate-45" : ""
            }`}
        />
      </button>

      {/* Навигация */}
      <nav className="flex w-full flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex h-11 items-center rounded-xl px-3.5 transition-colors duration-200 ${isActive ? "text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              {/* Синяя плашка активного пункта */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl bg-[rgb(2,76,209)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  style={{ zIndex: 0 }}
                />
              )}

              {/* Иконка (фиксированное место) */}
              <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>

              {/* Текст с чистым opacity/transform (без подёргиваний ширины) */}
              <span
                className={`relative z-10 ml-3 whitespace-nowrap font-medium transition-all duration-200 ease-in-out ${collapsed
                    ? "pointer-events-none -translate-x-2 opacity-0"
                    : "translate-x-0 opacity-100"
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