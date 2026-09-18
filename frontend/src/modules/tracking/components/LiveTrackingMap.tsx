import React, { useEffect, useRef, useState, useCallback } from "react";
import { type Map, Marker, Popup } from "maplibre-gl";
import {
  Layers,
  Box,
  Maximize2,
  Minimize2,
  Compass,
} from "lucide-react";
import { MapContainer, type MapTileStyle } from "@/shared/components/map/MapContainer";
import { REGIONS, type RegionKey, type EnrichedTrackedVehicle } from "../hooks/useTracking";
import type { Warehouse } from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

interface LiveTrackingMapProps {
  vehicles: EnrichedTrackedVehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  warehouses: Warehouse[];
  selectedRegion: RegionKey;
  focusCoords?: [number, number] | null;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  warehouses,
  selectedRegion,
  focusCoords,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapType, setMapType] = useState<MapTileStyle>("google_roadmap");
  const [is3D, setIs3D] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const vehicleMarkersRef = useRef<Record<string, { marker: Marker; element: HTMLElement }>>({});
  const warehouseMarkersRef = useRef<Marker[]>([]);
  const stopMarkersRef = useRef<Marker[]>([]);
  const vehicleTrailsRef = useRef<Record<string, [number, number][]>>({});

  // 1. Khi bản đồ MapLibre khởi tạo xong
  const handleMapLoad = useCallback((map: Map) => {
    mapInstanceRef.current = map;

    // A. Source cho vệt đường lịch sử di chuyển (Breadcrumb Trail)
    if (!map.getSource("vehicle-trails-source")) {
      map.addSource("vehicle-trails-source", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "vehicle-trails-line",
        type: "line",
        source: "vehicle-trails-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#10b981",
          "line-width": 3.5,
          "line-opacity": 0.75,
          "line-dasharray": [1, 1],
        },
      });
    }

    // B. Source cho đường Polyline lộ trình đang chọn
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
      el.className = "cursor-pointer group select-none";
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="h-6 w-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
          </div>
          <div class="absolute -bottom-5 whitespace-nowrap bg-background/90 backdrop-blur-xs text-foreground px-1.5 py-0.2 rounded text-[10px] font-bold shadow-xs border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            ${wh.name}
          </div>
        </div>
      `;

      const popup = new Popup({ offset: 12, closeButton: false }).setHTML(`
        <div class="p-2 space-y-1 text-xs">
          <div class="font-bold text-slate-900 dark:text-slate-100">${wh.name}</div>
          <div class="text-slate-500 dark:text-slate-400 text-[11px]">${wh.address}</div>
          <div class="text-[10px] text-amber-600 font-semibold font-mono">Mã: ${wh.code}</div>
        </div>
      `);

      const marker = new Marker({ element: el })
        .setLngLat([wh.longitude, wh.latitude])
        .setPopup(popup)
        .addTo(map);

      warehouseMarkersRef.current.push(marker);
    });
  }, [warehouses, mapReady]);

  // 4. Cập nhật vị trí và góc xoay Marker các xe thời gian thực + Ghi vệt di chuyển
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    vehicles.forEach((item) => {
      const { telemetry } = item;
      const vehicleId = telemetry.vehicleId;
      const isSelected = selectedVehicleId === vehicleId;
      const isMoving = telemetry.speedKmH > 0;
      const isAlert = item.status === "ALERT";

      // Lưu lại vệt di chuyển (tối đa 25 điểm gần nhất)
      if (isMoving) {
        if (!vehicleTrailsRef.current[vehicleId]) {
          vehicleTrailsRef.current[vehicleId] = [];
        }
        const trail = vehicleTrailsRef.current[vehicleId];
        const last = trail[trail.length - 1];
        if (!last || last[0] !== telemetry.coordinates[0] || last[1] !== telemetry.coordinates[1]) {
          trail.push(telemetry.coordinates);
          if (trail.length > 25) trail.shift();
        }
      }

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
              ? "bg-primary text-primary-foreground border-primary scale-115 ring-4 ring-primary/30 z-30 shadow-primary/30"
              : isAlert
              ? "bg-rose-600 text-white border-rose-400 z-20 animate-pulse"
              : isMoving
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-slate-700 z-10"
              : "bg-muted text-muted-foreground border-border z-0"
          }">
            <div style="transform: rotate(${telemetry.bearing}deg);" class="transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>
            </div>
            <span>${telemetry.plateNumber}</span>
            ${
              isMoving
                ? `<span class="text-[9px] opacity-90 pl-0.5">${telemetry.speedKmH}k</span>`
                : ""
            }
          </div>
        </div>
      `;
    });

    // Cập nhật vệt di chuyển lên map
    const trailsSource = map.getSource("vehicle-trails-source") as any;
    if (trailsSource) {
      const trailFeatures = Object.entries(vehicleTrailsRef.current)
        .filter(([id, coords]) => coords.length >= 2 && (!selectedVehicleId || selectedVehicleId === id))
        .map(([_, coords]) => ({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coords,
          },
        }));

      trailsSource.setData({
        type: "FeatureCollection",
        features: trailFeatures,
      });
    }
  }, [vehicles, selectedVehicleId, onSelectVehicle, mapReady]);

  // 5. Tự động bay camera khi chọn xe hoặc ấn nút định vị
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    if (focusCoords) {
      map.flyTo({
        center: focusCoords,
        zoom: 15,
        pitch: is3D ? 50 : 25,
        speed: 1.4,
        curve: 1.2,
      });
      return;
    }

    if (selectedVehicleId) {
      const selected = vehicles.find((v) => v.telemetry.vehicleId === selectedVehicleId);
      if (selected) {
        map.flyTo({
          center: selected.telemetry.coordinates,
          zoom: Math.max(map.getZoom(), 14),
          speed: 1.2,
        });
      }
    }
  }, [selectedVehicleId, focusCoords, mapReady]);

  // 6. Vẽ Polyline và Điểm dừng khi chọn xe
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    // Xóa stop markers cũ
    stopMarkersRef.current.forEach((m) => m.remove());
    stopMarkersRef.current = [];

    const selectedVehicle = vehicles.find((v) => v.telemetry.vehicleId === selectedVehicleId);
    const route = selectedVehicle?.route;

    if (!selectedVehicle || !route || !route.stops || route.stops.length === 0) {
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

  // Toggle chế độ nghiêng 3D
  const handleToggle3D = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const next = !is3D;
    setIs3D(next);
    map.easeTo({
      pitch: next ? 55 : 0,
      duration: 600,
    });
  };

  // Toggle Toàn màn hình
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  // Reset góc la bàn về chính Bắc
  const handleResetNorth = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.easeTo({ bearing: 0, pitch: is3D ? 55 : 0, duration: 400 });
  };

  // 7. Cleanup khi unmount
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
    <div
      ref={containerRef}
      className="relative h-full w-full min-h-[450px] rounded-xl overflow-hidden border border-border shadow-2xs group"
    >
      <MapContainer
        key={mapType}
        center={REGIONS[selectedRegion].center}
        zoom={REGIONS[selectedRegion].zoom}
        mapType={mapType}
        onMapLoad={handleMapLoad}
      />

      {/* Floating Control Toolbar góc trái bản đồ */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 bg-card/90 backdrop-blur-md p-1.5 rounded-xl border border-border/80 shadow-lg">
        {/* Nút Layer chuyển đổi loại bản đồ */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className={cn(
              "p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
              showLayerMenu
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title="Đổi lớp bản đồ"
          >
            <Layers className="h-4 w-4" />
          </button>

          {showLayerMenu && (
            <div className="absolute left-full ml-2 top-0 bg-card/95 backdrop-blur-md p-1.5 rounded-xl border border-border shadow-xl flex flex-col gap-1 min-w-[135px] text-xs font-medium z-30">
              <button
                onClick={() => {
                  setMapType("google_roadmap");
                  setShowLayerMenu(false);
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer",
                  mapType === "google_roadmap"
                    ? "bg-primary/15 text-primary font-bold"
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                Đường phố
              </button>
              <button
                onClick={() => {
                  setMapType("google_hybrid");
                  setShowLayerMenu(false);
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer",
                  mapType === "google_hybrid"
                    ? "bg-primary/15 text-primary font-bold"
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                Vệ tinh kết hợp
              </button>
              <button
                onClick={() => {
                  setMapType("esri_streets");
                  setShowLayerMenu(false);
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer",
                  mapType === "esri_streets"
                    ? "bg-primary/15 text-primary font-bold"
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                Bản đồ Esri
              </button>
            </div>
          )}
        </div>

        {/* Nút bật/tắt góc nghiêng 3D */}
        <button
          onClick={handleToggle3D}
          className={cn(
            "p-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer",
            is3D
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          title={is3D ? "Về góc nhìn 2D phẳng" : "Chuyển góc nhìn 3D nghiêng"}
        >
          <Box className="h-4 w-4" />
        </button>

        {/* Nút xoay La bàn về chính Bắc */}
        <button
          onClick={handleResetNorth}
          className="p-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title="Xoay hướng chính Bắc"
        >
          <Compass className="h-4 w-4" />
        </button>

        {/* Nút Toàn màn hình */}
        <button
          onClick={handleToggleFullscreen}
          className="p-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title={isFullscreen ? "Thu nhỏ" : "Xem toàn màn hình"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Chú giải nhanh góc dưới trái bản đồ */}
      <div className="absolute bottom-3 left-3 hidden sm:flex items-center gap-2.5 bg-card/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border/70 text-[11px] font-medium shadow-md">
        <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
          <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-slate-100" />
          Đang chạy
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-muted-foreground" />
          Dừng đỗ
        </span>
        <span className="flex items-center gap-1 text-rose-600 font-semibold">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          Cảnh báo
        </span>
        <span className="flex items-center gap-1 text-emerald-600 font-semibold border-l border-border pl-2">
          <span className="h-1.5 w-3 bg-emerald-500 rounded-sm" />
          Vệt GPS
        </span>
      </div>
    </div>
  );
};
