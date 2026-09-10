import React from "react";
import {
  MoreVertical,
  Eye,
  Edit,
  Navigation,
  CheckCircle2,
  XCircle,
  Trash2,
  Truck,
  User,
  Fuel,
  Coins,
  Clock,
  MapPin,
  Building2,
  Play,
  Copy,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/shared/components/ui/dropdown-menu";
import { RouteStatusBadge } from "./RouteStatusBadge";
import type { RouteStatus } from "@/core/types/logistics";
import type { EnrichedRoute } from "../hooks/useRoutes";
import { cn } from "@/shared/utils/cn";

interface RouteTableRowProps {
  route: EnrichedRoute;
  isSelected?: boolean;
  onSelect: (route: EnrichedRoute) => void;
  onViewDetail: (route: EnrichedRoute) => void;
  onFocusMap?: (route: EnrichedRoute) => void;
  onEdit: (route: EnrichedRoute) => void;
  onDuplicate?: (route: EnrichedRoute) => void;
  onUpdateStatus: (id: string, status: RouteStatus) => void;
  onDelete: (route: EnrichedRoute) => void;
}

export const RouteTableRow: React.FC<RouteTableRowProps> = ({
  route,
  isSelected = false,
  onSelect,
  onViewDetail,
  onFocusMap,
  onEdit,
  onDuplicate,
  onUpdateStatus,
  onDelete,
}) => {
  return (
    <tr
      onClick={() => onSelect(route)}
      className={cn(
        "group border-b border-border/60 hover:bg-muted/40 transition-colors cursor-pointer text-xs",
        isSelected && "bg-primary/5 dark:bg-primary/10 border-primary/30"
      )}
    >
      {/* 1. Mã & Tên Tuyến */}
      <td className="py-3 px-4 min-w-[220px]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 flex-nowrap">
            <span className="font-bold text-foreground group-hover:text-primary transition-colors text-xs sm:text-sm whitespace-nowrap">
              {route.routeName || route.routeCode}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] whitespace-nowrap">
            <span className="font-mono font-semibold text-foreground/80 bg-muted/80 px-1.5 py-0.2 rounded border border-border/50 shrink-0">
              {route.routeCode}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
              <Building2 className="h-2.5 w-2.5 shrink-0" />
              <span>{route.warehouse?.name?.replace("Tổng kho ", "").replace("Kho Trung chuyển ", "") || "Kho"}</span>
            </span>
          </div>
        </div>
      </td>

      {/* 2. Tài Xế & Phương Tiện */}
      <td className="py-3 px-4 min-w-[170px] whitespace-nowrap">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <User className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{route.driver?.fullName || "Chưa phân tài"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <Truck className="h-3 w-3 shrink-0" />
            <span>{route.vehicle?.licensePlate || "Chưa gán xe"} ({route.vehicle?.brand || "Truck"})</span>
          </div>
        </div>
      </td>

      {/* 3. Tiến Độ Chặng Giao (Stops) */}
      <td className="py-3 px-4 min-w-[170px] whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              Điểm giao: <strong className="font-mono text-foreground">{route.completedStopsCount}/{route.totalStopsCount}</strong>
            </span>
            <span
              className={cn(
                "font-bold font-mono px-1.5 py-0.2 rounded text-[10px]",
                route.progressPercent === 100
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : route.progressPercent > 0
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
              )}
            >
              {route.progressPercent}%
            </span>
          </div>

          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                route.progressPercent === 100 ? "bg-emerald-500" : "bg-primary"
              )}
              style={{ width: `${route.progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span>{route.totalWeightKg || 0} kg hàng</span>
            <span>{route.totalVolumeM3 || 0} m³</span>
          </div>
        </div>
      </td>

      {/* 4. Cự Ly & Thời Gian */}
      <td className="py-3 px-4 min-w-[130px] whitespace-nowrap">
        <div className="flex flex-col gap-0.5 text-[11px]">
          <div className="flex items-center gap-1 font-bold font-mono text-foreground">
            <Navigation className="h-3 w-3 text-primary shrink-0" />
            <span>{route.totalDistance} km</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
            <Clock className="h-3 w-3 shrink-0" />
            <span>~{route.estimatedDuration} phút</span>
          </div>
        </div>
      </td>

      {/* 5. Chi Phí Ước Tính (Nhiên Liệu & BOT) */}
      <td className="py-3 px-4 min-w-[140px] whitespace-nowrap">
        <div className="flex flex-col gap-0.5 text-[11px] font-mono">
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <Fuel className="h-3 w-3 shrink-0" />
            <span>~{route.fuelEstLiters || 0} Lít Dầu</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-[10px]">
            <Coins className="h-3 w-3 shrink-0" />
            <span>BOT: {(route.tollFeeEstVND || 0).toLocaleString()}đ</span>
          </div>
        </div>
      </td>

      {/* 6. Trạng Thái Tuyến */}
      <td className="py-3 px-4 min-w-[120px] whitespace-nowrap">
        <RouteStatusBadge status={route.status} />
      </td>

      {/* 7. Menu Thao Tác */}
      <td className="py-3 px-4 text-right w-10 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 shadow-lg">
            <DropdownMenuItem
              onClick={() => onViewDetail(route)}
              className="gap-2 cursor-pointer text-xs font-semibold"
            >
              <Eye className="h-3.5 w-3.5 text-primary" />
              <span>Xem chi tiết & Chặng dừng</span>
            </DropdownMenuItem>

            {onFocusMap && (
              <DropdownMenuItem
                onClick={() => onFocusMap(route)}
                className="gap-2 cursor-pointer text-xs"
              >
                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                <span>Xem trên bản đồ</span>
              </DropdownMenuItem>
            )}

            {route.status === "PLANNED" && (
              <DropdownMenuItem
                onClick={() => onUpdateStatus(route.id, "ACTIVE")}
                className="gap-2 cursor-pointer text-xs text-amber-600 font-semibold"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Bắt đầu chạy tuyến</span>
              </DropdownMenuItem>
            )}

            {route.status === "ACTIVE" && (
              <DropdownMenuItem
                onClick={() => onUpdateStatus(route.id, "COMPLETED")}
                className="gap-2 cursor-pointer text-xs text-emerald-600 font-semibold"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Đánh dấu hoàn thành</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => onEdit(route)}
              className="gap-2 cursor-pointer text-xs"
            >
              <Edit className="h-3.5 w-3.5 text-amber-500" />
              <span>Chỉnh sửa thông số</span>
            </DropdownMenuItem>

            {onDuplicate && (
              <DropdownMenuItem
                onClick={() => onDuplicate(route)}
                className="gap-2 cursor-pointer text-xs text-blue-600 dark:text-blue-400 font-medium"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Nhân bản tuyến này</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 text-xs cursor-pointer">
                <Navigation className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Đổi trạng thái</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                <DropdownMenuItem onClick={() => onUpdateStatus(route.id, "PLANNED")} className="gap-2 text-xs cursor-pointer">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span>Đã lập lịch</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus(route.id, "ACTIVE")} className="gap-2 text-xs cursor-pointer">
                  <Navigation className="h-3.5 w-3.5 text-amber-500" />
                  <span>Đang chạy</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus(route.id, "COMPLETED")} className="gap-2 text-xs cursor-pointer">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Hoàn thành</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus(route.id, "CANCELLED")} className="gap-2 text-xs cursor-pointer">
                  <XCircle className="h-3.5 w-3.5 text-rose-500" />
                  <span>Hủy tuyến</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => onDelete(route)}
              className="gap-2 cursor-pointer text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Xóa tuyến</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};
