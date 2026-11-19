"use client";

import { Activity, Cpu, CheckCircle2, Award, GitBranch, Layers, Sliders, Database } from "lucide-react";

export default function ModelDiagnosticsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-brand-navy/60 p-5 rounded-xl border border-brand-deepBlue/50 shadow-md">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-brand-cyan" /> Diagnostik Arsitektur Model JST (ANN-MLP)
        </h1>
        <p className="text-sm text-gray-300 mt-1">
          Hasil evaluasi ilmiah pelatihan model Jaringan Syaraf Tiruan pada <strong>104.439 data riil satelit NASA FIRMS (VIIRS 375m)</strong> Provinsi Riau.
        </p>
      </div>

      {/* Target Metrik vs Hasil Evaluasi Nyata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-brand-cardBg/90 border border-green-500/40 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase">
            <span>Akurasi Pengujian</span>
            <span className="text-[10px] text-green-400 bg-green-950/60 px-1.5 py-0.5 rounded border border-green-600/40">Target PRD &ge; 85%</span>
          </div>
          <div className="text-3xl font-extrabold text-green-400 mt-2">99.74%</div>
          <div className="flex items-center gap-1.5 text-xs text-green-300 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Melampaui target PRD (20.888 data uji)
          </div>
        </div>

        <div className="bg-brand-cardBg/90 border border-brand-cyan/40 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase">
            <span>F1-Score Model</span>
            <span className="text-[10px] text-brand-cyan bg-brand-deepBlue/60 px-1.5 py-0.5 rounded border border-brand-cyan/40">Target PRD &ge; 0.80</span>
          </div>
          <div className="text-3xl font-extrabold text-brand-cyan mt-2">0.9982</div>
          <div className="flex items-center gap-1.5 text-xs text-blue-300 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan" /> Seimbang antara Precision & Recall
          </div>
        </div>

        <div className="bg-brand-cardBg/90 border border-brand-deepBlue p-4 rounded-xl shadow-md">
          <div className="text-xs font-semibold text-gray-400 uppercase">Basis Data Pelatihan</div>
          <div className="text-2xl font-extrabold text-white mt-2">104.439 Titik</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-300 mt-2">
            <Database className="w-3.5 h-3.5 text-brand-cyan" /> NASA FIRMS VIIRS Suomi-NPP (Riau)
          </div>
        </div>
      </div>

      {/* Visualisasi Confusion Matrix Hasil Training Riil */}
      <div className="bg-brand-navy/80 p-6 rounded-xl border border-brand-deepBlue shadow-lg space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" /> Confusion Matrix Hasil Pengujian (Test Set: 20.888 Sampel)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-center border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2 border border-brand-deepBlue bg-brand-darkBg text-gray-400">Aktual \ Prediksi</th>
                  <th className="p-2 border border-brand-deepBlue bg-green-950/40 text-green-300 font-bold">Prediksi LOW RISK (0)</th>
                  <th className="p-2 border border-brand-deepBlue bg-red-950/40 text-red-300 font-bold">Prediksi HIGH RISK (1)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-brand-deepBlue bg-brand-darkBg text-gray-300 font-semibold text-left">
                    Aktual LOW RISK (0)
                  </td>
                  <td className="p-3 border border-brand-deepBlue bg-green-900/30 text-green-300 font-mono font-bold text-base">
                    6.146 <span className="block text-[10px] text-gray-400 font-normal">(True Negative - 99.58%)</span>
                  </td>
                  <td className="p-3 border border-brand-deepBlue bg-red-900/20 text-gray-300 font-mono text-sm">
                    26 <span className="block text-[10px] text-red-400 font-normal">(False Positive)</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border border-brand-deepBlue bg-brand-darkBg text-gray-300 font-semibold text-left">
                    Aktual HIGH RISK (1)
                  </td>
                  <td className="p-3 border border-brand-deepBlue bg-red-900/20 text-gray-300 font-mono text-sm">
                    28 <span className="block text-[10px] text-red-400 font-normal">(False Negative)</span>
                  </td>
                  <td className="p-3 border border-brand-deepBlue bg-red-900/40 text-red-300 font-mono font-bold text-base">
                    14.688 <span className="block text-[10px] text-gray-400 font-normal">(True Positive - 99.81%)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-brand-darkBg/70 p-4 rounded-xl border border-brand-deepBlue/50 flex flex-col justify-center text-xs space-y-2">
            <div className="font-semibold text-gray-200">Interpretasi Kepatuhan Lingkungan:</div>
            <p className="text-gray-300 leading-relaxed">
              Dari 14.716 kejadian kebakaran berisiko tinggi pada data uji, model berhasil mendeteksi <strong>14.688 titik secara akurat (Sensitivitas/Recall 99.81%)</strong>.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Tingkat kesalahan fatal (titik kebakaran tinggi terlewat) hanya <strong>28 kasus (0.19%)</strong>, menjadikannya sangat aman dan dapat diandalkan sebagai instrumen pengarah tim patroli Manggala Agni.
            </p>
          </div>
        </div>
      </div>

      {/* Visualisasi Arsitektur Layer */}
      <div className="bg-brand-navy/80 p-6 rounded-xl border border-brand-deepBlue shadow-lg space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-cyan" /> Arsitektur Jaringan Syaraf Tiruan (7 &rarr; 64 &rarr; 32 &rarr; 1)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="bg-brand-darkBg p-4 rounded-xl border border-brand-deepBlue flex flex-col items-center">
            <span className="text-xs font-bold text-brand-cyan uppercase">Input Layer</span>
            <div className="text-2xl font-black text-white my-2">7 Neuron</div>
            <p className="text-[11px] text-gray-400">
              MinMaxScaler normalisasi untuk 7 fitur kontinu VIIRS 375m
            </p>
          </div>

          <div className="bg-brand-darkBg p-4 rounded-xl border border-brand-deepBlue flex flex-col items-center">
            <span className="text-xs font-bold text-blue-400 uppercase">Hidden Layer 1</span>
            <div className="text-2xl font-black text-white my-2">64 Neuron</div>
            <p className="text-[11px] text-gray-400">
              Aktivasi <strong>ReLU</strong>, bobot teroptimasi Adam
            </p>
          </div>

          <div className="bg-brand-darkBg p-4 rounded-xl border border-brand-deepBlue flex flex-col items-center">
            <span className="text-xs font-bold text-blue-400 uppercase">Hidden Layer 2</span>
            <div className="text-2xl font-black text-white my-2">32 Neuron</div>
            <p className="text-[11px] text-gray-400">
              Aktivasi <strong>ReLU</strong>, ekstraksi fitur tingkat lanjut
            </p>
          </div>

          <div className="bg-brand-darkBg p-4 rounded-xl border border-risk-high/40 flex flex-col items-center">
            <span className="text-xs font-bold text-red-400 uppercase">Output Layer</span>
            <div className="text-2xl font-black text-white my-2">1 Neuron</div>
            <p className="text-[11px] text-gray-400">
              Aktivasi <strong>Sigmoid</strong> (&ycirc; &isin; [0.00, 1.00] probabilitas)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
