"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Map,
  Zap,
  UploadCloud,
  FileText,
  Activity,
  Radio,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import axios from "axios";

export default function Navbar() {
  const pathname = usePathname();
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<{ count: number; high: number } | null>(null);

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

  const triggerNrtSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await axios.post("http://localhost:8000/api/v1/sync-nrt");
      setSyncToast({
        count: res.data.added_count,
        high: res.data.high_risk_count,
      });
      setTimeout(() => setSyncToast(null), 5000);
    } catch (err) {
      console.error("NRT Sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const navLinks = [
    { href: "/", label: "Peta Nasional", icon: Map },
    { href: "/predict", label: "Prediksi Cepat", icon: Zap },
    { href: "/ingest", label: "Upload CSV", icon: UploadCloud },
    { href: "/priority-list", label: "Surat Tugas Satgas", icon: FileText },
    { href: "/model-diagnostics", label: "Diagnostik JST", icon: Activity },
  ];

  return (
    <header className="liquid-glass border-b border-emerald-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-950/80 border border-emerald-400/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)] group-hover:scale-105 group-hover:border-emerald-400 transition-all">
              <ShieldCheck className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="text-base font-extrabold text-white tracking-wider flex items-center gap-2">
                FRFP
                <span className="text-[11px] font-semibold text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 font-mono tracking-normal">
                  v2.0 NATIONWIDE
                </span>
              </div>
              <div className="text-[11px] text-emerald-100/70 font-medium tracking-tight">
                Fire Risk Foresight & Prioritization
              </div>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                      : "text-gray-300 hover:bg-emerald-950/40 hover:text-emerald-200 hover:border hover:border-emerald-500/20"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: NRT Sync & Server Status */}
          <div className="flex items-center gap-3">
            {/* Quick NRT Sync Button */}
            <button
              onClick={triggerNrtSync}
              disabled={isSyncing}
              title="Perbarui data satelit Near-Realtime (NRT) otomatis"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-400 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Radio className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? "animate-pulse text-yellow-400" : ""}`} />
              <span>{isSyncing ? "Syncing NRT..." : "Auto-Sync NRT"}</span>
              <RefreshCw className={`w-3 h-3 text-emerald-400/80 ${isSyncing ? "animate-spin" : ""}`} />
            </button>

            {/* Server Online Indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-[11px] font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  serverOnline === true
                    ? "bg-emerald-400 shadow-[0_0_8px_#34D399]"
                    : serverOnline === false
                    ? "bg-red-500 shadow-[0_0_8px_#EF4444]"
                    : "bg-gray-400"
                }`}
              />
              <span className="hidden md:inline text-gray-300">
                {serverOnline === true ? (
                  <span className="text-emerald-300 font-semibold">API Live</span>
                ) : serverOnline === false ? (
                  <span className="text-red-400 font-semibold">Offline</span>
                ) : (
                  "Checking..."
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="bg-emerald-900/90 border-b border-emerald-400/50 py-1.5 px-4 text-center text-xs text-emerald-100 flex items-center justify-center gap-2 shadow-lg animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          <span>
            Sinkronisasi NRT Berhasil! Ditambahkan <strong>{syncToast.count} titik baru</strong> (
            <span className="text-red-300 font-bold">{syncToast.high} High Risk</span>).
          </span>
        </div>
      )}
    </header>
  );
}
