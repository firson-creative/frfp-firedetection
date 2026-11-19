import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Sistem Klasifikasi Titik Panas Karhutla Riau (ANN-MLP)",
  description:
    "Prototipe Sistem Klasifikasi Tingkat Risiko Titik Panas Karhutla Berbasis Jaringan Syaraf Tiruan (ANN-MLP) untuk Prioritas Audit Kepatuhan Lingkungan Provinsi Riau.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-brand-darkBg min-h-screen text-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="bg-brand-navy border-t border-brand-deepBlue/40 py-4 text-center text-xs text-gray-400">
          <p>© 2026 Prototipe Sistem Klasifikasi Risiko Karhutla Riau — Berbasis ANN-MLP (TensorFlow + FastAPI + Next.js)</p>
          <p className="mt-1 text-gray-500">Mata Kuliah Kecerdasan Buatan (AI) — Bounding Box: Provinsi Riau</p>
        </footer>
      </body>
    </html>
  );
}
