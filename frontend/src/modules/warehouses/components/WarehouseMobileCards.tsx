import React from "react";
import {
  Building2,
  MapPin,
  Boxes,
  Clock,
  Phone,
  Eye,
  Edit,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Navigation,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
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

interface WarehouseMobileCardsProps {
  warehouses: Warehouse[];
  selectedWarehouseId: string | null;
  onSelectWarehouse: (warehouse: Warehouse) => void;
  onViewDetail: (warehouse: Warehouse) => void;
  onFocusMap?: (warehouse: Warehouse) => void;
  onEdit: (warehouse: Warehouse) => void;
  onUpdateStatus: (id: string, status: WarehouseStatus) => void;
  onDelete: (warehouse: Warehouse) => void;
}

export const WarehouseMobileCards: React.FC<WarehouseMobileCardsProps> = ({
  warehouses,
  selectedWarehouseId,
  onSelectWarehouse,
  onViewDetail,
  onFocusMap,
  onEdit,
  onUpdateStatus,
  onDelete,
}) => {
  if (warehouses.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border">
        <Building2 className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm font-semibold text-foreground">Không có kho bãi phù hợp</p>
        <p className="text-xs text-muted-foreground mt-1">Vui lòng điều chỉnh lại bộ lọc tìm kiếm.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {warehouses.map((wh) => {
        const occupancy =
          wh.capacity > 0 ? Math.round((wh.usedCapacity / wh.capacity) * 100) : 0;
        const isOverload = occupancy >= 85 || wh.status === "FULL";
        const isHigh = occupancy >= 70 && occupancy < 85;
        const isSelected = selectedWarehouseId === wh.id;

        return (
          <Card
            key={wh.id}
            onClick={() => onSelectWarehouse(wh)}
            className={cn(
              "border transition-all cursor-pointer shadow-2xs hover:border-primary/50",
              isSelected && "border-primary ring-2 ring-primary/20 bg-primary/5"
            )}
          >
            <CardContent className="p-4 space-y-3">
              {/* Header: Name + Badges + Menu */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-foreground text-sm leading-tight">
                      {wh.name}
                    </span>
                    <WarehouseRegionBadge region={wh.region} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="font-mono font-semibold text-foreground/80 bg-muted px-1.5 py-0.2 rounded border border-border/50">
                      {wh.code}
                    </span>
                    <span>•</span>
                    <WarehouseTypeBadge type={wh.type} />
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <WarehouseStatusBadge status={wh.status} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 shadow-lg">
                      <DropdownMenuItem onClick={() => onViewDetail(wh)} className="gap-2 text-xs font-semibold">
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>Xem chi tiết & Dock</span>
                      </DropdownMenuItem>
                      {onFocusMap && (
                        <DropdownMenuItem onClick={() => onFocusMap(wh)} className="gap-2 text-xs">
                          <Navigation className="h-3.5 w-3.5 text-blue-500" />
                          <span>Xem trên bản đồ</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(wh)} className="gap-2 text-xs">
                        <Edit className="h-3.5 w-3.5 text-amber-500" />
                        <span>Chỉnh sửa thông số</span>
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2 text-xs">
                          <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Đổi trạng thái</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-40">
                          <DropdownMenuItem onClick={() => onUpdateStatus(wh.id, "ACTIVE")} className="text-xs gap-1.5">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>Hoạt động</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(wh.id, "MAINTENANCE")} className="text-xs gap-1.5">
                            <Wrench className="h-3 w-3 text-amber-500" />
                            <span>Bảo trì</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(wh.id, "FULL")} className="text-xs gap-1.5">
                            <AlertTriangle className="h-3 w-3 text-rose-500" />
                            <span>Quá tải</span>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(wh)}
                        className="gap-2 text-xs text-rose-600 focus:text-rose-600"
                      >
                        <span>Xóa kho</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                <span className="truncate">{wh.address}</span>
              </div>

              {/* Occupancy bar */}
              <div className="space-y-1.5 bg-muted/40 p-2.5 rounded-lg border border-border/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Công suất kho:</span>
                  <span className="font-mono font-bold text-foreground">
                    {wh.usedCapacity}/{wh.capacity} Tấn ({occupancy}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      wh.status === "MAINTENANCE"
                        ? "bg-amber-500"
                        : isOverload
                        ? "bg-rose-500"
                        : isHigh
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    )}
                    style={{ width: `${Math.min(occupancy, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>Pallets: {wh.usedPallets || 0}/{wh.totalPallets || 0}</span>
                  <span>{wh.dockDoors || 0} Cửa Dock • {(wh.areaSqM || 0).toLocaleString()} m²</span>
                </div>
              </div>

              {/* Throughput & Safety Badges */}
              <div className="flex items-center justify-between text-[11px] bg-muted/20 p-2 rounded-md border border-border/40 font-mono">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Activity className="h-3 w-3 text-blue-500" />
                  <span>Xuất/Nhập: {wh.dailyInboundTons || 0}/{wh.dailyOutboundTons || 0}T</span>
                </div>
                {wh.compliance?.pcccCertificateNumber && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-sans text-[10px]">
                    <ShieldCheck className="h-3 w-3" />
                    <span>PCCC hợp lệ</span>
                  </span>
                )}
              </div>

              {/* Footer info & Quick buttons */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground text-[11px]">
                    QL: {wh.managerName || "Chưa có"}
                  </p>
                  {wh.managerPhone && (
                    <a
                      href={`tel:${wh.managerPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-primary text-[10px] font-mono flex items-center gap-1"
                    >
                      <Phone className="h-2.5 w-2.5" />
                      {wh.managerPhone}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetail(wh);
                    }}
                    className="h-7 px-2.5 text-xs gap-1 font-semibold"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Chi tiết</span>
                  </Button>
                  {onFocusMap && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFocusMap(wh);
                      }}
                      className="h-7 px-2 text-xs gap-1"
                    >
                      <Navigation className="h-3 w-3" />
                      <span>Bản đồ</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
