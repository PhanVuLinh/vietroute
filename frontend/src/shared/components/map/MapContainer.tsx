import * as React from "react";
import { Map, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ENV } from "@/core/config/env";
import { cn } from "@/shared/utils/cn";

export type MapTileStyle = "google_roadmap" | "google_satellite" | "google_hybrid" | "esri_streets";

export interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  mapType?: MapTileStyle;
  className?: string;
  onMapLoad?: (map: Map) => void;
  children?: React.ReactNode;
}

const TILE_SOURCES: Record<MapTileStyle, { tiles: string[]; maxzoom: number; attribution: string }> = {
  // 1. Google Maps Chuẩn (Đường phố, Tiếng Việt 100%, Siêu mượt, Không Watermark, Không Giới Hạn)
  google_roadmap: {
    tiles: [
      "https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      "https://mt2.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      "https://mt3.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    ],
    maxzoom: 20,
    attribution: "© Google Maps | VietRoute Engine",
  },
  // 2. Google Maps Vệ Tinh (Satellite)
  google_satellite: {
    tiles: [
      "https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      "https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      "https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    ],
    maxzoom: 20,
    attribution: "© Google Satellite | VietRoute Engine",
  },
  // 3. Google Maps Kết Hợp (Hybrid: Vệ tinh + Tên đường tiếng Việt)
  google_hybrid: {
    tiles: [
      "https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      "https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      "https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    ],
    maxzoom: 20,
    attribution: "© Google Hybrid | VietRoute Engine",
  },
  // 4. Esri World Street Map (Dự phòng độ tin cậy cao)
  esri_streets: {
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    ],
    maxzoom: 19,
    attribution: "© Esri ArcGIS | VietRoute Engine",
  },
};

/**
 * Component nền tảng bản đồ số MapLibre GL JS tích hợp Google Maps Engine cho VietRoute
 * Hiển thị đường sá tiếng Việt cực nét, không lag, không watermark, không giới hạn request
 */
export const MapContainer: React.FC<MapContainerProps> = ({
  center = ENV.MAP_DEFAULT_CENTER_HN,
  zoom = 12,
  mapType = "google_roadmap",
  className,
  onMapLoad,
  children,
}) => {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<Map | null>(null);
  const onMapLoadRef = React.useRef(onMapLoad);
  onMapLoadRef.current = onMapLoad;

  const [isLoaded, setIsLoaded] = React.useState(false);

  // Khởi tạo map 1 lần duy nhất khi component mount
  React.useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const sourceConfig = TILE_SOURCES[mapType] || TILE_SOURCES.google_roadmap;

    const map = new Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          base_tiles: {
            type: "raster",
            tiles: sourceConfig.tiles,
            tileSize: 256,
            attribution: sourceConfig.attribution,
          },
        },
        layers: [
          {
            id: "base-tiles-layer",
            type: "raster",
            source: "base_tiles",
            minzoom: 0,
            maxzoom: sourceConfig.maxzoom,
          },
        ],
      },
      center: center,
      zoom: zoom,
      fadeDuration: 0,
    });

    // Thêm điều khiển điều hướng chuẩn (Phóng to / Thu nhỏ / Xoay la bàn)
    map.addControl(new NavigationControl({ visualizePitch: true }), "top-right");

    map.on("load", () => {
      setIsLoaded(true);
      map.resize();
      if (onMapLoadRef.current) {
        onMapLoadRef.current(map);
      }
    });

    // Tự động nhận diện thay đổi kích thước khung chứa (Flex/Grid/Sidebar toggle)
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.resize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    // Kích hoạt nhiều nhịp resize phòng trường hợp layout CSS tính toán trễ
    const t1 = setTimeout(() => map.resize(), 100);
    const t2 = setTimeout(() => map.resize(), 300);
    const t3 = setTimeout(() => map.resize(), 800);

    mapInstanceRef.current = map;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // Run once on mount

  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-lg border border-border bg-slate-100 dark:bg-slate-900", className)}>
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
      {isLoaded && children}
    </div>
  );
};
