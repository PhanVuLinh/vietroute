import React, { useEffect, useRef, useState, useCallback } from "react";
import { type Map, Marker, Popup } from "maplibre-gl";
import { MapContainer } from "@/shared/components/map/MapContainer";
import { REGIONS, type RegionKey, type EnrichedTrackedVehicle } from "../hooks/useTracking";
import type { Warehouse } from "@/core/types/logistics";

interface LiveTrackingMapProps {
  vehicles: EnrichedTrackedVehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  warehouses: Warehouse[];
  selectedRegion: RegionKey;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  warehouses,
  selectedRegion,
}) => {
  const mapInstanceRef = useRef<Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const vehicleMarkersRef = useRef<Record<string, { marker: Marker; element: HTMLElement }>>({});
  const warehouseMarkersRef = useRef<Marker[]>([]);
  const stopMarkersRef = useRef<Marker[]>([]);

  // 1. Khi bản đồ MapLibre khởi tạo xong
  const handleMapLoad = useCallback((map: Map) => {
    mapInstanceRef.current = map;

    // Khởi tạo GeoJSON source cho đường Polyline lộ trình đang chọn
    if (!map.getSource("active-route-source")) {
      map.addSource("active-route-source", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      // Lớp viền phát sáng của tuyến đường
      map.addLayer({
        id: "active-route-glow",
        type: "line",
        source: "active-route-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3b82f6",
          "line-width": 8,
          "line-opacity": 0.35,
        },
      });

      // Lớp nét đứt chính của tuyến đường
      map.addLayer({
        id: "active-route-line",
        type: "line",
        source: "active-route-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#2563eb",
          "line-width": 4,
          "line-dasharray": [2, 2],
        },
      });
    }

    setMapReady(true);
  }, []);

  // 2. Chuyển vùng bản đồ khi selectedRegion đổi
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const reg = REGIONS[selectedRegion];
    if (reg) {
      map.flyTo({
        center: reg.center,
        zoom: reg.zoom,
        speed: 1.2,
        curve: 1.4,
      });
    }
  }, [selectedRegion, mapReady]);

  // 3. Render danh sách Markers kho bãi trung chuyển
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady || warehouses.length === 0) return;

    warehouseMarkersRef.current.forEach((m) => m.remove());
    warehouseMarkersRef.current = [];

    warehouses.forEach((wh) => {
      const el = document.createElement("div");
      el.className =
        "flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-lg border border-white/40 cursor-pointer hover:scale-105 transition-transform select-none";
      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/></svg>
        <span>${wh.name.replace("Kho ", "").replace("Trung chuyển ", "")}</span>
      `;

      const popup = new Popup({ offset: 12, closeButton: false }).setHTML(`
        <div class="p-1 space-y-1 text-xs">
          <p class="font-bold text-foreground">${wh.name}</p>
          <p class="text-muted-foreground text-[11px]">${wh.address}</p>
          <p class="text-emerald-600 font-medium text-[11px]">Sức chứa: ${wh.capacity} Tấn (${wh.openingTime} - ${wh.closingTime})</p>
        </div>
      `);

      const marker = new Marker({ element: el })
        .setLngLat([wh.longitude, wh.latitude])
        .setPopup(popup)
        .addTo(map);

      warehouseMarkersRef.current.push(marker);
    });
  }, [warehouses, mapReady]);

  // 4. Cập nhật vị trí và góc xoay Marker các xe thời gian thực
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    vehicles.forEach((item) => {
      const { telemetry } = item;
      const vehicleId = telemetry.vehicleId;
      const isSelected = selectedVehicleId === vehicleId;
      const isMoving = telemetry.speedKmH > 0;
      const isAlert = item.status === "ALERT";

      let markerObj = vehicleMarkersRef.current[vehicleId];

      if (!markerObj) {
        const el = document.createElement("div");
        el.className = "tracking-vehicle-marker cursor-pointer group";

        const marker = new Marker({ element: el })
          .setLngLat(telemetry.coordinates)
          .addTo(map);

        el.addEventListener("click", () => {
          onSelectVehicle(vehicleId);
        });

        markerObj = { marker, element: el };
        vehicleMarkersRef.current[vehicleId] = markerObj;
      } else {
        markerObj.marker.setLngLat(telemetry.coordinates);
      }

      // Cập nhật DOM của Marker
      markerObj.element.innerHTML = `
        <div class="relative flex flex-col items-center">
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-md border transition-all ${
            isSelected
              ? "bg-primary text-primary-foreground border-primary scale-110 ring-4 ring-primary/30 z-30"
              : isAlert
              ? "bg-rose-600 text-white border-rose-400 z-20 animate-pulse"
              : isMoving
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-slate-700 z-10"
              : "bg-muted text-muted-foreground border-border z-0"
          }">
            <div style="transform: rotate(${telemetry.bearing}deg);" class="transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>
            </div>
            <span>${telemetry.plateNumber}</span>
            ${
              isMoving
                ? `<span class="text-[9px] opacity-80 pl-0.5">${telemetry.speedKmH}k</span>`
                : ""
            }
          </div>
        </div>
      `;
    });
  }, [vehicles, selectedVehicleId, onSelectVehicle, mapReady]);

  // 5. Vẽ Polyline và Điểm dừng khi chọn xe
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    // Xóa stop markers cũ
    stopMarkersRef.current.forEach((m) => m.remove());
    stopMarkersRef.current = [];

    const selectedVehicle = vehicles.find((v) => v.telemetry.vehicleId === selectedVehicleId);
    const route = selectedVehicle?.route;

    if (!selectedVehicle || !route || !route.stops || route.stops.length === 0) {
      // Clear route source
      const src = map.getSource("active-route-source") as any;
      if (src) {
        src.setData({
          type: "FeatureCollection",
          features: [],
        });
      }
      return;
    }

    // Tọa độ tuyến đường nối: Vị trí xe -> Stop 1 -> Stop 2...
    const coordinates: [number, number][] = [
      selectedVehicle.telemetry.coordinates,
      ...route.stops.map((s) => [s.longitude, s.latitude] as [number, number]),
    ];

    const src = map.getSource("active-route-source") as any;
    if (src) {
      src.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: coordinates,
        },
      });
    }

    // Thêm markers cho từng điểm dừng
    route.stops.forEach((stop, idx) => {
      const stopEl = document.createElement("div");
      stopEl.className =
        "flex items-center justify-center h-6 w-6 rounded-full font-bold text-[10px] text-white shadow-md border-2 border-white select-none";

      if (stop.status === "COMPLETED") {
        stopEl.className += " bg-emerald-600";
      } else if (stop.status === "ARRIVED") {
        stopEl.className += " bg-amber-500 animate-bounce";
      } else {
        stopEl.className += " bg-primary";
      }

      stopEl.innerText = `${idx + 1}`;

      const stopMarker = new Marker({ element: stopEl })
        .setLngLat([stop.longitude, stop.latitude])
        .addTo(map);

      stopMarkersRef.current.push(stopMarker);
    });
  }, [selectedVehicleId, vehicles, mapReady]);

  // 6. Cleanup khi unmount
  useEffect(() => {
    return () => {
      Object.values(vehicleMarkersRef.current).forEach((m) => m.marker.remove());
      vehicleMarkersRef.current = {};
      warehouseMarkersRef.current.forEach((m) => m.remove());
      warehouseMarkersRef.current = [];
      stopMarkersRef.current.forEach((m) => m.remove());
      stopMarkersRef.current = [];
    };
  }, []);

  return (
    <div className="relative h-full w-full min-h-[450px] rounded-xl overflow-hidden border border-border shadow-2xs">
      <MapContainer
        center={REGIONS[selectedRegion].center}
        zoom={REGIONS[selectedRegion].zoom}
        onMapLoad={handleMapLoad}
      />
    </div>
  );
};
