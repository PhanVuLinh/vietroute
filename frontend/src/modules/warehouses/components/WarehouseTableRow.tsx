import React from "react";
import {
  MoreVertical,
  Eye,
  Edit,
  MapPin,
  Trash2,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Phone,
  Clock,
  Layers,
  Boxes,
  ThermometerSnowflake,
  Sun,
  Shuffle,
  ShieldCheck,
  Activity,
  Share2,
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
import {
  WarehouseStatusBadge,
  WarehouseTypeBadge,
  WarehouseRegionBadge,
} from "./WarehouseStatusBadge";
import type { Warehouse, WarehouseStatus } from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

interface WarehouseTableRowProps {
  warehouse: Warehouse;
  isSelected?: boolean;
  onSelect: (warehouse: Warehouse) => void;
  onViewDetail: (warehouse: Warehouse) => void;
  onFocusMap?: (warehouse: Warehouse) => void;
  onEdit: (warehouse: Warehouse) => void;
  onUpdateStatus: (id: string, status: WarehouseStatus) => void;
  onDelete: (warehouse: Warehouse) => void;
}

export const WarehouseTableRow: React.FC<WarehouseTableRowProps> = ({
  warehouse,
  isSelected = false,
  onSelect,
  onViewDetail,
  onFocusMap,
  onEdit,
  onUpdateStatus,
  onDelete,
}) => {
  const occupancyPercent =
    warehouse.capacity > 0
      ? Math.round((warehouse.usedCapacity / warehouse.capacity) * 100)
      : 0;

  const isOverload = occupancyPercent >= 85 || warehouse.status === "FULL";
  const isHighOccupancy = occupancyPercent >= 70 && occupancyPercent < 85;

  const getOccupancyColor = () => {
    if (warehouse.status === "MAINTENANCE") return "bg-amber-500 text-amber-600";
    if (isOverload) return "bg-rose-500 text-rose-600 dark:text-rose-400";
    if (isHighOccupancy) return "bg-amber-500 text-amber-600 dark:text-amber-400";
    return "bg-emerald-500 text-emerald-600 dark:text-emerald-400";
  };

  const getStorageIcon = () => {
    switch (warehouse.storageType) {
      case "COLD":
        return <ThermometerSnowflake className="h-3 w-3 text-cyan-500 inline mr-1" title="Kho lạnh" />;
      case "DRY":
        return <Sun className="h-3 w-3 text-amber-500 inline mr-1" title="Kho khô tiêu chuẩn" />;
      default:
        return <Shuffle className="h-3 w-3 text-purple-500 inline mr-1" title="Kho hỗn hợp (Khô + Lạnh)" />;
    }
  };

  return (
    <tr
      onClick={() => onSelect(warehouse)}
      className={cn(
        "group border-b border-border/60 hover:bg-muted/40 transition-colors cursor-pointer text-xs",
        isSelected && "bg-primary/5 dark:bg-primary/10 border-primary/30"
      )}
    >
      {/* 1. Thông tin Hub & Mã */}
      <td className="py-3.5 px-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">
              {warehouse.name}
            </span>
            <WarehouseRegionBadge region={warehouse.region} />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
            <span className="font-mono font-semibold text-foreground/80 bg-muted/70 px-1.5 py-0.5 rounded border border-border/50">
              {warehouse.code}
            </span>
            <span>•</span>
            <WarehouseTypeBadge type={warehouse.type} />
            <span>•</span>
            <span className="flex items-center">
              {getStorageIcon()}
              {warehouse.storageType === "COLD" ? "Kho Lạnh" : warehouse.storageType === "DRY" ? "Kho Khô" : "Hỗn hợp"}
            </span>
          </div>
        </div>
      </td>

      {/* 2. Địa chỉ & Tỉnh thành */}
      <td className="py-3.5 px-4 max-w-[200px]">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground truncate">{warehouse.city}</span>
          <span className="text-[11px] text-muted-foreground truncate" title={warehouse.address}>
            {warehouse.address}
          </span>
        </div>
      </td>

      {/* 3. Công suất & Tỷ lệ lấp đầy */}
      <td className="py-3.5 px-4 min-w-[170px]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-mono font-semibold text-foreground">
              {warehouse.usedCapacity} / {warehouse.capacity} Tấn
            </span>
            <span
              className={cn(
                "font-bold font-mono px-1.5 py-0.2 rounded text-[11px]",
                isOverload
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : isHighOccupancy
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              )}
            >
              {occupancyPercent}%
            </span>
          </div>

          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", getOccupancyColor().split(" ")[0])}
              style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              Pallets: <strong className="font-mono text-foreground/80">{warehouse.usedPallets || 0}</strong>/{warehouse.totalPallets || 0}
            </span>
            <span>
              Sàn: <strong className="font-mono text-foreground/80">{(warehouse.areaSqM || 0).toLocaleString()} m²</strong>
            </span>
          </div>
        </div>
      </td>

      {/* 4. Cổng Dock & Thông lượng Throughput */}
      <td className="py-3.5 px-4">
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex items-center gap-1.5 text-foreground font-medium">
            <Boxes className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>
              <strong className="font-mono">{warehouse.dockDoors || 0}</strong> Cửa Dock
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-mono">
            <Activity className="h-3 w-3 text-blue-500 shrink-0" />
            <span>
              Xuất/Nhập: <strong>{warehouse.dailyInboundTons || 0}</strong> / <strong>{warehouse.dailyOutboundTons || 0}</strong> T
            </span>
          </div>
        </div>
      </td>

      {/* 5. Ban Quản lý Kho */}
      <td className="py-3.5 px-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">{warehouse.managerName || "Chưa phân công"}</span>
          {warehouse.managerPhone && (
            <a
              href={`tel:${warehouse.managerPhone}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-primary hover:underline flex items-center gap-1 font-mono"
            >
              <Phone className="h-2.5 w-2.5" />
              {warehouse.managerPhone}
            </a>
          )}
        </div>
      </td>

      {/* 6. Trạng thái & PCCC */}
      <td className="py-3.5 px-4">
        <div className="flex flex-col gap-1 items-start">
          <WarehouseStatusBadge status={warehouse.status} />
          {warehouse.compliance?.pcccCertificateNumber && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
              <ShieldCheck className="h-2.5 w-2.5 text-emerald-500" />
              <span>PCCC chuẩn</span>
            </span>
          )}
        </div>
      </td>

      {/* 7. Menu Thao tác */}
      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
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
              onClick={() => onViewDetail(warehouse)}
              className="gap-2 cursor-pointer text-xs font-semibold"
            >
              <Eye className="h-3.5 w-3.5 text-primary" />
              <span>Xem chi tiết & Cổng Dock</span>
            </DropdownMenuItem>

            {onFocusMap && (
              <DropdownMenuItem
                onClick={() => onFocusMap(warehouse)}
                className="gap-2 cursor-pointer text-xs"
              >
                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                <span>Xem trên bản đồ</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => onEdit(warehouse)}
              className="gap-2 cursor-pointer text-xs"
            >
              <Edit className="h-3.5 w-3.5 text-amber-500" />
              <span>Chỉnh sửa thông số kho</span>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 text-xs cursor-pointer">
                <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Đổi trạng thái kho</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(warehouse.id, "ACTIVE")}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Hoạt động</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(warehouse.id, "MAINTENANCE")}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <Wrench className="h-3.5 w-3.5 text-amber-500" />
                  <span>Bảo trì bến bãi</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(warehouse.id, "FULL")}
                  className="gap-2 text-xs cursor-pointer"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                  <span>Quá tải / Đầy tải</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => onDelete(warehouse)}
              className="gap-2 cursor-pointer text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Xóa kho bãi</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};
