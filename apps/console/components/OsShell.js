"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navSections = [
  {
    label: "Core",
    items: [
      { href: "/console", label: "Overview" },
      { href: "/console/assets", label: "Assets" },
      { href: "/console/ai-employees", label: "AI Employees" },
      { href: "/console/tasks", label: "Tasks & Ops" },
    ],
  },
  {
    label: "Departments",
    items: [
      { href: "/console/departments/music", label: "Music (ZIG ZAG)" },
      { href: "/console/departments/art", label: "Art" },
      { href: "/console/departments/collectibles", label: "Collectibles" },
      { href: "/console/departments/crypto", label: "CryptoSpace" },
      { href: "/console/departments/cannabis", label: "Cannabis / Gunga" },
    ],
  },
  {
    label: "Ops & Security",
    items: [
      { href: "/console/finance", label: "Finance & Treasury" },
      { href: "/console/security", label: "Security" },
      { href: "/console/settings", label: "Settings" },
    ],
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function OsShell({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <aside className="hidden md:flex md:flex-col w-72 border-r border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.2em] text-slate-400 uppercase">
              Troupe Inc.
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Troupe-OS
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="px-2 mb-1 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                {section.label}
              </div>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/console" &&
                      pathname.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={classNames(
                          "flex items-center rounded-md px-2.5 py-1.5 text-sm transition-colors",
                          isActive
                            ? "bg-slate-800 text-slate-50"
                            : "text-slate-300 hover:bg-slate-900 hover:text-slate-50"
                        )}
                      >
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="h-14 border-t border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex flex-col">
            <span className="font-medium text-slate-200">Owner</span>
            <span className="text-[11px]">ZIG ZAG / Troupe Inc.</span>
          </div>
          <div className="h-8 w-8 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">
            ZZ
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="md:hidden mr-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 text-slate-300 text-xs">
                OS
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Control Panel
              </span>
              <span className="text-base md:text-lg font-semibold">
                Troupe-OS Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-xs text-slate-400">
              <span>Environment: <span className="text-emerald-400">DEV</span></span>
              <span className="text-[11px]">All activity logged</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950/90">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
