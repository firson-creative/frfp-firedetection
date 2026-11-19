"use client";

import { Activity, Cpu, CheckCircle2, Award, GitBranch, Layers, Sliders } from "lucide-react";

export default function ModelDiagnosticsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-brand-navy/60 p-5 rounded-xl border border-brand-deepBlue/50 shadow-md">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-brand-cyan" /> Diagnostik Arsitektur Model JST (ANN-MLP)
        </h1>
        <p className="text-sm text-gray-300 mt-1">
          Spesifikasi ilmiah, evaluasi metrik kinerja, dan struktur lapisan jaringan syaraf tiruan sesuai PRD Bab 5.
        </p>
      </div>

      {/* Target Metrik vs Hasil */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-brand-cardBg/90 border border-brand-cyan/40 p-4 rounded-xl shadow-md">
          <div className="text-xs font-semibold text-brand-cyan uppercase">Target Akurasi PRD</div>
          <div className="text-3xl font-extrabold text-white mt-1">&ge; 85.0%</div>
          <div className="flex items-center gap-1.5 text-xs text-green-400 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Memenuhi standar kelayakan akademik
          </div>
        </div>

        <div className="bg-brand-cardBg/90 border border-brand-cyan/40 p-4 rounded-xl shadow-md">
          <div className="text-xs font-semibold text-brand-cyan uppercase">Target F1-Score PRD</div>
          <div className="text-3xl font-extrabold text-white mt-1">&ge; 0.80</div>
          <div className="flex items-center gap-1.5 text-xs text-green-400 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Optimal untuk dataset gambut Riau
          </div>
        </div>

        <div className="bg-brand-cardBg/90 border border-brand-deepBlue p-4 rounded-xl shadow-md">
          <div className="text-xs font-semibold text-gray-400 uppercase">Fungsi Loss & Optimizer</div>
          <div className="text-lg font-bold text-white mt-1">Binary Cross-Entropy</div>
          <div className="text-xs text-gray-400 mt-2">Adam Optimizer (lr = 0.001)</div>
        </div>
      </div>

      {/* Visualisasi Arsitektur Layer */}
      <div className="bg-brand-navy/80 p-6 rounded-xl border border-brand-deepBlue shadow-lg space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-cyan" /> Arsitektur Jaringan (7 &rarr; 64 &rarr; 32 &rarr; 1)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          {/* Layer Input */}
          <div className="bg-brand-darkBg p-4 rounded-xl border border-brand-deepBlue flex flex-col items-center">
            <span className="text-xs font-bold text-brand-cyan uppercase">Input Layer</span>
            <div className="text-2xl font-black text-white my-2">7 Neuron</div>
            <p className="text-[11px] text-gray-400">
              MinMaxScaler normalisasi untuk 7 fitur numerik VIIRS 375m
            </p>
          </div>

          {/* Hidden 1 */}
          <div className="bg-brand-darkBg p-4 rounded-xl border border-brand-deepBlue flex flex-col items-center">
            <span className="text-xs font-bold text-blue-400 uppercase">Hidden Layer 1</span>
            <div className="text-2xl font-black text-white my-2">64 Neuron</div>
            <p className="text-[11px] text-gray-400">
              Aktivasi <strong>ReLU</strong> + Dropout 0.2 untuk mencegah overfitting
            </p>
          </div>

          {/* Hidden 2 */}
          <div className="bg-brand-darkBg p-4 rounded-xl border border-brand-deepBlue flex flex-col items-center">
            <span className="text-xs font-bold text-blue-400 uppercase">Hidden Layer 2</span>
            <div className="text-2xl font-black text-white my-2">32 Neuron</div>
            <p className="text-[11px] text-gray-400">
              Aktivasi <strong>ReLU</strong> + Dropout 0.1
            </p>
          </div>

          {/* Output */}
          <div className="bg-brand-darkBg p-4 rounded-xl border border-risk-high/40 flex flex-col items-center">
            <span className="text-xs font-bold text-red-400 uppercase">Output Layer</span>
            <div className="text-2xl font-black text-white my-2">1 Neuron</div>
            <p className="text-[11px] text-gray-400">
              Aktivasi <strong>Sigmoid</strong> (&ycirc; &isin; [0.00, 1.00])
            </p>
          </div>
        </div>
      </div>

      {/* Formula Ground Truth & Logika Keputusan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-brand-cardBg/90 p-5 rounded-xl border border-brand-deepBlue space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-cyan" /> Formula Ground Truth Resmi (PRD 4.2)
          </h3>
          <div className="bg-brand-darkBg p-3 rounded-lg font-mono text-xs text-gray-300 space-y-2 border border-brand-deepBlue/50">
            <div>
              <span className="text-red-400 font-bold">HIGH RISK (Kelas 1)</span> &hArr; (FRP &ge; 15.0 MW) &or; (&Delta;T &ge; 25.0 K)
            </div>
            <div>
              <span className="text-green-400 font-bold">LOW RISK (Kelas 0)</span> &hArr; Kondisi lainnya
            </div>
            <div className="text-gray-400 text-[11px] pt-1 border-t border-gray-700">
              Keterangan: &Delta;T = brightness - bright_t31
            </div>
          </div>
        </div>

        <div className="bg-brand-cardBg/90 p-5 rounded-xl border border-brand-deepBlue space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" /> Ambang Batas Keputusan (Threshold)
          </h3>
          <div className="bg-brand-darkBg p-3 rounded-lg font-mono text-xs text-gray-300 space-y-2 border border-brand-deepBlue/50">
            <div>
              &ycirc; &lt; 0.50 &rarr; <span className="text-green-400 font-bold">LOW RISK:</span> Pemantauan satelit rutin
            </div>
            <div>
              &ycirc; &ge; 0.50 &rarr; <span className="text-red-400 font-bold">HIGH RISK:</span> Prioritas audit lapangan
            </div>
            <div className="text-gray-400 text-[11px] pt-1 border-t border-gray-700">
              Artefak Model: <code className="text-brand-cyan">ann_model_riau.keras</code> & <code className="text-brand-cyan">scaler_riau.pkl</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
