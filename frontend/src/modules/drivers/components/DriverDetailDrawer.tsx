import React from "react";
import {
  X,
  Phone,
  Truck,
  Award,
  Calendar,
  MapPin,
  CheckCircle2,
  Coffee,
  PowerOff,
  ShieldAlert,
  Gauge,
  Edit,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { DriverStatusBadge } from "./DriverStatusBadge";
import type { EnrichedDriver } from "../hooks/useDrivers";
import type { DriverStatus } from "@/core/types/logistics";

interface DriverDetailDrawerProps {
  driver: EnrichedDriver | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (driver: EnrichedDriver) => void;
  onUpdateStatus: (id: string, status: DriverStatus) => void;
}

export const DriverDetailDrawer: React.FC<DriverDetailDrawerProps> = ({
  driver,
  isOpen,
  onClose,
  onEdit,
  onUpdateStatus,
}) => {
  if (!isOpen || !driver) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-base uppercase border border-primary/30 shadow-2xs">
                {driver.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{driver.fullName}</h3>
                <span className="font-mono text-xs text-muted-foreground">{driver.driverCode}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* 1. Trạng thái & Quick switcher */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Trạng thái hiện tại:</span>
                <DriverStatusBadge status={driver.status} />
              </div>

              <div className="pt-2 border-t border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                  Đổi trạng thái làm việc nhanh:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    variant={driver.status === "AVAILABLE" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdateStatus(driver.id, "AVAILABLE")}
                    className="h-8 text-xs gap-1.5 justify-start cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Sẵn sàng
                  </Button>
                  <Button
                    variant={driver.status === "ON_BREAK" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdateStatus(driver.id, "ON_BREAK")}
                    className="h-8 text-xs gap-1.5 justify-start cursor-pointer"
                  >
                    <Coffee className="h-3.5 w-3.5 text-amber-500" />
                    Nghỉ ca
                  </Button>
                  <Button
                    variant={driver.status === "OFFLINE" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdateStatus(driver.id, "OFFLINE")}
                    className="h-8 text-xs gap-1.5 justify-start cursor-pointer"
                  >
                    <PowerOff className="h-3.5 w-3.5 text-muted-foreground" />
                    Ngoại tuyến
                  </Button>
                  <Button
                    variant={driver.status === "SUSPENDED" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => onUpdateStatus(driver.id, "SUSPENDED")}
                    className="h-8 text-xs gap-1.5 justify-start cursor-pointer"
                  >
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                    Tạm khóa
                  </Button>
                </div>
              </div>
            </div>

            {/* 2. Chỉ số hiệu suất KPI */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4 text-primary" />
                Chỉ số hiệu suất vận hành
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl border border-border bg-card text-center space-y-1">
                  <span className="text-[10px] text-muted-foreground block">Đơn hôm nay</span>
                  <span className="text-base font-bold font-mono text-foreground tabular-nums">
                    {driver.todayCompletedDeliveries}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card text-center space-y-1">
                  <span className="text-[10px] text-muted-foreground block">Đúng hạn (OTD)</span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {driver.onTimeRate}%
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card text-center space-y-1">
                  <span className="text-[10px] text-muted-foreground block">Thành công</span>
                  <span className="text-base font-bold font-mono text-primary tabular-nums">
                    {driver.successRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Giấy phép lái xe */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Giấy phép lái xe (GPLX)</span>
                <Badge variant="outline" className="font-mono text-xs">
                  Hạng {driver.licenseType}
                </Badge>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Số hiệu GPLX:</span>
                  <span className="font-mono font-semibold text-foreground">{driver.licenseNumber}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Ngày hết hạn:</span>
                  <span className="font-mono font-medium text-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {driver.licenseExpiredAt}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">Đang xử lý:</span>
                  <span className="font-mono font-semibold text-primary">
                    {driver.currentDeliveryCount} đơn hàng
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Phương tiện phụ trách */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-primary" />
                Phương tiện đang được giao
              </h4>
              {driver.vehicle ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-primary">
                      {driver.vehicle.licensePlate}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {driver.vehicle.type}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {driver.vehicle.brand} {driver.vehicle.model}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block">Tải trọng:</span>
                      <span className="font-mono font-semibold">
                        {driver.vehicle.capacityWeight} kg ({driver.vehicle.capacityVolume} m³)
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Nhiên liệu:</span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {driver.vehicle.fuelPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                  Tài xế hiện chưa được phân công phương tiện cố định
                </div>
              )}
            </div>

            {/* 5. Vị trí GPS hiện tại */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-rose-500" />
                Tọa độ GPS thời gian thực
              </h4>
              <div className="flex items-center justify-between text-xs font-mono bg-muted/40 p-2.5 rounded-lg">
                <span className="text-muted-foreground">Tọa độ:</span>
                <span className="text-foreground font-semibold">
                  {driver.currentLocation[1].toFixed(4)}° N, {driver.currentLocation[0].toFixed(4)}° E
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
            <a
              href={`tel:${driver.phone}`}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold bg-muted hover:bg-accent border border-border text-foreground transition-colors"
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
              Gọi {driver.phone}
            </a>

            <Button
              variant="default"
              onClick={() => {
                onClose();
                onEdit(driver);
              }}
              className="flex-1 gap-2 text-xs font-semibold cursor-pointer"
            >
              <Edit className="h-4 w-4" />
              Chỉnh sửa hồ sơ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
