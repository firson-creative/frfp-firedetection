"use client";

import { useState } from "react";
import axios from "axios";
import { Zap, AlertTriangle, CheckCircle, Info, MapPin, Thermometer, ShieldAlert } from "lucide-react";

export default function PredictPage() {
  const [formData, setFormData] = useState({
    latitude: 0.5071,
    longitude: 101.4478,
    brightness: 342.5,
    scan: 0.45,
    track: 0.40,
    frp: 28.4,
    bright_t31: 295.2,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    {
      name: "🔥 High Risk (Gambut Siak/Pelalawan)",
      desc: "FRP tinggi (38 MW) & ΔT signifikan (>40 K)",
      data: {
        latitude: 0.6542,
        longitude: 101.8921,
        brightness: 355.2,
        scan: 0.42,
        track: 0.38,
        frp: 38.6,
        bright_t31: 292.4,
      },
    },
    {
      name: "🌿 Low Risk (Pemantauan Kampar)",
      desc: "FRP rendah (4.2 MW) & delta suhu normal (<15 K)",
      data: {
        latitude: 0.2315,
        longitude: 101.1245,
        brightness: 308.5,
        scan: 0.38,
        track: 0.36,
        frp: 4.2,
        bright_t31: 298.0,
      },
    },
    {
      name: "⚠️ Uji Titik Luar Riau",
      desc: "Koordinat di luar Bounding Box Riau",
      data: {
        latitude: 3.8500,
        longitude: 97.4500,
        brightness: 345.0,
        scan: 0.45,
        track: 0.40,
        frp: 30.0,
        bright_t31: 295.0,
      },
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handlePreset = (presetData: any) => {
    setFormData(presetData);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post("http://localhost:8000/api/v1/predict", formData);
      setResult(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Gagal menghubungi server backend di http://localhost:8000. Pastikan server backend sudah dijalankan di terminal dengan perintah: cd backend; python run.py"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-brand-navy/60 p-5 rounded-xl border border-brand-deepBlue/50 shadow-md">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-brand-cyan" /> Uji Prediksi Cepat Titik Panas Tunggal
        </h1>
        <p className="text-sm text-gray-300 mt-1">
          Masukkan 7 parameter satelit NASA FIRMS (VIIRS 375m) untuk menguji klasifikasi risiko inferensi ANN-MLP.
        </p>
      </div>

      {/* Preset Tombol Cepat */}
      <div className="bg-brand-cardBg/80 p-4 rounded-xl border border-brand-deepBlue/50">
        <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Preset Simulasi Cepat:</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePreset(p.data)}
              className="text-left p-2.5 rounded-lg bg-brand-deepBlue/40 hover:bg-brand-deepBlue/80 border border-brand-cyan/20 transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-brand-cyan">{p.name}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulir 7 Fitur */}
        <div className="lg:col-span-7 bg-brand-navy/80 p-6 rounded-xl border border-brand-deepBlue shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-sm font-bold text-brand-cyan uppercase tracking-wider mb-2">
              7 Parameter Fitur Model ANN
            </h2>

            {/* Latitude & Longitude */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300">
                  Latitude (Lintang) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full bg-brand-cardBg border border-brand-deepBlue rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-cyan font-mono"
                />
                <span className="text-[10px] text-gray-400">Riau: -1.15 s.d. 2.45</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300">
                  Longitude (Bujur) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full bg-brand-cardBg border border-brand-deepBlue rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-cyan font-mono"
                />
                <span className="text-[10px] text-gray-400">Riau: 100.00 s.d. 103.85</span>
              </div>
            </div>

            {/* Brightness & Bright_T31 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300">
                  Brightness (Kanal I-4) [K]
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="brightness"
                  value={formData.brightness}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full bg-brand-cardBg border border-brand-deepBlue rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-cyan font-mono"
                />
                <span className="text-[10px] text-gray-400">Rentang: 300.0 - 505.0 K</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300">
                  Bright_T31 (Kanal I-5) [K]
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="bright_t31"
                  value={formData.bright_t31}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full bg-brand-cardBg border border-brand-deepBlue rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-cyan font-mono"
                />
                <span className="text-[10px] text-gray-400">Pembanding latar (275 - 345 K)</span>
              </div>
            </div>

            {/* FRP */}
            <div>
              <label className="block text-xs font-medium text-gray-300">
                FRP - Fire Radiative Power (MW) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                name="frp"
                value={formData.frp}
                onChange={handleChange}
                required
                className="mt-1 w-full bg-brand-cardBg border border-brand-deepBlue rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-cyan font-mono"
              />
              <span className="text-[10px] text-gray-400">Ambang Tinggi: &ge; 15.0 MW</span>
            </div>

            {/* Scan & Track */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300">
                  Scan Resolution (km)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="scan"
                  value={formData.scan}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full bg-brand-cardBg border border-brand-deepBlue rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-cyan font-mono"
                />
                <span className="text-[10px] text-gray-400">0.32 - 0.80 km</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300">
                  Track Resolution (km)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="track"
                  value={formData.track}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full bg-brand-cardBg border border-brand-deepBlue rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-cyan font-mono"
                />
                <span className="text-[10px] text-gray-400">0.36 - 0.80 km</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-brand-cyan hover:bg-cyan-400 text-brand-navy font-bold rounded-lg shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
                  <span>Memproses Inferensi ANN...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Klasifikasikan Tingkat Risiko</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Hasil Prediksi & Kartu Penjelasan */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          {error && (
            <div className="p-4 bg-red-950/60 border border-red-500 rounded-xl text-red-300 text-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Terjadi Kesalahan:</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {result ? (
            <div className="bg-brand-navy p-6 rounded-xl border border-brand-deepBlue shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-brand-deepBlue">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Hasil Inferensi Model
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    result.risk_class === "HIGH RISK"
                      ? "bg-red-500/20 text-red-400 border-red-500/50"
                      : "bg-green-500/20 text-green-400 border-green-500/50"
                  }`}
                >
                  {result.risk_class}
                </span>
              </div>

              {/* Skor Probabilitas Gauge */}
              <div className="text-center py-2">
                <div className="text-xs text-gray-400">Probabilitas Kebakaran Lahan:</div>
                <div
                  className={`text-4xl font-extrabold mt-1 ${
                    result.risk_class === "HIGH RISK" ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {(result.probability * 100).toFixed(1)}%
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${
                      result.risk_class === "HIGH RISK" ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${result.probability * 100}%` }}
                  />
                </div>
              </div>

              {/* Explainability Metrik */}
              <div className="bg-brand-darkBg/80 p-3 rounded-lg border border-brand-deepBlue/50 space-y-2 text-xs">
                <div className="font-semibold text-gray-300 flex items-center gap-1.5 pb-1 border-b border-gray-700">
                  <Info className="w-3.5 h-3.5 text-brand-cyan" /> Faktor Pemicu Risiko (Explainability):
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Selisih Suhu (ΔT):</span>
                  <span className="font-bold text-white">{result.delta_t} K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Radiasi FRP:</span>
                  <span className="font-bold text-white">{result.frp} MW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status Koordinat:</span>
                  <span
                    className={`font-semibold ${
                      result.is_riau ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    {result.is_riau ? "Valid di Wilayah Riau" : "Di luar Bounding Box Riau"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wilayah / Kabupaten:</span>
                  <span className="font-semibold text-brand-cyan">{result.subregion}</span>
                </div>
              </div>

              {/* Rekomendasi Lapangan */}
              <div className="p-3 bg-brand-deepBlue/30 rounded-lg border border-brand-cyan/20 text-xs">
                <div className="text-brand-cyan font-bold flex items-center gap-1 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Rekomendasi Satgas & Audit:
                </div>
                <div className="text-gray-200">{result.recommendation}</div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] bg-brand-navy/30 border border-dashed border-brand-deepBlue rounded-xl flex flex-col items-center justify-center p-6 text-center text-gray-400">
              <Zap className="w-10 h-10 text-gray-500 mb-2" />
              <div className="font-semibold text-sm">Menunggu Input Pengujian</div>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Tekan tombol preset di atas atau isi parameter formulir lalu klik Klasifikasikan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
