import React, { useEffect, useRef, useCallback } from "react";
import { type Map, Marker, Popup, type LngLatBoundsLike } from "maplibre-gl";
import { Navigation, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { MapContainer } from "@/shared/components/map/MapContainer";
import { useTrackingStore } from "@/shared/stores/trackingStore";
import type { Driver, Order, VehicleTelemetry, Warehouse } from "@/core/types/logistics";
import type { DriverCandidate } from "../utils/driverScoring";

interface DispatchMapProps {
  selectedOrder: Order | null;
  selectedWarehouse?: Warehouse;
  recommendedDriver?: DriverCandidate | null;
  warehouses: Warehouse[];
  drivers: Driver[];
  onSelectDriverMarker?: (driverId: string) => void;
  className?: string;
}

export const DispatchMap: React.FC<DispatchMapProps> = ({
  selectedOrder,
  selectedWarehouse,
  recommendedDriver,
  warehouses,
  drivers,
  onSelectDriverMarker,
  className,
}) => {
  const mapInstanceRef = useRef<Map | null>(null);
  const vehicleMarkersRef = useRef<Record<string, { marker: Marker; element: HTMLElement }>>({});
  const warehouseMarkersRef = useRef<Marker[]>([]);
  const orderMarkersRef = useRef<Marker[]>([]);

  // Bảng màu marker tài xế
  const getMarkerStatusStyle = useCallback(
    (driverId?: string, vehicleId?: string) => {
      if (vehicleId === "veh-12" || vehicleId === "veh-05") {
        return {
          bg: "bg-rose-600",
          ring: "ring-rose-500/40",
          label: "Có vấn đề",
        };
      }

      const driver = drivers.find((d) => d.id === driverId);
      if (!driver) {
        return {
          bg: "bg-blue-600",
          ring: "ring-blue-500/40",
          label: "Đang giao",
        };
      }

      if (driver.status === "AVAILABLE") {
        return {
          bg: "bg-emerald-600",
          ring: "ring-emerald-500/40",
          label: "Sẵn sàng",
        };
      }

      if (driver.currentDeliveryCount >= 4) {
        return {
          bg: "bg-amber-600",
          ring: "ring-amber-500/40",
          label: "Sắp quá tải",
        };
      }

      return {
        bg: "bg-blue-600",
        ring: "ring-blue-500/40",
        label: "Đang giao",
      };
    },
    [drivers]
  );

  // Cập nhật marker tài xế mượt mà từ GPS telemetry
  const updateVehicleMarker = useCallback(
    (telemetry: VehicleTelemetry) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const existing = vehicleMarkersRef.current[telemetry.vehicleId];
      const isSelectedDriver = recommendedDriver?.driver.id === telemetry.driverId;
      const statusStyle = getMarkerStatusStyle(telemetry.driverId, telemetry.vehicleId);

      if (existing) {
        existing.marker.setLngLat([telemetry.coordinates[0], telemetry.coordinates[1]]);

        const arrowEl = existing.element.querySelector(".vehicle-arrow") as HTMLElement;
        if (arrowEl) {
          arrowEl.style.transform = `rotate(${telemetry.bearing}deg)`;
        }

        if (isSelectedDriver) {
          existing.element.classList.add("scale-125", "z-30");
        } else {
          existing.element.classList.remove("scale-125", "z-30");
        }
      } else {
        const el = document.createElement("div");
        el.className = `group relative flex items-center justify-center cursor-pointer select-none transition-transform ${
          isSelectedDriver ? "scale-125 z-30" : ""
        }`;
        el.style.width = "32px";
        el.style.height = "32px";

        el.innerHTML = `
          <div class="relative flex items-center justify-center w-7 h-7 rounded-full ${statusStyle.bg} text-white shadow-md ring-2 ${statusStyle.ring}">
            <svg class="vehicle-arrow w-3.5 h-3.5 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor" style="transform: rotate(${telemetry.bearing}deg)">
              <polygon points="12,2 19,21 12,17 5,21" />
            </svg>
            <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${statusStyle.bg} border-2 border-card"></span>
          </div>
        `;

        const popupContent = document.createElement("div");
        popupContent.className = "p-2 min-w-[180px] text-xs font-sans space-y-1 text-foreground";
        popupContent.innerHTML = `
          <div class="font-bold text-foreground border-b border-border pb-1 flex justify-between">
            <span>${telemetry.driverName}</span>
            <span class="text-[10px] text-primary">${telemetry.plateNumber}</span>
          </div>
          <div class="text-[11px] text-muted-foreground">Vận tốc: <b>${telemetry.speedKmH} km/h</b></div>
          <div class="text-[10px] text-emerald-600 font-semibold">${statusStyle.label}</div>
        `;

        const popup = new Popup({ offset: 12, closeButton: false }).setDOMContent(popupContent);

        el.addEventListener("click", () => {
          if (telemetry.driverId && onSelectDriverMarker) {
            onSelectDriverMarker(telemetry.driverId);
          }
        });

        const marker = new Marker({ element: el })
          .setLngLat([telemetry.coordinates[0], telemetry.coordinates[1]])
          .setPopup(popup)
          .addTo(map);

        vehicleMarkersRef.current[telemetry.vehicleId] = { marker, element: el };
      }
    },
    [getMarkerStatusStyle, onSelectDriverMarker, recommendedDriver]
  );

  // Khi MapLibre tải xong
  const handleMapLoad = useCallback(
    (map: Map) => {
      mapInstanceRef.current = map;

      // 1. Vẽ các kho bãi
      warehouses.forEach((wh) => {
        const el = document.createElement("div");
        el.className = "flex items-center justify-center w-7 h-7 rounded-lg bg-blue-700 text-white shadow-md ring-2 ring-blue-400/40 cursor-pointer transition-transform hover:scale-110";
        el.innerHTML = `
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        `;

        const popup = new Popup({ offset: 12 }).setHTML(`
          <div class="p-1.5 text-xs text-foreground font-sans">
            <div class="font-bold">${wh.name}</div>
            <div class="text-[11px] text-muted-foreground">Kho xuất phát</div>
          </div>
        `);

        const m = new Marker({ element: el })
          .setLngLat([wh.longitude, wh.latitude])
          .setPopup(popup)
          .addTo(map);

        warehouseMarkersRef.current.push(m);
      });

      // 2. Nạp markers xe từ trackingStore snapshot ban đầu
      const initialVehicles = useTrackingStore.getState().vehicles;
      Object.values(initialVehicles).forEach(updateVehicleMarker);
    },
    [warehouses, updateVehicleMarker]
  );

  // Cập nhật tuyến lộ trình khi chọn đơn hàng
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Dọn dẹp markers đơn cũ
    orderMarkersRef.current.forEach((m) => m.remove());
    orderMarkersRef.current = [];

    // Xóa layer tuyến cũ nếu có
    if (map.getLayer("dispatch-route-line")) {
      map.removeLayer("dispatch-route-line");
    }
    if (map.getSource("dispatch-route-source")) {
      map.removeSource("dispatch-route-source");
    }

    if (!selectedOrder) return;

    // Tọa độ kho lấy hàng
    const wh = selectedWarehouse || warehouses[0];
    const pickupCoords: [number, number] = wh
      ? [wh.longitude, wh.latitude]
      : [105.8544, 21.0285];

    // Tọa độ điểm giao
    const deliveryCoords: [number, number] = [
      selectedOrder.receiverLongitude,
      selectedOrder.receiverLatitude,
    ];

    // Marker Điểm giao hàng (Delivery Destination)
    const delEl = document.createElement("div");
    delEl.className = "flex items-center justify-center w-7 h-7 rounded-full bg-rose-600 text-white font-bold shadow-lg ring-4 ring-rose-400/40 animate-bounce cursor-pointer";
    delEl.innerHTML = `
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    `;

    const delPopup = new Popup({ offset: 14 }).setHTML(`
      <div class="p-2 text-xs font-sans space-y-1 text-foreground">
        <div class="font-bold text-rose-600">Đơn ${selectedOrder.orderCode}</div>
        <div class="text-[11px] font-medium">${selectedOrder.receiverName}</div>
        <div class="text-[10px] text-muted-foreground line-clamp-2">${selectedOrder.receiverAddress}</div>
      </div>
    `);

    const delMarker = new Marker({ element: delEl })
      .setLngLat(deliveryCoords)
      .setPopup(delPopup)
      .addTo(map);

    orderMarkersRef.current.push(delMarker);

    // Vẽ đường nối tuyến (Route line) giữa Kho và Điểm giao
    try {
      map.addSource("dispatch-route-source", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [pickupCoords, deliveryCoords],
          },
        },
      });

      map.addLayer({
        id: "dispatch-route-line",
        type: "line",
        source: "dispatch-route-source",
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
    } catch {
      // Bỏ qua nếu map chưa sẵn sàng
    }

    // Tự động căn khung hình (fitBounds) bao quát toàn bộ lộ trình
    const minLng = Math.min(pickupCoords[0], deliveryCoords[0]);
    const maxLng = Math.max(pickupCoords[0], deliveryCoords[0]);
    const minLat = Math.min(pickupCoords[1], deliveryCoords[1]);
    const maxLat = Math.max(pickupCoords[1], deliveryCoords[1]);

    const bounds: LngLatBoundsLike = [
      [minLng - 0.02, minLat - 0.02],
      [maxLng + 0.02, maxLat + 0.02],
    ];

    map.fitBounds(bounds, { padding: 60, duration: 800 });
  }, [selectedOrder, selectedWarehouse, warehouses]);

  // Đăng ký trackingStore nhận luồng GPS mà không re-render React component
  useEffect(() => {
    const unsubscribe = useTrackingStore.subscribe((state) => {
      for (const telemetry of Object.values(state.vehicles)) {
        updateVehicleMarker(telemetry);
      }
    });

    return () => {
      unsubscribe();
      Object.values(vehicleMarkersRef.current).forEach(({ marker }) => marker.remove());
      vehicleMarkersRef.current = {};
      warehouseMarkersRef.current.forEach((m) => m.remove());
      warehouseMarkersRef.current = [];
      orderMarkersRef.current.forEach((m) => m.remove());
      orderMarkersRef.current = [];
    };
  }, [updateVehicleMarker]);

  const resetMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({ center: [105.8544, 21.0285], zoom: 12, essential: true });
    }
  };

  return (
    <Card className={`relative flex flex-col h-[680px] lg:h-[720px] overflow-hidden border-border/80 shadow-xs ${className || ""}`}>
      {/* Header */}
      <CardHeader className="py-2.5 px-4 border-b border-border/60 shrink-0 bg-card/70 backdrop-blur-xs flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            <span>Bản đồ giám sát lộ trình</span>
          </CardTitle>
          {selectedOrder && (
            <Badge variant="info" className="font-mono text-[10px] font-semibold py-0">
              Đang chọn: {selectedOrder.orderCode}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={resetMapView}
            className="h-7 text-xs font-semibold gap-1 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">Đặt lại góc nhìn</span>
          </Button>
        </div>
      </CardHeader>

      {/* Map Container */}
      <CardContent className="p-0 flex-1 relative h-full w-full">
        <MapContainer
          center={[105.8544, 21.0285]}
          zoom={12}
          onMapLoad={handleMapLoad}
          className="h-full w-full rounded-none border-0"
        />

        {/* Chú thích bản đồ điều phối */}
        <div className="absolute bottom-3 left-3 z-10 rounded-lg bg-card/90 backdrop-blur-md p-2 shadow-md border border-border/70 text-[10px] space-y-1 select-none pointer-events-auto">
          <div className="font-bold text-muted-foreground uppercase text-[9px] tracking-wider mb-0.5">
            Trạng thái điều phối
          </div>
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              <span>Sẵn sàng</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
              <span>Đang giao</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
              <span>Sắp quá tải</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
              <span>Có vấn đề</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-1 border-t border-border/40">
            <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
            <span className="font-semibold text-rose-600 dark:text-rose-400">Điểm giao đã chọn</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
