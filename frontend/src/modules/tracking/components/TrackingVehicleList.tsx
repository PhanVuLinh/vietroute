import React from "react";
import {
  Search,
  Truck,
  Fuel,
  Navigation,
  Radio,
  X,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import type {
  EnrichedTrackedVehicle,
  TrackingFilterStatus,
} from "../hooks/useTracking";

interface TrackingVehicleListProps {
  vehicles: EnrichedTrackedVehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filterStatus: TrackingFilterStatus;
  onFilterChange: (status: TrackingFilterStatus) => void;
}

export const TrackingVehicleList: React.FC<TrackingVehicleListProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl shadow-2xs overflow-hidden">
      {/* 1. Thanh tìm kiếm */}
      <div className="p-3 border-b border-border space-y-2.5 bg-muted/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm biển số, tài xế, mã xe..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* 2. Bộ lọc trạng thái */}
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-muted/60 rounded-lg text-[11px] font-medium">
          <button
            onClick={() => onFilterChange("ALL")}
            className={`py-1 rounded-md text-center transition-all cursor-pointer ${
              filterStatus === "ALL"
                ? "bg-card text-foreground font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => onFilterChange("MOVING")}
            className={`py-1 rounded-md text-center transition-all cursor-pointer ${
              filterStatus === "MOVING"
                ? "bg-card text-primary font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Đang chạy
          </button>
          <button
            onClick={() => onFilterChange("IDLE")}
            className={`py-1 rounded-md text-center transition-all cursor-pointer ${
              filterStatus === "IDLE"
                ? "bg-card text-foreground font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dừng đỗ
          </button>
          <button
            onClick={() => onFilterChange("ALERT")}
            className={`py-1 rounded-md text-center transition-all cursor-pointer ${
              filterStatus === "ALERT"
                ? "bg-card text-rose-600 dark:text-rose-400 font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cảnh báo
          </button>
        </div>
      </div>

      {/* 3. Danh sách các xe */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60">
        {vehicles.length > 0 ? (
          vehicles.map((item) => {
            const isSelected = selectedVehicleId === item.telemetry.vehicleId;
            const isMoving = item.telemetry.speedKmH > 0;
            const isAlert = item.status === "ALERT";

            return (
              <div
                key={item.telemetry.vehicleId}
                onClick={() => onSelectVehicle(item.telemetry.vehicleId)}
                className={`p-3.5 transition-all cursor-pointer select-none hover:bg-muted/40 ${
                  isSelected
                    ? "bg-primary/10 dark:bg-primary/15 border-l-4 border-l-primary"
                    : "border-l-4 border-l-transparent"
                }`}
              >
                {/* Dòng 1: Biển số + Vận tốc */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isAlert
                          ? "bg-rose-500/15 text-rose-600 border-rose-500/30"
                          : isMoving
                          ? "bg-primary/15 text-primary border-primary/30"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-foreground">
                          {item.telemetry.plateNumber}
                        </span>
                        {isAlert && (
                          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {item.telemetry.driverName}
                      </span>
                    </div>
                  </div>

                  {/* Vận tốc Speed Badge */}
                  <div className="text-right">
                    {isMoving ? (
                      <Badge
                        variant="default"
                        className="font-mono text-[11px] font-bold px-2 py-0.5 gap-1 bg-primary text-primary-foreground shadow-2xs"
                      >
                        <Navigation className="h-3 w-3 animate-pulse" />
                        {item.telemetry.speedKmH} km/h
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] text-muted-foreground px-1.5 py-0"
                      >
                        Dừng đỗ (0 km/h)
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Dòng 2: Nhiên liệu & Tuyến đường */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/40">
                  <div className="flex items-center gap-1 font-mono">
                    <Fuel className="h-3 w-3 text-muted-foreground" />
                    <span>{item.telemetry.fuelPercent}% xăng</span>
                  </div>

                  <div className="font-mono text-[10px] flex items-center gap-1 text-muted-foreground/80">
                    <Radio className="h-3 w-3 text-emerald-500" />
                    <span>{item.telemetry.bearing}° hướng lái</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
            <Truck className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="font-semibold text-foreground">Không có xe phù hợp</p>
            <p>Thử điều chỉnh lại từ khóa hoặc bộ lọc.</p>
          </div>
        )}
      </div>

      {/* Footer Số lượng */}
      <div className="p-2.5 bg-muted/20 border-t border-border text-center text-[11px] font-mono text-muted-foreground">
        Tổng số: <span className="font-bold text-foreground">{vehicles.length}</span> phương tiện
      </div>
    </div>
  );
};
