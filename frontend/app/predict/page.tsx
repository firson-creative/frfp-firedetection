"use client";

import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import {
  Zap,
  AlertTriangle,
  MapPin,
  Thermometer,
  Clock,
  Calendar,
  Compass,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Flame,
} from "lucide-react";

export default function PredictPage() {
  const [formData, setFormData] = useState<Record<string, string | number>>({
    latitude: 0.5071,
    longitude: 101.4478,
    brightness: 342.5,
    scan: 0.45,
    track: 0.4,
    frp: 28.4,
    bright_t31: 295.2,
    acq_date: "2026-11-20",
    acq_time: "0630",
    daynight: "D",
  });

  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatApiError = (err: any): string => {
    const detail = err?.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((item: any) => {
          const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : "input";
          return `${field}: ${item?.msg || "nilai tidak valid"}`;
        })
        .join(" | ");
    }
    return (
      err?.message ||
      "Gagal menghubungi server backend di http://127.0.0.1:8000. Pastikan backend aktif dengan perintah: cd backend; python run.py"
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const numericFields = ["latitude", "longitude", "brightness", "scan", "track", "frp", "bright_t31"] as const;
    const parsedPayload: Record<string, any> = {
      acq_date: String(formData.acq_date || "").trim() || null,
      acq_time: String(formData.acq_time || "").trim() || null,
      daynight: String(formData.daynight || "D"),
    };

    for (const key of numericFields) {
      const raw = String(formData[key] ?? "").trim();
      const num = Number(raw);
      if (raw === "" || !Number.isFinite(num)) {
        setError(`Parameter '${key}' harus diisi dengan angka yang valid.`);
        return;
      }
      parsedPayload[key] = num;
    }

    if (parsedPayload.latitude < -90 || parsedPayload.latitude > 90) {
      setError("Latitude harus berada di antara -90.00 s.d. 90.00 derajat.");
      return;
    }
    if (parsedPayload.longitude < -180 || parsedPayload.longitude > 180) {
      setError("Longitude harus berada di antara -180.00 s.d. 180.00 derajat.");
      return;
    }
    if (parsedPayload.acq_time) {
      const t = parsedPayload.acq_time.padStart(4, "0");
      if (!/^\d{4}$/.test(t) || Number(t.slice(0, 2)) > 23 || Number(t.slice(2, 4)) > 59) {
        setError("Waktu UTC (HHMM) tidak valid. Gunakan format 4 digit antara 0000 s.d. 2359.");
        return;
      }
      parsedPayload.acq_time = t;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/predict`, parsedPayload, { timeout: 15000 });
      setResult(res.data);
    } catch (err: any) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            Model ANN-MLP (7 &rarr; 16 &rarr; 1) &bull; Akurasi 99.39%
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white flex items-center gap-2 mt-0.5">
            <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Uji Prediksi Cepat Titik Panas
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-600/30 dark:border-emerald-400/30 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition self-start sm:self-auto"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showGuide ? "Tutup Panduan Parameter" : "Panduan Parameter untuk Pengguna Awam"}</span>
          {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showGuide && (
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 transition-all">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Panduan Membaca Data Sensor Satelit VIIRS 375m (NASA FIRMS)</span>
          </div>
          <p>
            Sistem FRFP mendeteksi potensi kebakaran hutan/lahan menggunakan data sensor satelit cuaca polar Suomi-NPP / NOAA-20 (resolusi 375 meter). Model Artificial Neural Network (ANN) mengevaluasi kombinasi variabel termal dan geometri untuk membedakan antara titik api nyata (High Risk) vs pantulan panas biasa (Low Risk).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-emerald-900">
              <strong className="text-zinc-900 dark:text-white flex items-center gap-1 mb-1">
                <Flame className="w-3.5 h-3.5 text-red-500" /> 1. Suhu &amp; Delta (&Delta;T)
              </strong>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                <strong>Brightness I-4</strong> mengukur radiasi api (peka suhu tinggi). <strong>Bright T31</strong> mengukur suhu tanah sekitar. Selisih keduanya (&Delta;T = Brightness - T31) di atas 25–35 K menandakan kobaran api yang membakar vegetasi.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-emerald-900">
              <strong className="text-zinc-900 dark:text-white flex items-center gap-1 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> 2. Radiasi Panas (FRP)
              </strong>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                <strong>Fire Radiative Power (MW)</strong> menghitung laju energi pembakaran. Nilai &lt;5 MW tergolong api kecil/asap tipis, sedangkan &gt;20 MW mengindikasikan karhutla aktif yang meluas di lahan gambut atau hutan lebat.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-emerald-900">
              <strong className="text-zinc-900 dark:text-white flex items-center gap-1 mb-1">
                <Compass className="w-3.5 h-3.5 text-emerald-500" /> 3. Geometri Scan &amp; Track
              </strong>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Menunjukkan ukuran tapak piksel satelit di permukaan bumi (km). Semakin mendekati 0.375–0.40 km, piksel berada di tengah lintasan satelit sehingga resolusi pengamatan paling tajam dan presisi.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <form onSubmit={handleSubmit} className="xl:col-span-6 space-y-5">
          {/* Bagian 1: Waktu & Orbit */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> 1. Waktu Akuisisi &amp; Lintasan Satelit
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Tanggal Perekaman
                </label>
                <input
                  type="date"
                  name="acq_date"
                  value={formData.acq_date}
                  onChange={handleChange}
                  className="w-full surface-input rounded-lg p-2 text-xs font-mono"
                />
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  Tanggal satelit melintas dan mendeteksi anomali (format: YYYY-MM-DD).
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Jam Satelit UTC (HHMM)
                </label>
                <input
                  type="text"
                  name="acq_time"
                  placeholder="0630"
                  value={formData.acq_time}
                  onChange={handleChange}
                  maxLength={4}
                  className="w-full surface-input rounded-lg p-2 text-xs font-mono"
                />
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  Waktu dunia UTC 4 digit (misal: <code className="font-mono text-emerald-600 dark:text-emerald-400">0630</code> = 13:30 WIB / 14:30 WITA).
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Lintasan Orbit Satelit
                </label>
                <select
                  name="daynight"
                  value={formData.daynight}
                  onChange={handleChange}
                  className="w-full surface-input rounded-lg p-2 text-xs font-semibold"
                >
                  <option value="D" className="bg-white dark:bg-zinc-950">D - Siang Hari (Day)</option>
                  <option value="N" className="bg-white dark:bg-zinc-950">N - Malam Hari (Night)</option>
                </select>
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  Malam hari (N) bebas dari pantulan matahari sehingga akurasi deteksi termal sangat tinggi.
                </p>
              </div>
            </div>
          </div>

          {/* Bagian 2: Koordinat Geografis */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> 2. Titik Koordinat Geografis (WGS84)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Latitude / Garis Lintang (&deg;)
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full surface-input rounded-lg p-2 text-xs font-mono"
                  required
                />
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  Rentang wilayah NKRI: <span className="font-mono text-zinc-700 dark:text-zinc-300">-11.00&deg;</span> (selatan NTT) s.d. <span className="font-mono text-zinc-700 dark:text-zinc-300">6.00&deg;</span> (utara Aceh).
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Longitude / Garis Bujur (&deg;)
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full surface-input rounded-lg p-2 text-xs font-mono"
                  required
                />
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  Rentang wilayah NKRI: <span className="font-mono text-zinc-700 dark:text-zinc-300">95.00&deg;</span> (Sabang di barat) s.d. <span className="font-mono text-zinc-700 dark:text-zinc-300">141.00&deg;</span> (Merauke di timur).
                </p>
              </div>
            </div>
          </div>

          {/* Bagian 3: Parameter Sensor Termal & Geometri */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5" /> 3. Data Sensor Termal &amp; Geometri VIIRS 375m
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Brightness I-4 (Kelvin)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="brightness"
                  value={formData.brightness}
                  onChange={handleChange}
                  className="w-full surface-input rounded-lg p-2 text-xs font-mono font-bold"
                  required
                />
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  Suhu pancaran inframerah peka api (3.9 &mu;m). Tanah normal ~300 K (27&deg;C), titik api aktif &gt;330&ndash;380+ K.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Bright T31 I-5 (Kelvin)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="bright_t31"
                  value={formData.bright_t31}
                  onChange={handleChange}
                  className="w-full surface-input rounded-lg p-2 text-xs font-mono"
                  required
                />
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  Suhu permukaan tanah di sekitar api (11 &mu;m, normal 280&ndash;315 K). Acuan dasar menghitung selisih panas (&Delta;T).
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  FRP (Megawatt / MW)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="frp"
                  value={formData.frp}
                  onChange={handleChange}
                  className="w-full surface-input rounded-lg p-2 text-xs font-mono text-amber-600 dark:text-amber-400 font-bold"
                  required
                />
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  Daya energi radiasi api. &lt;5 MW = api kecil/asap tipis; &gt;20&ndash;50+ MW = kobaran kebakaran hutan/lahan masif.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Scan Pixel (Kilometer / km)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="scan"
                  value={formData.scan}
                  onChange={handleChange}
                  className="w-full surface-input rounded-lg p-2 text-xs font-mono"
                  required
                />
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  Ukuran sapuan piksel melintang orbit (across-track). Nilai standar VIIRS 375m berkisar 0.32 s.d. 0.80 km (tipikal: 0.45 km).
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Track Pixel (Kilometer / km)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="track"
                  value={formData.track}
                  onChange={handleChange}
                  className="w-full surface-input rounded-lg p-2 text-xs font-mono"
                  required
                />
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
                  Ukuran sapuan piksel searah lajur terbang satelit (along-track). Standar berkisar 0.36 s.d. 0.60 km (tipikal: 0.40 km).
                </p>
              </div>
            </div>

            {/* Live Indicator Card untuk Pengguna Awam */}
            {(() => {
              const b = Number(formData.brightness) || 0;
              const t = Number(formData.bright_t31) || 0;
              const dt = Number((b - t).toFixed(1));
              const frpVal = Number(formData.frp) || 0;
              const isSignificant = dt >= 25;
              return (
                <div className="mt-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-4 h-4 ${isSignificant ? "text-red-500 animate-pulse" : "text-zinc-400"}`} />
                    <div>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Estimasi Selisih Suhu (&Delta;T = I-4 &minus; T31):</span>
                      <span className="ml-1.5 font-mono font-bold text-zinc-900 dark:text-white">
                        {isNaN(dt) ? "0.0" : dt} K
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    {isSignificant ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                        🔥 Anomali Panas Kuat (&ge;25 K)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        Suhu Relatif Seragam (&lt;25 K)
                      </span>
                    )}
                    {frpVal >= 20 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                        ⚡ Radiasi Tinggi (&gt;20 MW)
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses Inferensi ANN...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Klasifikasikan Tingkat Risiko
              </>
            )}
          </button>
        </form>

        <div className="xl:col-span-6 xl:border-l xl:border-zinc-200 xl:dark:border-zinc-800 xl:pl-6">
          {result ? (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400">Hasil Klasifikasi ANN-MLP (7 &rarr; 16 &rarr; 1)</span>
                  <div className="text-3xl font-black mt-1 flex flex-wrap items-baseline gap-2.5">
                    <span
                      className={
                        result.risk_class === "HIGH RISK" ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"
                      }
                    >
                      {result.risk_class}
                    </span>
                    <span className="text-xs font-mono font-normal text-zinc-500 dark:text-zinc-400">
                      Probabilitas: {(result.probability * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold self-start ${
                    result.risk_class === "HIGH RISK"
                      ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                      : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  }`}
                >
                  Prioritas: {result.audit_priority}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-b border-zinc-200 dark:border-zinc-800 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Wilayah / Provinsi</span>
                    <div className="font-semibold text-zinc-950 dark:text-white">{result.province_region}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Waktu Konversi Lokal</span>
                    <div className="font-semibold text-emerald-700 dark:text-emerald-400 font-mono">{result.local_time_str}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800 py-2 border-b border-zinc-200 dark:border-zinc-800 text-xs">
                <div className="pr-3 py-1">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Delta Suhu (&Delta;T)</span>
                  <div className="text-lg font-bold text-zinc-950 dark:text-white font-mono mt-0.5">{result.delta_t} K</div>
                </div>
                <div className="sm:px-3 py-1">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Radiasi FRP</span>
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">{result.frp} MW</div>
                </div>
                <div className="sm:px-3 py-1">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Validitas RI</span>
                  <div className={`text-sm font-bold mt-1 ${result.is_indonesia ? "text-emerald-700 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {result.is_indonesia ? "Dalam Teritori" : "Di Luar RI"}
                  </div>
                </div>
                <div className="sm:pl-3 py-1">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Status</span>
                  <div className="text-sm font-bold text-zinc-950 dark:text-white mt-1">
                    {result.risk_class === "HIGH RISK" ? "PENDING DISPATCH" : "MONITORING"}
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-sky-600 dark:border-sky-400 pl-3 py-1 text-xs text-zinc-700 dark:text-zinc-300">
                <strong className="text-zinc-950 dark:text-white block mb-1">Penjelasan Proses &amp; Alasan Keputusan AI</strong>
                <p className="leading-relaxed">
                  {result.explanation ||
                    `Klasifikasi ${result.risk_class} dihitung oleh ANN-MLP (7→16→1) berdasarkan FRP ${result.frp} MW dan selisih suhu ΔT ${result.delta_t} K dengan probabilitas ${(result.probability * 100).toFixed(2)}%.`}
                </p>
              </div>

              <div className="border-l-2 border-emerald-600 dark:border-emerald-400 pl-3 py-1 text-xs text-zinc-700 dark:text-zinc-300">
                <strong className="text-zinc-950 dark:text-white block mb-1">Rekomendasi Operasional Satgas &amp; Gakkum</strong>
                <p className="leading-relaxed">{result.recommendation}</p>
              </div>
            </div>
          ) : (
            <div className="py-12 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-2">
              <Zap className="w-6 h-6 mx-auto text-zinc-400" />
              <div className="font-semibold text-zinc-700 dark:text-zinc-300">Belum Ada Hasil Prediksi</div>
              <p>Isi parameter sensor VIIRS di sebelah kiri lalu tekan tombol klasifikasi untuk melihat hasil prediksi model ANN-MLP secara langsung.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
