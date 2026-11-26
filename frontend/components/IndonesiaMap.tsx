"use client";

import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Rectangle,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  ShieldAlert,
  Compass,
  Clock,
  Sun,
  Moon,
  Calendar,
  Layers,
  Thermometer,
  Zap,
} from "lucide-react";

export interface HotspotFeature {
  type: string;
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    id: number;
    latitude: number;
    longitude: number;
    brightness: number;
    frp: number;
    bright_t31: number;
    delta_t: number;
    probability: number;
    risk_class: string;
    subregion?: string;
    province_region?: string;
    acq_date?: string;
    acq_time?: string;
    daynight?: string;
    local_time_str?: string;
    audit_priority?: string;
    audit_status?: string;
    recommendation?: string;
    created_at?: string;
  };
}

export const INDONESIA_PROVINCES = [
  {
    group: "Nasional",
    provinces: [
      { name: "Seluruh Nusantara (Sabang - Merauke)", lat: -0.7893, lon: 113.9213, zoom: 5 },
    ],
  },
  {
    group: "Sumatera",
    provinces: [
      { name: "Aceh", lat: 4.6951, lon: 96.7494, zoom: 7 },
      { name: "Sumatera Utara", lat: 2.1154, lon: 99.5451, zoom: 7 },
      { name: "Sumatera Barat", lat: -0.7399, lon: 100.8, zoom: 7 },
      { name: "Riau", lat: 0.5071, lon: 101.4478, zoom: 8 },
      { name: "Kepulauan Riau", lat: 3.9457, lon: 108.1429, zoom: 7 },
      { name: "Jambi", lat: -1.6101, lon: 103.6131, zoom: 8 },
      { name: "Sumatera Selatan", lat: -3.3194, lon: 104.9144, zoom: 7 },
      { name: "Kep. Bangka Belitung", lat: -2.7411, lon: 106.4406, zoom: 8 },
      { name: "Bengkulu", lat: -3.5778, lon: 102.3464, zoom: 8 },
      { name: "Lampung", lat: -4.5586, lon: 105.4068, zoom: 8 },
    ],
  },
  {
    group: "Jawa",
    provinces: [
      { name: "DKI Jakarta", lat: -6.2088, lon: 106.8456, zoom: 10 },
      { name: "Banten", lat: -6.4058, lon: 106.064, zoom: 8 },
      { name: "Jawa Barat", lat: -6.9175, lon: 107.6191, zoom: 8 },
      { name: "Jawa Tengah", lat: -7.151, lon: 110.1403, zoom: 8 },
      { name: "D.I. Yogyakarta", lat: -7.7956, lon: 110.3695, zoom: 9 },
      { name: "Jawa Timur", lat: -7.5361, lon: 112.2384, zoom: 8 },
    ],
  },
  {
    group: "Bali & Nusa Tenggara",
    provinces: [
      { name: "Bali", lat: -8.4095, lon: 115.1889, zoom: 9 },
      { name: "Nusa Tenggara Barat", lat: -8.6529, lon: 117.3616, zoom: 8 },
      { name: "Nusa Tenggara Timur", lat: -8.6574, lon: 121.0794, zoom: 8 },
    ],
  },
  {
    group: "Kalimantan",
    provinces: [
      { name: "Kalimantan Barat", lat: -0.2787, lon: 111.4753, zoom: 7 },
      { name: "Kalimantan Tengah", lat: -1.6815, lon: 113.3824, zoom: 7 },
      { name: "Kalimantan Selatan", lat: -3.0926, lon: 115.2838, zoom: 8 },
      { name: "Kalimantan Timur", lat: 0.5387, lon: 116.4194, zoom: 7 },
      { name: "Kalimantan Utara", lat: 3.0731, lon: 116.0414, zoom: 7 },
    ],
  },
  {
    group: "Sulawesi",
    provinces: [
      { name: "Sulawesi Utara", lat: 0.6247, lon: 123.975, zoom: 8 },
      { name: "Gorontalo", lat: 0.6999, lon: 122.4467, zoom: 8 },
      { name: "Sulawesi Tengah", lat: -1.43, lon: 121.4456, zoom: 7 },
      { name: "Sulawesi Barat", lat: -2.8441, lon: 119.2321, zoom: 8 },
      { name: "Sulawesi Selatan", lat: -3.6687, lon: 119.9741, zoom: 7 },
      { name: "Sulawesi Tenggara", lat: -4.1449, lon: 122.1746, zoom: 8 },
    ],
  },
  {
    group: "Maluku",
    provinces: [
      { name: "Maluku", lat: -3.2385, lon: 130.1453, zoom: 7 },
      { name: "Maluku Utara", lat: 1.5709, lon: 127.8088, zoom: 7 },
    ],
  },
  {
    group: "Papua",
    provinces: [
      { name: "Papua", lat: -4.2699, lon: 138.0804, zoom: 7 },
      { name: "Papua Barat", lat: -1.3361, lon: 133.1747, zoom: 7 },
      { name: "Papua Selatan", lat: -7.5, lon: 139.5, zoom: 7 },
      { name: "Papua Tengah", lat: -3.9, lon: 136.5, zoom: 7 },
      { name: "Papua Pegunungan", lat: -4.1, lon: 138.9, zoom: 7 },
      { name: "Papua Barat Daya", lat: -0.8833, lon: 131.25, zoom: 8 },
    ],
  },
];

