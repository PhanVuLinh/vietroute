import React from "react";
import {
  X,
  Truck,
  User,
  Phone,
  Gauge,
  Fuel,
  Thermometer,
  Navigation,
  Compass,
  MapPin,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { EnrichedTrackedVehicle } from "../hooks/useTracking";

interface VehicleTelemetryCardProps {
  trackedVehicle: EnrichedTrackedVehicle | null;
  onClose: () => void;
  onFocusVehicle: (coords: [number, number]) => void;
}

export const VehicleTelemetryCard: React.FC<VehicleTelemetryCardProps> = ({
  trackedVehicle,
  onClose,
  onFocusVehicle,
}) => {
  if (!trackedVehicle) return null;

  const { telemetry, vehicle, driver, route } = trackedVehicle;
  const isOverspeed = telemetry.speedKmH > 60;
  const isMoving = telemetry.speedKmH > 0;

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-20 animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl overflow-hidden text-card-foreground">
        {/* 1. Header: Plate, Driver, Close button */}
        <div className="p-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold text-xs uppercase border border-primary/30">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-sm text-foreground">
                  {telemetry.plateNumber}
                </span>
                <Badge
                  variant={isMoving ? "default" : "outline"}
                  className="font-mono text-[10px] px-1.5 py-0"
                >
                  {isMoving ? "Đang chạy" : "Dừng đỗ"}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground block truncate">
                {vehicle ? `${vehicle.brand} ${vehicle.model}` : "Phương tiện vận tải"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2. Telemetry Gauges Grid */}
        <div className="p-3.5 space-y-3 text-xs">
          {/* Cảnh báo vi phạm tốc độ */}
          {isOverspeed && (
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 font-semibold text-[11px] flex items-center gap-2 animate-pulse">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Vượt tốc độ tối đa đô thị (Hiện tại: {telemetry.speedKmH}/60 km/h)</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {/* Tốc độ */}
            <div className="p-2.5 rounded-xl border border-border bg-muted/20 text-center space-y-0.5">
              <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <Gauge className="h-3 w-3" /> Vận tốc
              </span>
              <div className="text-base font-bold font-mono text-primary tabular-nums">
                {telemetry.speedKmH}{" "}
                <span className="text-[10px] font-normal text-muted-foreground">km/h</span>
              </div>
            </div>

            {/* Nhiên liệu */}
            <div className="p-2.5 rounded-xl border border-border bg-muted/20 text-center space-y-0.5">
              <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <Fuel className="h-3 w-3" /> Nhiên liệu
              </span>
              <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {telemetry.fuelPercent}%
              </div>
            </div>

            {/* Hướng lái Bearing */}
            <div className="p-2.5 rounded-xl border border-border bg-muted/20 text-center space-y-0.5">
              <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <Compass className="h-3 w-3" /> Hướng lái
              </span>
              <div className="text-base font-bold font-mono text-foreground tabular-nums">
                {telemetry.bearing}°
              </div>
            </div>
          </div>

          {/* Tuyến đường & Hành trình */}
          {route && (
            <div className="p-2.5 rounded-xl border border-border bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[11px] text-foreground flex items-center gap-1">
                  <Navigation className="h-3 w-3 text-primary" />
                  Tuyến: {route.routeCode}
                </span>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {route.totalDistance} km • {route.estimatedDuration}p
                </Badge>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Số điểm dừng: {route.stops?.length || 0} điểm</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Đang vận chuyển
                </span>
              </div>
            </div>
          )}

          {/* Tài xế phụ trách */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                {telemetry.driverName?.charAt(0) || "T"}
              </div>
              <div>
                <span className="font-semibold text-xs text-foreground block">
                  {telemetry.driverName}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {driver?.phone || "0971..."}
                </span>
              </div>
            </div>

            {driver?.phone && (
              <a
                href={`tel:${driver.phone}`}
                className="p-1.5 rounded-lg bg-muted hover:bg-accent text-foreground border border-border transition-colors"
                title="Gọi tài xế"
              >
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            )}
          </div>
        </div>

        {/* 3. Footer: Fly to vehicle button */}
        <div className="p-2.5 bg-muted/40 border-t border-border flex items-center justify-between">
          <span className="text-[10px] font-mono text-muted-foreground">
            GPS: {telemetry.coordinates[1].toFixed(4)}, {telemetry.coordinates[0].toFixed(4)}
          </span>
          <Button
            variant="default"
            size="sm"
            onClick={() => onFocusVehicle(telemetry.coordinates)}
            className="h-7 px-3 text-xs gap-1 font-semibold cursor-pointer shadow-xs"
          >
            <MapPin className="h-3 w-3" />
            Tâm bản đồ
          </Button>
        </div>
      </div>
    </div>
  );
};
