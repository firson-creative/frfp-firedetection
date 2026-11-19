import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "FRFP — Fire Risk Foresight & Prioritization (ANN-MLP)",
  description:
    "Sistem Cerdas Klasifikasi & Prioritas Risiko Kebakaran Hutan dan Lahan Skala Nasional Berbasis Artificial Neural Network (ANN-MLP) dan Data Satelit NASA FIRMS VIIRS 375m.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen text-gray-100 flex flex-col bg-[#030d0b]">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="liquid-glass border-t border-emerald-500/20 py-5 text-center text-xs text-emerald-200/60 mt-12">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            <p className="font-semibold text-emerald-300">
              © 2026 FRFP — Fire Risk Foresight & Prioritization | Skala Nasional (Sabang s.d. Merauke)
            </p>
            <p className="text-[11px] text-gray-400">
              Inovasi Model ANN-MLP (TensorFlow / Scikit-Learn + FastAPI + Next.js) • Deteksi Realtime Satelit NASA FIRMS VIIRS 375m
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
