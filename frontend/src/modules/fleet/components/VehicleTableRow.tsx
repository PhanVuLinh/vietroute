import React from "react";
import {
  Truck,
  Car,
  Bike,
  User,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle2,
  Wrench,
  PowerOff,
  AlertTriangle,
  Fuel,
  Navigation,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { VehicleStatusBadge } from "./VehicleStatusBadge";
import type { EnrichedVehicle } from "../hooks/useVehicles";
import type { VehicleStatus, VehicleType } from "@/core/types/logistics";

interface VehicleTableRowProps {
  vehicle: EnrichedVehicle;
  onViewDetail: (vehicle: EnrichedVehicle) => void;
  onEdit: (vehicle: EnrichedVehicle) => void;
  onUpdateStatus: (id: string, status: VehicleStatus) => void;
}

const VEHICLE_TYPE_ICONS: Record<VehicleType, React.ElementType> = {
  TRUCK: Truck,
  VAN: Truck,
  CAR: Car,
  MOTORBIKE: Bike,
};

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  TRUCK: "Xe tải",
  VAN: "Xe Van",
  CAR: "Xe bán tải/con",
  MOTORBIKE: "Xe máy",
};

export const VehicleTableRow: React.FC<VehicleTableRowProps> = ({
  vehicle,
  onViewDetail,
  onEdit,
  onUpdateStatus,
}) => {
  const TypeIcon = VEHICLE_TYPE_ICONS[vehicle.type] || Truck;

  // Kiểm tra hạn bảo dưỡng
  const isMaintenanceSoon = React.useMemo(() => {
    if (!vehicle.nextMaintenanceDate) return false;
    const maintDate = new Date(vehicle.nextMaintenanceDate);
    const now = new Date();
    const diffDays = Math.ceil((maintDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diffDays > 0 && diffDays <= 45;
  }, [vehicle.nextMaintenanceDate]);

  const isMaintenanceOverdue = React.useMemo(() => {
    if (!vehicle.nextMaintenanceDate) return false;
    return new Date(vehicle.nextMaintenanceDate) < new Date();
  }, [vehicle.nextMaintenanceDate]);

  return (
    <tr className="hover:bg-muted/35 transition-colors border-b border-border/60 group">
      {/* 1. Biển số & Mã xe */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 shadow-2xs">
            <TypeIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                {vehicle.licensePlate}
              </span>
              <Badge variant="secondary" className="text-[10px] px-1 py-0 font-medium">
                {VEHICLE_TYPE_LABELS[vehicle.type]}
              </Badge>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground block">
              {vehicle.vehicleCode} • {vehicle.brand} {vehicle.model}
            </span>
          </div>
        </div>
      </td>

      {/* 2. Trọng tải & Thể tích */}
      <td className="py-3 px-4">
        <div className="space-y-0.5 text-xs">
          <div className="font-semibold font-mono text-foreground tabular-nums">
            {vehicle.capacityWeight >= 1000
              ? `${(vehicle.capacityWeight / 1000).toFixed(1)} Tấn`
              : `${vehicle.capacityWeight} kg`}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            {vehicle.capacityVolume} m³ • ODO: {vehicle.currentMileage.toLocaleString("vi-VN")} km
          </div>
        </div>
      </td>

      {/* 3. Nhiên liệu */}
      <td className="py-3 px-4">
        <div className="space-y-1.5 w-24">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Fuel className="h-3 w-3 text-muted-foreground" />
            </span>
            <span
              className={`font-mono text-xs font-bold tabular-nums ${
                vehicle.fuelPercent <= 20
                  ? "text-rose-600 dark:text-rose-400"
                  : vehicle.fuelPercent <= 40
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {vehicle.fuelPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                vehicle.fuelPercent <= 20
                  ? "bg-rose-500"
                  : vehicle.fuelPercent <= 40
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${vehicle.fuelPercent}%` }}
            />
          </div>
        </div>
      </td>

      {/* 4. Bảo dưỡng tiếp theo */}
      <td className="py-3 px-4">
        <div className="space-y-0.5 text-xs">
          <div className="font-mono text-muted-foreground">{vehicle.nextMaintenanceDate}</div>
          {isMaintenanceOverdue && (
            <span className="text-rose-600 dark:text-rose-400 font-semibold text-[10px] flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 shrink-0" /> Quá hạn bảo dưỡng
            </span>
          )}
          {!isMaintenanceOverdue && isMaintenanceSoon && (
            <span className="text-amber-600 dark:text-amber-400 font-semibold text-[10px] flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 shrink-0" /> Sắp đến hạn
            </span>
          )}
        </div>
      </td>

      {/* 5. Tài xế phụ trách */}
      <td className="py-3 px-4">
        {vehicle.driver ? (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shrink-0">
              {vehicle.driver.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <span className="font-medium text-xs text-foreground block truncate">
                {vehicle.driver.fullName}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground block">
                {vehicle.driver.phone}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">Chưa phân công</span>
        )}
      </td>

      {/* 6. Trạng thái */}
      <td className="py-3 px-4">
        <VehicleStatusBadge status={vehicle.status} />
      </td>

      {/* 7. Thao tác */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetail(vehicle)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
            title="Xem chi tiết xe"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-semibold">Thao tác xe</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onViewDetail(vehicle)}
                className="text-xs cursor-pointer gap-2"
              >
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                Xem hồ sơ xe
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(vehicle)}
                className="text-xs cursor-pointer gap-2"
              >
                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                Cập nhật thông tin
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Đổi trạng thái
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(vehicle.id, "AVAILABLE")}
                disabled={vehicle.status === "AVAILABLE"}
                className="text-xs cursor-pointer gap-2 text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Sẵn sàng điều động
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(vehicle.id, "EN_ROUTE")}
                disabled={vehicle.status === "EN_ROUTE"}
                className="text-xs cursor-pointer gap-2 text-primary"
              >
                <Navigation className="h-3.5 w-3.5" />
                Chạy tuyến (En Route)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(vehicle.id, "MAINTENANCE")}
                disabled={vehicle.status === "MAINTENANCE"}
                className="text-xs cursor-pointer gap-2 text-amber-600 dark:text-amber-400"
              >
                <Wrench className="h-3.5 w-3.5" />
                Đưa vào bảo dưỡng
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(vehicle.id, "OFFLINE")}
                disabled={vehicle.status === "OFFLINE"}
                className="text-xs cursor-pointer gap-2 text-muted-foreground"
              >
                <PowerOff className="h-3.5 w-3.5" />
                Tạm ngưng hoạt động
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
};
