"use client";

import { useState } from "react";
import axios from "axios";
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle, Filter, ArrowRight } from "lucide-react";
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
      setResetMessage("Basis data berhasil di-reset menjadi kosong.");
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
      <div className="bg-brand-navy/60 p-5 rounded-xl border border-brand-deepBlue/50 shadow-md">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-brand-cyan" /> Batch Ingestion Data Satelit NASA FIRMS
        </h1>
        <p className="text-sm text-gray-300 mt-1">
          Unggah rekaman data titik panas satelit VIIRS 375m (format .CSV). Sistem akan otomatis menyaring titik di
          wilayah Provinsi Riau dan mengklasifikasikan tingkat risiko secara serempak.
        </p>
      </div>

      {/* Upload Box */}
      <form onSubmit={handleUpload} className="bg-brand-navy/80 p-6 rounded-xl border border-brand-deepBlue space-y-4">
        <div className="border-2 border-dashed border-brand-deepBlue hover:border-brand-cyan/60 rounded-xl p-8 text-center transition flex flex-col items-center justify-center bg-brand-darkBg/50">
          <FileSpreadsheet className="w-12 h-12 text-brand-cyan mb-3" />
          <p className="text-sm font-semibold text-gray-200">
            {file ? file.name : "Pilih atau Seret File CSV NASA FIRMS ke sini"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Wajib memiliki kolom: latitude, longitude, brightness, scan, track, frp, bright_t31
          </p>

          <label className="mt-4 cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-brand-deepBlue hover:bg-brand-deepBlue/80 text-brand-cyan text-xs font-bold rounded-lg transition border border-brand-cyan/30">
            <span>Pilih File CSV</span>
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-500 rounded-lg text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {resetMessage && (
          <div className="p-3 bg-green-950/60 border border-green-500 rounded-lg text-green-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>{resetMessage}</span>
          </div>
        )}

        {/* Opsi Timpa Data & Reset */}
        <div className="p-3 bg-brand-darkBg/60 rounded-lg border border-brand-deepBlue/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="w-4 h-4 rounded bg-brand-darkBg border-brand-deepBlue text-brand-cyan focus:ring-brand-cyan"
            />
            <span>Timpa (ganti) data lama di database dengan batch ini saja</span>
          </label>

          <button
            type="button"
            onClick={handleResetDb}
            className="text-xs text-red-400 hover:text-red-300 underline font-medium self-end sm:self-auto"
          >
            Kosongkan Database Hotspot
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
          <div className="text-xs text-gray-400">
            💡 Tips: File uji coba data riil tersedia di <code className="text-brand-cyan font-mono">data/riau_nrt_test.csv</code> (4.843 titik).
          </div>
          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full sm:w-auto px-6 py-2.5 bg-brand-cyan hover:bg-cyan-400 text-brand-navy font-bold text-sm rounded-lg shadow-md transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
                <span>Memproses Batch...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Mulai Filter & Inferensi Batch</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Hasil Batch Processing */}
      {response && (
        <div className="bg-brand-navy p-6 rounded-xl border border-brand-deepBlue space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-brand-deepBlue">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" /> Hasil Rekapitulasi Pemrosesan Batch
            </h2>
            <Link
              href="/"
              className="text-xs text-brand-cyan hover:underline flex items-center gap-1 font-semibold"
            >
              Lihat di Peta Riau <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Statistik Kartu */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-brand-cardBg p-3 rounded-lg border border-brand-deepBlue text-center">
              <div className="text-[11px] text-gray-400 uppercase">Total Upload</div>
              <div className="text-xl font-bold text-white mt-1">{response.total_uploaded}</div>
            </div>
            <div className="bg-brand-cardBg p-3 rounded-lg border border-brand-deepBlue text-center">
              <div className="text-[11px] text-gray-400 uppercase">Lolos Filter Riau</div>
              <div className="text-xl font-bold text-brand-cyan mt-1">{response.total_processed_riau}</div>
            </div>
            <div className="bg-brand-cardBg p-3 rounded-lg border border-brand-deepBlue text-center">
              <div className="text-[11px] text-gray-400 uppercase">Di Luar Riau</div>
              <div className="text-xl font-bold text-gray-400 mt-1">{response.total_out_of_bounds}</div>
            </div>
            <div className="bg-brand-cardBg p-3 rounded-lg border border-risk-high/40 text-center">
              <div className="text-[11px] text-red-400 uppercase font-semibold">High Risk</div>
              <div className="text-xl font-bold text-red-400 mt-1">{response.high_risk_count}</div>
            </div>
            <div className="bg-brand-cardBg p-3 rounded-lg border border-risk-low/40 text-center">
              <div className="text-[11px] text-green-400 uppercase font-semibold">Low Risk</div>
              <div className="text-xl font-bold text-green-400 mt-1">{response.low_risk_count}</div>
            </div>
          </div>

          {/* Tabel Sampel Data Hasil */}
          <div className="overflow-x-auto rounded-lg border border-brand-deepBlue">
            <table className="min-w-full divide-y divide-brand-deepBlue text-left text-xs">
              <thead className="bg-brand-darkBg text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Lokasi (Lat, Lon)</th>
                  <th className="px-4 py-3">Wilayah</th>
                  <th className="px-4 py-3">Brightness</th>
                  <th className="px-4 py-3">FRP</th>
                  <th className="px-4 py-3">&Delta;T (K)</th>
                  <th className="px-4 py-3">Probabilitas</th>
                  <th className="px-4 py-3">Status Risiko</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-deepBlue/50 text-gray-200">
                {response.records.slice(0, 15).map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-brand-deepBlue/30 transition">
                    <td className="px-4 py-2 font-mono">
                      {row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}
                    </td>
                    <td className="px-4 py-2 text-gray-300">{row.subregion}</td>
                    <td className="px-4 py-2 font-mono">{row.brightness} K</td>
                    <td className="px-4 py-2 font-mono font-semibold">{row.frp} MW</td>
                    <td className="px-4 py-2 font-mono">{row.delta_t} K</td>
                    <td className="px-4 py-2 font-mono">{(row.probability * 100).toFixed(1)}%</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.risk_class === "HIGH RISK"
                            ? "bg-red-500/20 text-red-400 border border-red-500/40"
                            : "bg-green-500/20 text-green-400 border border-green-500/40"
                        }`}
                      >
                        {row.risk_class}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
