import React from "react";
import {
  X,
  Truck,
  Fuel,
  Gauge,
  Calendar,
  Wrench,
  User,
  Phone,
  CheckCircle2,
  Navigation,
  PowerOff,
  Edit,
  Package,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { VehicleStatusBadge, VehicleInspectionBadge } from "./VehicleStatusBadge";
import type { EnrichedVehicle } from "../hooks/useVehicles";
import type { VehicleStatus } from "@/core/types/logistics";

interface VehicleDetailDrawerProps {
  vehicle: EnrichedVehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (vehicle: EnrichedVehicle) => void;
  onUpdateStatus: (id: string, status: VehicleStatus) => void;
}

export const VehicleDetailDrawer: React.FC<VehicleDetailDrawerProps> = ({
  vehicle,
  isOpen,
  onClose,
  onEdit,
  onUpdateStatus,
}) => {
  if (!isOpen || !vehicle) return null;

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
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold text-base border border-primary/30 shadow-2xs">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground font-mono">
                    {vehicle.licensePlate}
                  </h3>
                  <Badge variant="outline" className="text-[10px]">
                    {vehicle.type}
                  </Badge>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {vehicle.vehicleCode} • {vehicle.brand} {vehicle.model}
                </span>
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
            {/* 1. Trạng thái & Quick Switcher */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Trạng thái vận hành:</span>
                <VehicleStatusBadge status={vehicle.status} />
              </div>

              <div className="pt-2 border-t border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                  Chuyển đổi trạng thái xe:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    variant={vehicle.status === "AVAILABLE" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdateStatus(vehicle.id, "AVAILABLE")}
                    className="h-8 text-xs gap-1.5 justify-start cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Sẵn sàng
                  </Button>
                  <Button
                    variant={vehicle.status === "EN_ROUTE" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdateStatus(vehicle.id, "EN_ROUTE")}
                    className="h-8 text-xs gap-1.5 justify-start cursor-pointer"
                  >
                    <Navigation className="h-3.5 w-3.5 text-primary" />
                    Chạy tuyến
                  </Button>
                  <Button
                    variant={vehicle.status === "MAINTENANCE" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdateStatus(vehicle.id, "MAINTENANCE")}
                    className="h-8 text-xs gap-1.5 justify-start cursor-pointer"
                  >
                    <Wrench className="h-3.5 w-3.5 text-amber-500" />
                    Bảo dưỡng
                  </Button>
                  <Button
                    variant={vehicle.status === "OFFLINE" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdateStatus(vehicle.id, "OFFLINE")}
                    className="h-8 text-xs gap-1.5 justify-start cursor-pointer"
                  >
                    <PowerOff className="h-3.5 w-3.5 text-muted-foreground" />
                    Ngưng dùng
                  </Button>
                </div>
              </div>
            </div>

            {/* 2. Thông số kỹ thuật xe & Tải trọng */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-primary" />
                Thông số tải trọng & Định mức
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-muted/40 space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">Tải trọng tối đa</span>
                  <span className="font-bold font-mono text-foreground text-sm">
                    {vehicle.capacityWeight.toLocaleString("vi-VN")} kg
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/40 space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">Thể tích thùng</span>
                  <span className="font-bold font-mono text-foreground text-sm">
                    {vehicle.capacityVolume} m³
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/40 space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">Đồng hồ ODO</span>
                  <span className="font-bold font-mono text-foreground text-sm">
                    {vehicle.currentMileage.toLocaleString("vi-VN")} km
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/40 space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">Nhiên liệu còn lại</span>
                  <span
                    className={`font-bold font-mono text-sm ${
                      vehicle.fuelPercent <= 20
                        ? "text-rose-500"
                        : vehicle.fuelPercent <= 40
                        ? "text-amber-500"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {vehicle.fuelPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Hồ sơ Pháp lý & Đăng kiểm */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Hồ sơ Đăng kiểm & Pháp lý
                </h4>
                <VehicleInspectionBadge expiryDate={vehicle.inspectionExpiryDate} showDetails={true} />
              </div>

              <div className="space-y-2 text-xs bg-muted/20 p-3 rounded-lg border border-border/60">
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Số tem kiểm định:</span>
                  <span className="font-mono font-bold text-foreground">
                    {vehicle.inspectionCertificateNumber || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Đơn vị kiểm định:</span>
                  <span className="font-medium text-foreground text-right">
                    {vehicle.inspectionCenter || "Chưa có thông tin"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Lần kiểm định gần nhất:</span>
                  <span className="font-mono text-foreground">
                    {vehicle.lastInspectionDate || "---"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Hạn đăng kiểm tiếp theo:</span>
                  <span className="font-mono font-bold text-foreground">
                    {vehicle.inspectionExpiryDate || "---"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">Hạn bảo hiểm TNDS:</span>
                  <span className="font-mono font-semibold text-primary">
                    {vehicle.insuranceExpiryDate || "---"}
                  </span>
                </div>
              </div>

              {vehicle.inspectionNotes && (
                <div className="text-[11px] p-2.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                  <span className="font-bold block mb-0.5">Ghi chú kiểm định:</span>
                  {vehicle.inspectionNotes}
                </div>
              )}
            </div>

            {/* 4. Kế hoạch bảo dưỡng định kỳ */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
              <h4 className="text-xs font-bold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  Kế hoạch bảo dưỡng kỹ thuật
                </span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">Lần bảo dưỡng kế tiếp:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {vehicle.nextMaintenanceDate}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-muted-foreground">Tình trạng máy móc:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Đạt tiêu chuẩn vận hành
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Tài xế phụ trách */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                Tài xế đang quản lý xe
              </h4>
              {vehicle.driver ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                        {vehicle.driver.fullName.charAt(0)}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-foreground">{vehicle.driver.fullName}</h5>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {vehicle.driver.driverCode} • GPLX Hạng {vehicle.driver.licenseType}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`tel:${vehicle.driver.phone}`}
                      className="p-2 rounded-lg bg-muted hover:bg-accent text-foreground transition-colors"
                      title="Gọi tài xế"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                  Phương tiện chưa được gán tài xế phụ trách cố định
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 text-xs cursor-pointer"
            >
              Đóng
            </Button>
            <Button
              variant="default"
              onClick={() => {
                onClose();
                onEdit(vehicle);
              }}
              className="flex-1 gap-2 text-xs font-semibold cursor-pointer"
            >
              <Edit className="h-4 w-4" />
              Chỉnh sửa thông tin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
