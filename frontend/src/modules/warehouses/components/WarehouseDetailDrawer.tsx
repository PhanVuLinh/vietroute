import React from "react";
import {
  X,
  Building2,
  MapPin,
  Boxes,
  Clock,
  Phone,
  Mail,
  User,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Edit,
  Navigation,
  ThermometerSnowflake,
  Sun,
  Shuffle,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  WarehouseStatusBadge,
  WarehouseTypeBadge,
  WarehouseRegionBadge,
} from "./WarehouseStatusBadge";
import type { Warehouse, WarehouseStatus } from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

interface WarehouseDetailDrawerProps {
  warehouse: Warehouse | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (warehouse: Warehouse) => void;
  onUpdateStatus: (id: string, status: WarehouseStatus) => void;
  onFocusMap?: (warehouse: Warehouse) => void;
}

export const WarehouseDetailDrawer: React.FC<WarehouseDetailDrawerProps> = ({
  warehouse,
  isOpen,
  onClose,
  onEdit,
  onUpdateStatus,
  onFocusMap,
}) => {
  if (!isOpen || !warehouse) return null;

  const occupancy =
    warehouse.capacity > 0
      ? Math.round((warehouse.usedCapacity / warehouse.capacity) * 100)
      : 0;
  const isOverload = occupancy >= 85 || warehouse.status === "FULL";
  const isHigh = occupancy >= 70 && occupancy < 85;

  const palletOccupancy =
    warehouse.totalPallets && warehouse.totalPallets > 0
      ? Math.round(((warehouse.usedPallets || 0) / warehouse.totalPallets) * 100)
      : 0;

  // Mock danh sách phương tiện đang hoạt động tại cổng Dock của Hub
  const mockDockActivities = [
    {
      dockNo: "Dock #01",
      plate: "29C-882.14",
      driver: "Nguyễn Văn Hùng",
      type: "Bốc hàng đi Đà Nẵng",
      status: "LOADING",
      progress: 80,
      eta: "15 phút nữa xong",
    },
    {
      dockNo: "Dock #03",
      plate: "51D-921.45",
      driver: "Trần Đình Khang",
      type: "Nhập hàng từ Cát Lái",
      status: "UNLOADING",
      progress: 45,
      eta: "30 phút nữa xong",
    },
    {
      dockNo: "Dock #06",
      plate: "43C-652.89",
      driver: "Phạm Quốc Tuấn",
      type: "Đang kiểm đếm niêm phong",
      status: "INSPECTING",
      progress: 20,
      eta: "45 phút nữa xong",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-card border-l border-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* 1. Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold border border-primary/30 shadow-2xs shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-foreground">
                    {warehouse.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <span className="font-mono font-semibold text-foreground/80 bg-muted px-1.5 py-0.2 rounded border border-border/50 text-[11px]">
                    {warehouse.code}
                  </span>
                  <span>•</span>
                  <WarehouseRegionBadge region={warehouse.region} />
                  <span>•</span>
                  <WarehouseTypeBadge type={warehouse.type} />
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 2. Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Quick Status Bar */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Trạng thái vận hành Hub:</span>
                <WarehouseStatusBadge status={warehouse.status} />
              </div>

              <div className="pt-2 border-t border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                  Cập nhật trạng thái bến bãi:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <Button
                    variant={warehouse.status === "ACTIVE" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdateStatus(warehouse.id, "ACTIVE")}
                    className="h-8 text-xs gap-1.5 justify-center cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Hoạt động
                  </Button>
                  <Button
                    variant={warehouse.status === "MAINTENANCE" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdateStatus(warehouse.id, "MAINTENANCE")}
                    className="h-8 text-xs gap-1.5 justify-center cursor-pointer"
                  >
                    <Wrench className="h-3.5 w-3.5 text-amber-500" />
                    Bảo trì
                  </Button>
                  <Button
                    variant={warehouse.status === "FULL" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdateStatus(warehouse.id, "FULL")}
                    className="h-8 text-xs gap-1.5 justify-center cursor-pointer"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                    Quá tải
                  </Button>
                </div>
              </div>
            </div>

            {/* Sức chứa & Tỷ lệ lấp đầy */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Boxes className="h-4 w-4 text-primary" />
                  <span>Chỉ số dung lượng & Sức chứa</span>
                </h4>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {warehouse.storageType === "COLD"
                    ? "Kho lạnh (-18°C ~ 4°C)"
                    : warehouse.storageType === "DRY"
                    ? "Kho khô tiêu chuẩn"
                    : "Kho hỗn hợp Đa năng"}
                </Badge>
              </div>

              {/* Progress Tấn */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tải trọng lưu trữ (Tấn):</span>
                  <span className="font-mono font-bold text-foreground">
                    {warehouse.usedCapacity} / {warehouse.capacity} Tấn ({occupancy}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      warehouse.status === "MAINTENANCE"
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
              </div>

              {/* Grid 4 chỉ số */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60">
                <div className="p-2.5 rounded-lg bg-muted/40 text-center">
                  <p className="text-[10px] text-muted-foreground">Tổng Pallet</p>
                  <p className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {warehouse.usedPallets || 0}/{warehouse.totalPallets || 0}
                  </p>
                  <p className="text-[9px] text-muted-foreground font-mono">({palletOccupancy}%)</p>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 text-center">
                  <p className="text-[10px] text-muted-foreground">Diện tích sàn</p>
                  <p className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {(warehouse.areaSqM || 0).toLocaleString()}
                  </p>
                  <p className="text-[9px] text-muted-foreground">m² mặt bằng</p>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 text-center">
                  <p className="text-[10px] text-muted-foreground">Cổng Dock</p>
                  <p className="text-sm font-bold font-mono text-primary mt-0.5">
                    {warehouse.dockDoors || 0}
                  </p>
                  <p className="text-[9px] text-muted-foreground">cửa xuất/nhập</p>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 text-center">
                  <p className="text-[10px] text-muted-foreground">Khung giờ</p>
                  <p className="text-xs font-bold font-mono text-foreground mt-1">
                    {warehouse.openingTime}
                  </p>
                  <p className="text-[9px] text-muted-foreground font-mono">đến {warehouse.closingTime}</p>
                </div>
              </div>
            </div>

            {/* Vị trí địa lý & GPS */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-rose-500" />
                <span>Vị trí địa lý & Địa chỉ</span>
              </h4>

              <div className="text-xs space-y-1.5">
                <p className="text-foreground font-medium leading-relaxed">{warehouse.address}</p>
                <p className="text-muted-foreground">Khu vực: {warehouse.city} ({warehouse.region})</p>
                <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-muted-foreground">
                  <span>Tọa độ: {warehouse.latitude.toFixed(4)}, {warehouse.longitude.toFixed(4)}</span>
                </div>
              </div>

              {onFocusMap && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onFocusMap(warehouse);
                    onClose();
                  }}
                  className="w-full text-xs h-8 gap-1.5 mt-2"
                >
                  <Navigation className="h-3.5 w-3.5 text-primary" />
                  <span>Xem vị trí trực tiếp trên bản đồ MapLibre</span>
                </Button>
              )}
            </div>

            {/* Ban Điều Hành / Quản Lý Kho */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-4 w-4 text-blue-500" />
                <span>Ban Quản trị & Điều hành Hub</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Người phụ trách:</span>
                  <span className="font-semibold text-foreground">{warehouse.managerName || "Chưa thiết lập"}</span>
                </div>

                {warehouse.managerPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Hotline quản lý:</span>
                    <a
                      href={`tel:${warehouse.managerPhone}`}
                      className="font-mono text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      {warehouse.managerPhone}
                    </a>
                  </div>
                )}

                {warehouse.managerEmail && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email tiếp nhận:</span>
                    <a
                      href={`mailto:${warehouse.managerEmail}`}
                      className="font-mono text-primary hover:underline flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      {warehouse.managerEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Hoạt động tại Cửa Dock Realtime (Mock) */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-emerald-500" />
                  <span>Hoạt động tại cửa Dock</span>
                </h4>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  {mockDockActivities.length} xe đang phục vụ
                </Badge>
              </div>

              <div className="space-y-2">
                {mockDockActivities.map((dock, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-border/70 bg-muted/20 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-mono text-[11px] bg-primary/10 text-primary px-1.5 py-0.2 rounded">
                          {dock.dockNo}
                        </span>
                        <span className="font-bold font-mono text-foreground">{dock.plate}</span>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {dock.eta}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Tài xế: {dock.driver}</span>
                      <span className="text-foreground/80 font-medium">{dock.type}</span>
                    </div>

                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${dock.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Footer Actions */}
          <div className="p-4 border-t border-border bg-muted/20 flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onEdit(warehouse);
                onClose();
              }}
              className="flex-1 h-9 text-xs gap-1.5 cursor-pointer font-semibold"
            >
              <Edit className="h-3.5 w-3.5 text-amber-500" />
              <span>Chỉnh sửa thông tin</span>
            </Button>
            <Button
              variant="default"
              onClick={onClose}
              className="h-9 px-4 text-xs cursor-pointer"
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
