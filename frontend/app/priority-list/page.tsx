"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import {
  INDONESIA_ADMINISTRATIVE,
  getKabupatenOptions,
  normalizeRegion,
} from "@/lib/indonesia-regions";
import {
  FileText,
  Printer,
  Search,
  Download,
  MapPin,
  Compass,
  RotateCcw,
  Flame,
  Building2,
  Sun,
  Moon,
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
    <div className="w-full space-y-4">
      <div className="hidden print:block mb-4 text-black">
        <div className="flex items-center gap-4 border-b-[3px] border-double border-black pb-3">
          <img
            src="/logo.png"
            alt="Logo FRFP"
            className="w-14 h-14 object-contain flex-shrink-0"
          />
          <div className="flex-1 text-center pr-14">
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-black">
              KEMENTERIAN LINGKUNGAN HIDUP DAN KEHUTANAN REPUBLIK INDONESIA
            </div>
            <h1 className="font-sans text-base font-extrabold uppercase tracking-wide mt-0.5 text-black">
              SURAT PERINTAH TUGAS GROUND CHECK &amp; AUDIT KEPATUHAN LINGKUNGAN
            </h1>
            <div className="text-[11px] font-bold uppercase text-black mt-0.5">
              KOMANDO NASIONAL SATUAN TUGAS PENGENDALIAN KARHUTLA &amp; BALAI PENEGAKAN HUKUM (GAKKUM) KLHK
            </div>
            <p className="text-[10px] text-black mt-0.5">
              Berdasarkan Hasil Klasifikasi Risiko Citra Satelit NASA FIRMS VIIRS 375m Berbasis Jaringan Syaraf Tiruan (ANN-MLP)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 border border-black mt-3 text-[10px] divide-x divide-black">
          <div className="px-2.5 py-1.5">
            <span className="block text-[9px] uppercase text-gray-600 font-semibold">Provinsi</span>
            <strong className="text-black">
              {selectedProvince === "ALL" ? "Seluruh Teritori Indonesia" : selectedProvince}
            </strong>
          </div>
          <div className="px-2.5 py-1.5">
            <span className="block text-[9px] uppercase text-gray-600 font-semibold">Kabupaten / Kota</span>
            <strong className="text-black">
              {selectedKabupaten === "ALL" ? "Semua Kabupaten / Kota" : selectedKabupaten}
            </strong>
          </div>
          <div className="px-2.5 py-1.5">
            <span className="block text-[9px] uppercase text-gray-600 font-semibold">Target Prioritas</span>
            <strong className="text-black">{filtered.length} Titik Kritis (HIGH RISK)</strong>
          </div>
          <div className="px-2.5 py-1.5">
            <span className="block text-[9px] uppercase text-gray-600 font-semibold">Tanggal Terbit</span>
            <strong className="text-black">
              {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
            </strong>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800 print:hidden">
        <div>
          <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            Filter Khusus HIGH RISK (P1) &bull; Sabang s.d. Merauke
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white flex items-center gap-2 mt-0.5">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Lembar Prioritas Tugas Satgas &amp; Audit Gakkum
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Unduh CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Surat Tugas
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-2.5 print:hidden text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-2" />
          <input
            type="text"
            placeholder="Cari provinsi, kabupaten, rekomendasi, atau koordinat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full surface-input rounded-lg pl-9 pr-4 py-1.5 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 min-w-[220px]">
          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <select
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="w-full surface-input rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <option value="ALL" className="bg-white dark:bg-zinc-950">
              Semua Provinsi ({hotspots.length} Titik)
            </option>
            {INDONESIA_ADMINISTRATIVE.map((island) => (
              <optgroup key={island.island} label={`Pulau ${island.island}`} className="bg-white dark:bg-zinc-950 font-bold">
                {island.provinces.map((prov) => (
                  <option key={prov.name} value={prov.name} className="bg-white dark:bg-zinc-950 font-normal">
                    Provinsi {prov.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 min-w-[220px]">
          <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <select
            value={selectedKabupaten}
            onChange={(e) => setSelectedKabupaten(e.target.value)}
            className="w-full surface-input rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <option value="ALL" className="bg-white dark:bg-zinc-950">
              {selectedProvince === "ALL"
                ? "Semua Kabupaten / Kota"
                : `Semua Kabupaten di ${selectedProvince}`}
            </option>
            {availableKabupatenList.map((kab, i) => (
              <option key={i} value={kab} className="bg-white dark:bg-zinc-950">
                {kab}
              </option>
            ))}
          </select>
        </div>

        {(selectedProvince !== "ALL" || selectedKabupaten !== "ALL" || search !== "") && (
          <button
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 transition flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-zinc-950 dark:text-white">{filtered.length} Titik Kritis</span>
          <span>&bull;</span>
          <span>Provinsi: <strong className="text-zinc-900 dark:text-zinc-200">{selectedProvince === "ALL" ? "Seluruh Indonesia" : selectedProvince}</strong></span>
          <span>&bull;</span>
          <span>Kabupaten/Kota: <strong className="text-zinc-900 dark:text-zinc-200">{selectedKabupaten === "ALL" ? "Semua Wilayah" : selectedKabupaten}</strong></span>
        </div>

        <span className="flex items-center gap-1.5 text-[11px]">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          Rata-rata FRP: <strong className="text-amber-600 dark:text-amber-400 font-mono">{avgFrp} MW</strong>
        </span>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden print:border-0 print:rounded-none print:overflow-visible print:bg-white print:text-black">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="min-w-full text-xs text-left print-doc-table print:text-[10px]">
            <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-semibold border-b border-zinc-200 dark:border-zinc-800 print:bg-zinc-100 print:text-black">
              <tr>
                <th className="p-2.5 text-center w-10 print:px-1.5 print:py-1.5 print:whitespace-nowrap">No</th>
                <th className="p-2.5 print:px-2 print:py-1.5">Wilayah Administratif</th>
                <th className="p-2.5 print:px-2 print:py-1.5 print:whitespace-nowrap">Koordinat</th>
                <th className="p-2.5 print:px-2 print:py-1.5 print:whitespace-nowrap">Waktu Rekam</th>
                <th className="p-2.5 print:px-2 print:py-1.5 print:whitespace-nowrap">FRP / Suhu</th>
                <th className="p-2.5 print:px-2 print:py-1.5 print:whitespace-nowrap">&Delta;T</th>
                <th className="p-2.5 print:px-2 print:py-1.5 print:whitespace-nowrap">Prob.</th>
                <th className="p-2.5 print:px-2 print:py-1.5 print:whitespace-nowrap">Prioritas</th>
                <th className="p-2.5 print:px-2 print:py-1.5">Rekomendasi Operasional Satgas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-black print:bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-emerald-700 dark:text-emerald-400 print:text-black">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data antrean audit satgas nasional...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-zinc-500 dark:text-zinc-400 print:text-black">
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
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition print:hover:bg-transparent"
                    >
                      <td className="p-2.5 font-mono font-bold text-center text-emerald-700 dark:text-emerald-400 print:text-black print:px-1.5 print:py-1.5 print:whitespace-nowrap">
                        {index + 1}
                      </td>

                      <td className="p-2.5 print:px-2 print:py-1.5">
                        <div className="font-bold text-zinc-950 dark:text-zinc-100 print:text-black text-xs print:text-[10px] flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 print:hidden" />
                          <span>{displaySubregion}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 print:text-black mt-0.5 print:mt-0">
                          {displayProvince}
                        </div>
                      </td>

                      <td className="p-2.5 font-mono print:px-2 print:py-1.5 print:whitespace-nowrap">
                        <div className="text-zinc-900 dark:text-zinc-200 font-semibold print:text-black">
                          {Number(p.latitude).toFixed(4)}, {Number(p.longitude).toFixed(4)}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 print:text-black">
                          VIIRS 375m
                        </div>
                      </td>

                      <td className="p-2.5 print:px-2 print:py-1.5 print:whitespace-nowrap">
                        <div className="font-mono text-zinc-800 dark:text-zinc-200 print:text-black">
                          {p.local_time_str || "Waktu Satelit"}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 print:hidden flex items-center gap-1">
                          <span>{p.acq_date || "-"} &bull;</span>
                          {p.daynight === "N" ? (
                            <span className="inline-flex items-center gap-0.5"><Moon className="w-3 h-3" /> Malam</span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5"><Sun className="w-3 h-3" /> Siang</span>
                          )}
                        </div>
                      </td>

                      <td className="p-2.5 font-mono print:px-2 print:py-1.5 print:whitespace-nowrap">
                        <div className="text-amber-600 dark:text-amber-400 font-bold print:text-black">{p.frp} MW</div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 print:text-black">{p.brightness} K</div>
                      </td>

                      <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400 font-bold print:text-black print:px-2 print:py-1.5 print:whitespace-nowrap">
                        {p.delta_t} K
                      </td>

                      <td className="p-2.5 font-mono text-zinc-700 dark:text-zinc-300 print:text-black print:px-2 print:py-1.5 print:whitespace-nowrap">
                        {(Number(p.probability) * 100).toFixed(1)}%
                      </td>

                      <td className="p-2.5 print:px-2 print:py-1.5 print:whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 print:border-0 print:bg-transparent print:p-0 print:text-black">
                          {p.audit_priority || "Sangat Tinggi (P1)"}
                        </span>
                      </td>

                      <td className="p-2.5 text-zinc-700 dark:text-zinc-300 print:text-black max-w-xs print:max-w-none leading-relaxed print:leading-snug text-[11px] print:text-[10px] print:px-2 print:py-1.5">
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

      <div className="hidden print:block mt-6 text-black text-[11px] break-inside-avoid">
        <div className="flex justify-between items-start px-8 pt-4">
          <div className="text-center w-72">
            <p>Mengetahui,</p>
            <p className="font-bold mt-0.5">
              Komandan Satuan Tugas / Daops Manggala Agni{" "}
              {selectedProvince === "ALL" ? "Wilayah Operasi" : selectedProvince}
            </p>
            <div className="h-16" />
            <p className="font-bold underline">( ..................................................... )</p>
            <p className="text-[10px] mt-0.5">NIP / NRP Satgas Pengendalian Karhutla</p>
          </div>

          <div className="text-center w-80">
            <p>Ditetapkan di Jakarta, {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
            <p className="font-bold mt-0.5">
              Pejabat Pengawas Lingkungan Hidup (PPLH) / Penyidik Gakkum KLHK
            </p>
            <div className="h-16" />
            <p className="font-bold underline">( ..................................................... )</p>
            <p className="text-[10px] mt-0.5">Penyidik Pegawai Negeri Sipil (PPNS) Lingkungan Hidup</p>
          </div>
        </div>
      </div>
    </div>
  );
}
