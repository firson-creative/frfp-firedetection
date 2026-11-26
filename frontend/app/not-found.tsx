import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400">
        <Compass className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white">404 - Halaman Tidak Ditemukan</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
        Halaman atau rute yang Anda cari tidak tersedia dalam sistem FRFP.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
      >
        Kembali ke Peta Nasional
      </Link>
    </div>
  );
}
