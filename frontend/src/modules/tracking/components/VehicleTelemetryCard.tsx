import React from "react";
import {
  X,
  Truck,
  Phone,
  Gauge,
  Fuel,
  Navigation,
  Compass,
  MapPin,
  AlertTriangle,
  Zap,
  Thermometer,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { StatusBadge } from "@/shared/components/common/StatusBadge";
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
  const isAlert = trackedVehicle.status === "ALERT";

  // Mô phỏng thông số Telematics cảm biến xe tải thông minh
  const engineRpm = isMoving ? Math.round(1400 + (telemetry.speedKmH * 15)) : 750;
  const engineTemp = isMoving ? 88 : 82;
  const batteryVolt = 24.2;

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[410px] z-20 animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl overflow-hidden text-card-foreground">
        {/* 1. Header: Biển số xe, Loại xe, Nút đóng */}
        <div className="p-3.5 border-b border-border bg-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold text-xs uppercase border border-primary/30 shadow-2xs">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-sm text-foreground">
                  {telemetry.plateNumber}
                </span>
                <StatusBadge
                  label={isMoving ? "Đang chạy" : "Dừng đỗ"}
                  variant={isMoving ? "emerald" : "slate"}
                  pulseDot={isMoving}
                  size="xs"
                />
              </div>
              <span className="text-xs text-muted-foreground block truncate">
                {vehicle
                  ? `${vehicle.brand} ${vehicle.model}${vehicle.capacityWeight ? ` (${vehicle.capacityWeight.toLocaleString()} kg)` : ""}`
                  : "Phương tiện vận tải"}
              </span>

            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Đóng bảng thông tin"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2. Telemetry Gauges Grid */}
        <div className="p-3.5 space-y-3 text-xs">
          {/* Cảnh báo vi phạm nếu có */}
          {isOverspeed && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold text-[11px] flex items-center gap-2 animate-pulse">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Vượt tốc độ an toàn đô thị (Hiện tại: {telemetry.speedKmH}/60 km/h)</span>
            </div>
          )}

          {/* Grid chỉ số vận hành tức thời */}
          <div className="grid grid-cols-3 gap-2">
            {/* Vận tốc */}
            <div className="p-2.5 rounded-xl border border-border bg-muted/20 text-center space-y-0.5">
              <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <Gauge className="h-3 w-3 text-primary" /> Vận tốc
              </span>
              <div className="text-base font-bold font-mono text-primary tabular-nums">
                {telemetry.speedKmH}{" "}
                <span className="text-[10px] font-normal text-muted-foreground">km/h</span>
              </div>
            </div>

            {/* Nhiên liệu */}
            <div className="p-2.5 rounded-xl border border-border bg-muted/20 text-center space-y-0.5">
              <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <Fuel className="h-3 w-3 text-emerald-500" /> Nhiên liệu
              </span>
              <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {telemetry.fuelPercent}%
              </div>
            </div>

            {/* Hướng lái */}
            <div className="p-2.5 rounded-xl border border-border bg-muted/20 text-center space-y-0.5">
              <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <Compass className="h-3 w-3 text-amber-500" /> Hướng lái
              </span>
              <div className="text-base font-bold font-mono text-foreground tabular-nums">
                {telemetry.bearing}°
              </div>
            </div>
          </div>

          {/* Telematics Động cơ & Cảm biến IoT */}
          <div className="grid grid-cols-3 gap-2 bg-muted/30 p-2 rounded-xl border border-border/60 text-[10px]">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-primary shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[9px]">Vòng tua RPM</span>
                <b className="font-mono">{engineRpm} rpm</b>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Thermometer className="h-3 w-3 text-amber-500 shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[9px]">Nhiệt động cơ</span>
                <b className="font-mono">{engineTemp}°C</b>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-blue-500 shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[9px]">Bình ắc quy</span>
                <b className="font-mono">{batteryVolt}V</b>
              </div>
            </div>
          </div>

          {/* Tuyến đường & Hành trình đang phụ trách */}
          {route && (
            <div className="p-2.5 rounded-xl border border-border bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[11px] text-foreground flex items-center gap-1">
                  <Navigation className="h-3 w-3 text-primary" />
                  Lộ trình: {route.routeCode}
                </span>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {route.totalDistance} km • ~{route.estimatedDuration}p
                </Badge>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Số điểm giao: {route.stops?.length || 0} trạm</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Đang giao hàng
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
                  {driver?.phone || "0971-888-999"}
                </span>
              </div>
            </div>

            {driver?.phone && (
              <a
                href={`tel:${driver.phone}`}
                className="p-1.5 rounded-lg bg-card hover:bg-accent text-foreground border border-border shadow-2xs transition-colors cursor-pointer"
                title="Gọi tài xế trực tiếp"
              >
                <Phone className="h-3.5 w-3.5 text-primary" />
              </a>
            )}
          </div>
        </div>

        {/* 3. Footer: Tọa độ GPS & Nút Định vị lại */}
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
            Định vị xe (FlyTo)
          </Button>
        </div>
      </div>
    </div>
  );
};
