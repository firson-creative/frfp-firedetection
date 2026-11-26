"use client";

import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Trash2,
  RefreshCw,
  Trees,
  Waves,
  Mountain,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";

export default function IngestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileSizeStr, setFileSizeStr] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setFileSizeStr(formatBytes(f.size));
      setError(null);
      setResetMessage(null);
    }
  };

  const handleResetDb = async () => {
    setIsResetting(true);
    setError(null);
    setResetMessage(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/reset-db`, {}, { timeout: 15000 });
      setResetMessage(res.data?.message || "Basis data berhasil di-reset menjadi kosong (0 titik).");
      setResponse(null);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || "Koneksi ke backend gagal.";
      setError(`Gagal mengosongkan database: ${detail}. Pastikan Backend aktif di port 8000.`);
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
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
        `${API_BASE_URL}/api/v1/predict-batch?replace_existing=${replaceExisting}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 180000,
        }
      );
      setResponse(res.data);
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "Gagal mengunggah dan memproses file CSV. Pastikan Backend di port 8000 aktif.";
      setError(`Error Pemrosesan: ${detail}`);
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSample = async (region: string) => {
    setUploading(true);
    setError(null);
    setResponse(null);
    setResetMessage(null);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/load-sample?region=${region}&replace_existing=${replaceExisting}`,
        {},
        { timeout: 30000 }
      );
      setResponse(res.data);
      setResetMessage(`Dataset sampel ${region.toUpperCase()} (${res.data.total_processed_indonesia.toLocaleString()} titik) berhasil diklasifikasi dan dimuat.`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || "Gagal memuat dataset sampel.";
      setError(`Gagal memuat sampel: ${detail}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            Vectorized Chunked Stream &bull; NASA FIRMS VIIRS 375m (.csv)
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-white flex items-center gap-2 mt-0.5">
            <UploadCloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Ingesti Batch Data Satelit
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          disabled={isResetting || uploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg transition text-xs font-bold disabled:opacity-50 self-start sm:self-auto"
        >
          {isResetting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          <span>{isResetting ? "Mengosongkan..." : "Reset Database (0 Titik)"}</span>
        </button>
      </div>

      <div className="space-y-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Dataset Uji Cepat Siap Pakai (&lt; 200 KB)
          </h2>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">Proses &lt; 0.2 detik</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleLoadSample("kalimantan")}
            disabled={uploading || isResetting}
            className="px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition text-left flex items-center justify-between gap-2 disabled:opacity-50"
          >
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Trees className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Kalimantan
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">1.500 Titik &bull; 127 KB</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={() => handleLoadSample("sulawesi")}
            disabled={uploading || isResetting}
            className="px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition text-left flex items-center justify-between gap-2 disabled:opacity-50"
          >
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Sulawesi
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">1.200 Titik &bull; 101 KB</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={() => handleLoadSample("papua")}
            disabled={uploading || isResetting}
            className="px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition text-left flex items-center justify-between gap-2 disabled:opacity-50"
          >
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Papua
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">1.500 Titik &bull; 127 KB</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={() => handleLoadSample("nasional")}
            disabled={uploading || isResetting}
            className="px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition text-left flex items-center justify-between gap-2 disabled:opacity-50"
          >
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Nusantara
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">2.500 Titik &bull; 211 KB</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-zinc-900 border border-emerald-300 dark:border-zinc-700 rounded-lg text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-3">
        <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 rounded-xl p-6 text-center transition flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <FileSpreadsheet className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-2" />
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {file ? (
              <span className="text-emerald-700 dark:text-emerald-400">
                {file.name} <span className="text-xs text-zinc-500 font-normal">({fileSizeStr})</span>
              </span>
            ) : (
              "Pilih atau Seret File CSV NASA FIRMS (VIIRS 375m) ke sini"
            )}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Sensor: <code>latitude, longitude, brightness, scan, track, frp, bright_t31</code> &bull; Temporal: <code>acq_date, acq_time, daynight</code>
          </p>

          <label className="mt-3 cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg transition">
            <span>Pilih File CSV</span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span>Gantikan data lama di database sebelum mengimpor</span>
          </label>

          <button
            type="submit"
            disabled={uploading || !file}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses Batch...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" /> Proses Ingesti &amp; Klasifikasikan
              </>
            )}
          </button>
        </div>
      </form>

      {response && (
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">Pemrosesan Batch Selesai</div>
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Ringkasan Klasifikasi Nasional</h2>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
            >
              Lihat di Peta Nasional <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800 py-3 border-y border-zinc-200 dark:border-zinc-800">
            <div className="pr-3 py-1">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Total Baris File</span>
              <div className="text-2xl font-bold text-zinc-950 dark:text-white font-mono mt-0.5">
                {response.total_uploaded.toLocaleString()}
              </div>
            </div>
            <div className="sm:px-3 py-1">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Wilayah Indonesia</span>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                {response.total_processed_indonesia.toLocaleString()}
              </div>
            </div>
            <div className="sm:px-3 py-1">
              <span className="text-[11px] text-red-600 dark:text-red-400">High Risk</span>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono mt-0.5">
                {response.high_risk_count.toLocaleString()}
              </div>
            </div>
            <div className="sm:pl-3 py-1">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Low Risk</span>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                {response.low_risk_count.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Sampel 15 Titik Pertama
            </h3>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="min-w-full text-xs text-left">
                <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-2.5">Wilayah / Koordinat</th>
                    <th className="p-2.5">Waktu Satelit (Lokal)</th>
                    <th className="p-2.5">Brightness / FRP</th>
                    <th className="p-2.5">&Delta;T</th>
                    <th className="p-2.5">Probabilitas</th>
                    <th className="p-2.5">Hasil Klasifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-black">
                  {response.records?.slice(0, 15).map((rec: any, i: number) => {
                    const isHigh = rec.risk_class === "HIGH RISK";
                    return (
                      <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
                        <td className="p-2.5">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{rec.province_region}</div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                            {rec.latitude.toFixed(4)}, {rec.longitude.toFixed(4)}
                          </div>
                        </td>
                        <td className="p-2.5">
                          <div className="font-mono text-zinc-800 dark:text-zinc-200">{rec.local_time_str}</div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                            <span>{rec.acq_date} &bull;</span>
                            {rec.daynight === "N" ? (
                              <span className="inline-flex items-center gap-0.5"><Moon className="w-3 h-3" /> Malam</span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5"><Sun className="w-3 h-3" /> Siang</span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 font-mono">
                          <div className="text-zinc-950 dark:text-white">{rec.brightness} K</div>
                          <div className="text-amber-600 dark:text-amber-400 text-[11px] font-bold">{rec.frp} MW</div>
                        </td>
                        <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400">{rec.delta_t} K</td>
                        <td className="p-2.5 font-mono text-zinc-700 dark:text-zinc-300">{(rec.probability * 100).toFixed(1)}%</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isHigh
                                ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
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

      <ConfirmModal
        open={showResetConfirm}
        title="Kosongkan Basis Data Hotspot?"
        description="Apakah Anda yakin ingin mengosongkan seluruh riwayat titik panas di basis data? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Kosongkan"
        cancelLabel="Batal"
        loading={isResetting}
        onConfirm={handleResetDb}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
