import React, { useEffect, useRef, useState, useCallback } from "react";
import { type Map, Marker, Popup, LngLatBounds } from "maplibre-gl";
import {
  Route as RouteIcon,
  MapPin,
  Building2,
  Truck,
  Compass,
  Layers,
  Globe,
  Map as MapIcon,
  CheckCircle2,
  Clock,
  Navigation,
} from "lucide-react";
import { MapContainer, type MapTileStyle } from "@/shared/components/map/MapContainer";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { EnrichedRoute } from "../hooks/useRoutes";

interface RouteMapProps {
  routes: EnrichedRoute[];
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
  className?: string;
}

const REGION_CENTERS = {
  ALL: { name: "Toàn quốc", center: [107.5, 16.0] as [number, number], zoom: 5.2 },
  NORTH: { name: "Miền Bắc", center: [105.85, 21.03] as [number, number], zoom: 9.5 },
  CENTRAL: { name: "Miền Trung", center: [108.2, 15.6] as [number, number], zoom: 8.5 },
  SOUTH: { name: "Miền Nam", center: [106.68, 10.78] as [number, number], zoom: 9.5 },
};

export const RouteMap: React.FC<RouteMapProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  className,
}) => {
  const mapInstanceRef = useRef<Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [currentLayer, setCurrentLayer] = useState<MapTileStyle>("google_roadmap");
  const markersRef = useRef<Marker[]>([]);

  const handleMapLoad = useCallback((map: Map) => {
    mapInstanceRef.current = map;
    setMapReady(true);
  }, []);

  // Chuyển góc nhìn vùng miền
  const flyToRegion = (regionKey: keyof typeof REGION_CENTERS) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const target = REGION_CENTERS[regionKey];
    map.flyTo({
      center: target.center,
      zoom: target.zoom,
      speed: 1.2,
      curve: 1.4,
    });
  };

  // Đổi kiểu lớp bản đồ Google Maps
  const handleSwitchLayer = (type: MapTileStyle) => {
    setCurrentLayer(type);
    const map = mapInstanceRef.current;
    if (!map) return;

    const tilesMap: Record<MapTileStyle, string[]> = {
      google_roadmap: [
        "https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        "https://mt2.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      ],
      google_satellite: [
        "https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      ],
      google_hybrid: [
        "https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      ],
      esri_streets: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      ],
    };

    const source = map.getSource("base_tiles") as any;
    if (source && typeof source.setTiles === "function") {
      source.setTiles(tilesMap[type]);
    }
  };

  // Cập nhật Lines và Markers lộ trình trên bản đồ
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    // 1. Xóa markers cũ
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // 2. Xác định các tuyến cần vẽ
    const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
    const routesToDraw = selectedRouteId ? [activeRoute].filter(Boolean) : routes;

    // 3. Cập nhật GeoJSON LineString cho Polyline tuyến đường
    const lineFeatures = routesToDraw.map((r) => {
      let coords: [number, number][] = [];
      if (r.polyline && r.polyline.length > 0) {
        coords = r.polyline;
      } else if (r.stops && r.stops.length > 0) {
        // Tự tạo tọa độ từ kho xuất phát và các điểm dừng
        if (r.warehouse) {
          coords.push([r.warehouse.longitude, r.warehouse.latitude]);
        }
        r.stops.forEach((s) => coords.push([s.longitude, s.latitude]));
      }

      return {
        type: "Feature" as const,
        properties: {
          routeId: r.id,
          routeCode: r.routeCode,
          status: r.status,
          isSelected: r.id === selectedRouteId,
        },
        geometry: {
          type: "LineString" as const,
          coordinates: coords,
        },
      };
    });

    const geojsonData = {
      type: "FeatureCollection" as const,
      features: lineFeatures.filter((f) => f.geometry.coordinates.length > 1),
    };

    const sourceId = "routes-polyline-source";
    const layerId = "routes-polyline-layer";
    const layerGlowId = "routes-polyline-glow-layer";

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as any).setData(geojsonData);
    } else {
      map.addSource(sourceId, {
        type: "geojson",
        data: geojsonData,
      });

      // Lớp bóng phát sáng cho line
      map.addLayer({
        id: layerGlowId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": [
            "match",
            ["get", "status"],
            "ACTIVE",
            "#f59e0b",
            "COMPLETED",
            "#10b981",
            "CANCELLED",
            "#ef4444",
            "#3b82f6", // PLANNED
          ],
          "line-width": 8,
          "line-opacity": 0.35,
        },
      });

      // Lớp nét chính
      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": [
            "match",
            ["get", "status"],
            "ACTIVE",
            "#f59e0b",
            "COMPLETED",
            "#10b981",
            "CANCELLED",
            "#ef4444",
            "#2563eb", // PLANNED
          ],
          "line-width": 4,
          "line-dasharray": [
            "case",
            ["==", ["get", "status"], "PLANNED"],
            ["literal", [2, 2]],
            ["literal", [1]],
          ],
        },
      });
    }

    // 4. Thêm Markers cho Kho xuất phát và các Điểm dừng
    routesToDraw.forEach((route) => {
      // Marker Kho xuất phát
      if (route.warehouse) {
        const whEl = document.createElement("div");
        whEl.className = "cursor-pointer select-none transition-transform hover:scale-115";
        whEl.innerHTML = `
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-600 text-white shadow-lg border-2 border-white font-bold text-[10px]">
            <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/>
            </svg>
            <span>KHO XUẤT: ${route.warehouse.name.replace("Tổng kho ", "").replace("Kho Trung chuyển ", "")}</span>
          </div>
        `;

        const whPopup = new Popup({ offset: 14 }).setHTML(`
          <div class="p-2 text-xs space-y-1 font-sans min-w-[180px]">
            <strong class="text-foreground block">${route.warehouse.name}</strong>
            <p class="text-[10px] text-muted-foreground">${route.warehouse.address}</p>
            <div class="text-[10px] text-primary pt-1 font-mono">Tuyến: ${route.routeCode}</div>
          </div>
        `);

        const whMarker = new Marker({ element: whEl })
          .setLngLat([route.warehouse.longitude, route.warehouse.latitude])
          .setPopup(whPopup)
          .addTo(map);

        markersRef.current.push(whMarker);
      }

      // Markers các điểm dừng (1, 2, 3...)
      (route.stops || []).forEach((stop) => {
        const isDone = stop.status === "COMPLETED";
        const isArrived = stop.status === "ARRIVED";

        const stopColor = isDone
          ? "bg-emerald-600 border-emerald-200"
          : isArrived
          ? "bg-amber-500 border-amber-200 animate-pulse"
          : "bg-slate-700 border-slate-300";

        const stopEl = document.createElement("div");
        stopEl.className = "cursor-pointer select-none transition-transform hover:scale-120";
        stopEl.innerHTML = `
          <div class="h-6 w-6 rounded-full flex items-center justify-center font-bold text-white shadow-lg border-2 ${stopColor} text-xs font-mono">
            ${stop.sequence}
          </div>
        `;

        const stopPopup = new Popup({ offset: 14 }).setHTML(`
          <div class="p-2.5 text-xs space-y-1.5 font-sans min-w-[210px]">
            <div class="flex items-center justify-between border-b border-border pb-1">
              <span class="font-bold text-foreground">Điểm #${stop.sequence}: ${stop.customerName || "Khách hàng"}</span>
            </div>
            <p class="text-[11px] text-muted-foreground">${stop.address || "Địa chỉ giao hàng"}</p>
            <div class="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5 font-mono">
              <span>Đơn: <strong>${stop.orderCode || "N/A"}</strong></span>
              <span>Trọng lượng: <strong>${stop.weightKg || 0}kg</strong></span>
            </div>
            <div class="flex items-center justify-between text-[10px] pt-1">
              <span class="text-muted-foreground">Khung giờ: <strong>${stop.timeWindowStart || "08:00"} - ${stop.timeWindowEnd || "17:00"}</strong></span>
            </div>
          </div>
        `);

        stopEl.addEventListener("click", () => {
          onSelectRoute(route.id);
        });

        const stopMarker = new Marker({ element: stopEl })
          .setLngLat([stop.longitude, stop.latitude])
          .setPopup(stopPopup)
          .addTo(map);

        markersRef.current.push(stopMarker);
      });
    });

    // 5. Tự động fitBounds vào toàn bộ tuyến được chọn
    if (activeRoute) {
      const bounds = new LngLatBounds();
      let hasCoords = false;

      if (activeRoute.warehouse) {
        bounds.extend([activeRoute.warehouse.longitude, activeRoute.warehouse.latitude]);
        hasCoords = true;
      }
      (activeRoute.stops || []).forEach((s) => {
        bounds.extend([s.longitude, s.latitude]);
        hasCoords = true;
      });

      if (hasCoords) {
        map.fitBounds(bounds, {
          padding: 60,
          maxZoom: 13,
          duration: 1000,
        });
      }
    }
  }, [routes, selectedRouteId, mapReady, onSelectRoute]);

  return (
    <div className={`relative h-full w-full min-h-[480px] rounded-xl overflow-hidden border border-border shadow-2xs ${className || ""}`}>
      <MapContainer
        center={[107.5, 16.0]}
        zoom={5.2}
        mapType={currentLayer}
        onMapLoad={handleMapLoad}
      />

      {/* Floating Region Selector (Top-Left) */}
      <div className="absolute top-3 left-3 z-10 bg-card/95 backdrop-blur-md p-1 rounded-xl border border-border/80 shadow-md flex items-center gap-0.5">
        <Compass className="h-3.5 w-3.5 text-muted-foreground ml-1 mr-0.5" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => flyToRegion("ALL")}
          className="h-7 px-2 text-[11px] font-semibold"
        >
          Toàn quốc
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => flyToRegion("NORTH")}
          className="h-7 px-2 text-[11px]"
        >
          Miền Bắc
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => flyToRegion("CENTRAL")}
          className="h-7 px-2 text-[11px]"
        >
          Miền Trung
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => flyToRegion("SOUTH")}
          className="h-7 px-2 text-[11px]"
        >
          Miền Nam
        </Button>
      </div>

      {/* Floating Layer Switcher (Top-Right) */}
      <div className="absolute top-24 right-3 z-10 bg-card/95 backdrop-blur-md p-1 rounded-xl border border-border/80 shadow-md flex flex-col gap-0.5">
        <Button
          variant={currentLayer === "google_roadmap" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleSwitchLayer("google_roadmap")}
          className="h-7 px-2 text-[10px] gap-1 justify-start"
          title="Bản đồ đường phố Google Maps"
        >
          <MapIcon className="h-3 w-3" />
          <span>Đường phố</span>
        </Button>
        <Button
          variant={currentLayer === "google_hybrid" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleSwitchLayer("google_hybrid")}
          className="h-7 px-2 text-[10px] gap-1 justify-start"
          title="Bản đồ vệ tinh Google Maps"
        >
          <Globe className="h-3 w-3" />
          <span>Vệ tinh</span>
        </Button>
      </div>

      {/* Floating Legend (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-10 bg-card/95 backdrop-blur-md p-2 rounded-xl border border-border/80 shadow-md text-[10px] space-y-1 select-none">
        <span className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider block">
          Chú giải lộ trình giao hàng
        </span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
            <span>Kho xuất phát</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            <span>Điểm đã giao</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Đang đến điểm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
            <span>Chờ giao tiếp</span>
          </div>
        </div>
      </div>
    </div>
  );
};
