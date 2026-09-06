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
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Khởi tạo instance MapLibre
    const map = new Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors | VietRoute Engine",
          },
        },
        layers: [
          {
            id: "osm-layer",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: center,
      zoom: zoom,
    });

    // Thêm điều khiển điều hướng chuẩn (Phóng to / Thu nhỏ / Xoay la bàn)
    map.addControl(new NavigationControl({ visualizePitch: true }), "top-right");

    map.on("load", () => {
      setIsLoaded(true);
      if (onMapLoad) {
        onMapLoad(map);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [center, zoom, onMapLoad]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-lg border border-border", className)}>
      <div ref={mapContainerRef} className="h-full w-full" />
      {isLoaded && children}
    </div>
  );
};

