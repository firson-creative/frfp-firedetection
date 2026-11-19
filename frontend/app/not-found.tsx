import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
        <Compass className="w-12 h-12 animate-pulse" />
      </div>
      <h1 className="text-3xl font-extrabold text-white">404 - Halaman Tidak Ditemukan</h1>
      <p className="text-sm text-gray-400 max-w-md">
        Halaman atau rute yang Anda cari tidak tersedia dalam sistem FRFP.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-glass-emerald"
      >
        Kembali ke Peta Nasional
      </Link>
    </div>
  );
}
