"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import {
  Flame,
  AlertTriangle,
  ShieldCheck,
  FileSpreadsheet,
  RefreshCw,
  Layers,
  Radio,
  Sparkles,
  MapPin,
  Clock,
  Compass,
} from "lucide-react";
import Link from "next/link";

// Dynamic import Leaflet map component to prevent SSR hydration errors
const IndonesiaMap = dynamic(() => import("@/components/IndonesiaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[620px] bg-brand-darkForest flex items-center justify-center text-emerald-300 rounded-2xl border border-emerald-500/20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
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

  // Near-Realtime Auto-Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Fallback Data Representatif Nasional (Sabang - Merauke) jika backend baru booting
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
        axios.get("http://localhost:8000/api/v1/stats", { timeout: 4000 }),
        axios.get("http://localhost:8000/api/v1/hotspots?limit=1500", { timeout: 4000 }),
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

  // Handle Manual and Auto NRT Sync
  const handleSyncNRT = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await axios.post("http://localhost:8000/api/v1/sync-nrt");
      setSyncFeedback(
        `Sukses: Ditambahkan ${res.data.added_count} titik baru (${res.data.high_risk_count} High Risk) via ${res.data.source}.`
      );
      await fetchData();
    } catch (err: any) {
      setSyncFeedback("Gagal sinkronisasi NRT satelit.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  // Auto-sync polling every 30 seconds when enabled
  useEffect(() => {
    if (!autoSyncEnabled) return;
    const interval = setInterval(() => {
      handleSyncNRT();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoSyncEnabled]);

  return (
    <div className="space-y-6">
      {/* Hero / Header Wilayah Nasional */}
      <div className="liquid-glass p-6 rounded-2xl border border-emerald-500/25 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <Compass className="w-3.5 h-3.5 text-emerald-400" /> Skala Nasional (Sabang s.d. Merauke)
              </span>
              <span className="text-xs text-emerald-100/70 font-mono">
                38 Provinsi • Koordinat: -11.0° s.d. 6.0° LU/LS | 95.0° s.d. 141.0° BT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
              FRFP — Fire Risk Foresight & Prioritization
            </h1>
            <p className="text-sm text-emerald-100/80 mt-1 max-w-3xl leading-relaxed">
              Platform kecerdasan buatan berbasis <strong>Jaringan Syaraf Tiruan (ANN-MLP)</strong> untuk deteksi dini,
              prakiraan risiko, dan prioritas inspeksi karhutla citra satelit <strong>NASA FIRMS VIIRS (375m)</strong> secara near-realtime.
            </p>
          </div>

          {/* Quick Actions & NRT Live Sync */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Auto-Sync Toggle */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 border border-emerald-500/20 text-xs">
              <Radio className={`w-3.5 h-3.5 ${autoSyncEnabled ? "text-emerald-400 animate-pulse" : "text-gray-500"}`} />
              <span className="text-gray-300 font-medium">Live NRT Feed:</span>
              <button
                onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                  autoSyncEnabled
                    ? "bg-emerald-500 text-black shadow-[0_0_8px_#10B981]"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {autoSyncEnabled ? "AKTIF (30s)" : "NONAKTIF"}
              </button>
            </div>

            {/* Sync Now Button */}
            <button
              onClick={handleSyncNRT}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-glass-emerald transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Menyinkronkan..." : "Sync NRT Satelit"}
            </button>

            <Link
              href="/predict"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-extrabold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition active:scale-95"
            >
              <Flame className="w-3.5 h-3.5" /> Uji Prediksi
            </Link>
          </div>
        </div>

        {/* Sync Feedback Toast */}
        {syncFeedback && (
          <div className="mt-4 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}
      </div>

      {backendError && (
        <div className="bg-amber-950/60 border border-amber-500/50 p-4 rounded-xl text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Server Backend (:8000) Offline:</strong> Menampilkan data simulasi satelit nasional. Jalankan server dengan:{" "}
              <code className="bg-black/50 px-2 py-0.5 rounded font-mono text-emerald-300">cd backend; python run.py</code>
            </span>
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-xs whitespace-nowrap"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 4 Liquid Glass Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hotspot Nasional */}
        <div className="liquid-glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-300/80 text-xs font-semibold uppercase tracking-wider">
            <span>Total Hotspot Nasional</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white font-mono">{stats.total_hotspots.toLocaleString()}</div>
          <div className="mt-1 text-xs text-emerald-100/60">Terdeteksi di Sabang s.d. Merauke</div>
        </div>

        {/* High Risk (Prioritas Intervensi) */}
        <div className="liquid-glass-card rounded-2xl p-5 border-red-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-bl-full" />
          <div className="flex items-center justify-between text-red-400 text-xs font-semibold uppercase tracking-wider">
            <span>High Risk (Prioritas)</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-red-400 font-mono">{stats.high_risk_count.toLocaleString()}</div>
          <div className="mt-1 text-xs text-red-200/60">
            FRP &ge; 15.0 MW atau &Delta;T &ge; 25.0 K (Prob &ge; 0.50)
          </div>
        </div>

        {/* Low Risk (Pemantauan Satelit Rutin) */}
        <div className="liquid-glass-card rounded-2xl p-5 border-emerald-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <span>Low Risk (Rutin)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-300 font-mono">{stats.low_risk_count.toLocaleString()}</div>
          <div className="mt-1 text-xs text-emerald-100/60">Pemantauan satelit berkala</div>
        </div>

        {/* Antrean Surat Tugas Audit */}
        <div className="liquid-glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <span>Antrean Audit & Tugas</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-amber-300 font-mono">
            {stats.pending_audit_high_risk.toLocaleString()}
          </div>
          <div className="mt-1 text-xs">
            <Link href="/priority-list" className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline flex items-center gap-1">
              Buka Lembar Surat Tugas &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Peta GIS & Kontrol Spasial */}
      <div className="liquid-glass p-5 rounded-2xl border border-emerald-500/25 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              Sebaran Spasial Titik Panas Seluruh Indonesia
            </h2>
            <span className="text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
              Leaflet • 38 Provinsi
            </span>
          </div>

          {/* Filter Tombol Risiko */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-emerald-500/20 text-xs font-medium">
            <button
              onClick={() => setSelectedRisk("ALL")}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedRisk === "ALL"
                  ? "bg-emerald-500/30 text-emerald-200 font-bold border border-emerald-500/40"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Semua Titik ({hotspots.length})
            </button>
            <button
              onClick={() => setSelectedRisk("HIGH RISK")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                selectedRisk === "HIGH RISK"
                  ? "bg-red-500/30 text-red-300 font-bold border border-red-500/40"
                  : "text-red-400 hover:bg-red-500/10"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_#EF4444]" />
              High Risk ({stats.high_risk_count})
            </button>
            <button
              onClick={() => setSelectedRisk("LOW RISK")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                selectedRisk === "LOW RISK"
                  ? "bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40"
                  : "text-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
              Low Risk ({stats.low_risk_count})
            </button>
          </div>
        </div>

        {/* Indonesia Interactive Map */}
        <IndonesiaMap hotspots={hotspots} selectedRisk={selectedRisk} />
      </div>
    </div>
  );
}
