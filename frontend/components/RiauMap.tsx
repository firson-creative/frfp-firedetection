"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Rectangle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AlertTriangle, CheckCircle, ShieldAlert, Thermometer, Wind } from "lucide-react";

interface HotspotFeature {
  type: string;
  geometry: {
    coordinates: [number, number]; // [lon, lat]
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
    subregion: string;
    audit_priority: string;
    audit_status: string;
    recommendation: string;
    created_at: string;
  };
}

export default function RiauMap({
  hotspots,
  selectedRisk,
  onSelectHotspot,
}: {
  hotspots: HotspotFeature[];
  selectedRisk: string;
  onSelectHotspot?: (h: HotspotFeature["properties"]) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[580px] bg-brand-darkBg flex items-center justify-center text-gray-400 rounded-xl border border-brand-deepBlue/50">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin" />
          <span>Memuat Peta Spasial Riau...</span>
        </div>
      </div>
    );
  }

  // Bounding Box Riau Bounds: [[lat_min, lon_min], [lat_max, lon_max]]
  const riauBounds: [[number, number], [number, number]] = [
    [-1.15, 100.0],
    [2.45, 103.85],
  ];

  const filteredHotspots = hotspots.filter((item) => {
    if (selectedRisk === "ALL") return true;
    return item.properties.risk_class === selectedRisk;
  });

  return (
    <div className="w-full h-[580px] rounded-xl overflow-hidden shadow-2xl border border-brand-deepBlue/50 relative">
      <MapContainer
        center={[0.5071, 101.4478]} // Pekanbaru, Riau
        zoom={8}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Boundary Box Provinsi Riau */}
        <Rectangle
          bounds={riauBounds}
          pathOptions={{
            color: "#20B8D5",
            weight: 2,
            dashArray: "6, 6",
            fillOpacity: 0.03,
          }}
        />

        {/* Render Hotspots */}
        {filteredHotspots.map((item) => {
          const isHigh = item.properties.risk_class === "HIGH RISK";
          const [lon, lat] = item.geometry.coordinates;

          return (
            <CircleMarker
              key={item.properties.id}
              center={[lat, lon]}
              radius={isHigh ? 9 : 6}
              pathOptions={{
                color: isHigh ? "#DC2626" : "#16A34A",
                fillColor: isHigh ? "#EF4444" : "#22C55E",
                fillOpacity: 0.85,
                weight: isHigh ? 2 : 1,
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[240px] text-gray-800">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        isHigh
                          ? "bg-red-100 text-red-700 border border-red-300"
                          : "bg-green-100 text-green-700 border border-green-300"
                      }`}
                    >
                      {item.properties.risk_class}
                    </span>
                    <span className="text-xs font-mono font-semibold text-gray-600">
                      Prob: {(item.properties.probability * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-semibold text-gray-700">
                    📍 {item.properties.subregion}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] bg-gray-50 p-2 rounded">
                    <div>
                      <span className="text-gray-500">Suhu Kanal I-4:</span>
                      <div className="font-bold text-gray-800">{item.properties.brightness} K</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Radiasi FRP:</span>
                      <div className="font-bold text-gray-800">{item.properties.frp} MW</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Delta Suhu (ΔT):</span>
                      <div className="font-bold text-gray-800">{item.properties.delta_t} K</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Prioritas:</span>
                      <div className="font-bold text-red-600">{item.properties.audit_priority}</div>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-gray-600 italic">
                    {item.properties.recommendation}
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-200 flex justify-end">
                    <a
                      href="/priority-list"
                      className="text-xs bg-brand-navy hover:bg-brand-deepBlue text-white px-2.5 py-1 rounded font-medium transition"
                    >
                      Buka Lembar Audit
                    </a>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-5 right-5 z-20 bg-brand-navy/90 backdrop-blur-md p-3 rounded-lg border border-brand-deepBlue shadow-lg text-xs">
        <div className="font-bold text-white mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-brand-cyan" /> Legenda Risiko Satelit
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-risk-high shadow-[0_0_8px_#DC2626]" />
            <span className="text-gray-200">HIGH RISK (Prioritas Audit Gakkum)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-risk-low" />
            <span className="text-gray-300">LOW RISK (Pemantauan Satelit Rutin)</span>
          </div>
          <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-700">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-brand-cyan" />
            <span className="text-gray-400">Bounding Box Provinsi Riau</span>
          </div>
        </div>
      </div>
    </div>
  );
}
