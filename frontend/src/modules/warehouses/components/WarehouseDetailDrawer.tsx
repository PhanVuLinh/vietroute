import React, { useState } from "react";
import {
  X,
  Building2,
  MapPin,
  Boxes,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Edit,
  Navigation,
  ThermometerSnowflake,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  Flame,
  FileText,
  Activity,
  ParkingSquare,
  Droplets,
  AlertCircle,
  Share2,
  ArrowRightLeft,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { WarehouseAiDemandForecast } from "./WarehouseAiDemandForecast";
import {
  WarehouseStatusBadge,
  WarehouseTypeBadge,
  WarehouseRegionBadge,
} from "./WarehouseStatusBadge";
import { InventoryTable } from "./InventoryTable";
import { WarehouseActivityLog } from "./WarehouseActivityLog";
import { InboundReceiptDialog } from "./InboundReceiptDialog";
import { OutboundDispatchDialog } from "./OutboundDispatchDialog";
import { StockTransferDialog } from "./StockTransferDialog";
import { BarcodeScannerKioskModal } from "./BarcodeScannerKioskModal";
import type { Warehouse, WarehouseStatus, DockStatus } from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

interface WarehouseDetailDrawerProps {
  warehouse: Warehouse | null;
  allWarehouses?: Warehouse[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (warehouse: Warehouse) => void;
  onUpdateStatus: (id: string, status: WarehouseStatus) => void;
  onFocusMap?: (warehouse: Warehouse) => void;
}

const DOCK_STATUS_CONFIG: Record<
  DockStatus,
  { label: string; bgClass: string; textClass: string; dotClass: string }
> = {
  AVAILABLE: {
    label: "Cổng trống (Sẵn sàng)",
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/15",
    textClass: "text-emerald-700 dark:text-emerald-300",
    dotClass: "bg-emerald-500",
  },
  LOADING: {
    label: "Đang bốc hàng lên xe",
    bgClass: "bg-blue-500/10 dark:bg-blue-500/15",
    textClass: "text-blue-700 dark:text-blue-300 font-semibold",
    dotClass: "bg-blue-500 animate-pulse",
  },
  UNLOADING: {
    label: "Đang dỡ hàng vào kho",
    bgClass: "bg-amber-500/10 dark:bg-amber-500/15",
    textClass: "text-amber-700 dark:text-amber-300 font-semibold",
    dotClass: "bg-amber-500 animate-pulse",
  },
  INSPECTING: {
    label: "Kiểm hóa & Niêm chì",
    bgClass: "bg-purple-500/10 dark:bg-purple-500/15",
    textClass: "text-purple-700 dark:text-purple-300",
    dotClass: "bg-purple-500",
  },
  MAINTENANCE: {
    label: "Bảo dưỡng bàn nâng",
    bgClass: "bg-rose-500/10 dark:bg-rose-500/15",
    textClass: "text-rose-700 dark:text-rose-300",
    dotClass: "bg-rose-500",
  },
};

export const WarehouseDetailDrawer: React.FC<WarehouseDetailDrawerProps> = ({
  warehouse,
  allWarehouses = [],
  isOpen,
  onClose,
  onEdit,
  onUpdateStatus,
  onFocusMap,
}) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isInboundOpen, setIsInboundOpen] = useState(false);
  const [isOutboundOpen, setIsOutboundOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [wmsSubTab, setWmsSubTab] = useState<"inventory" | "activity">("inventory");

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

  // Lọc danh sách kho lân cận có thể tiếp nhận điều hướng luồng hàng
  const nearbyDivertHubs = allWarehouses
    .filter((w) => w.id !== warehouse.id && (w.region === warehouse.region || warehouse.type === "CENTRAL_HUB"))
    .map((w) => {
      const occ = w.capacity > 0 ? Math.round((w.usedCapacity / w.capacity) * 100) : 0;
      const remainingTons = Math.max(0, w.capacity - w.usedCapacity);
      return {
        ...w,
        occupancy: occ,
        remainingTons,
      };
    })
    .sort((a, b) => a.occupancy - b.occupancy);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-full max-w-2xl bg-card border-l border-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* 1. Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold border border-primary/30 shadow-2xs shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-foreground leading-tight">
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

          {/* 2. Scrollable Body with Tabs */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Quick Status Bar */}
            <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Trạng thái:</span>
                <WarehouseStatusBadge status={warehouse.status} />
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant={warehouse.status === "ACTIVE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdateStatus(warehouse.id, "ACTIVE")}
                  className="h-7 text-xs px-2 cursor-pointer gap-1"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>Hoạt động</span>
                </Button>
                <Button
                  variant={warehouse.status === "MAINTENANCE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdateStatus(warehouse.id, "MAINTENANCE")}
                  className="h-7 text-xs px-2 cursor-pointer gap-1"
                >
                  <Wrench className="h-3 w-3 text-amber-500" />
                  <span>Bảo trì</span>
                </Button>
                <Button
                  variant={warehouse.status === "FULL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdateStatus(warehouse.id, "FULL")}
                  className="h-7 text-xs px-2 cursor-pointer gap-1"
                >
                  <AlertTriangle className="h-3 w-3 text-rose-500" />
                  <span>Quá tải</span>
                </Button>
              </div>
            </div>

            {/* Overload Alert with Quick Action */}
            {isOverload && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs flex items-center justify-between gap-3 text-rose-700 dark:text-rose-300 animate-pulse">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>
                    <strong>Cảnh báo quá tải ({occupancy}%):</strong> Kho đang vượt ngưỡng an toàn vận hành, cần phân luồng hàng.
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab("divert")}
                  className="h-7 text-xs px-2.5 shrink-0 border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20"
                >
                  Điều hướng ngay
                </Button>
              </div>
            )}

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-6 w-full h-9 p-1 bg-muted/60 text-xs">
                <TabsTrigger value="overview" className="text-[11px] py-1">
                  Chỉ số
                </TabsTrigger>
                <TabsTrigger value="zones" className="text-[11px] py-1">
                  Phân khu
                </TabsTrigger>
                <TabsTrigger value="docks" className="text-[11px] py-1">
                  Cổng Dock
                </TabsTrigger>
                <TabsTrigger value="wms" className="text-[11px] py-1 font-semibold text-primary">
                  Xuất Nhập
                </TabsTrigger>
                <TabsTrigger value="compliance" className="text-[11px] py-1">
                  PCCC
                </TabsTrigger>
                <TabsTrigger value="divert" className="text-[11px] py-1">
                  Điều hướng
                </TabsTrigger>
                <TabsTrigger value="ai-demand" className="text-[11px] py-1 font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Dự Báo AI</span>
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: TỔNG QUAN & CHỈ SỐ */}
              <TabsContent value="overview" className="space-y-4 pt-3">
                {/* Công suất Tấn & Thanh đo lấp đầy */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Boxes className="h-4 w-4 text-primary" />
                      <span>Công suất lưu trữ & Tỷ lệ lấp đầy</span>
                    </h4>
                    <span
                      className={cn(
                        "font-bold font-mono px-2 py-0.5 rounded text-xs",
                        isOverload
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          : isHigh
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {occupancy}% Dung lượng
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Tải trọng lưu kho:</span>
                      <span className="font-mono font-bold text-foreground">
                        {warehouse.usedCapacity} / {warehouse.capacity} Tấn
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

                  {/* 4 Chỉ số cơ bản */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60">
                    <div className="p-2.5 rounded-lg bg-muted/40 text-center">
                      <p className="text-[10px] text-muted-foreground">Tổng Pallets</p>
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
                        {warehouse.openingTime} - {warehouse.closingTime}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-mono">24/7 linh hoạt</p>
                    </div>
                  </div>
                </div>

                {/* Thông lượng xuất nhập & Bãi đỗ xe Yard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Throughput trong ngày */}
                  <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-blue-500" />
                      <span>Thông lượng hôm nay (Throughput)</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <div className="flex items-center gap-1 text-[11px]">
                          <ArrowDownToLine className="h-3.5 w-3.5" />
                          <span>Hàng nhập:</span>
                        </div>
                        <p className="text-base font-bold font-mono mt-1">
                          {warehouse.dailyInboundTons || 0} <span className="text-xs font-normal">Tấn</span>
                        </p>
                      </div>

                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
                        <div className="flex items-center gap-1 text-[11px]">
                          <ArrowUpFromLine className="h-3.5 w-3.5" />
                          <span>Hàng xuất:</span>
                        </div>
                        <p className="text-base font-bold font-mono mt-1">
                          {warehouse.dailyOutboundTons || 0} <span className="text-xs font-normal">Tấn</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bãi đỗ xe bến bãi (Yard Management) */}
                  <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <ParkingSquare className="h-3.5 w-3.5 text-purple-500" />
                      <span>Sân bãi đỗ xe tải / Cont</span>
                    </h4>
                    <div className="p-2 rounded-lg bg-muted/40 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Xe đang đỗ chờ lệnh:</span>
                        <span className="font-bold font-mono text-foreground">
                          {warehouse.yardParkingOccupied || 0} / {warehouse.yardParkingCapacity || 0} vị trí
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{
                            width: `${
                              warehouse.yardParkingCapacity
                                ? Math.min(
                                    Math.round(
                                      ((warehouse.yardParkingOccupied || 0) / warehouse.yardParkingCapacity) * 100
                                    ),
                                    100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vị trí & Ban quản lý */}
                <div className="p-3.5 rounded-xl border border-border bg-card space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-500" />
                      <span>Vị trí địa lý & Ban quản trị</span>
                    </h4>
                    {onFocusMap && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onFocusMap(warehouse);
                          onClose();
                        }}
                        className="h-6 text-[11px] text-primary gap-1 px-1.5"
                      >
                        <Navigation className="h-3 w-3" />
                        <span>Xem bản đồ</span>
                      </Button>
                    )}
                  </div>

                  <p className="text-foreground leading-relaxed">{warehouse.address}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/50 text-muted-foreground">
                    <div>
                      <span>Quản lý: </span>
                      <strong className="text-foreground">{warehouse.managerName || "Chưa phân công"}</strong>
                    </div>
                    {warehouse.managerPhone && (
                      <div>
                        <span>Hotline: </span>
                        <a href={`tel:${warehouse.managerPhone}`} className="text-primary font-mono font-semibold hover:underline">
                          {warehouse.managerPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: PHÂN KHU CHỨC NĂNG & CẢM BIẾN */}
              <TabsContent value="zones" className="space-y-3 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    Sơ đồ {warehouse.zones?.length || 0} phân khu chức năng
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    Giám sát sức chứa & Cảm biến nhiệt độ IoT
                  </span>
                </div>

                <div className="space-y-2.5">
                  {warehouse.zones && warehouse.zones.length > 0 ? (
                    warehouse.zones.map((zone) => {
                      const zoneOcc =
                        zone.capacityPallets > 0
                          ? Math.round((zone.usedPallets / zone.capacityPallets) * 100)
                          : 0;

                      return (
                        <div
                          key={zone.id}
                          className="p-3 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-colors space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-foreground">{zone.name}</span>
                                <Badge variant="outline" className="text-[10px] font-mono">
                                  {zone.code}
                                </Badge>
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                {zone.type === "CROSS_DOCK"
                                  ? "Khu Cross-Docking trung chuyển nhanh"
                                  : zone.type === "COLD_STORAGE"
                                  ? "Kho lạnh / Bảo quản nhiệt độ"
                                  : zone.type === "PALLET_RACK"
                                  ? "Khu kệ Pallet cao tầng"
                                  : "Khu tập kết hàng hóa"}
                              </span>
                            </div>

                            {/* Cảm biến nhiệt độ cho kho lạnh */}
                            {zone.type === "COLD_STORAGE" && zone.temperatureCelsius !== undefined && (
                              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-mono text-[11px]">
                                <div className="flex items-center gap-1">
                                  <ThermometerSnowflake className="h-3.5 w-3.5 text-cyan-500 animate-pulse" />
                                  <span className="font-bold">{zone.temperatureCelsius}°C</span>
                                </div>
                                {zone.humidityPercent && (
                                  <div className="flex items-center gap-0.5 text-[10px] text-cyan-600 dark:text-cyan-400">
                                    <Droplets className="h-3 w-3" />
                                    <span>{zone.humidityPercent}%</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground">Pallet sử dụng:</span>
                              <span className="font-mono font-bold text-foreground">
                                {zone.usedPallets} / {zone.capacityPallets} ô ({zoneOcc}%)
                              </span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  zoneOcc >= 90
                                    ? "bg-rose-500"
                                    : zoneOcc >= 75
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                )}
                                style={{ width: `${Math.min(zoneOcc, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-muted-foreground text-xs bg-muted/20 rounded-xl border border-border">
                      Kho chưa cấu hình phân khu chi tiết.
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 3: ĐIỀU PHỐI CỔNG DOCK REALTIME */}
              <TabsContent value="docks" className="space-y-3 pt-3">
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Trạng thái {warehouse.dockList?.length || warehouse.dockDoors || 0} Cổng Dock</span>
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setIsKioskOpen(true)}
                      className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-semibold cursor-pointer shadow-2xs"
                    >
                      <ScanLine className="h-3.5 w-3.5" />
                      <span>Trạm quét Dock Kiosk</span>
                    </Button>
                    <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">
                      Live TAT
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {warehouse.dockList && warehouse.dockList.length > 0 ? (
                    warehouse.dockList.map((dock) => {
                      const cfg = DOCK_STATUS_CONFIG[dock.status] || DOCK_STATUS_CONFIG.AVAILABLE;

                      return (
                        <div
                          key={dock.id}
                          className="p-3 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-colors space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                                {dock.doorNumber}
                              </span>
                              <div>
                                <span className="font-bold text-foreground">{dock.name}</span>
                                <span className="text-[10px] text-muted-foreground block">
                                  {dock.type === "INBOUND"
                                    ? "Cổng Nhập hàng"
                                    : dock.type === "OUTBOUND"
                                    ? "Cổng Xuất hàng"
                                    : "Cổng Xuất/Nhập Đa Năng"}
                                </span>
                              </div>
                            </div>

                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] border",
                                cfg.bgClass,
                                cfg.textClass
                              )}
                            >
                              <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dotClass)} />
                              <span>{cfg.label}</span>
                            </span>
                          </div>

                          {/* Thông tin phương tiện nếu đang bốc/dỡ */}
                          {dock.currentVehiclePlate && (
                            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 space-y-1.5 text-[11px]">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Truck className="h-3.5 w-3.5 text-primary" />
                                  <span className="font-bold font-mono text-foreground">
                                    {dock.currentVehiclePlate}
                                  </span>
                                  <span className="text-muted-foreground">({dock.currentDriverName})</span>
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground">
                                  Dự kiến xong: <strong>{dock.estimatedCompletionTime}</strong>
                                </span>
                              </div>

                              <p className="text-muted-foreground text-[10px] truncate">
                                Loại hàng: {dock.cargoType} (Bắt đầu: {dock.startedAt})
                              </p>

                              {dock.progressPercent !== undefined && (
                                <div className="space-y-0.5">
                                  <div className="flex justify-between text-[10px]">
                                    <span className="text-muted-foreground">Tiến độ bốc/dỡ:</span>
                                    <span className="font-mono font-bold text-primary">
                                      {dock.progressPercent}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full transition-all"
                                      style={{ width: `${dock.progressPercent}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-muted-foreground text-xs bg-muted/20 rounded-xl border border-border">
                      Cổng dock đang ở trạng thái mặc định.
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB WMS: XUẤT NHẬP KHO & TỒN KHO */}
              <TabsContent value="wms" className="space-y-4 pt-3">
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-card border border-border/80 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant={wmsSubTab === "inventory" ? "default" : "outline"}
                      onClick={() => setWmsSubTab("inventory")}
                      className="h-7 text-xs px-2.5 cursor-pointer"
                    >
                      <Boxes className="h-3.5 w-3.5 mr-1" />
                      Tồn kho SKU
                    </Button>
                    <Button
                      size="sm"
                      variant={wmsSubTab === "activity" ? "default" : "outline"}
                      onClick={() => setWmsSubTab("activity")}
                      className="h-7 text-xs px-2.5 cursor-pointer"
                    >
                      <Activity className="h-3.5 w-3.5 mr-1" />
                      Nhật ký xuất nhập
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => setIsKioskOpen(true)}
                      className="h-7 text-xs px-2.5 bg-primary hover:bg-primary/90 text-primary-foreground gap-1 font-semibold cursor-pointer shadow-2xs"
                    >
                      <ScanLine className="h-3.5 w-3.5" />
                      <span>Trạm quét Barcode</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setIsInboundOpen(true)}
                      className="h-7 text-xs px-2 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer"
                    >
                      <ArrowDownToLine className="h-3 w-3" />
                      <span>Nhập kho</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setIsOutboundOpen(true)}
                      className="h-7 text-xs px-2 bg-blue-600 hover:bg-blue-700 text-white gap-1 cursor-pointer"
                    >
                      <ArrowUpFromLine className="h-3 w-3" />
                      <span>Xuất kho</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsTransferOpen(true)}
                      className="h-7 text-xs px-2 gap-1 cursor-pointer"
                    >
                      <ArrowRightLeft className="h-3 w-3 text-indigo-500" />
                      <span>Điều chuyển</span>
                    </Button>
                  </div>
                </div>

                {wmsSubTab === "inventory" ? (
                  <InventoryTable warehouseId={warehouse.id} />
                ) : (
                  <WarehouseActivityLog warehouseId={warehouse.id} />
                )}
              </TabsContent>

              {/* TAB 4: PHÁP LÝ & AN TOÀN PCCC */}
              <TabsContent value="compliance" className="space-y-3 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Hồ sơ Pháp lý & An toàn Phòng Cháy Chữa Cháy (PCCC)</span>
                  </span>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                    Đạt chuẩn an toàn
                  </Badge>
                </div>

                {warehouse.compliance ? (
                  <div className="space-y-3">
                    {/* 1. Giấy phép PCCC */}
                    <div className="p-3.5 rounded-xl border border-border bg-card space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <Flame className="h-4 w-4 text-rose-500" />
                          <span>Chứng nhận An toàn PCCC Bến Bãi</span>
                        </div>
                        <Badge variant="outline" className="font-mono text-[10px] text-emerald-600">
                          Còn hiệu lực
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground pt-1 text-[11px]">
                        <div>
                          <span>Số giấy phép: </span>
                          <strong className="text-foreground font-mono">
                            {warehouse.compliance.pcccCertificateNumber}
                          </strong>
                        </div>
                        <div>
                          <span>Cơ quan cấp: </span>
                          <strong className="text-foreground">{warehouse.compliance.pcccInspector}</strong>
                        </div>
                        <div>
                          <span>Hạn kiểm tra định kỳ: </span>
                          <strong className="text-foreground font-mono">
                            {warehouse.compliance.pcccExpiryDate}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* 2. Hợp đồng Bảo hiểm Cháy Nổ Kho Hàng */}
                    <div className="p-3.5 rounded-xl border border-border bg-card space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span>Bảo hiểm Cháy Nổ Bắt Buộc Kho Hàng</span>
                        </div>
                        <Badge variant="outline" className="font-mono text-[10px] text-blue-600">
                          Đã mua bảo hiểm
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground pt-1 text-[11px]">
                        <div>
                          <span>Số hợp đồng bảo hiểm: </span>
                          <strong className="text-foreground font-mono">
                            {warehouse.compliance.insurancePolicyNumber}
                          </strong>
                        </div>
                        <div>
                          <span>Đơn vị bảo hiểm: </span>
                          <strong className="text-foreground">{warehouse.compliance.insuranceProvider}</strong>
                        </div>
                        <div>
                          <span>Thời hạn bảo hiểm đến: </span>
                          <strong className="text-foreground font-mono">
                            {warehouse.compliance.insuranceExpiryDate}
                          </strong>
                        </div>
                        <div>
                          <span>Kiểm định giàn kệ (Racks): </span>
                          <strong className="text-foreground font-mono">
                            {warehouse.compliance.rackInspectionExpiry}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground text-xs bg-muted/20 rounded-xl border border-border">
                    Chưa bổ sung thông tin hồ sơ PCCC và bảo hiểm cho kho bãi này.
                  </div>
                )}
              </TabsContent>

              {/* TAB 5: ĐỀ XUẤT ĐIỀU HƯỚNG LUỒNG HÀNG (FLOW DIVERT) */}
              <TabsContent value="divert" className="space-y-3 pt-3">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Giải pháp Cân Bằng Tải & Phân Luồng Chuỗi Cung Ứng</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Khi kho đạt mức tải cao, hệ thống tự động tìm các Hub phụ cận còn sức chứa trống để điều hướng xe và đơn hàng.
                  </p>
                </div>

                <div className="space-y-2">
                  {nearbyDivertHubs.map((hub) => (
                    <div
                      key={hub.id}
                      className="p-3 rounded-xl border border-border/80 bg-card hover:border-primary/50 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground">{hub.name}</span>
                          <WarehouseRegionBadge region={hub.region} />
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {hub.code} • {hub.city}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] pt-0.5">
                          <span className="text-emerald-600 font-semibold">
                            Còn trống: <strong>{hub.remainingTons} Tấn</strong>
                          </span>
                          <span className="text-muted-foreground">
                            Đã dùng: <strong>{hub.occupancy}%</strong>
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (onFocusMap) {
                            onFocusMap(hub);
                            onClose();
                          }
                        }}
                        className="h-8 text-xs shrink-0 gap-1"
                      >
                        <Navigation className="h-3 w-3 text-primary" />
                        <span>Xem vị trí</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* TAB: DỰ BÁO NHU CẦU AI */}
              <TabsContent value="ai-demand">
                <WarehouseAiDemandForecast warehouse={warehouse} />
              </TabsContent>
            </Tabs>
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

      {/* WMS Dialogs */}
      <InboundReceiptDialog
        isOpen={isInboundOpen}
        onClose={() => setIsInboundOpen(false)}
        onSuccess={() => {}}
        warehouseId={warehouse.id}
        warehouses={allWarehouses}
      />
      <OutboundDispatchDialog
        isOpen={isOutboundOpen}
        onClose={() => setIsOutboundOpen(false)}
        onSuccess={() => {}}
        warehouseId={warehouse.id}
        warehouses={allWarehouses}
      />
      <StockTransferDialog
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSuccess={() => {}}
        warehouses={allWarehouses && allWarehouses.length > 0 ? allWarehouses : [warehouse]}
        currentWarehouseId={warehouse.id}
      />

      {/* WMS Barcode & QR Scanner Kiosk Modal */}
      <BarcodeScannerKioskModal
        isOpen={isKioskOpen}
        onClose={() => setIsKioskOpen(false)}
        warehouses={allWarehouses && allWarehouses.length > 0 ? allWarehouses : [warehouse]}
        currentWarehouseId={warehouse.id}
      />
    </div>
  );
};
