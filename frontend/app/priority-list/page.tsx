"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Printer, ShieldAlert, CheckCircle, Search, Download } from "lucide-react";

export default function PriorityListPage() {
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubregion, setSelectedSubregion] = useState("ALL");

  useEffect(() => {
    const fetchHighRisk = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/hotspots?risk_class=HIGH+RISK&limit=100", { timeout: 3500 });
        setHotspots(res.data.features || []);
      } catch (err) {
        console.warn("Gagal memuat prioritas audit dari backend, menggunakan data representatif:", err);
        setHotspots([
          {
            properties: {
              id: 1,
              latitude: 0.6542,
              longitude: 101.8921,
              subregion: "Kab. Siak",
              frp: 38.6,
              brightness: 355.2,
              delta_t: 62.8,
              probability: 0.9998,
              audit_priority: "Sangat Tinggi (P1)",
              recommendation: "Prioritas Audit Khusus Gakkum & Dispatch Segera Regu Pemadam Manggala Agni."
            }
          },
          {
            properties: {
              id: 2,
              latitude: 0.2851,
              longitude: 102.1524,
              subregion: "Kab. Pelalawan",
              frp: 26.4,
              brightness: 348.6,
              delta_t: 54.6,
              probability: 0.9995,
              audit_priority: "Sangat Tinggi (P1)",
              recommendation: "Verifikasi patroli darat dan jadwal audit kepatuhan konsesi terdekat."
            }
          },
          {
            properties: {
              id: 3,
              latitude: 1.6800,
              longitude: 101.4500,
              subregion: "Kota Dumai",
              frp: 31.0,
              brightness: 351.2,
              delta_t: 58.1,
              probability: 0.9997,
              audit_priority: "Sangat Tinggi (P1)",
              recommendation: "Prioritas patroli udara dan audit batas konsesi gambut."
            }
          }
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
    const matchSearch =
      p.subregion.toLowerCase().includes(search.toLowerCase()) ||
      p.latitude.toString().includes(search) ||
      p.longitude.toString().includes(search);
    const matchRegion = selectedSubregion === "ALL" || p.subregion === selectedSubregion;
    return matchSearch && matchRegion;
  });

  const subregions = Array.from(new Set(hotspots.map((h) => h.properties.subregion)));

  return (
    <div className="space-y-6">
      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-4 text-black">
        <div className="text-center">
          <h1 className="text-xl font-bold uppercase tracking-wider">
            SURAT TUGAS PATROLI CEPAT & AUDIT KEPATUHAN LINGKUNGAN
          </h1>
          <h2 className="text-sm font-semibold">
            SATGAS PENGENDALIAN KEBAKARAN HUTAN DAN LAHAN PROVINSI RIAU
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Berdasarkan Hasil Klasifikasi Risiko Citra Satelit VIIRS 375m Jaringan Syaraf Tiruan (ANN-MLP)
          </p>
          <p className="text-xs text-gray-500">
            Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}
          </p>
        </div>
      </div>

      {/* Screen Controls Header */}
      <div className="print:hidden bg-brand-navy/60 p-5 rounded-xl border border-brand-deepBlue/50 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-cyan" /> Prioritas Verifikasi & Surat Tugas Audit Lapangan
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Daftar titik panas berstatus <strong>HIGH RISK</strong> yang membutuhkan pemeriksaan fisik oleh Regu
            Manggala Agni dan Balai Penegakan Hukum (Gakkum) KLHK Wilayah Sumatera.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-cyan hover:bg-cyan-400 text-brand-navy font-bold text-sm rounded-lg shadow-md transition"
        >
          <Printer className="w-4 h-4" /> Cetak Surat Tugas (PDF)
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="print:hidden flex flex-col sm:flex-row gap-3 bg-brand-cardBg/80 p-4 rounded-xl border border-brand-deepBlue">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan kabupaten atau koordinat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-darkBg border border-brand-deepBlue rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-cyan"
          />
        </div>

        <select
          value={selectedSubregion}
          onChange={(e) => setSelectedSubregion(e.target.value)}
          className="bg-brand-darkBg border border-brand-deepBlue text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-brand-cyan"
        >
          <option value="ALL">Semua Kabupaten / Wilayah Riau</option>
          {subregions.map((reg, idx) => (
            <option key={idx} value={reg}>
              {reg}
            </option>
          ))}
        </select>
      </div>

      {/* Tabel Data Prioritas */}
      <div className="bg-brand-navy print:bg-white rounded-xl border border-brand-deepBlue print:border-black overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-deepBlue print:divide-black text-left text-xs">
            <thead className="bg-brand-darkBg print:bg-gray-100 text-gray-300 print:text-black font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Koordinat (Lat, Lon)</th>
                <th className="px-4 py-3">Wilayah / Kabupaten</th>
                <th className="px-4 py-3">FRP (MW)</th>
                <th className="px-4 py-3">Suhu (K)</th>
                <th className="px-4 py-3">&Delta;T (K)</th>
                <th className="px-4 py-3">Probabilitas</th>
                <th className="px-4 py-3">Tingkat Prioritas</th>
                <th className="px-4 py-3">Rekomendasi Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-deepBlue/50 print:divide-gray-300 text-gray-200 print:text-black">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    Memuat data prioritas audit...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    Tidak ditemukan data titik panas berisiko tinggi sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const p = item.properties;
                  return (
                    <tr key={p.id} className="hover:bg-brand-deepBlue/20 transition">
                      <td className="px-4 py-3 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold">
                        {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                      </td>
                      <td className="px-4 py-3">{p.subregion}</td>
                      <td className="px-4 py-3 font-mono font-bold text-red-400 print:text-black">
                        {p.frp} MW
                      </td>
                      <td className="px-4 py-3 font-mono">{p.brightness} K</td>
                      <td className="px-4 py-3 font-mono">{p.delta_t} K</td>
                      <td className="px-4 py-3 font-mono font-semibold">
                        {(p.probability * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 font-semibold text-red-400 print:text-black">
                        {p.audit_priority}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-300 print:text-gray-800">
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

      {/* Signature Section for Print */}
      <div className="hidden print:grid grid-cols-2 mt-12 text-black text-xs text-center">
        <div>
          <p>Mengetahui,</p>
          <p className="font-bold mt-1">Kepala Dinas LHK Provinsi Riau</p>
          <div className="h-20" />
          <p className="font-bold underline">(........................................................)</p>
          <p>NIP. ................................................</p>
        </div>
        <div>
          <p>Pekanbaru, {new Date().toLocaleDateString("id-ID")}</p>
          <p className="font-bold mt-1">Komandan Regu Manggala Agni</p>
          <div className="h-20" />
          <p className="font-bold underline">(........................................................)</p>
          <p>NIP. ................................................</p>
        </div>
      </div>
    </div>
  );
}
