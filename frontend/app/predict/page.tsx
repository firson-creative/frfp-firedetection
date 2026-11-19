"use client";

import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import {
  Zap,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Thermometer,
  ShieldAlert,
  Clock,
  Calendar,
  Sun,
  Moon,
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="liquid-glass p-5 rounded-2xl border border-emerald-500/25">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-emerald-400" /> Uji Prediksi Cepat Titik Panas Satelit
        </h1>
        <p className="text-sm text-emerald-100/70 mt-1">
          Simulasikan 7 parameter sensor VIIRS 375m beserta tanggal dan waktu perekaman untuk diklasifikasikan
          secara instan oleh model <strong>ANN-MLP (Akurasi 99.74%)</strong> di seluruh wilayah Indonesia.
        </p>
      </div>

      {/* Form Input Grid */}
      <form onSubmit={handleSubmit} className="liquid-glass p-6 rounded-2xl border border-emerald-500/25 space-y-6">
        {/* Section 1: Tanggal & Waktu Akuisisi Satelit */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
            <Clock className="w-4 h-4" /> Waktu Akuisisi Satelit NASA FIRMS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Tanggal (acq_date)
              </label>
              <input
                type="date"
                name="acq_date"
                value={formData.acq_date}
                onChange={handleChange}
                className="w-full liquid-glass-input rounded-lg p-2.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Waktu UTC (acq_time)
              </label>
              <input
                type="text"
                name="acq_time"
                placeholder="HHMM (contoh: 0630)"
                value={formData.acq_time}
                onChange={handleChange}
                maxLength={4}
                className="w-full liquid-glass-input rounded-lg p-2.5 text-xs font-mono"
              />
              <span className="text-[10px] text-gray-400">Format 4 digit jam UTC (0630 = 13:30 WIB)</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Lintasan Orbit (daynight)
              </label>
              <select
                name="daynight"
                value={formData.daynight}
                onChange={handleChange}
                className="w-full liquid-glass-input rounded-lg p-2.5 text-xs font-semibold"
              >
                <option value="D" className="bg-brand-forest">☀️ D - Siang Hari</option>
                <option value="N" className="bg-brand-forest">🌙 N - Malam Hari</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Koordinat Spasial */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
            <Compass className="w-4 h-4" /> Koordinat Geografis
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Latitude (Lintang: -11.00 s.d. 6.00)
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full liquid-glass-input rounded-lg p-2.5 text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Longitude (Bujur: 95.00 s.d. 141.00)
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full liquid-glass-input rounded-lg p-2.5 text-xs font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: 5 Parameter Sensor Termal */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
            <Thermometer className="w-4 h-4" /> Parameter Termal & Geometri Satelit VIIRS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Brightness I-4 (K)
              </label>
              <input
                type="number"
                step="0.1"
                name="brightness"
                value={formData.brightness}
                onChange={handleChange}
                className="w-full liquid-glass-input rounded-lg p-2.5 text-xs font-mono"
                required
              />
              <span className="text-[10px] text-gray-400">Rentang valid: 300 - 505 K</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Bright T31 I-5 (K)
              </label>
              <input
                type="number"
                step="0.1"
                name="bright_t31"
                value={formData.bright_t31}
                onChange={handleChange}
                className="w-full liquid-glass-input rounded-lg p-2.5 text-xs font-mono"
                required
              />
              <span className="text-[10px] text-gray-400">Suhu latar: 275 - 345 K</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                FRP (Megawatt)
              </label>
              <input
                type="number"
                step="0.1"
                name="frp"
                value={formData.frp}
                onChange={handleChange}
                className="w-full liquid-glass-input rounded-lg p-2.5 text-xs font-mono text-amber-300 font-bold"
                required
              />
              <span className="text-[10px] text-gray-400">Intensitas radiasi energi</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Scan (km)</label>
              <input
                type="number"
                step="0.01"
                name="scan"
                value={formData.scan}
                onChange={handleChange}
                className="w-full liquid-glass-input rounded-lg p-2.5 text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Track (km)</label>
              <input
                type="number"
                step="0.01"
                name="track"
                value={formData.track}
                onChange={handleChange}
                className="w-full liquid-glass-input rounded-lg p-2.5 text-xs font-mono"
                required
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-950/70 border border-red-500/60 rounded-xl text-red-200 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-glass-emerald transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Memproses Inferensi Jaringan Syaraf Tiruan (ANN)...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" /> Klasifikasikan Tingkat Risiko Titik Panas
            </>
          )}
        </button>
      </form>

      {/* Hasil Prediksi Model */}
      {result && (
        <div className="liquid-glass p-6 rounded-2xl border border-emerald-500/30 shadow-glass space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-emerald-500/20">
            <div>
              <span className="text-xs font-mono text-emerald-400">Hasil Klasifikasi ANN-MLP (7 &rarr; 64 &rarr; 32 &rarr; 1):</span>
              <div className="text-2xl font-black mt-1 flex items-center gap-2">
                <span
                  className={
                    result.risk_class === "HIGH RISK" ? "text-red-400" : "text-emerald-400"
                  }
                >
                  {result.risk_class}
                </span>
                <span className="text-xs font-normal text-gray-400">
                  (Probabilitas Kebakaran: {(result.probability * 100).toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  result.risk_class === "HIGH RISK"
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                Prioritas: {result.audit_priority}
              </span>
            </div>
          </div>

          {/* Regional & Timezone Analysis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-black/40 p-3.5 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-gray-400 text-[11px]">Wilayah / Provinsi:</span>
                <div className="font-semibold text-white">{result.province_region}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-gray-400 text-[11px]">Waktu Konversi Lokal:</span>
                <div className="font-semibold text-emerald-300 font-mono">{result.local_time_str}</div>
              </div>
            </div>
          </div>

          {/* Metrik Turunan */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-black/30 p-3 rounded-lg border border-emerald-500/20">
              <span className="text-gray-400">Delta Suhu (&Delta;T):</span>
              <div className="text-base font-bold text-white font-mono">{result.delta_t} K</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg border border-emerald-500/20">
              <span className="text-gray-400">Radiasi Termal (FRP):</span>
              <div className="text-base font-bold text-amber-300 font-mono">{result.frp} MW</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg border border-emerald-500/20">
              <span className="text-gray-400">Validitas Wilayah:</span>
              <div className={`text-sm font-bold ${result.is_indonesia ? "text-emerald-400" : "text-amber-400"}`}>
                {result.is_indonesia ? "Dalam RI (Sabang-Merauke)" : "Di Luar Wilayah RI"}
              </div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg border border-emerald-500/20">
              <span className="text-gray-400">Status Tugas:</span>
              <div className="text-sm font-bold text-white">
                {result.risk_class === "HIGH RISK" ? "PENDING DISPATCH" : "MONITORING"}
              </div>
            </div>
          </div>

          {/* Rekomendasi Aksi */}
          <div className="p-3.5 bg-emerald-950/60 rounded-xl border border-emerald-500/30 text-xs text-gray-200">
            <strong className="text-emerald-300 block mb-1">Rekomendasi Operasional Satgas & Gakkum:</strong>
            <p className="leading-relaxed">{result.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
