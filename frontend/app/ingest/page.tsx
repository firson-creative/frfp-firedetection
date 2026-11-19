"use client";

import { useState } from "react";
import axios from "axios";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Filter,
  ArrowRight,
  Trash2,
  Calendar,
  Clock,
  Compass,
} from "lucide-react";
import Link from "next/link";

export default function IngestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResetMessage(null);
    }
  };

  const handleResetDb = async () => {
    if (!confirm("Apakah Anda yakin ingin mengosongkan seluruh riwayat hotspot di basis data?")) {
      return;
    }
    try {
      await axios.post("http://localhost:8000/api/v1/reset-db");
      setResetMessage("Basis data berhasil di-reset menjadi kosong (0 titik).");
      setResponse(null);
    } catch (err: any) {
      setError("Gagal mereset basis data.");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Pilih file CSV satelit NASA FIRMS terlebih dahulu.");
      return;
    }

    setUploading(true);
    setError(null);
    setResponse(null);
    setResetMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/predict-batch?replace_existing=${replaceExisting}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResponse(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Gagal mengunggah dan memproses file CSV.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="liquid-glass p-5 rounded-2xl border border-emerald-500/25">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-emerald-400" /> Ingesti Batch Data Satelit NASA FIRMS
        </h1>
        <p className="text-sm text-emerald-100/70 mt-1">
          Unggah rekaman data titik panas satelit VIIRS 375m (format <code>.csv</code>). Sistem secara serempak
          akan memvalidasi koordinat seluruh Indonesia (Sabang s.d. Merauke), menghitung waktu lokal (WIB/WITA/WIT),
          dan mengklasifikasikan tingkat risiko dengan model <strong>ANN-MLP</strong>.
        </p>
      </div>

      {/* Upload Box */}
      <form onSubmit={handleUpload} className="liquid-glass p-6 rounded-2xl border border-emerald-500/25 space-y-5">
        <div className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-400/70 rounded-xl p-8 text-center transition flex flex-col items-center justify-center bg-black/40">
          <FileSpreadsheet className="w-12 h-12 text-emerald-400 mb-3" />
          <p className="text-sm font-semibold text-gray-200">
            {file ? file.name : "Pilih atau Seret File CSV NASA FIRMS (VIIRS 375m) ke sini"}
          </p>
          <p className="text-xs text-emerald-200/60 mt-1">
            Kolom wajib: <code>latitude, longitude, brightness, scan, track, frp, bright_t31</code>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Kolom opsional temporal: <code>acq_date, acq_time, daynight</code>
          </p>

          <label className="mt-4 cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-glass-emerald">
            <span>Pilih File CSV</span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-950/70 border border-red-500 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {resetMessage && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-500 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{resetMessage}</span>
          </div>
        )}

        {/* Options Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-emerald-500/20 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="replace"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-black/50 border-emerald-500/40 cursor-pointer"
            />
            <label htmlFor="replace" className="text-gray-300 cursor-pointer">
              Gantikan data lama di database (Reset sebelum simpan batch baru)
            </label>
          </div>

          <button
            type="button"
            onClick={handleResetDb}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-500/30 rounded-lg transition text-xs font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Kosongkan Database Hotspot
          </button>
        </div>

        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-glass-emerald transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Memproses Klasifikasi JST Seluruh Titik...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" /> Proses Ingesti & Klasifikasikan Batch
            </>
          )}
        </button>
      </form>

      {/* Upload Results Summary */}
      {response && (
        <div className="liquid-glass p-6 rounded-2xl border border-emerald-500/30 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xs text-emerald-400 font-mono">Hasil Pemrosesan Batch Selesai:</div>
              <h2 className="text-xl font-bold text-white mt-1">Ringkasan Klasifikasi Nasional</h2>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg shadow-sm transition"
            >
              Lihat di Peta Nasional <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4 Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="liquid-glass-card p-3 rounded-xl">
              <span className="text-[11px] text-gray-400">Total Baris File</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">{response.total_uploaded.toLocaleString()}</div>
            </div>
            <div className="liquid-glass-card p-3 rounded-xl">
              <span className="text-[11px] text-emerald-300">Wilayah Indonesia</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                {response.total_processed_indonesia.toLocaleString()}
              </div>
            </div>
            <div className="liquid-glass-card p-3 rounded-xl border-red-500/30">
              <span className="text-[11px] text-red-300">High Risk (Prioritas)</span>
              <div className="text-2xl font-bold text-red-400 font-mono mt-1">
                {response.high_risk_count.toLocaleString()}
              </div>
            </div>
            <div className="liquid-glass-card p-3 rounded-xl border-emerald-500/30">
              <span className="text-[11px] text-emerald-300">Low Risk (Rutin)</span>
              <div className="text-2xl font-bold text-emerald-300 font-mono mt-1">
                {response.low_risk_count.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Sample Table with Date/Time and Region */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Sampel Titik Terklasifikasi (Menampilkan hingga 15 Titik Pertama):
            </h3>
            <div className="overflow-x-auto rounded-xl border border-emerald-500/20">
              <table className="min-w-full text-xs text-left">
                <thead className="bg-black/60 text-emerald-300 font-semibold border-b border-emerald-500/20">
                  <tr>
                    <th className="p-2.5">Wilayah / Koordinat</th>
                    <th className="p-2.5">Waktu Satelit (Lokal)</th>
                    <th className="p-2.5">Brightness / FRP</th>
                    <th className="p-2.5">&Delta;T</th>
                    <th className="p-2.5">Probabilitas</th>
                    <th className="p-2.5">Hasil Klasifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10 bg-black/20">
                  {response.records?.slice(0, 15).map((rec: any, i: number) => {
                    const isHigh = rec.risk_class === "HIGH RISK";
                    return (
                      <tr key={i} className="hover:bg-emerald-950/30 transition">
                        <td className="p-2.5">
                          <div className="font-semibold text-gray-200">{rec.province_region}</div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {rec.latitude.toFixed(4)}, {rec.longitude.toFixed(4)}
                          </div>
                        </td>
                        <td className="p-2.5">
                          <div className="font-mono text-emerald-200">{rec.local_time_str}</div>
                          <div className="text-[10px] text-gray-400">
                            {rec.acq_date} • {rec.daynight === "N" ? "🌙 Malam" : "☀️ Siang"}
                          </div>
                        </td>
                        <td className="p-2.5 font-mono">
                          <div className="text-white">{rec.brightness} K</div>
                          <div className="text-amber-300 text-[11px] font-bold">{rec.frp} MW</div>
                        </td>
                        <td className="p-2.5 font-mono text-emerald-300">{rec.delta_t} K</td>
                        <td className="p-2.5 font-mono text-gray-300">{(rec.probability * 100).toFixed(1)}%</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isHigh
                                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            }`}
                          >
                            {rec.risk_class}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
