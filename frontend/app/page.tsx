"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import WelcomeSplash from "@/components/WelcomeSplash";
import {
  Flame,
  AlertTriangle,
  RefreshCw,
  UploadCloud,
  MapPin,
} from "lucide-react";
import Link from "next/link";

const IndonesiaMap = dynamic(() => import("@/components/IndonesiaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-230px)] min-h-[500px] bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-4 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Memuat Peta Spasial Nusantara (Sabang - Merauke)...</span>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_hotspots: 0,
    high_risk_count: 0,
    low_risk_count: 0,
    pending_audit_high_risk: 0,
  });
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<string>("ALL");
  const [backendError, setBackendError] = useState<boolean>(false);

  const fallbackHotspots = [
    {
      type: "Feature",
      geometry: { coordinates: [101.8921, 0.6542] },
      properties: {
        id: 1,
        latitude: 0.6542,
        longitude: 101.8921,
        brightness: 358.4,
        frp: 42.6,
        bright_t31: 292.1,
        delta_t: 66.3,
        probability: 0.9999,
        risk_class: "HIGH RISK",
        province_region: "Riau (Sumatera)",
        subregion: "Kab. Siak",
        acq_date: "2026-11-20",
        acq_time: "0630",
        daynight: "D",
        local_time_str: "2026-11-20 13:30 WIB (Siang)",
        audit_priority: "Sangat Tinggi (P1)",
        audit_status: "PENDING",
        recommendation: "Prioritas Audit Khusus Gakkum & Dispatch Segera Regu Pemadam Manggala Agni.",
        created_at: "2026-11-20 13:30:00",
      },
    },
    {
      type: "Feature",
      geometry: { coordinates: [113.8245, -2.2154] },
      properties: {
        id: 2,
        latitude: -2.2154,
        longitude: 113.8245,
        brightness: 352.0,
        frp: 35.8,
        bright_t31: 293.4,
        delta_t: 58.6,
        probability: 0.9996,
        risk_class: "HIGH RISK",
        province_region: "Kalimantan Tengah",
        subregion: "Pulang Pisau",
        acq_date: "2026-11-20",
        acq_time: "0545",
        daynight: "D",
        local_time_str: "2026-11-20 12:45 WIB (Siang)",
        audit_priority: "Sangat Tinggi (P1)",
        audit_status: "PENDING",
        recommendation: "Batas konsesi lahan gambut dalam, siapkan pemadaman water bombing.",
        created_at: "2026-11-20 12:45:00",
      },
    },
    {
      type: "Feature",
      geometry: { coordinates: [140.4012, -7.5021] },
      properties: {
        id: 3,
        latitude: -7.5021,
        longitude: 140.4012,
        brightness: 349.2,
        frp: 28.5,
        bright_t31: 294.0,
        delta_t: 55.2,
        probability: 0.9992,
        risk_class: "HIGH RISK",
        province_region: "Papua Selatan",
        subregion: "Merauke",
        acq_date: "2026-11-20",
        acq_time: "0415",
        daynight: "D",
        local_time_str: "2026-11-20 13:15 WIT (Siang)",
        audit_priority: "Sangat Tinggi (P1)",
        audit_status: "PENDING",
        recommendation: "Padang savana kering Merauke, verifikasi ground patrol dan sekat bakar.",
        created_at: "2026-11-20 13:15:00",
      },
    },
    {
      type: "Feature",
      geometry: { coordinates: [106.8456, -6.2088] },
      properties: {
        id: 4,
        latitude: -6.2088,
        longitude: 106.8456,
        brightness: 309.2,
        frp: 4.5,
        bright_t31: 297.8,
        delta_t: 11.4,
        probability: 0.0008,
        risk_class: "LOW RISK",
        province_region: "DKI Jakarta (Jawa)",
        subregion: "Jakarta Pusat",
        acq_date: "2026-11-20",
        acq_time: "1420",
        daynight: "N",
        local_time_str: "2026-11-20 21:20 WIB (Malam)",
        audit_priority: "Rendah (P3)",
        audit_status: "VERIFIED",
        recommendation: "Pemantauan satelit berkala, tidak ada anomali radiasi termal berbahaya.",
        created_at: "2026-11-20 21:20:00",
      },
    },
    {
      type: "Feature",
      geometry: { coordinates: [119.4238, -5.1477] },
      properties: {
        id: 5,
        latitude: -5.1477,
        longitude: 119.4238,
        brightness: 312.8,
        frp: 5.1,
        bright_t31: 296.5,
        delta_t: 16.3,
        probability: 0.0015,
        risk_class: "LOW RISK",
        province_region: "Sulawesi Selatan",
        subregion: "Makassar",
        acq_date: "2026-11-20",
        acq_time: "1350",
        daynight: "N",
        local_time_str: "2026-11-20 21:50 WITA (Malam)",
        audit_priority: "Rendah (P3)",
        audit_status: "VERIFIED",
        recommendation: "Pemantauan satelit berkala, intensitas normal.",
        created_at: "2026-11-20 21:50:00",
      },
    },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setBackendError(false);
    try {
      const [statsRes, geoRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/stats`, { timeout: 10000 }),
        axios.get(`${API_BASE_URL}/api/v1/hotspots?limit=1500`, { timeout: 10000 }),
      ]);
      setStats(statsRes.data);
      setHotspots(geoRes.data.features || []);
    } catch (err) {
      console.warn("Server backend belum aktif, menggunakan fallback data representatif:", err);
      setBackendError(true);
      setStats({
        total_hotspots: 5,
        high_risk_count: 3,
        low_risk_count: 2,
        pending_audit_high_risk: 3,
      });
      setHotspots(fallbackHotspots);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4">
      <WelcomeSplash />

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            Sabang s.d. Merauke &bull; 38 Provinsi &bull; Dataset Satelit VIIRS 375m &amp; Input Manual
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight mt-0.5">
            Pantauan Risiko Kebakaran Hutan &amp; Lahan
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Memuat..." : "Muat Ulang Data"}</span>
          </button>

          <Link
            href="/ingest"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition"
          >
            <UploadCloud className="w-3.5 h-3.5" /> Muat Dataset
          </Link>

          <Link
            href="/predict"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
          >
            <Flame className="w-3.5 h-3.5" /> Input Prediksi Manual
          </Link>
        </div>
      </div>

      {backendError && (
        <div className="bg-amber-50 dark:bg-zinc-950 border border-amber-300 dark:border-amber-700 px-3 py-2.5 rounded-lg text-amber-900 dark:text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>
              <strong>Backend (:8000) Offline:</strong> Menampilkan data simulasi nasional.
            </span>
          </div>
          <button
            onClick={fetchData}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-semibold text-xs whitespace-nowrap"
          >
            Coba Lagi
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-zinc-200 dark:border-zinc-800 pb-3 gap-y-3 divide-x-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800">
        <div className="pr-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Total Hotspot Nasional
          </div>
          <div className="text-2xl font-extrabold text-zinc-950 dark:text-white font-mono mt-0.5">
            {loading ? "..." : stats.total_hotspots.toLocaleString()}
          </div>
        </div>

        <div className="sm:px-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            High Risk (Prioritas)
          </div>
          <div className="text-2xl font-extrabold text-red-600 dark:text-red-400 font-mono mt-0.5">
            {loading ? "..." : stats.high_risk_count.toLocaleString()}
          </div>
        </div>

        <div className="sm:px-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Low Risk (Rutin)
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
            {loading ? "..." : stats.low_risk_count.toLocaleString()}
          </div>
        </div>

        <div className="sm:pl-4 flex items-end justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Antrean Audit
            </div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
              {loading ? "..." : stats.pending_audit_high_risk.toLocaleString()}
            </div>
          </div>
          <Link href="/priority-list" className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold pb-1">
            Surat Tugas &rarr;
          </Link>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Peta Sebaran Spasial Titik Panas</span>
          </h2>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium">
            <button
              onClick={() => setSelectedRisk("ALL")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedRisk === "ALL"
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-black font-bold"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              Semua ({hotspots.length})
            </button>
            <button
              onClick={() => setSelectedRisk("HIGH RISK")}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                selectedRisk === "HIGH RISK"
                  ? "bg-red-600 text-white font-bold"
                  : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              High Risk ({stats.high_risk_count})
            </button>
            <button
              onClick={() => setSelectedRisk("LOW RISK")}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                selectedRisk === "LOW RISK"
                  ? "bg-emerald-600 text-white font-bold"
                  : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              Low Risk ({stats.low_risk_count})
            </button>
          </div>
        </div>

        <IndonesiaMap hotspots={hotspots} selectedRisk={selectedRisk} />
      </div>
    </div>
  );
}
