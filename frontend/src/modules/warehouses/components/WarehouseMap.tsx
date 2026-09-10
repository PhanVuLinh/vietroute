import React, { useEffect, useRef, useState, useCallback } from "react";
import { type Map, Marker, Popup } from "maplibre-gl";
import {
  Building2,
  Boxes,
  MapPin,
  Compass,
  Phone,
  Clock,
  Layers,
} from "lucide-react";
import { MapContainer } from "@/shared/components/map/MapContainer";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { Warehouse } from "@/core/types/logistics";

interface WarehouseMapProps {
  warehouses: Warehouse[];
  selectedWarehouseId: string | null;
  onSelectWarehouse: (warehouseId: string) => void;
  className?: string;
}

const REGION_CENTERS = {
  ALL: { name: "Toàn quốc", center: [107.5, 16.0] as [number, number], zoom: 5.2 },
  NORTH: { name: "Miền Bắc", center: [105.85, 21.03] as [number, number], zoom: 9.5 },
  CENTRAL: { name: "Miền Trung", center: [108.2, 15.6] as [number, number], zoom: 8.5 },
  SOUTH: { name: "Miền Nam", center: [106.68, 10.78] as [number, number], zoom: 9.5 },
};

export const WarehouseMap: React.FC<WarehouseMapProps> = ({
  warehouses,
  selectedWarehouseId,
  onSelectWarehouse,
  className,
}) => {
  const mapInstanceRef = useRef<Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const markersRef = useRef<Marker[]>([]);

  const handleMapLoad = useCallback((map: Map) => {
    mapInstanceRef.current = map;
    setMapReady(true);
  }, []);

  // Chuyển góc nhìn theo vùng
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

  // Render & cập nhật Markers các kho
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady || warehouses.length === 0) return;

    // Xóa markers cũ
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    warehouses.forEach((wh) => {
      const occupancy = wh.capacity > 0 ? Math.round((wh.usedCapacity / wh.capacity) * 100) : 0;
      const isSelected = selectedWarehouseId === wh.id;
      const isOverload = occupancy >= 85 || wh.status === "FULL";
      const isHigh = occupancy >= 70 && occupancy < 85;
      const isMaintenance = wh.status === "MAINTENANCE";

      const colorClass = isMaintenance
        ? "bg-amber-600 text-white border-amber-300"
        : isOverload
        ? "bg-rose-600 text-white border-rose-300 animate-pulse"
        : isHigh
        ? "bg-amber-500 text-white border-amber-200"
        : "bg-emerald-600 text-white border-emerald-200";

      const el = document.createElement("div");
      el.className = `group cursor-pointer select-none transition-transform duration-200 ${
        isSelected ? "scale-125 z-30" : "hover:scale-110 z-10"
      }`;

      el.innerHTML = `
        <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg shadow-md border ${colorClass} ${
          isSelected ? "ring-2 ring-primary ring-offset-1 shadow-xl scale-110" : ""
        }">
          <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/>
            <path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/>
          </svg>
          <div class="flex flex-col min-w-0">
            <span class="text-[10px] font-bold leading-tight truncate max-w-[100px] whitespace-nowrap">
              ${wh.name.replace("Tổng kho ", "").replace("Kho Trung chuyển ", "").replace("Hub Giao nhận ", "").replace("Kho Phân phối ", "")}
            </span>
            <span class="text-[9px] opacity-90 font-mono leading-tight whitespace-nowrap">
              ${occupancy}% (${wh.usedCapacity}T)
            </span>
          </div>
        </div>
      `;

      // Popup thông tin kho
      const popupHtml = `
        <div class="p-2.5 space-y-2 text-xs font-sans min-w-[220px]">
          <div class="border-b border-border pb-1.5">
            <div class="font-bold text-foreground text-sm flex items-center justify-between">
              <span>${wh.name}</span>
            </div>
            <span class="text-[10px] text-muted-foreground font-mono">${wh.code} • ${wh.city}</span>
          </div>

          <div class="space-y-1 text-[11px]">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Sức chứa:</span>
              <span class="font-bold font-mono text-foreground">${wh.usedCapacity}/${wh.capacity} Tấn</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Tỷ lệ lấp đầy:</span>
              <span class="font-bold font-mono ${
                occupancy >= 85
                  ? "text-rose-600"
                  : occupancy >= 70
                  ? "text-amber-600"
                  : "text-emerald-600"
              }">${occupancy}%</span>
            </div>
            ${
              wh.totalPallets
                ? `
            <div class="flex justify-between">
              <span class="text-muted-foreground">Pallets:</span>
              <span class="font-mono text-foreground">${wh.usedPallets || 0}/${wh.totalPallets}</span>
            </div>`
                : ""
            }
            <div class="flex justify-between">
              <span class="text-muted-foreground">Giờ vận hành:</span>
              <span class="font-mono text-foreground">${wh.openingTime} - ${wh.closingTime}</span>
            </div>
            ${
              wh.managerName
                ? `
            <div class="flex justify-between pt-1 border-t border-border/40">
              <span class="text-muted-foreground">Quản lý:</span>
              <span class="font-medium text-foreground">${wh.managerName}</span>
            </div>`
                : ""
            }
          </div>
          <p class="text-[10px] text-muted-foreground pt-0.5">${wh.address}</p>
        </div>
      `;

      const popup = new Popup({ offset: 16, closeButton: false }).setHTML(popupHtml);

      el.addEventListener("click", () => {
        onSelectWarehouse(wh.id);
        map.flyTo({
          center: [wh.longitude, wh.latitude],
          zoom: 12.5,
          speed: 1.2,
        });
      });

      const marker = new Marker({ element: el })
        .setLngLat([wh.longitude, wh.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [warehouses, selectedWarehouseId, onSelectWarehouse, mapReady]);

  // Focus khi chọn kho từ danh sách ngoài
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedWarehouseId) return;
    const target = warehouses.find((w) => w.id === selectedWarehouseId);
    if (target) {
      map.flyTo({
        center: [target.longitude, target.latitude],
        zoom: 13,
        speed: 1.3,
      });
    }
  }, [selectedWarehouseId, warehouses]);

  return (
    <div className={`relative h-full w-full min-h-[480px] rounded-xl overflow-hidden border border-border shadow-2xs ${className || ""}`}>
      <MapContainer
        center={[107.5, 16.0]}
        zoom={5.2}
        onMapLoad={handleMapLoad}
      />

      {/* Floating Region Selector (Top-Left) */}
      <div className="absolute top-3 left-3 z-10 bg-card/90 backdrop-blur-md p-1.5 rounded-xl border border-border/70 shadow-md flex items-center gap-1">
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

      {/* Floating Legend (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-10 bg-card/90 backdrop-blur-md p-2 rounded-xl border border-border/70 shadow-md text-[10px] space-y-1 select-none">
        <span className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider block">
          Tỷ lệ lấp đầy kho bãi
        </span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>&lt; 70% (An toàn)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>70% - 85% (Cao)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span>&gt; 85% (Quá tải)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
            <span>Bảo trì bãi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
