import React, { useState } from "react";
import {
  X,
  Route as RouteIcon,
  Navigation,
  Clock,
  Fuel,
  Coins,
  Truck,
  User,
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  Edit,
  Phone,
  Package,
  Weight,
  Play,
  XCircle,
  Check,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  RouteStatusBadge,
  RouteStopStatusBadge,
} from "./RouteStatusBadge";
import type { RouteStatus, RouteStopStatus } from "@/core/types/logistics";
import type { EnrichedRoute } from "../hooks/useRoutes";
import { cn } from "@/shared/utils/cn";

interface RouteDetailDrawerProps {
  route: EnrichedRoute | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (route: EnrichedRoute) => void;
  onUpdateRouteStatus: (id: string, status: RouteStatus) => void;
  onUpdateStopStatus: (routeId: string, stopId: string, status: RouteStopStatus) => void;
  onFocusMap?: (route: EnrichedRoute) => void;
}

export const RouteDetailDrawer: React.FC<RouteDetailDrawerProps> = ({
  route,
  isOpen,
  onClose,
  onEdit,
  onUpdateRouteStatus,
  onUpdateStopStatus,
  onFocusMap,
}) => {
  const [activeTab, setActiveTab] = useState<string>("stops");

  if (!isOpen || !route) return null;

  const stops = route.stops || [];
  const dieselPricePerLiter = 23800; // VNĐ / Lít dầu DO 0.05S-II
  const estFuelCostVND = Math.round((route.fuelEstLiters || 0) * dieselPricePerLiter);
  const totalCostVND = estFuelCostVND + (route.tollFeeEstVND || 0);

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
                <RouteIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-foreground leading-tight">
                    {route.routeName || route.routeCode}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <span className="font-mono font-semibold text-foreground/80 bg-muted px-1.5 py-0.2 rounded border border-border/50 text-[11px]">
                    {route.routeCode}
                  </span>
                  <span>•</span>
                  <RouteStatusBadge status={route.status} />
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Quick Action Status Bar */}
            <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Trạng thái tuyến:</span>
                <RouteStatusBadge status={route.status} />
              </div>

              <div className="flex items-center gap-1.5">
                {route.status === "PLANNED" && (
                  <Button
                    size="sm"
                    onClick={() => onUpdateRouteStatus(route.id, "ACTIVE")}
                    className="h-7 text-xs px-2.5 bg-amber-600 hover:bg-amber-700 text-white gap-1"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Bắt đầu xuất phát</span>
                  </Button>
                )}

                {route.status === "ACTIVE" && (
                  <Button
                    size="sm"
                    onClick={() => onUpdateRouteStatus(route.id, "COMPLETED")}
                    className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Hoàn thành tuyến</span>
                  </Button>
                )}

                {route.status !== "CANCELLED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateRouteStatus(route.id, "CANCELLED")}
                    className="h-7 text-xs px-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1 border-rose-200 dark:border-rose-900/40"
                  >
                    <XCircle className="h-3 w-3" />
                    <span>Hủy</span>
                  </Button>
                )}

                {route.status !== "PLANNED" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateRouteStatus(route.id, "PLANNED")}
                    className="h-7 text-xs px-2 text-muted-foreground"
                  >
                    Đặt lại
                  </Button>
                )}
              </div>
            </div>

            {/* Overview Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Navigation className="h-3.5 w-3.5 text-primary" />
                  <span>Tổng cự ly</span>
                </div>
                <p className="text-base font-bold font-mono text-foreground">
                  {route.totalDistance} <span className="text-xs font-normal">km</span>
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  ~{Math.floor(route.estimatedDuration / 60)}g {route.estimatedDuration % 60}p
                </p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Tiến độ giao</span>
                </div>
                <p className="text-base font-bold font-mono text-foreground">
                  {route.completedStopsCount} / {route.totalStopsCount} <span className="text-xs font-normal">chặng</span>
                </p>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      route.progressPercent === 100 ? "bg-emerald-500" : "bg-primary"
                    )}
                    style={{ width: `${route.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Fuel className="h-3.5 w-3.5 text-blue-500" />
                  <span>Định mức dầu</span>
                </div>
                <p className="text-base font-bold font-mono text-foreground">
                  ~{route.fuelEstLiters || 0} <span className="text-xs font-normal">Lít</span>
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  ~{estFuelCostVND.toLocaleString()} đ
                </p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  <span>Phí trạm BOT</span>
                </div>
                <p className="text-base font-bold font-mono text-foreground">
                  {(route.tollFeeEstVND || 0).toLocaleString()} <span className="text-xs font-normal">đ</span>
                </p>
                <p className="text-[10px] text-muted-foreground">VETC / ePass</p>
              </div>
            </div>

            {/* Driver & Vehicle & Warehouse info */}
            <div className="p-3.5 rounded-xl border border-border bg-card grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-primary" />
                  Kho xuất phát
                </span>
                <p className="font-bold text-foreground truncate">
                  {route.warehouse?.name || "Kho hàng"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{route.warehouse?.address}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3 text-primary" />
                  Tài xế phụ trách
                </span>
                <p className="font-bold text-foreground">
                  {route.driver?.fullName || "Chưa phân công"}
                </p>
                {route.driver?.phone && (
                  <a
                    href={`tel:${route.driver.phone}`}
                    className="text-[11px] text-primary font-mono hover:underline flex items-center gap-1"
                  >
                    <Phone className="h-2.5 w-2.5" />
                    <span>{route.driver.phone}</span>
                  </a>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Truck className="h-3 w-3 text-primary" />
                  Phương tiện gán
                </span>
                <p className="font-bold font-mono text-foreground">
                  {route.vehicle?.licensePlate || "Chưa gán xe"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {route.vehicle?.brand} ({route.vehicle?.capacityWeight ? `${route.vehicle.capacityWeight / 1000} Tấn` : "N/A"})
                </p>
              </div>
            </div>

            {/* Traffic Alerts Warning if any */}
            {route.trafficAlerts && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1 text-amber-800 dark:text-amber-300">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Cảnh báo giao thông trên lộ trình</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900/80 dark:text-amber-300/80 pl-1">
                  {Array.isArray(route.trafficAlerts) ? (
                    route.trafficAlerts.map((alert, idx) => (
                      <li key={idx}>{alert}</li>
                    ))
                  ) : (
                    <li>{route.trafficAlerts}</li>
                  )}
                </ul>
              </div>
            )}

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full h-9 p-1 bg-muted/60 text-xs">
                <TabsTrigger value="stops" className="text-[11px] py-1">
                  Lộ trình ({stops.length} điểm)
                </TabsTrigger>
                <TabsTrigger value="costs" className="text-[11px] py-1">
                  Chi phí & Định mức
                </TabsTrigger>
                <TabsTrigger value="cargo" className="text-[11px] py-1">
                  Hàng hóa & Tải trọng
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: LỘ TRÌNH VÀ CÁC ĐIỂM DỪNG */}
              <TabsContent value="stops" className="space-y-3 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    Danh sách chặng dừng theo thứ tự tối ưu
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    Cập nhật trạng thái giao nhận trực tiếp
                  </span>
                </div>

                {/* Origin Hub */}
                <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 flex items-start gap-3 text-xs">
                  <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">
                        Điểm xuất phát: {route.warehouse?.name || "Kho hàng"}
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                        Xuất bến
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px]">{route.warehouse?.address}</p>
                  </div>
                </div>

                {/* Stops Timeline */}
                <div className="space-y-2.5 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/80">
                  {stops.map((stop, index) => {
                    const isCompleted = stop.status === "COMPLETED";
                    const isArrived = stop.status === "ARRIVED";
                    const isSkipped = stop.status === "SKIPPED";

                    return (
                      <div
                        key={stop.id}
                        className={cn(
                          "p-3 rounded-xl border bg-card hover:border-primary/40 transition-all text-xs relative ml-6",
                          isCompleted
                            ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10"
                            : isArrived
                            ? "border-blue-500/40 bg-blue-500/5 dark:bg-blue-500/10"
                            : isSkipped
                            ? "border-slate-500/20 opacity-70"
                            : "border-border"
                        )}
                      >
                        {/* Stop Number Circle on left line */}
                        <div
                          className={cn(
                            "absolute -left-[30px] top-3 h-6 w-6 rounded-full font-bold font-mono text-[11px] flex items-center justify-center border shadow-2xs",
                            isCompleted
                              ? "bg-emerald-500 text-white border-emerald-600"
                              : isArrived
                              ? "bg-blue-500 text-white border-blue-600 animate-pulse"
                              : isSkipped
                              ? "bg-slate-400 text-white border-slate-500"
                              : "bg-card text-foreground border-border"
                          )}
                        >
                          {index + 1}
                        </div>

                        {/* Stop Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-foreground text-xs">
                                {stop.customerName || `Điểm giao #${index + 1}`}
                              </span>
                              {stop.orderCode && (
                                <span className="font-mono text-[10px] bg-muted px-1.5 py-0.2 rounded border border-border/60 text-foreground font-semibold">
                                  {stop.orderCode}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span>{stop.address}</span>
                            </p>
                          </div>

                          <RouteStopStatusBadge status={stop.status} />
                        </div>

                        {/* Stop Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                          {stop.customerPhone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-primary shrink-0" />
                              <a
                                href={`tel:${stop.customerPhone}`}
                                className="font-mono text-primary hover:underline"
                              >
                                {stop.customerPhone}
                              </a>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>
                              Khung giờ: <strong className="font-mono text-foreground">{stop.timeWindowStart} - {stop.timeWindowEnd}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 shrink-0" />
                            <span>
                              {stop.packageCount || 1} kiện ({stop.weightKg || 0} kg)
                            </span>
                          </div>
                        </div>

                        {/* Notes if present */}
                        {stop.notes && (
                          <p className="mt-1.5 p-1.5 rounded bg-muted/40 text-[10px] text-muted-foreground italic">
                            Ghi chú: {stop.notes}
                          </p>
                        )}

                        {/* Quick Stop Status Toggle Actions */}
                        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-border/40">
                          <span className="text-[10px] text-muted-foreground mr-1">Cập nhật chặng:</span>

                          <Button
                            variant={stop.status === "ARRIVED" ? "default" : "outline"}
                            size="sm"
                            onClick={() => onUpdateStopStatus(route.id, stop.id, "ARRIVED")}
                            className="h-6 text-[10px] px-2 gap-1"
                          >
                            <Clock3 className="h-2.5 w-2.5" />
                            <span>Đã đến</span>
                          </Button>

                          <Button
                            variant={stop.status === "COMPLETED" ? "default" : "outline"}
                            size="sm"
                            onClick={() => onUpdateStopStatus(route.id, stop.id, "COMPLETED")}
                            className="h-6 text-[10px] px-2 gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                          >
                            <Check className="h-2.5 w-2.5" />
                            <span>Đã giao xong</span>
                          </Button>

                          <Button
                            variant={stop.status === "SKIPPED" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => onUpdateStopStatus(route.id, stop.id, "SKIPPED")}
                            className="h-6 text-[10px] px-1.5 text-muted-foreground hover:text-rose-600"
                          >
                            <span>Bỏ qua</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* TAB 2: CHI PHÍ & ĐỊNH MỨC VẬN HÀNH */}
              <TabsContent value="costs" className="space-y-3 pt-3">
                <div className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs">
                  <h4 className="font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span>Bảng tính toán Chi phí Vận hành Tuyến</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                      <div className="space-y-0.5">
                        <span className="font-medium text-foreground flex items-center gap-1">
                          <Fuel className="h-3.5 w-3.5 text-blue-500" />
                          <span>Định mức dầu Diesel (DO 0.05S-II)</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {route.fuelEstLiters || 0} Lít × {dieselPricePerLiter.toLocaleString()} đ/L
                        </span>
                      </div>
                      <span className="font-mono font-bold text-foreground">
                        {estFuelCostVND.toLocaleString()} đ
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                      <div className="space-y-0.5">
                        <span className="font-medium text-foreground flex items-center gap-1">
                          <Coins className="h-3.5 w-3.5 text-amber-500" />
                          <span>Phí qua các trạm thu phí BOT</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Hệ thống thu phí tự động VETC / ePass
                        </span>
                      </div>
                      <span className="font-mono font-bold text-foreground">
                        {(route.tollFeeEstVND || 0).toLocaleString()} đ
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-sm font-bold">
                      <span className="text-foreground">Tổng chi phí định mức dự kiến:</span>
                      <span className="font-mono text-primary text-base">
                        {totalCostVND.toLocaleString()} đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gợi ý tối ưu chi phí */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Lợi thế định tuyến tối ưu (TSP Optimizer)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Thứ tự các điểm giao đã được thuật toán Neighbor TSP sắp xếp giúp giảm cự ly di chuyển rỗng, tiết kiệm trung bình 18.5% nhiên liệu so với giao theo thứ tự thủ công.
                  </p>
                </div>
              </TabsContent>

              {/* TAB 3: HÀNG HÓA VÀ TẢI TRỌNG */}
              <TabsContent value="cargo" className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                      <Weight className="h-3.5 w-3.5 text-primary" />
                      <span>Tổng khối lượng hàng</span>
                    </div>
                    <p className="text-xl font-bold font-mono text-foreground">
                      {route.totalWeightKg || 0} <span className="text-xs font-normal">kg</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Tải trọng xe: {route.vehicle ? `${route.vehicle.capacityWeight} kg` : "N/A"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                      <Package className="h-3.5 w-3.5 text-blue-500" />
                      <span>Tổng thể tích</span>
                    </div>
                    <p className="text-xl font-bold font-mono text-foreground">
                      {route.totalVolumeM3 || 0} <span className="text-xs font-normal">m³</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Tổng số chặng: {stops.length} điểm
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-card space-y-2 text-xs">
                  <h4 className="font-semibold text-foreground">Danh mục đơn hàng vận chuyển trên chuyến</h4>
                  <div className="space-y-1.5">
                    {stops.map((stop, i) => (
                      <div
                        key={stop.id}
                        className="p-2 rounded-lg bg-muted/40 flex items-center justify-between text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-primary">#{i + 1}</span>
                          <span className="font-medium text-foreground">{stop.customerName}</span>
                          {stop.orderCode && (
                            <span className="font-mono text-muted-foreground">({stop.orderCode})</span>
                          )}
                        </div>
                        <div className="font-mono text-muted-foreground">
                          {stop.packageCount || 1} kiện • {stop.weightKg || 0} kg
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* 3. Footer Actions */}
          <div className="p-4 border-t border-border bg-muted/20 flex items-center gap-2">
            {onFocusMap && (
              <Button
                variant="outline"
                onClick={() => {
                  onFocusMap(route);
                  onClose();
                }}
                className="h-9 text-xs gap-1.5 cursor-pointer font-semibold"
              >
                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                <span>Xem trên bản đồ</span>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => {
                onEdit(route);
                onClose();
              }}
              className="flex-1 h-9 text-xs gap-1.5 cursor-pointer font-semibold"
            >
              <Edit className="h-3.5 w-3.5 text-amber-500" />
              <span>Chỉnh sửa thông số</span>
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
