import * as React from "react";
import { Map, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ENV } from "@/core/config/env";
import { cn } from "@/shared/utils/cn";

export interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMapLoad?: (map: Map) => void;
  children?: React.ReactNode;
}

/**
 * Component nền tảng bản đồ số MapLibre GL JS cho hệ thống VietRoute
 * Đảm bảo tự động resize, tải layer mượt mà và không bị gián đoạn/trắng trang
 */
export const MapContainer: React.FC<MapContainerProps> = ({
  center = ENV.MAP_DEFAULT_CENTER_HN,
  zoom = 12,
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

    // Khởi tạo instance MapLibre với dữ liệu OpenStreetMap phân phối qua CDN CARTO (khắc phục lỗi ERR_CONNECTION_REFUSED)
    const map = new Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm_carto: {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors © CARTO | VietRoute Engine",
          },
        },
        layers: [
          {
            id: "osm-carto-layer",
            type: "raster",
            source: "osm_carto",
            minzoom: 0,
            maxzoom: 20,
          },
        ],
      },
      center: center,
      zoom: zoom,
      fadeDuration: 100,
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

