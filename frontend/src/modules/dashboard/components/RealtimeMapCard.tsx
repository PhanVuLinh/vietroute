import React, { useEffect, useRef, useState, useCallback } from "react";
import { type Map, Marker, Popup } from "maplibre-gl";
import { Navigation, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { MapContainer } from "@/shared/components/map/MapContainer";
import { useTrackingStore } from "@/shared/stores/trackingStore";
import type { Warehouse, Driver, VehicleTelemetry } from "@/core/types/logistics";
import { MOCK_ORDERS } from "@/mocks/data/orders";

interface RealtimeMapCardProps {
  warehouses: Warehouse[];
  drivers: Driver[];
  onSelectDriver?: (driverId: string) => void;
  className?: string;
}

export const RealtimeMapCard: React.FC<RealtimeMapCardProps> = ({
  warehouses,
  drivers,
  onSelectDriver,
  className,
}) => {
  const mapInstanceRef = useRef<Map | null>(null);
  const vehicleMarkersRef = useRef<Record<string, { marker: Marker; element: HTMLElement }>>({});
  const warehouseMarkersRef = useRef<Marker[]>([]);
  const deliveryMarkersRef = useRef<Marker[]>([]);
  const [activeVehicleCount, setActiveVehicleCount] = useState(0);

  // Xác định trạng thái màu sắc marker theo đặc tả nghiệp vụ:
  // - Xanh lá: Sẵn sàng
  // - Xanh dương: Đang giao
  // - Cam: Sắp quá tải (>= 4 đơn)
  // - Đỏ: Có vấn đề (GPS alert, xe trễ...)
  const getMarkerStatusStyle = useCallback((driverId?: string, vehicleId?: string) => {
    // Xe veh-12 hoặc có vấn đề GPS cảnh báo
    if (vehicleId === "veh-12" || vehicleId === "veh-05") {
      return {
        bg: "bg-rose-600",
        ring: "ring-rose-500/40",
        label: "Có vấn đề",
        textColor: "text-rose-600",
      };
    }

    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) {
      return {
        bg: "bg-blue-600",
        ring: "ring-blue-500/40",
        label: "Đang giao",
        textColor: "text-blue-600",
      };
    }

    if (driver.status === "AVAILABLE") {
      return {
        bg: "bg-emerald-600",
        ring: "ring-emerald-500/40",
        label: "Sẵn sàng",
        textColor: "text-emerald-600",
      };
    }

    if (driver.currentDeliveryCount >= 4) {
      return {
        bg: "bg-amber-600",
        ring: "ring-amber-500/40",
        label: "Sắp quá tải",
        textColor: "text-amber-600",
      };
    }

    return {
      bg: "bg-blue-600",
      ring: "ring-blue-500/40",
      label: "Đang giao",
      textColor: "text-blue-600",
    };
  }, [drivers]);

  // Cập nhật marker vị trí xe từ telemetry snapshot hoặc subscriber
  const updateVehicleMarker = useCallback(
    (telemetry: VehicleTelemetry) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const existing = vehicleMarkersRef.current[telemetry.vehicleId];
      const statusStyle = getMarkerStatusStyle(telemetry.driverId, telemetry.vehicleId);

      if (existing) {
        // Cập nhật tọa độ trực tiếp mà không re-render React component
        existing.marker.setLngLat([telemetry.coordinates[0], telemetry.coordinates[1]]);

        // Cập nhật góc quay mũi tên xe
        const arrowEl = existing.element.querySelector(".vehicle-arrow") as HTMLElement;
        if (arrowEl) {
          arrowEl.style.transform = `rotate(${telemetry.bearing}deg)`;
        }

        // Cập nhật thông số trong popup
        const speedEl = existing.element.querySelector(".vehicle-speed");
        if (speedEl) {
          speedEl.textContent = `${telemetry.speedKmH} km/h`;
        }
      } else {
        // Tạo marker HTML mới
        const el = document.createElement("div");
        el.className = "group relative flex items-center justify-center cursor-pointer select-none";
        el.style.width = "34px";
        el.style.height = "34px";

        el.innerHTML = `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${statusStyle.bg} text-white shadow-lg ring-2 ${statusStyle.ring} transition-transform hover:scale-110">
            <svg class="vehicle-arrow w-4 h-4 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor" style="transform: rotate(${telemetry.bearing}deg)">
              <polygon points="12,2 19,21 12,17 5,21" />
            </svg>
            <span class="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full ${statusStyle.bg} border-2 border-card"></span>
          </div>
        `;

        const popupContent = document.createElement("div");
        popupContent.className = "p-2.5 min-w-[200px] text-xs font-sans space-y-1.5 text-foreground";
        popupContent.innerHTML = `
          <div class="flex items-center justify-between gap-2 border-b pb-1.5 border-border">
            <span class="font-bold text-sm text-foreground">${telemetry.driverName}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white ${statusStyle.bg}">${statusStyle.label}</span>
          </div>
          <div class="grid grid-cols-2 gap-1 text-[11px] pt-1">
            <span class="text-muted-foreground">Biển số:</span>
            <span class="font-semibold text-right text-foreground">${telemetry.plateNumber}</span>
            <span class="text-muted-foreground">Vận tốc:</span>
            <span class="font-semibold text-right text-foreground vehicle-speed">${telemetry.speedKmH} km/h</span>
            <span class="text-muted-foreground">Nhiên liệu:</span>
            <span class="font-semibold text-right text-foreground">${telemetry.fuelPercent}%</span>
          </div>
        `;

        const popup = new Popup({ offset: 16, closeButton: false, maxWidth: "260px" }).setDOMContent(
          popupContent
        );

        el.addEventListener("click", () => {
          if (telemetry.driverId && onSelectDriver) {
            onSelectDriver(telemetry.driverId);
          }
        });

        const marker = new Marker({ element: el })
          .setLngLat([telemetry.coordinates[0], telemetry.coordinates[1]])
          .setPopup(popup)
          .addTo(map);

        vehicleMarkersRef.current[telemetry.vehicleId] = { marker, element: el };
      }
    },
    [getMarkerStatusStyle, onSelectDriver]
  );

  // Khi MapLibre tải xong
  const handleMapLoad = useCallback(
    (map: Map) => {
      mapInstanceRef.current = map;

      // 1. Vẽ các Kho trung chuyển
      warehouses.forEach((wh) => {
        const el = document.createElement("div");
        el.className = "flex items-center justify-center w-7 h-7 rounded-lg bg-blue-700 text-white shadow-md ring-2 ring-blue-400/40 cursor-pointer transition-transform hover:scale-110";
        el.innerHTML = `
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        `;

        const popup = new Popup({ offset: 14 }).setHTML(`
          <div class="p-2 text-xs space-y-1 text-foreground">
            <div class="font-bold text-foreground">${wh.name}</div>
            <div class="text-[11px] text-muted-foreground">${wh.address}</div>
            <div class="text-[11px] pt-1 border-t border-border flex justify-between">
              <span>Sức chứa:</span>
              <span class="font-semibold text-primary">${wh.usedCapacity}/${wh.capacity} tấn</span>
            </div>
          </div>
        `);

        const m = new Marker({ element: el })
          .setLngLat([wh.longitude, wh.latitude])
          .setPopup(popup)
          .addTo(map);

        warehouseMarkersRef.current.push(m);
      });

      // 2. Vẽ một số điểm giao hàng tiêu biểu (Hà Nội)
      const hanoiDeliveries = MOCK_ORDERS.slice(0, 4);
      hanoiDeliveries.forEach((order) => {
        const el = document.createElement("div");
        el.className = "flex items-center justify-center w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold shadow ring-2 ring-violet-300/60 cursor-pointer";
        el.innerHTML = `
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        `;

        const popup = new Popup({ offset: 10 }).setHTML(`
          <div class="p-1.5 text-xs text-foreground space-y-1">
            <div class="font-bold text-primary">Đơn ${order.orderCode}</div>
            <div class="text-[11px] text-muted-foreground line-clamp-2">${order.receiverAddress}</div>
            <div class="text-[10px] text-muted-foreground/80">Người nhận: ${order.receiverName}</div>
          </div>
        `);

        const m = new Marker({ element: el })
          .setLngLat([order.receiverLongitude, order.receiverLatitude])
          .setPopup(popup)
          .addTo(map);

        deliveryMarkersRef.current.push(m);
      });

      // 3. Khởi tạo markers xe từ snapshot hiện tại của trackingStore
      const currentVehicles = useTrackingStore.getState().vehicles;
      const vehicleList = Object.values(currentVehicles);
      setActiveVehicleCount(vehicleList.length);
      vehicleList.forEach(updateVehicleMarker);
    },
    [warehouses, updateVehicleMarker]
  );

  // Đăng ký nhận luồng GPS từ Zustand trackingStore mà không re-render React component
  useEffect(() => {
    const unsubscribe = useTrackingStore.subscribe((state) => {
      const vehicleList = Object.values(state.vehicles);
      setActiveVehicleCount(vehicleList.length);
      for (const telemetry of vehicleList) {
        updateVehicleMarker(telemetry);
      }
    });

    return () => {
      unsubscribe();
      // Dọn dẹp markers khi component unmount
      Object.values(vehicleMarkersRef.current).forEach(({ marker }) => marker.remove());
      vehicleMarkersRef.current = {};
      warehouseMarkersRef.current.forEach((m) => m.remove());
      warehouseMarkersRef.current = [];
      deliveryMarkersRef.current.forEach((m) => m.remove());
      deliveryMarkersRef.current = [];
    };
  }, [updateVehicleMarker]);

  // Điều khiển view map về Hà Nội hoặc TP.HCM
  const panToCity = (center: [number, number], zoom: number = 12) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({ center, zoom, essential: true });
    }
  };

  return (
    <Card className={`relative flex flex-col h-[460px] sm:h-[520px] overflow-hidden border-border/80 shadow-xs ${className || ""}`}>
      {/* Card Header với trạng thái Realtime */}
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/60 shrink-0 bg-card/60 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            <span>Bản đồ điều phối theo thời gian thực</span>
          </CardTitle>
          <Badge
            variant="outline"
            className="hidden sm:flex items-center gap-1.5 py-0.5 px-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span>{activeVehicleCount > 0 ? `${activeVehicleCount} xe đang phát GPS` : "Đang kết nối GPS"}</span>
          </Badge>
        </div>

        {/* Nút thao tác nhanh chuyển vùng Hà Nội / TP.HCM */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => panToCity([105.8544, 21.0285], 12)}
            className="h-7 text-xs font-semibold px-2 cursor-pointer hover:bg-accent"
          >
            Hà Nội
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => panToCity([106.6297, 10.8231], 12)}
            className="h-7 text-xs font-semibold px-2 cursor-pointer hover:bg-accent"
          >
            TP.HCM
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => panToCity([105.8544, 21.0285], 11)}
            className="h-7 w-7 cursor-pointer"
            title="Đặt lại góc nhìn"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      {/* Map Container Body */}
      <CardContent className="p-0 flex-1 relative h-full w-full">
        <MapContainer
          center={[105.8544, 21.0285]}
          zoom={12}
          onMapLoad={handleMapLoad}
          className="h-full w-full rounded-none border-0"
        />

        {/* Chú thích bản đồ (Map Legend) */}
        <div className="absolute bottom-3 left-3 z-10 rounded-lg bg-card/90 backdrop-blur-md p-2.5 shadow-md border border-border/70 text-[11px] space-y-1.5 select-none pointer-events-auto">
          <div className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider mb-1">
            Chú thích phương tiện
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              <span>Sẵn sàng</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
              <span>Đang giao</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
              <span>Sắp quá tải</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
              <span>Có vấn đề</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2 pt-0.5 border-t border-border/40">
              <span className="flex h-3 w-3 items-center justify-center rounded bg-blue-700 text-[8px] text-white font-bold">
                K
              </span>
              <span>Kho trung chuyển & Điểm giao</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
