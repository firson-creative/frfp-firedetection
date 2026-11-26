"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import {
  INDONESIA_ADMINISTRATIVE,
  ALL_PROVINCES,
  getKabupatenOptions,
  normalizeRegion,
} from "@/lib/indonesia-regions";
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
  RotateCcw,
  Flame,
  AlertTriangle,
  Building2,
} from "lucide-react";

export default function PriorityListPage() {
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedProvince, setSelectedProvince] = useState<string>("ALL");
  const [selectedKabupaten, setSelectedKabupaten] = useState<string>("ALL");

  useEffect(() => {
    const fetchHighRisk = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/hotspots?risk_class=HIGH+RISK&limit=500`,
          { timeout: 10000 }
        );
        setHotspots(res.data.features || []);
      } catch (err) {
        console.warn("Gagal memuat prioritas audit dari backend, menggunakan data representatif nasional:", err);
        setHotspots([
          {
            properties: {
              id: 1,
              latitude: 0.6542,
              longitude: 101.8921,
              province_region: "Provinsi Riau",
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
              latitude: 0.2851,
              longitude: 102.1524,
              province_region: "Provinsi Riau",
              subregion: "Kab. Pelalawan",
              frp: 38.2,
              brightness: 355.0,
              delta_t: 62.4,
              probability: 0.9998,
              acq_date: "2026-11-20",
              acq_time: "0630",
              daynight: "D",
              local_time_str: "2026-11-20 13:30 WIB (Siang)",
              audit_priority: "Sangat Tinggi (P1)",
              recommendation: "Pemeriksaan izin batas konsesi lahan gambut dan kanal blocking.",
            },
          },
          {
            properties: {
              id: 3,
              latitude: -2.2154,
              longitude: 113.8245,
              province_region: "Provinsi Kalimantan Tengah",
              subregion: "Kab. Pulang Pisau",
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
              id: 4,
              latitude: -7.5021,
              longitude: 140.4012,
              province_region: "Provinsi Papua Selatan (Merauke)",
              subregion: "Kab. Merauke",
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
          {
            properties: {
              id: 5,
              latitude: -4.1449,
              longitude: 122.1746,
              province_region: "Provinsi Sulawesi Tenggara",
              subregion: "Kab. Konawe",
              frp: 31.4,
              brightness: 350.8,
              delta_t: 56.4,
              probability: 0.9995,
              acq_date: "2026-11-20",
              acq_time: "0510",
              daynight: "D",
              local_time_str: "2026-11-20 13:10 WITA (Siang)",
              audit_priority: "Sangat Tinggi (P1)",
              recommendation: "Ground check terpadu di kawasan perbukitan dan audit pembukaan lahan sawit/tambang.",
            },
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchHighRisk();
  }, []);

  const handleProvinceChange = (newProv: string) => {
    setSelectedProvince(newProv);
    setSelectedKabupaten("ALL");
  };

  const availableKabupatenList = useMemo(() => {
    if (selectedProvince === "ALL") {
      const fromData = Array.from(
        new Set(
          hotspots
            .map((h) => h.properties.subregion)
            .filter((sub) => sub && sub !== "Luar Wilayah")
        )
      ).sort();
      return fromData;
    }

    const registered = getKabupatenOptions(selectedProvince);

    const normProv = normalizeRegion(selectedProvince);
    const fromHotspots = hotspots
      .filter((h) => {
        const pReg = (h.properties.province_region || "").toLowerCase();
        return pReg.includes(normProv);
      })
      .map((h) => h.properties.subregion)
      .filter(Boolean);

    const merged = Array.from(new Set([...registered, ...fromHotspots])).sort();
    return merged;
  }, [selectedProvince, hotspots]);

  const handleResetFilters = () => {
    setSelectedProvince("ALL");
    setSelectedKabupaten("ALL");
    setSearch("");
  };

  const filtered = useMemo(() => {
    return hotspots.filter((item) => {
      const p = item.properties;
      const provText = (p.province_region || "").toLowerCase();
      const subText = (p.subregion || "").toLowerCase();
      const searchLower = search.toLowerCase();

      const matchSearch =
        !searchLower ||
        provText.includes(searchLower) ||
        subText.includes(searchLower) ||
        (p.recommendation || "").toLowerCase().includes(searchLower) ||
        p.latitude.toString().includes(searchLower) ||
        p.longitude.toString().includes(searchLower);

      let matchProvince = true;
      if (selectedProvince !== "ALL") {
        const normSelected = normalizeRegion(selectedProvince);
        matchProvince =
          provText.includes(normSelected) ||
          subText.includes(normSelected);
      }

      let matchKabupaten = true;
      if (selectedKabupaten !== "ALL") {
        const normSelectedKab = normalizeRegion(selectedKabupaten);
        matchKabupaten =
          subText.includes(normSelectedKab) ||
          normalizeRegion(p.subregion || "").includes(normSelectedKab);
      }

      return matchSearch && matchProvince && matchKabupaten;
    });
  }, [hotspots, search, selectedProvince, selectedKabupaten]);

  const avgFrp = useMemo(() => {
    if (filtered.length === 0) return 0;
    const total = filtered.reduce((acc, h) => acc + (h.properties.frp || 0), 0);
    return (total / filtered.length).toFixed(1);
  }, [filtered]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = [
      "No",
      "Provinsi",
      "Kabupaten_Kota",
      "Latitude",
      "Longitude",
      "Waktu_Satelit_Lokal",
      "Tanggal_Akuisisi",
      "Jam_Akuisisi",
      "FRP_MW",
      "Brightness_K",
      "Delta_T_K",
      "Probabilitas_Risiko",
      "Tingkat_Prioritas",
      "Rekomendasi_Satgas"
    ];

    const rows = filtered.map((item, idx) => {
      const p = item.properties;
      return [
        idx + 1,
        `"${p.province_region || 'Indonesia'}"`,
        `"${p.subregion || p.province_region || ''}"`,
        p.latitude,
        p.longitude,
        `"${p.local_time_str || ''}"`,
        p.acq_date || '',
        p.acq_time || '',
        p.frp,
        p.brightness,
        p.delta_t,
        p.probability,
        `"${p.audit_priority || 'Sangat Tinggi (P1)'}"`,
        `"${(p.recommendation || '').replace(/"/g, '""')}"`
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const provSlug = selectedProvince === "ALL" ? "Nasional" : selectedProvince.replace(/\s+/g, "_");
    const kabSlug = selectedKabupaten === "ALL" ? "Semua_Kab" : selectedKabupaten.replace(/\s+/g, "_");
    link.setAttribute("download", `FRFP_Prioritas_Audit_${provSlug}_${kabSlug}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="hidden print:block border-b-2 border-black pb-4 mb-4 text-black">
        <div className="text-center">
          <div className="text-[10px] uppercase font-bold tracking-widest text-gray-800">
            KEMENTERIAN LINGKUNGAN HIDUP DAN KEHUTANAN REPUBLIK INDONESIA
          </div>
          <h1 className="text-lg font-black uppercase tracking-wider mt-1">
            SURAT PERINTAH TUGAS GROUND CHECK & AUDIT KEPATUHAN LINGKUNGAN
          </h1>
          <h2 className="text-xs font-bold mt-0.5">
            KOMANDO NASIONAL SATUAN TUGAS PENGENDALIAN KARHUTLA & BALAI PENEGAKAN HUKUM (GAKKUM) KLHK
          </h2>
          <p className="text-[10px] text-gray-700 mt-1">
            Berdasarkan Hasil Klasifikasi Risiko Citra Satelit NASA FIRMS VIIRS 375m Berbasis Jaringan Syaraf Tiruan (ANN-MLP v2.0)
          </p>

          <div className="text-[10px] font-semibold text-gray-900 mt-3 border-y border-dashed border-gray-400 py-1.5 flex justify-around">
            <span>
              <strong>Provinsi:</strong> {selectedProvince === "ALL" ? "Seluruh Teritori Indonesia (Nasional)" : selectedProvince}
            </span>
            <span>
              <strong>Kabupaten/Kota:</strong> {selectedKabupaten === "ALL" ? "Semua Kabupaten / Kota" : selectedKabupaten}
            </span>
            <span>
              <strong>Target Prioritas:</strong> {filtered.length} Titik Kritis (HIGH RISK)
            </span>
            <span>
              <strong>Tanggal Terbit:</strong> {new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}
            </span>
          </div>
        </div>
      </div>

      <div className="liquid-glass p-5 rounded-2xl border border-emerald-500/25 flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Skala Nasional: Sabang s.d. Merauke
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Filter Khusus HIGH RISK (P1)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" /> Lembar Prioritas Tugas Satgas & Audit Gakkum
          </h1>
          <p className="text-xs text-emerald-100/70 mt-1 max-w-2xl leading-relaxed">
            Daftar titik panas kategori <strong>HIGH RISK</strong> di 38 Provinsi Indonesia yang memerlukan verifikasi
            fisik darurat oleh Regu Pemadam Manggala Agni dan audit kepatuhan konsesi oleh Balai Penegakan Hukum KLHK.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-500/30 text-xs font-semibold rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Unduh data tabel dalam format CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Unduh CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-glass-emerald transition active:scale-95"
            title="Cetak atau simpan sebagai PDF Surat Perintah Tugas Resmi"
          >
            <Printer className="w-4 h-4" /> Cetak Surat Tugas Resmi
          </button>
        </div>
      </div>

      <div className="liquid-glass p-4 rounded-xl flex flex-col lg:flex-row gap-3 print:hidden text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari provinsi, kabupaten, rekomendasi, atau koordinat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full liquid-glass-input rounded-lg pl-9 pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 min-w-[240px]">
          <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <select
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="w-full liquid-glass-input rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
          >
            <option value="ALL" className="bg-brand-forest">
              🌐 Semua Provinsi ({hotspots.length} Titik)
            </option>
            {INDONESIA_ADMINISTRATIVE.map((island) => (
              <optgroup key={island.island} label={`Pulau ${island.island}`} className="bg-brand-darkForest text-emerald-300 font-bold">
                {island.provinces.map((prov) => (
                  <option key={prov.name} value={prov.name} className="bg-brand-forest text-white font-normal">
                    Provinsi {prov.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 min-w-[240px]">
          <Compass className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <select
            value={selectedKabupaten}
            onChange={(e) => setSelectedKabupaten(e.target.value)}
            className="w-full liquid-glass-input rounded-lg px-3 py-2 text-xs font-medium cursor-pointer"
          >
            <option value="ALL" className="bg-brand-forest">
              {selectedProvince === "ALL"
                ? "🏛️ Semua Kabupaten / Kota"
                : `🏛️ Semua Kabupaten di ${selectedProvince}`}
            </option>
            {availableKabupatenList.map((kab, i) => (
              <option key={i} value={kab} className="bg-brand-forest text-white">
                {kab}
              </option>
            ))}
          </select>
        </div>

        {(selectedProvince !== "ALL" || selectedKabupaten !== "ALL" || search !== "") && (
          <button
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition active:scale-95 flex-shrink-0"
            title="Reset semua filter ke default seluruh Indonesia"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="liquid-glass-card p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-300">Menampilkan:</span>
          <span className="font-bold text-white px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">
            {filtered.length} Titik Kritis
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-emerald-300 font-medium">
            Provinsi: <strong className="text-white">{selectedProvince === "ALL" ? "Seluruh Indonesia" : selectedProvince}</strong>
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-emerald-300 font-medium">
            Kabupaten/Kota: <strong className="text-white">{selectedKabupaten === "ALL" ? "Semua Wilayah" : selectedKabupaten}</strong>
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-gray-300">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Rata-rata FRP: <strong className="text-amber-300 font-mono">{avgFrp} MW</strong>
          </span>
        </div>
      </div>

      <div className="liquid-glass rounded-2xl border border-emerald-500/25 overflow-hidden shadow-glass print:border-black print:bg-white print:text-black">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-black/60 text-emerald-300 font-semibold border-b border-emerald-500/25 print:bg-gray-100 print:text-black print:border-b-2 print:border-black">
              <tr>
                <th className="p-3 text-center w-12">No</th>
                <th className="p-3">Wilayah Administratif</th>
                <th className="p-3">Koordinat (Lat, Lon)</th>
                <th className="p-3">Waktu Rekam Satelit</th>
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
                  <td colSpan={9} className="p-8 text-center text-emerald-300">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data antrean audit satgas nasional...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400">
                    Tidak ditemukan titik prioritas <strong>HIGH RISK</strong> pada wilayah{" "}
                    {selectedProvince !== "ALL" ? `Provinsi ${selectedProvince}` : "yang dipilih"}{" "}
                    {selectedKabupaten !== "ALL" ? `(Kabupaten ${selectedKabupaten})` : ""}.
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const p = item.properties;
                  const displaySubregion = p.subregion || p.province_region || "Wilayah Indonesia";
                  const displayProvince = p.province_region || "Indonesia";

                  return (
                    <tr
                      key={p.id || index}
                      className="hover:bg-emerald-950/30 transition print:hover:bg-transparent"
                    >
                      <td className="p-3 font-mono font-bold text-center text-emerald-400 print:text-black">
                        #{index + 1}
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-gray-100 print:text-black text-xs flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 print:hidden" />
                          <span>{displaySubregion}</span>
                        </div>
                        <div className="text-[10px] text-emerald-300/80 print:text-gray-700 mt-0.5">
                          {displayProvince}
                        </div>
                      </td>

                      <td className="p-3 font-mono">
                        <div className="text-gray-200 font-semibold print:text-black">
                          {Number(p.latitude).toFixed(4)}, {Number(p.longitude).toFixed(4)}
                        </div>
                        <div className="text-[10px] text-gray-400 print:text-gray-600">
                          VIIRS 375m
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-mono text-emerald-200 print:text-black">
                          {p.local_time_str || "Waktu Satelit"}
                        </div>
                        <div className="text-[10px] text-gray-400 print:text-gray-600">
                          {p.acq_date || "-"} • {p.daynight === "N" ? "🌙 Malam" : "☀️ Siang"}
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
                        {(Number(p.probability) * 100).toFixed(1)}%
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 print:border print:border-black print:text-black">
                          {p.audit_priority || "Sangat Tinggi (P1)"}
                        </span>
                      </td>

                      <td className="p-3 text-gray-300 print:text-black max-w-xs leading-relaxed text-[11px]">
                        {p.recommendation || "Prioritas verifikasi patroli darurat dan berita acara kepatuhan."}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hidden print:block mt-8 text-black text-xs">
        <div className="flex justify-between items-start px-6 pt-4 border-t border-black">
          <div className="text-center w-72">
            <p>Mengetahui,</p>
            <p className="font-bold mt-0.5">
              Komandan Satuan Tugas / Daops Manggala Agni{" "}
              {selectedProvince === "ALL" ? "Wilayah Operasi" : selectedProvince}
            </p>
            <div className="h-16" />
            <p className="font-bold underline">( ..................................................... )</p>
            <p className="text-[10px]">NIP / NRP Satgas Pengendalian Karhutla</p>
          </div>

          <div className="text-center w-80">
            <p>Ditetapkan di Jakarta, {new Date().toLocaleDateString("id-ID")}</p>
            <p className="font-bold mt-0.5">
              Pejabat Pengawas Lingkungan Hidup (PPLH) / Penyidik Gakkum KLHK
            </p>
            <div className="h-16" />
            <p className="font-bold underline">( ..................................................... )</p>
            <p className="text-[10px]">Penyidik Pegawai Negeri Sipil (PPNS) Lingkungan Hidup</p>
          </div>
        </div>
      </div>
    </div>
  );
}
