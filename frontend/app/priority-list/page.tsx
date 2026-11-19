"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Printer,
  ShieldAlert,
  CheckCircle,
  Search,
  Download,
  Calendar,
  Clock,
  MapPin,
  Compass,
} from "lucide-react";

export default function PriorityListPage() {
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("ALL");

  useEffect(() => {
    const fetchHighRisk = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/hotspots?risk_class=HIGH+RISK&limit=300",
          { timeout: 4000 }
        );
        setHotspots(res.data.features || []);
      } catch (err) {
        console.warn("Gagal memuat prioritas audit dari backend, menggunakan data representatif:", err);
        setHotspots([
          {
            properties: {
              id: 1,
              latitude: 0.6542,
              longitude: 101.8921,
              province_region: "Riau (Sumatera)",
              subregion: "Kab. Siak",
              frp: 42.6,
              brightness: 358.4,
              delta_t: 66.3,
              probability: 0.9999,
              acq_date: "2026-11-20",
              acq_time: "0630",
              daynight: "D",
              local_time_str: "2026-11-20 13:30 WIB (Siang)",
              audit_priority: "Sangat Tinggi (P1)",
              recommendation: "Prioritas Audit Khusus Gakkum & Dispatch Segera Regu Pemadam Manggala Agni.",
            },
          },
          {
            properties: {
              id: 2,
              latitude: -2.2154,
              longitude: 113.8245,
              province_region: "Kalimantan Tengah",
              subregion: "Pulang Pisau",
              frp: 35.8,
              brightness: 352.0,
              delta_t: 58.6,
              probability: 0.9996,
              acq_date: "2026-11-20",
              acq_time: "0545",
              daynight: "D",
              local_time_str: "2026-11-20 12:45 WIB (Siang)",
              audit_priority: "Sangat Tinggi (P1)",
              recommendation: "Batas konsesi lahan gambut dalam, siapkan pemadaman water bombing.",
            },
          },
          {
            properties: {
              id: 3,
              latitude: -7.5021,
              longitude: 140.4012,
              province_region: "Papua Selatan",
              subregion: "Merauke",
              frp: 29.5,
              brightness: 349.2,
              delta_t: 55.2,
              probability: 0.9992,
              acq_date: "2026-11-20",
              acq_time: "0415",
              daynight: "D",
              local_time_str: "2026-11-20 13:15 WIT (Siang)",
              audit_priority: "Sangat Tinggi (P1)",
              recommendation: "Padang savana kering Merauke, verifikasi ground patrol dan sekat bakar.",
            },
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchHighRisk();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const filtered = hotspots.filter((item) => {
    const p = item.properties;
    const regionText = (p.province_region || p.subregion || "").toLowerCase();
    const matchSearch =
      regionText.includes(search.toLowerCase()) ||
      p.latitude.toString().includes(search) ||
      p.longitude.toString().includes(search);
    const matchRegion = selectedRegion === "ALL" || (p.province_region || p.subregion) === selectedRegion;
    return matchSearch && matchRegion;
  });

  const regions = Array.from(
    new Set(hotspots.map((h) => h.properties.province_region || h.properties.subregion).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-4 text-black">
        <div className="text-center">
          <h1 className="text-lg font-black uppercase tracking-wider">
            SURAT PERINTAH TUGAS GROUND CHECK & AUDIT KEPATUHAN LINGKUNGAN
          </h1>
          <h2 className="text-sm font-bold mt-0.5">
            KOMANDO NASIONAL SATUAN TUGAS PENGENDALIAN KARHUTLA (MANGGALA AGNI / GAKKUM KLHK)
          </h2>
          <p className="text-[11px] text-gray-700 mt-1">
            Berdasarkan Hasil Klasifikasi Risiko Citra Satelit NASA FIRMS VIIRS 375m Berbasis Jaringan Syaraf Tiruan (ANN-MLP v2.0)
          </p>
          <div className="text-[10px] text-gray-600 mt-1 flex justify-center gap-6">
            <span>Tanggal Dokumen: {new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}</span>
            <span>Klasifikasi: Prioritas Sangat Tinggi (P1 - HIGH RISK)</span>
          </div>
        </div>
      </div>

      {/* Screen Header & Action Buttons */}
      <div className="liquid-glass p-5 rounded-2xl border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" /> Lembar Prioritas Tugas Satgas & Audit Gakkum
          </h1>
          <p className="text-sm text-emerald-100/70 mt-1">
            Daftar titik panas kategori <strong>HIGH RISK</strong> di seluruh wilayah Indonesia (Sabang s.d. Merauke) yang
            memerlukan intervensi segera dan berita acara kepatuhan konsesi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-glass-emerald transition active:scale-95"
          >
            <Printer className="w-4 h-4" /> Cetak Surat Tugas Resmi
          </button>
        </div>
      </div>

      {/* Search & Filter Bar (Screen only) */}
      <div className="liquid-glass p-4 rounded-xl flex flex-col sm:flex-row gap-3 print:hidden text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari provinsi, kabupaten, atau koordinat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full liquid-glass-input rounded-lg pl-9 pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="liquid-glass-input rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
          >
            <option value="ALL" className="bg-brand-forest">Semua Wilayah ({hotspots.length})</option>
            {regions.map((r, i) => (
              <option key={i} value={r} className="bg-brand-forest">
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Priority Table */}
      <div className="liquid-glass rounded-2xl border border-emerald-500/25 overflow-hidden shadow-glass print:border-black print:bg-white print:text-black">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-black/60 text-emerald-300 font-semibold border-b border-emerald-500/25 print:bg-gray-100 print:text-black print:border-b-2 print:border-black">
              <tr>
                <th className="p-3">No</th>
                <th className="p-3">Wilayah / Koordinat</th>
                <th className="p-3">Waktu Satelit (Lokal)</th>
                <th className="p-3">FRP / Suhu I-4</th>
                <th className="p-3">&Delta;T (Delta)</th>
                <th className="p-3">Probabilitas</th>
                <th className="p-3">Tingkat Prioritas</th>
                <th className="p-3">Rekomendasi Operasional Satgas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10 print:divide-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-emerald-300">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data antrean audit satgas...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    Tidak ditemukan titik prioritas HIGH RISK pada filter wilayah yang dipilih.
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const p = item.properties;
                  return (
                    <tr
                      key={p.id || index}
                      className="hover:bg-emerald-950/30 transition print:hover:bg-transparent"
                    >
                      <td className="p-3 font-mono font-bold text-emerald-400 print:text-black">
                        #{index + 1}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-gray-100 print:text-black">
                          {p.province_region || p.subregion}
                        </div>
                        <div className="text-[10px] text-emerald-300/80 font-mono print:text-gray-700">
                          {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-emerald-200 print:text-black">
                          {p.local_time_str || "N/A"}
                        </div>
                        <div className="text-[10px] text-gray-400 print:text-gray-600">
                          {p.acq_date} • {p.daynight === "N" ? "🌙 Malam" : "☀️ Siang"}
                        </div>
                      </td>
                      <td className="p-3 font-mono">
                        <div className="text-amber-300 font-bold print:text-black">{p.frp} MW</div>
                        <div className="text-[10px] text-gray-400 print:text-gray-600">{p.brightness} K</div>
                      </td>
                      <td className="p-3 font-mono text-emerald-300 font-bold print:text-black">
                        {p.delta_t} K
                      </td>
                      <td className="p-3 font-mono text-gray-300 print:text-black">
                        {(p.probability * 100).toFixed(1)}%
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 print:border print:border-black print:text-black">
                          {p.audit_priority || "Sangat Tinggi (P1)"}
                        </span>
                      </td>
                      <td className="p-3 text-gray-300 print:text-black max-w-xs leading-relaxed text-[11px]">
                        {p.recommendation}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Signature Section (Visible only when printing) */}
      <div className="hidden print:block mt-8 text-black text-xs">
        <div className="flex justify-between items-start px-6 pt-4 border-t border-black">
          <div className="text-center">
            <p>Mengetahui,</p>
            <p className="font-bold">Komandan Regu Pemadam Manggala Agni</p>
            <div className="h-16" />
            <p>( ..................................................... )</p>
            <p className="text-[10px]">NIP / NRP Satgas</p>
          </div>
          <div className="text-center">
            <p>Ditetapkan di Jakarta, {new Date().toLocaleDateString("id-ID")}</p>
            <p className="font-bold">Pejabat Pengawas Lingkungan Hidup (PPLH) / Gakkum KLHK</p>
            <div className="h-16" />
            <p>( ..................................................... )</p>
            <p className="text-[10px]">Penyidik Pegawai Negeri Sipil (PPNS)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
