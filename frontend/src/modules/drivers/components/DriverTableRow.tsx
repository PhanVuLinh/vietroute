import React from "react";
import {
  Phone,
  Truck,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle2,
  Coffee,
  PowerOff,
  ShieldAlert,
  AlertTriangle,
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
import { DriverStatusBadge } from "./DriverStatusBadge";
import type { EnrichedDriver } from "../hooks/useDrivers";
import type { DriverStatus } from "@/core/types/logistics";

interface DriverTableRowProps {
  driver: EnrichedDriver;
  onViewDetail: (driver: EnrichedDriver) => void;
  onEdit: (driver: EnrichedDriver) => void;
  onUpdateStatus: (id: string, status: DriverStatus) => void;
}

export const DriverTableRow: React.FC<DriverTableRowProps> = ({
  driver,
  onViewDetail,
  onEdit,
  onUpdateStatus,
}) => {
  // Kiểm tra hạn bằng lái
  const isExpiringSoon = React.useMemo(() => {
    if (!driver.licenseExpiredAt) return false;
    const expDate = new Date(driver.licenseExpiredAt);
    const now = new Date();
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diffDays > 0 && diffDays <= 90;
  }, [driver.licenseExpiredAt]);

  const isExpired = React.useMemo(() => {
    if (!driver.licenseExpiredAt) return false;
    return new Date(driver.licenseExpiredAt) < new Date();
  }, [driver.licenseExpiredAt]);

  return (
    <tr className="hover:bg-muted/35 transition-colors border-b border-border/60 group">
      {/* 1. Tài xế & Mã */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs uppercase border border-primary/25 shadow-2xs">
              {driver.fullName.charAt(0)}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${
                driver.status === "AVAILABLE"
                  ? "bg-emerald-500"
                  : driver.status === "BUSY"
                  ? "bg-primary"
                  : driver.status === "ON_BREAK"
                  ? "bg-amber-500"
                  : "bg-muted-foreground"
              }`}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                {driver.fullName}
              </span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground block">
              {driver.driverCode}
            </span>
          </div>
        </div>
      </td>

      {/* 2. Số điện thoại */}
      <td className="py-3 px-4">
        <a
          href={`tel:${driver.phone}`}
          className="inline-flex items-center gap-1.5 text-xs text-foreground/85 hover:text-primary font-mono transition-colors"
        >
          <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>{driver.phone}</span>
        </a>
      </td>

      {/* 3. Giấy phép lái xe */}
      <td className="py-3 px-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="font-mono text-[10px] font-bold px-1.5 py-0">
              Hạng {driver.licenseType}
            </Badge>
            <span className="font-mono text-[11px] text-muted-foreground truncate">
              {driver.licenseNumber}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>Hạn: {driver.licenseExpiredAt}</span>
            {isExpired && (
              <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                <AlertTriangle className="h-3 w-3 shrink-0" /> Hết hạn
              </span>
            )}
            {!isExpired && isExpiringSoon && (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                <AlertTriangle className="h-3 w-3 shrink-0" /> Sắp hết
              </span>
            )}
          </div>
        </div>
      </td>

      {/* 4. Phương tiện phụ trách */}
      <td className="py-3 px-4">
        {driver.vehicle ? (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-primary">
              <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>{driver.vehicle.licensePlate}</span>
            </div>
            <span className="text-[11px] text-muted-foreground block truncate">
              {driver.vehicle.brand} {driver.vehicle.model}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">Chưa gán xe</span>
        )}
      </td>

      {/* 5. Trạng thái */}
      <td className="py-3 px-4">
        <DriverStatusBadge status={driver.status} />
      </td>

      {/* 6. Hiệu suất giao hàng */}
      <td className="py-3 px-4">
        <div className="space-y-1 min-w-[120px]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Hôm nay:</span>
            <span className="font-semibold font-mono tabular-nums text-foreground">
              {driver.todayCompletedDeliveries} đơn
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Đúng hạn:</span>
            <span
              className={`font-semibold font-mono tabular-nums ${
                driver.onTimeRate >= 98
                  ? "text-emerald-600 dark:text-emerald-400"
                  : driver.onTimeRate >= 95
                  ? "text-primary"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {driver.onTimeRate}%
            </span>
          </div>
        </div>
      </td>

      {/* 7. Thao tác */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetail(driver)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
            title="Xem hồ sơ chi tiết"
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
              <DropdownMenuLabel className="text-xs font-semibold">Thao tác tài xế</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onViewDetail(driver)}
                className="text-xs cursor-pointer gap-2"
              >
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                Xem hồ sơ chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(driver)}
                className="text-xs cursor-pointer gap-2"
              >
                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                Chỉnh sửa thông tin
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Đổi trạng thái nhanh
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(driver.id, "AVAILABLE")}
                disabled={driver.status === "AVAILABLE"}
                className="text-xs cursor-pointer gap-2 text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Sẵn sàng nhận đơn
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(driver.id, "ON_BREAK")}
                disabled={driver.status === "ON_BREAK"}
                className="text-xs cursor-pointer gap-2 text-amber-600 dark:text-amber-400"
              >
                <Coffee className="h-3.5 w-3.5" />
                Chuyển nghỉ ca
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(driver.id, "OFFLINE")}
                disabled={driver.status === "OFFLINE"}
                className="text-xs cursor-pointer gap-2 text-muted-foreground"
              >
                <PowerOff className="h-3.5 w-3.5" />
                Ngoại tuyến (Offline)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(driver.id, "SUSPENDED")}
                disabled={driver.status === "SUSPENDED"}
                className="text-xs cursor-pointer gap-2 text-rose-600 dark:text-rose-400"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Tạm khóa tài khoản
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
};
