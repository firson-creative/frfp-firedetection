"use client";

import { Activity, Cpu, CheckCircle2, Award, GitBranch, Layers, Sliders, Database, ShieldCheck } from "lucide-react";

export default function ModelDiagnosticsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="liquid-glass p-5 rounded-2xl border border-emerald-500/25">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-400" /> Diagnostik Arsitektur Jaringan Syaraf Tiruan (ANN-MLP)
        </h1>
        <p className="text-sm text-emerald-100/70 mt-1">
          Hasil evaluasi ilmiah pelatihan model JST pada <strong>104.439 data riil satelit NASA FIRMS VIIRS (375m)</strong> untuk
          deteksi dini dan inferensi risiko kebakaran hutan & lahan di seluruh wilayah Indonesia.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="liquid-glass-card p-5 rounded-2xl border-emerald-500/40 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase">
            <span>Akurasi Pengujian</span>
            <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono">
              Target PRD &ge; 85%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">99.39%</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-300 mt-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Melampaui target PRD (20.888 data uji)
          </div>
        </div>

        <div className="liquid-glass-card p-5 rounded-2xl border-emerald-500/40 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase">
            <span>F1-Score Model</span>
            <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono">
              Target PRD &ge; 0.80
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-300 mt-2 font-mono">0.9957</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-200 mt-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Seimbang antara Precision & Recall
          </div>
        </div>

        <div className="liquid-glass-card p-5 rounded-2xl border-emerald-500/40 relative overflow-hidden">
          <div className="text-xs font-semibold text-gray-400 uppercase">Basis Data Pelatihan Riil</div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">104.439 Titik</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-200 mt-2">
            <Database className="w-4 h-4 text-emerald-400" /> NASA FIRMS VIIRS Suomi-NPP 375m
          </div>
        </div>
      </div>

      <div className="liquid-glass p-6 rounded-2xl border border-emerald-500/25 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> Confusion Matrix Hasil Pengujian (Test Set: 20.888 Sampel Riil)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="overflow-x-auto rounded-xl border border-emerald-500/20">
            <table className="min-w-full text-center border-collapse text-xs">
              <thead>
                <tr className="bg-black/60 text-emerald-300">
                  <th className="p-3 border border-emerald-500/20 text-gray-400">Aktual \ Prediksi</th>
                  <th className="p-3 border border-emerald-500/20 text-emerald-300 font-bold">Prediksi LOW RISK (0)</th>
                  <th className="p-3 border border-emerald-500/20 text-red-400 font-bold">Prediksi HIGH RISK (1)</th>
                </tr>
              </thead>
              <tbody className="bg-black/20">
                <tr>
                  <td className="p-3 border border-emerald-500/20 bg-black/40 text-gray-300 font-semibold text-left">
                    Aktual LOW RISK (0)
                  </td>
                  <td className="p-3 border border-emerald-500/20 bg-emerald-950/40 text-emerald-300 font-mono font-bold text-base">
                    6.103 <span className="block text-[10px] text-gray-400 font-normal">(True Negative - 98.88%)</span>
                  </td>
                  <td className="p-3 border border-emerald-500/20 bg-red-950/20 text-gray-300 font-mono text-sm">
                    69 <span className="block text-[10px] text-red-400 font-normal">(False Positive)</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border border-emerald-500/20 bg-black/40 text-gray-300 font-semibold text-left">
                    Aktual HIGH RISK (1)
                  </td>
                  <td className="p-3 border border-emerald-500/20 bg-red-950/20 text-gray-300 font-mono text-sm">
                    58 <span className="block text-[10px] text-red-400 font-normal">(False Negative)</span>
                  </td>
                  <td className="p-3 border border-emerald-500/20 bg-red-950/40 text-red-400 font-mono font-bold text-base">
                    14.658 <span className="block text-[10px] text-gray-400 font-normal">(True Positive - 99.61%)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-black/40 p-4 rounded-xl border border-emerald-500/20 flex flex-col justify-center text-xs space-y-2.5">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Interpretasi Mitigasi & Kepatuhan Lingkungan:
            </div>
            <p className="text-gray-300 leading-relaxed">
              Dari 14.716 kejadian kebakaran berisiko tinggi pada data uji, model berhasil mendeteksi{" "}
              <strong className="text-emerald-300">14.658 titik secara akurat (Sensitivitas / Recall 99.61%)</strong>.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Tingkat kesalahan fatal (titik api berisiko tinggi terlewat) hanya{" "}
              <strong className="text-red-400">58 kasus (0.39%)</strong>, menjadikannya sangat aman dan dapat diandalkan
              sebagai instrumen pengarah inspeksi satgas darat Manggala Agni dan audit kepatuhan Gakkum KLHK.
            </p>
          </div>
        </div>
      </div>

      <div className="liquid-glass p-6 rounded-2xl border border-emerald-500/25 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" /> Detail Topologi Arsitektur Jaringan (7 &rarr; 16 &rarr; 1)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="liquid-glass-card p-4 rounded-xl border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
              <Layers className="w-4 h-4" /> Input Layer
            </div>
            <div className="text-lg font-black text-white font-mono">7 Fitur</div>
            <ul className="mt-2 text-gray-300 space-y-1 text-[11px]">
              <li>• Latitude & Longitude</li>
              <li>• Brightness (Kanal I-4)</li>
              <li>• Scan & Track (km)</li>
              <li>• FRP (Fire Radiative Power)</li>
              <li>• Bright_t31 (Kanal I-5)</li>
            </ul>
          </div>

          <div className="liquid-glass-card p-4 rounded-xl border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-300 font-bold mb-1">
              <GitBranch className="w-4 h-4" /> Single Hidden Layer
            </div>
            <div className="text-lg font-black text-white font-mono">16 Neuron</div>
            <p className="mt-2 text-gray-300 text-[11px] leading-relaxed">
              Aktivasi: <strong>ReLU</strong>.<br />
              Arsitektur sederhana 3-lapis feedforward standar kurikulum pengenalan JST Semester 3, mengekstrak interaksi non-linear FRP dan radiasi termal tanpa overfitting.
            </p>
          </div>

          <div className="liquid-glass-card p-4 rounded-xl border-emerald-500/30">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
              <Sliders className="w-4 h-4" /> Output Layer
            </div>
            <div className="text-lg font-black text-white font-mono">1 Neuron</div>
            <p className="mt-2 text-gray-300 text-[11px] leading-relaxed">
              Aktivasi: <strong>Sigmoid</strong>.<br />
              Menghasilkan probabilitas kontinyu [0.0 - 1.0] untuk klasifikasi risiko biner (Low Risk vs High Risk).
            </p>
          </div>
        </div>

        <div className="bg-black/40 p-4 rounded-xl border border-emerald-500/20 text-xs">
          <div className="font-semibold text-emerald-300 mb-2">Parameter Training & Hyperparameter:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-gray-300 font-mono">
            <div>
              <span className="text-gray-500 text-[10px] block">Optimizer:</span>
              <span className="text-white">Adam (lr=0.001)</span>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] block">Loss Function:</span>
              <span className="text-white">Binary Crossentropy</span>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] block">Feature Scaling:</span>
              <span className="text-white">StandardScaler</span>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] block">Validasi:</span>
              <span className="text-white">Stratified 80/20 Split</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
