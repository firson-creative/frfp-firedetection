"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Map,
  Zap,
  UploadCloud,
  FileText,
  Flame,
  Droplet,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, []);

  const navLinks = [
    { href: "/", label: "Peta Nasional", icon: Map },
    { href: "/predict", label: "Prediksi Cepat", icon: Zap },
    { href: "/ingest", label: "Upload CSV", icon: UploadCloud },
    { href: "/priority-list", label: "Surat Tugas Satgas", icon: FileText },
  ];

  return (
    <div className="flex min-h-screen w-full">
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden print:hidden"
        />
      )}

      <aside
        className={`print:hidden fixed lg:sticky top-0 left-0 z-50 h-screen flex-shrink-0 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between transition-all duration-200 overflow-hidden ${
          isOpen
            ? "w-60 translate-x-0"
            : "w-0 -translate-x-full lg:w-0 lg:border-r-0"
        }`}
      >
        <div className="w-60 flex flex-col h-full justify-between">
          <div>
            <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
              <Link href="/" className="flex items-center gap-2.5 min-w-0">
                <img
                  src="/logo.png"
                  alt="Logo FRFP"
                  className="w-8 h-8 object-contain flex-shrink-0 dark:hidden"
                />
                <img
                  src="/logo-dark.png"
                  alt="Logo FRFP"
                  className="w-8 h-8 object-contain flex-shrink-0 hidden dark:block"
                />
                <div className="truncate">
                  <div className="font-display text-sm tracking-wider text-zinc-950 dark:text-white">
                    FRFP
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                    Fire Risk Foresight
                  </div>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Sembunyikan Sidebar"
                aria-label="Sembunyikan Sidebar"
                className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            <nav className="p-3 space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (typeof window !== "undefined" && window.innerWidth < 1024) {
                        setIsOpen(false);
                      }
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-black"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Tema
              </span>

              <div
                className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                role="group"
                aria-label="Pengaturan Tema"
              >
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  title="Mode Terang (Light)"
                  aria-label="Mode Terang"
                  className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${
                    theme === "light"
                      ? "bg-white text-amber-600 border border-zinc-200"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  title="Mode Gelap (Dark)"
                  aria-label="Mode Gelap"
                  className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${
                    theme === "dark"
                      ? "bg-black text-sky-400 border border-zinc-700"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <Droplet className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {!isOpen && (
          <div className="print:hidden sticky top-0 z-30 h-11 px-3 sm:px-5 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                title="Tampilkan Sidebar"
                aria-label="Tampilkan Sidebar"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-xs font-semibold"
              >
                <PanelLeftOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Sidebar</span>
              </button>
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Logo FRFP"
                  className="w-6 h-6 object-contain dark:hidden"
                />
                <img
                  src="/logo-dark.png"
                  alt="Logo FRFP"
                  className="w-6 h-6 object-contain hidden dark:block"
                />
                <span className="font-display text-xs tracking-wider text-zinc-950 dark:text-white">FRFP</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                role="group"
                aria-label="Pengaturan Tema"
              >
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  title="Mode Terang (Light)"
                  aria-label="Mode Terang"
                  className={`flex items-center justify-center p-1 rounded-md transition-colors ${
                    theme === "light"
                      ? "bg-white text-amber-600 border border-zinc-200"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  title="Mode Gelap (Dark)"
                  aria-label="Mode Gelap"
                  className={`flex items-center justify-center p-1 rounded-md transition-colors ${
                    theme === "dark"
                      ? "bg-black text-sky-400 border border-zinc-700"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <Droplet className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 w-full px-3 sm:px-5 lg:px-6 py-3 sm:py-4">
          {children}
        </main>

        <footer className="border-t border-zinc-200 dark:border-zinc-800 py-2.5 px-4 sm:px-6 text-[11px] text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            &copy; 2026 FRFP — Fire Risk Foresight &amp; Prioritization | Jaga Hutan Jaga Rumah Kita
          </span>
          <span>
            ANN-MLP (Scikit-Learn + FastAPI + Next.js) &bull; Dataset Satelit VIIRS 375m
          </span>
        </footer>
      </div>
    </div>
  );
}
