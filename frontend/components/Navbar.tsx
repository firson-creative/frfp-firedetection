"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Flame, Map, Zap, UploadCloud, FileText, Activity } from "lucide-react";
import axios from "axios";

export default function Navbar() {
  const pathname = usePathname();
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await axios.get("http://localhost:8000/health", { timeout: 3000 });
        setServerOnline(res.status === 200);
      } catch (e) {
        setServerOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { href: "/", label: "Peta & Pemantauan", icon: Map },
    { href: "/predict", label: "Prediksi Cepat", icon: Zap },
    { href: "/ingest", label: "Upload CSV Satelit", icon: UploadCloud },
    { href: "/priority-list", label: "Prioritas Audit & Tugas", icon: FileText },
    { href: "/model-diagnostics", label: "Diagnostik Model", icon: Activity },
  ];

  return (
    <header className="bg-brand-navy border-b border-brand-deepBlue/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Judul */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-lg bg-risk-high/20 border border-risk-high/40 text-risk-high group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                KARHUTLA RIAU <span className="text-brand-cyan text-xs font-semibold px-2 py-0.5 rounded bg-brand-deepBlue/70 border border-brand-cyan/30">ANN-MLP</span>
              </div>
              <div className="text-xs text-gray-400">Prioritas Verifikasi & Audit Kepatuhan Lingkungan</div>
            </div>
          </Link>

          {/* Navigasi Utama */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-deepBlue text-brand-cyan border border-brand-cyan/30 shadow-sm"
                      : "text-gray-300 hover:bg-brand-cardBg hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Status Server */}
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                serverOnline === true
                  ? "bg-risk-low animate-ping"
                  : serverOnline === false
                  ? "bg-risk-high"
                  : "bg-gray-400"
              }`}
            />
            <span className="hidden sm:inline text-gray-300 font-mono">
              API Backend:{" "}
              {serverOnline === true ? (
                <span className="text-green-400 font-semibold">Online :8000</span>
              ) : serverOnline === false ? (
                <span className="text-red-400 font-semibold">Offline</span>
              ) : (
                "Memeriksa..."
              )}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
