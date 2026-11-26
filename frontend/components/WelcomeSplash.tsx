"use client";

import { useEffect, useState } from "react";

export default function WelcomeSplash() {
  const [phase, setPhase] = useState<"visible" | "fading" | "hidden">("visible");

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setPhase("fading");
    }, 2200);

    const hideTimer = setTimeout(() => {
      setPhase("hidden");
    }, 2700);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      onClick={() => setPhase("hidden")}
      role="status"
      aria-label="Selamat datang di FRFP"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 bg-white dark:bg-black text-zinc-950 dark:text-zinc-50 overflow-hidden transition-opacity duration-500 cursor-pointer ${
        phase === "fading" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/welcome-poster.jpg"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-25 dark:opacity-35 pointer-events-none"
      >
        <source src="/welcome-bg.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center space-y-5">
        <div className="animate-welcome-up flex items-center justify-center w-24 h-24">
          <img
            src="/logo.png"
            alt="Logo FRFP"
            className="w-full h-full object-contain dark:hidden"
          />
          <img
            src="/logo-dark.png"
            alt="Logo FRFP"
            className="w-full h-full object-contain hidden dark:block"
          />
        </div>

        <div className="animate-welcome-up">
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-zinc-700 dark:text-zinc-300 font-semibold">
            Fire Risk Foresight &amp; Prioritization
          </div>
        </div>

        <p className="animate-welcome-up-delay font-display text-lg sm:text-2xl tracking-wide text-emerald-800 dark:text-emerald-400">
          &ldquo;Jaga Hutan Jaga Rumah Kita&rdquo;
        </p>

        <div className="w-48 h-1 rounded-full bg-zinc-300/80 dark:bg-zinc-800 overflow-hidden">
          <div className="h-full bg-emerald-600 dark:bg-emerald-400 animate-welcome-bar" />
        </div>

        <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
          Klik di mana saja untuk melewati
        </span>
      </div>
    </div>
  );
}
