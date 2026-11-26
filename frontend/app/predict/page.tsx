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
} from "lucide-react";

export default function PredictPage() {
  const [formData, setFormData] = useState({
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

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "acq_date" || name === "acq_time" || name === "daynight") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/predict`, formData, { timeout: 15000 });
      setResult(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Gagal menghubungi server backend di http://127.0.0.1:8000. Pastikan backend aktif dengan perintah: cd backend; python run.py"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
          Model ANN-MLP (7 &rarr; 16 &rarr; 1) &bull; Akurasi 99.39%
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white flex items-center gap-2 mt-0.5">
          <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Uji Prediksi Cepat Titik Panas
        </h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <form onSubmit={handleSubmit} className="xl:col-span-6 space-y-5">
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Waktu Akuisisi Satelit NASA FIRMS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Tanggal
                </label>
                <input
                  type="date"
                  name="acq_date"
                  value={formData.acq_date}
                  onChange={handleChange}
                  className="w-full surface-input rounded-lg p-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Waktu UTC (HHMM)
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
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">0630 = 13:30 WIB</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Lintasan Orbit
                </label>
                <select
                  name="daynight"
                  value={formData.daynight}
                  onChange={handleChange}
                  className="w-full surface-input rounded-lg p-2 text-xs font-semibold"
                >
                  <option value="D" className="bg-white dark:bg-zinc-950">D - Siang Hari</option>
                  <option value="N" className="bg-white dark:bg-zinc-950">N - Malam Hari</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Koordinat Geografis
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Latitude (-11.00 s.d. 6.00)
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
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Longitude (95.00 s.d. 141.00)
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
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5" /> Parameter Termal &amp; Geometri VIIRS
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Brightness I-4 (K)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="brightness"
                  value={formData.brightness}
                  onChange={handleChange}
                  className="w-full surface-input rounded-lg p-2 text-xs font-mono"
                  required
                />
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">300 - 505 K</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Bright T31 I-5 (K)
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
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">275 - 345 K</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  FRP (MW)
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
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Radiasi energi</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Scan (km)</label>
                <input
                  type="number"
                  step="0.01"
                  name="scan"
                  value={formData.scan}
                  onChange={handleChange}
                  className="w-full surface-input rounded-lg p-2 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Track (km)</label>
                <input
                  type="number"
                  step="0.01"
                  name="track"
                  value={formData.track}
                  onChange={handleChange}
                  className="w-full surface-input rounded-lg p-2 text-xs font-mono"
                  required
                />
              </div>
            </div>
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
