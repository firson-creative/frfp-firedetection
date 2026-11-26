"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Rectangle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ShieldAlert, MapPin } from "lucide-react";

interface HotspotFeature {
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
    subregion: string;
    audit_priority: string;
    audit_status: string;
    recommendation: string;
    created_at: string;
  };
}

function RiauMarkers({
  hotspots,
  onSelectHotspot,
}: {
  hotspots: HotspotFeature[];
  onSelectHotspot?: (h: HotspotFeature["properties"]) => void;
}) {
  const map = useMap();

  return (
    <>
      {hotspots.map((item) => {
        const isHigh = item.properties.risk_class === "HIGH RISK";
        const [lon, lat] = item.geometry.coordinates;

        return (
          <CircleMarker
            key={item.properties.id}
            center={[lat, lon]}
            radius={isHigh ? 9 : 6}
            eventHandlers={{
              click: () => {
                map.flyTo([lat, lon], Math.max(map.getZoom(), 11), {
                  animate: true,
                  duration: 1.1,
                });
                onSelectHotspot?.(item.properties);
              },
            }}
            pathOptions={{
              color: isHigh ? "#DC2626" : "#16A34A",
              fillColor: isHigh ? "#EF4444" : "#22C55E",
              fillOpacity: 0.85,
              weight: isHigh ? 2 : 1,
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[240px] text-zinc-900 dark:text-zinc-100">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-200 dark:border-zinc-800">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      isHigh
                        ? "bg-red-100 text-red-700 border border-red-300"
                        : "bg-green-100 text-green-700 border border-green-300"
                    }`}
                  >
                    {item.properties.risk_class}
                  </span>
                  <span className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-300">
                    Prob: {(item.properties.probability * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="mt-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{item.properties.subregion}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] bg-zinc-50 dark:bg-zinc-900 p-2 rounded">
                  <div>
                    <span className="text-zinc-500">Suhu Kanal I-4:</span>
                    <div className="font-bold">{item.properties.brightness} K</div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Radiasi FRP:</span>
                    <div className="font-bold">{item.properties.frp} MW</div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Delta Suhu (&Delta;T):</span>
                    <div className="font-bold">{item.properties.delta_t} K</div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Prioritas:</span>
                    <div className="font-bold text-red-600">{item.properties.audit_priority}</div>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-300 italic">
                  {item.properties.recommendation}
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                  <a
                    href="/priority-list"
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded font-medium transition"
                  >
                    Buka Lembar Audit
                  </a>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
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
      <div className="w-full h-[580px] bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-500 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Memuat Peta Spasial Riau...</span>
        </div>
      </div>
    );
  }

  const riauBounds: [[number, number], [number, number]] = [
    [-1.15, 100.0],
    [2.45, 103.85],
  ];

  const filteredHotspots = hotspots.filter((item) => {
    if (selectedRisk === "ALL") return true;
    return item.properties.risk_class === selectedRisk;
  });

  return (
    <div className="w-full h-[580px] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative">
      <MapContainer
        center={[0.5071, 101.4478]}
        zoom={8}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Rectangle
          bounds={riauBounds}
          pathOptions={{
            color: "#10B981",
            weight: 2,
            dashArray: "6, 6",
            fillOpacity: 0.03,
          }}
        />

        <RiauMarkers hotspots={filteredHotspots} onSelectHotspot={onSelectHotspot} />
      </MapContainer>

      <div className="absolute bottom-5 right-5 z-20 surface-panel p-3 rounded-lg text-xs">
        <div className="font-bold text-zinc-950 dark:text-white mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Legenda Risiko Satelit
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600" />
            <span className="text-zinc-800 dark:text-zinc-200">HIGH RISK (Prioritas Audit Gakkum)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span className="text-zinc-600 dark:text-zinc-300">LOW RISK (Pemantauan Satelit Rutin)</span>
          </div>
          <div className="flex items-center gap-2 mt-1 pt-1 border-t border-zinc-200 dark:border-zinc-800">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-600 dark:border-emerald-400" />
            <span className="text-zinc-500 dark:text-zinc-400">Bounding Box Provinsi Riau</span>
          </div>
        </div>
      </div>
    </div>
  );
}