function MapController({ targetCoord }: { targetCoord: { lat: number; lon: number; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoord) {
      map.flyTo([targetCoord.lat, targetCoord.lon], targetCoord.zoom, {
        duration: 1.6,
      });
    }
  }, [targetCoord, map]);
  return null;
}

export default function IndonesiaMap({
  hotspots,
  selectedRisk,
  onSelectHotspot,
}: {
  hotspots: HotspotFeature[];
  selectedRisk: string;
  onSelectHotspot?: (h: HotspotFeature["properties"]) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("Seluruh Nusantara (Sabang - Merauke)");
  const [targetCoord, setTargetCoord] = useState<{ lat: number; lon: number; zoom: number } | null>(null);
  const [timeFilter, setTimeFilter] = useState<"ALL" | "TODAY" | "7DAYS">("ALL");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[620px] bg-brand-darkForest flex items-center justify-center text-emerald-300 rounded-2xl border border-emerald-500/20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Memuat Peta Spasial Nusantara (Sabang - Merauke)...</span>
        </div>
      </div>
    );
  }

  const indonesiaBounds: [[number, number], [number, number]] = [
    [-11.0, 95.0],
    [6.0, 141.0],
  ];

  const handleProvinceChange = (provinceName: string) => {
    setSelectedProvince(provinceName);
    for (const group of INDONESIA_PROVINCES) {
      const found = group.provinces.find((p) => p.name === provinceName);
      if (found) {
        setTargetCoord({ lat: found.lat, lon: found.lon, zoom: found.zoom });
        break;
      }
    }
  };

  const filteredHotspots = hotspots.filter((item) => {
    const p = item.properties;

    if (selectedRisk !== "ALL" && p.risk_class !== selectedRisk) {
      return false;
    }

    if (timeFilter !== "ALL" && p.acq_date) {
      const today = new Date().toISOString().split("T")[0];
      if (timeFilter === "TODAY" && p.acq_date !== today) {
      }
    }

    return true;
  });

  return (
    <div className="space-y-3">
      <div className="liquid-glass p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-gray-300 font-semibold hidden sm:inline">Loncat ke Wilayah:</span>
          <select
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="liquid-glass-input px-3 py-1.5 rounded-lg text-emerald-200 text-xs font-medium cursor-pointer"
          >
            {INDONESIA_PROVINCES.map((grp) => (
              <optgroup key={grp.group} label={`── ${grp.group} ──`} className="bg-brand-darkForest text-emerald-400 font-bold">
                {grp.provinces.map((prov) => (
                  <option key={prov.name} value={prov.name} className="bg-brand-forest text-gray-200 font-normal">
                    {prov.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-gray-300 font-semibold hidden md:inline">Waktu Rekam:</span>
          <div className="flex items-center bg-black/40 p-1 rounded-lg border border-emerald-500/20 text-[11px]">
            <button
              onClick={() => setTimeFilter("ALL")}
              className={`px-2.5 py-1 rounded transition ${
                timeFilter === "ALL"
                  ? "bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Semua Periode
            </button>
            <button
              onClick={() => setTimeFilter("TODAY")}
              className={`px-2.5 py-1 rounded transition ${
                timeFilter === "TODAY"
                  ? "bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              24 Jam Terakhir
            </button>
            <button
              onClick={() => setTimeFilter("7DAYS")}
              className={`px-2.5 py-1 rounded transition ${
                timeFilter === "7DAYS"
                  ? "bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              7 Hari
            </button>
          </div>
        </div>
      </div>

      <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-glass border border-emerald-500/30 relative">
        <MapContainer
          center={[-0.7893, 113.9213]}
          zoom={5}
          scrollWheelZoom={true}
          className="w-full h-full z-10"
        >
          <MapController targetCoord={targetCoord} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Rectangle
            bounds={indonesiaBounds}
            pathOptions={{
              color: "#10B981",
              weight: 1.5,
              dashArray: "6, 6",
              fillOpacity: 0.02,
            }}
          />

          {filteredHotspots.map((item) => {
            const isHigh = item.properties.risk_class === "HIGH RISK";
            const [lon, lat] = item.geometry.coordinates;
            const p = item.properties;

            return (
              <CircleMarker
                key={p.id}
                center={[lat, lon]}
                radius={isHigh ? 8 : 5}
                pathOptions={{
                  color: isHigh ? "#EF4444" : "#10B981",
                  fillColor: isHigh ? "#DC2626" : "#059669",
                  fillOpacity: isHigh ? 0.9 : 0.75,
                  weight: isHigh ? 2 : 1,
                  className: isHigh ? "marker-high-risk" : "",
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[260px] text-gray-100">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                          isHigh
                            ? "bg-red-500/20 text-red-400 border border-red-500/50"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                        }`}
                      >
                        {p.risk_class}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-300">
                        Prob: {(p.probability * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                      <span>📍</span>
                      <span>
                        {p.subregion && p.subregion !== p.province_region
                          ? `${p.subregion}, ${p.province_region}`
                          : (p.province_region || "Wilayah Indonesia")}
                      </span>
                    </div>

                    <div className="mt-1.5 bg-black/50 p-2 rounded-lg border border-emerald-500/20 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-gray-300">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-400" />
                          {p.acq_date || "N/A"}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-emerald-300">
                          {p.daynight === "N" ? (
                            <>
                              <Moon className="w-3 h-3 text-blue-400" /> Malam
                            </>
                          ) : (
                            <>
                              <Sun className="w-3 h-3 text-amber-400" /> Siang
                            </>
                          )}
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-200/90 font-mono">
                        ⏰ {p.local_time_str || `UTC ${p.acq_time || "00:00"}`}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px] bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/20">
                      <div>
                        <span className="text-gray-400 text-[10px]">Suhu Kanal I-4:</span>
                        <div className="font-bold text-white font-mono">{p.brightness} K</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px]">Radiasi FRP:</span>
                        <div className="font-bold text-amber-300 font-mono">{p.frp} MW</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px]">Delta Suhu (ΔT):</span>
                        <div className="font-bold text-emerald-300 font-mono">{p.delta_t} K</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px]">Prioritas Audit:</span>
                        <div className={`font-bold ${isHigh ? "text-red-400" : "text-emerald-400"}`}>
                          {p.audit_priority || (isHigh ? "P1" : "P3")}
                        </div>
                      </div>
                    </div>

                    {p.recommendation && (
                      <div className="mt-2 text-[10px] text-gray-300 italic border-l-2 border-emerald-400 pl-2">
                        {p.recommendation}
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-emerald-500/20 flex justify-end">
                      <a
                        href="/priority-list"
                        className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-md font-semibold transition shadow-sm"
                      >
                        Buka Surat Tugas &rarr;
                      </a>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        <div className="absolute bottom-5 right-5 z-20 liquid-glass p-3.5 rounded-xl text-xs max-w-xs">
          <div className="font-bold text-emerald-300 mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Klasifikasi Risiko Satelit VIIRS 375m</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_10px_#EF4444]" />
              <div>
                <div className="text-gray-100 font-semibold">HIGH RISK</div>
                <div className="text-[10px] text-red-300/80">Prioritas Verifikasi Lapangan & Audit Gakkum</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
              <div>
                <div className="text-gray-100 font-semibold">LOW RISK</div>
                <div className="text-[10px] text-emerald-300/80">Pemantauan Satelit Rutin Berkala</div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1.5 border-t border-emerald-500/20 text-[11px] text-emerald-200/70">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-400" />
              <span>Cakupan: Sabang s.d. Merauke (38 Provinsi)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
