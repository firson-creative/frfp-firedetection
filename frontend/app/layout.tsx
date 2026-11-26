import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@100..900&family=Momo+Trust+Display&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-zinc-950 dark:bg-black dark:text-zinc-50 font-sans">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
