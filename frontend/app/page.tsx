"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { Flame, AlertTriangle, ShieldCheck, FileSpreadsheet, RefreshCw, Layers } from "lucide-react";
import Link from "next/link";

// Dynamic import Leaflet map component to prevent SSR hydration errors
const RiauMap = dynamic(() => import("@/components/RiauMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[580px] bg-brand-darkBg flex items-center justify-center text-gray-400 rounded-xl border border-brand-deepBlue/50">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin" />
        <span>Memuat Komponen Peta GIS Riau...</span>
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

  // Fallback data representatif Riau jika server backend belum dinyalakan
  const fallbackHotspots = [
    {
      type: "Feature",
      geometry: { coordinates: [101.8921, 0.6542] },
      properties: {
        id: 1,
        latitude: 0.6542,
        longitude: 101.8921,
        brightness: 355.2,
        frp: 38.6,
        bright_t31: 292.4,
        delta_t: 62.8,
        probability: 0.9998,
        risk_class: "HIGH RISK",
        subregion: "Kab. Siak",
        audit_priority: "Sangat Tinggi (P1)",
        audit_status: "PENDING",
        recommendation: "Prioritas Audit Khusus Gakkum & Dispatch Segera Regu Pemadam Manggala Agni.",
        created_at: "2026-11-19 22:00:00"
      }
    },
    {
      type: "Feature",
      geometry: { coordinates: [102.1524, 0.2851] },
      properties: {
        id: 2,
        latitude: 0.2851,
        longitude: 102.1524,
        brightness: 348.6,
        frp: 26.4,
        bright_t31: 294.0,
        delta_t: 54.6,
        probability: 0.9995,
        risk_class: "HIGH RISK",
        subregion: "Kab. Pelalawan",
        audit_priority: "Sangat Tinggi (P1)",
        audit_status: "PENDING",
        recommendation: "Verifikasi patroli darat dan jadwal audit kepatuhan konsesi terdekat.",
        created_at: "2026-11-19 22:05:00"
      }
    },
    {
      type: "Feature",
      geometry: { coordinates: [101.4478, 0.5071] },
      properties: {
        id: 3,
        latitude: 0.5071,
        longitude: 101.4478,
        brightness: 312.4,
        frp: 6.2,
        bright_t31: 298.1,
        delta_t: 14.3,
        probability: 0.0012,
        risk_class: "LOW RISK",
        subregion: "Kota Pekanbaru",
        audit_priority: "Rendah (P3)",
        audit_status: "VERIFIED",
        recommendation: "Pemantauan satelit berkala, tidak mendesak untuk intervensi fisik saat ini.",
        created_at: "2026-11-19 22:10:00"
      }
    },
    {
      type: "Feature",
      geometry: { coordinates: [101.1245, 0.2315] },
      properties: {
        id: 4,
        latitude: 0.2315,
        longitude: 101.1245,
        brightness: 308.5,
        frp: 4.2,
        bright_t31: 298.0,
        delta_t: 10.5,
        probability: 0.0005,
        risk_class: "LOW RISK",
        subregion: "Kab. Kampar",
        audit_priority: "Rendah (P3)",
        audit_status: "VERIFIED",
        recommendation: "Pemantauan satelit berkala, tidak mendesak untuk intervensi fisik saat ini.",
        created_at: "2026-11-19 22:15:00"
      }
    },
    {
      type: "Feature",
      geometry: { coordinates: [101.4500, 1.6800] },
      properties: {
        id: 5,
        latitude: 1.6800,
        longitude: 101.4500,
        brightness: 351.2,
        frp: 31.0,
        bright_t31: 293.1,
        delta_t: 58.1,
        probability: 0.9997,
        risk_class: "HIGH RISK",
        subregion: "Kota Dumai",
        audit_priority: "Sangat Tinggi (P1)",
        audit_status: "PENDING",
        recommendation: "Prioritas patroli udara dan audit batas konsesi gambut.",
        created_at: "2026-11-19 22:20:00"
      }
    }
  ];

  const fetchData = async () => {
    setLoading(true);
    setBackendError(false);
    try {
      const [statsRes, geoRes] = await Promise.all([
        axios.get("http://localhost:8000/api/v1/stats", { timeout: 3500 }),
        axios.get("http://localhost:8000/api/v1/hotspots?limit=500", { timeout: 3500 }),
      ]);
      setStats(statsRes.data);
      setHotspots(geoRes.data.features || []);
    } catch (err) {
      console.warn("Server backend belum aktif, menggunakan data contoh representatif Riau:", err);
      setBackendError(true);
      setStats({
        total_hotspots: 5,
        high_risk_count: 3,
        low_risk_count: 2,
        pending_audit_high_risk: 3
      });
      setHotspots(fallbackHotspots);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Wilayah & Aksi */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-brand-navy/60 p-5 rounded-xl border border-brand-deepBlue/50 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40">
              Wilayah Percontohan Terbatas
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Koordinat: -1.15° s.d. 2.45° LU/LS | 100.00° s.d. 103.85° BT
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Dashboard Pemantauan & Prioritas Audit Karhutla Riau
          </h1>
          <p className="text-sm text-gray-300">
            Klasifikasi cerdas titik panas satelit NASA FIRMS VIIRS 375m menggunakan Jaringan Syaraf Tiruan (ANN-MLP).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-brand-cardBg hover:bg-brand-deepBlue text-gray-200 text-sm font-medium rounded-lg border border-brand-deepBlue transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/predict"
            className="flex items-center gap-2 px-4 py-2 bg-brand-cyan hover:bg-cyan-400 text-brand-navy text-sm font-bold rounded-lg shadow-md transition"
          >
            <Flame className="w-4 h-4" /> Uji Prediksi
          </Link>
        </div>
      </div>

      {backendError && (
        <div className="bg-yellow-950/60 border border-yellow-500/50 p-4 rounded-xl text-yellow-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span>
              <strong>Backend FastAPI (:8000) belum terhubung:</strong> Menampilkan data titik contoh Riau. Untuk menghubungkan ke database dan model ANN nyata, jalankan: <code className="bg-black/40 px-1.5 py-0.5 rounded font-mono text-brand-cyan">cd backend; python run.py</code>
            </span>
          </div>
          <button
            onClick={fetchData}
            className="px-2.5 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded font-semibold text-[11px] whitespace-nowrap"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hotspot */}
        <div className="bg-brand-cardBg/90 border border-brand-deepBlue/60 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Hotspot Aktif</span>
            <Layers className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">{stats.total_hotspots}</div>
          <div className="mt-1 text-xs text-gray-400">Terdeteksi di Bounding Box Riau</div>
        </div>

        {/* High Risk */}
        <div className="bg-brand-cardBg/90 border border-risk-high/40 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-risk-high/10 rounded-bl-full" />
          <div className="flex items-center justify-between text-red-400 text-xs font-semibold uppercase tracking-wider">
            <span>High Risk (Prioritas)</span>
            <AlertTriangle className="w-4 h-4 text-risk-high" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-red-400">{stats.high_risk_count}</div>
          <div className="mt-1 text-xs text-gray-400">
            FRP &ge; 15.0 MW atau &Delta;T &ge; 25.0 K
          </div>
        </div>

        {/* Low Risk */}
        <div className="bg-brand-cardBg/90 border border-risk-low/40 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-green-400 text-xs font-semibold uppercase tracking-wider">
            <span>Low Risk (Rutin)</span>
            <ShieldCheck className="w-4 h-4 text-risk-low" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-green-400">{stats.low_risk_count}</div>
          <div className="mt-1 text-xs text-gray-400">Pemantauan satelit berkala</div>
        </div>

        {/* Pending Audit Tasks */}
        <div className="bg-brand-cardBg/90 border border-brand-deepBlue/60 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-yellow-400 text-xs font-semibold uppercase tracking-wider">
            <span>Antrean Audit Gakkum</span>
            <FileSpreadsheet className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-yellow-400">
            {stats.pending_audit_high_risk}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            <Link href="/priority-list" className="text-brand-cyan hover:underline">
              Buka Lembar Surat Tugas &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Peta GIS Kontrol & Visualisasi */}
      <div className="bg-brand-navy/40 p-4 rounded-xl border border-brand-deepBlue/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Visualisasi Spasial Sebaran Titik Panas</h2>
            <span className="text-xs bg-brand-deepBlue text-gray-300 px-2 py-0.5 rounded font-mono">
              React-Leaflet
            </span>
          </div>

          {/* Filter Tombol */}
          <div className="flex items-center gap-1.5 bg-brand-cardBg p-1 rounded-lg border border-brand-deepBlue text-xs font-medium">
            <button
              onClick={() => setSelectedRisk("ALL")}
              className={`px-3 py-1.5 rounded transition ${
                selectedRisk === "ALL"
                  ? "bg-brand-deepBlue text-white font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Semua Titik ({hotspots.length})
            </button>
            <button
              onClick={() => setSelectedRisk("HIGH RISK")}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                selectedRisk === "HIGH RISK"
                  ? "bg-risk-high text-white font-bold"
                  : "text-red-400 hover:bg-risk-high/10"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white" />
              High Risk ({stats.high_risk_count})
            </button>
            <button
              onClick={() => setSelectedRisk("LOW RISK")}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                selectedRisk === "LOW RISK"
                  ? "bg-risk-low text-white font-bold"
                  : "text-green-400 hover:bg-risk-low/10"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white" />
              Low Risk ({stats.low_risk_count})
            </button>
          </div>
        </div>

        {/* Peta Leaflet */}
        <RiauMap hotspots={hotspots} selectedRisk={selectedRisk} />
      </div>
    </div>
  );
}
