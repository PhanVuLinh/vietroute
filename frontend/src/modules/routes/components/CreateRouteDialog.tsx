import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Route as RouteIcon,
  Navigation,
  Clock,
  Fuel,
  Coins,
  Truck,
  User,
  Building2,
  MapPin,
  Package,
  Weight,
  Phone,
  CheckCircle2,
  AlertCircle,
  Layers,
  CheckSquare,
  Square,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type {
  Route,
  RouteStatus,
  RouteStop,
  Warehouse,
  Driver,
  Vehicle,
  Order,
} from "@/core/types/logistics";
import type { RouteTemplate } from "@/mocks/data/routeTemplates";
import { cn } from "@/shared/utils/cn";

type CreationMode = "ORDERS" | "TEMPLATE" | "MANUAL";

interface CreateRouteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (routeData: Partial<Route>) => Promise<void>;
  onOptimizeStops?: (originCoords: [number, number], stops: RouteStop[]) => Promise<RouteStop[]>;
  initialRoute?: Route | null;
  warehouses: Warehouse[];
  drivers: Driver[];
  vehicles: Vehicle[];
  pendingOrders?: Order[];
  routeTemplates?: RouteTemplate[];
}

export const CreateRouteDialog: React.FC<CreateRouteDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onOptimizeStops,
  initialRoute,
  warehouses,
  drivers,
  vehicles,
  pendingOrders = [],
  routeTemplates = [],
}) => {
  const isEditing = !!initialRoute;

  // Active Creation Mode (default to ORDERS if creating new, MANUAL if editing)
  const [creationMode, setCreationMode] = useState<CreationMode>("ORDERS");

  // Form State
  const [routeCode, setRouteCode] = useState<string>("");
  const [routeName, setRouteName] = useState<string>("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [driverId, setDriverId] = useState<string>("");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [status, setStatus] = useState<RouteStatus>("PLANNED");
  const [totalDistance, setTotalDistance] = useState<number>(35);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(75);
  const [fuelEstLiters, setFuelEstLiters] = useState<number>(7.5);
  const [tollFeeEstVND, setTollFeeEstVND] = useState<number>(35000);
  const [totalWeightKg, setTotalWeightKg] = useState<number>(1200);
  const [totalVolumeM3, setTotalVolumeM3] = useState<number>(4.5);

  // Selected Order IDs for batching
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Stops list
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [notificationMsg, setNotificationMsg] = useState<string>("");

  useEffect(() => {
    if (initialRoute) {
      setCreationMode("MANUAL");
      setRouteCode(initialRoute.routeCode);
      setRouteName(initialRoute.routeName || "");
      setWarehouseId(initialRoute.warehouseId);
      setDriverId(initialRoute.driverId || "");
      setVehicleId(initialRoute.vehicleId || "");
      setStatus(initialRoute.status);
      setTotalDistance(initialRoute.totalDistance);
      setEstimatedDuration(initialRoute.estimatedDuration);
      setFuelEstLiters(
        initialRoute.fuelEstLiters ||
          Math.round(initialRoute.totalDistance * 0.22 * 10) / 10
      );
      setTollFeeEstVND(initialRoute.tollFeeEstVND || 0);
      setTotalWeightKg(initialRoute.totalWeightKg || 1200);
      setTotalVolumeM3(initialRoute.totalVolumeM3 || 4.5);
      setStops(initialRoute.stops || []);
    } else {
      setCreationMode("ORDERS");
      const autoCode = `RT-VN-${Math.floor(100 + Math.random() * 900)}`;
      setRouteCode(autoCode);
      setRouteName("");
      const defaultWh = warehouses[0]?.id || "";
      setWarehouseId(defaultWh);
      setDriverId(drivers[0]?.id || "");
      setVehicleId(vehicles[0]?.id || "");
      setStatus("PLANNED");
      setTotalDistance(35);
      setEstimatedDuration(75);
      setFuelEstLiters(7.5);
      setTollFeeEstVND(35000);
      setTotalWeightKg(1200);
      setTotalVolumeM3(4.5);
      setStops([]);
      setSelectedOrderIds([]);
    }
    setErrorMessage("");
    setNotificationMsg("");
  }, [initialRoute, isOpen, warehouses, drivers, vehicles]);

  // Lọc các đơn hàng chờ giao theo kho xuất phát đang chọn
  const warehousePendingOrders = useMemo(() => {
    if (!warehouseId) return pendingOrders;
    const filtered = pendingOrders.filter((o) => o.warehouseId === warehouseId);
    return filtered.length > 0 ? filtered : pendingOrders.slice(0, 8);
  }, [pendingOrders, warehouseId]);

  // Toggle chọn/bỏ chọn 1 đơn hàng
  const handleToggleOrder = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // Chọn / Bỏ chọn tất cả đơn hàng trong kho
  const handleToggleAllOrders = () => {
    if (selectedOrderIds.length === warehousePendingOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(warehousePendingOrders.map((o) => o.id));
    }
  };

  // GOM ĐƠN HÀNG ĐÃ CHỌN ĐỂ TẠO CHẶNG DỪNG TỰ ĐỘNG
  const handleConsolidateSelectedOrders = () => {
    const ordersToBatch = warehousePendingOrders.filter((o) =>
      selectedOrderIds.includes(o.id)
    );

    if (ordersToBatch.length === 0) {
      setErrorMessage("Vui lòng tích chọn ít nhất 1 đơn hàng để gom tuyến.");
      return;
    }

    let sumWeight = 0;
    let sumVolume = 0;

    const newStops: RouteStop[] = ordersToBatch.map((order, idx) => {
      sumWeight += order.totalWeight || 0;
      sumVolume += order.totalVolume || 0;

      const startTime = order.deliveryWindowStart
        ? order.deliveryWindowStart.substring(11, 16)
        : "08:30";
      const endTime = order.deliveryWindowEnd
        ? order.deliveryWindowEnd.substring(11, 16)
        : "11:30";

      return {
        id: `stop-ord-${order.id}-${idx + 1}`,
        routeId: "",
        deliveryId: `dlv-${order.id}`,
        sequence: idx + 1,
        latitude: order.receiverLatitude,
        longitude: order.receiverLongitude,
        estimatedArrival: startTime,
        address: order.receiverAddress,
        status: "PENDING",
        customerName: order.receiverName,
        customerPhone: order.receiverPhone,
        orderCode: order.orderCode,
        weightKg: order.totalWeight,
        packageCount: order.items?.length || 1,
        timeWindowStart: startTime,
        timeWindowEnd: endTime,
        notes: `Đơn ưu tiên: ${order.priority}`,
      };
    });

    const estDist = Math.round((12 + ordersToBatch.length * 6.5) * 10) / 10;
    const estDur = Math.round(30 + ordersToBatch.length * 20);
    const estFuel = Math.round(estDist * 0.22 * 10) / 10;
    const estToll = ordersToBatch.length > 2 ? 35000 : 0;

    setStops(newStops);
    setTotalWeightKg(Math.round(sumWeight));
    setTotalVolumeM3(Math.round(sumVolume * 10) / 10);
    setTotalDistance(estDist);
    setEstimatedDuration(estDur);
    setFuelEstLiters(estFuel);
    setTollFeeEstVND(estToll);

    const selectedWh = warehouses.find((w) => w.id === warehouseId);
    setRouteName(
      `Tuyến giao ${ordersToBatch.length} đơn (${selectedWh?.name?.replace("Tổng kho ", "").replace("Kho Trung chuyển ", "") || "Kho"})`
    );

    setCreationMode("MANUAL"); // Chuyển sang xem danh sách chặng và tối ưu
    setNotificationMsg(
      `Đã gom thành công ${ordersToBatch.length} đơn hàng vào lộ trình! Nhấn "Tự động tối ưu TSP" để sắp xếp chặng gần nhất.`
    );
  };

  // ÁP DỤNG TUYẾN MẪU (ROUTE TEMPLATE)
  const handleApplyTemplate = (tpl: RouteTemplate) => {
    setRouteName(tpl.name);
    setWarehouseId(tpl.warehouseId);
    setTotalDistance(tpl.totalDistance);
    setEstimatedDuration(tpl.estimatedDuration);
    setFuelEstLiters(tpl.fuelEstLiters);
    setTollFeeEstVND(tpl.tollFeeEstVND);
    setTotalWeightKg(tpl.totalWeightKg);
    setTotalVolumeM3(tpl.totalVolumeM3);

    const clonedStops: RouteStop[] = tpl.stops.map((s, idx) => ({
      ...s,
      id: `stop-tpl-${Date.now()}-${idx + 1}`,
      sequence: idx + 1,
      status: "PENDING",
    }));

    setStops(clonedStops);
    setCreationMode("MANUAL");
    setNotificationMsg(`Đã nạp thành công Tuyến Mẫu "${tpl.name}" với ${clonedStops.length} điểm dừng!`);
  };

  if (!isOpen) return null;

  // Thêm điểm dừng thủ công
  const handleAddStop = () => {
    const newStop: RouteStop = {
      id: `stop-${Date.now()}-${stops.length + 1}`,
      routeId: initialRoute?.id || "",
      deliveryId: `dlv-${Date.now()}`,
      sequence: stops.length + 1,
      latitude: 10.78 + Math.random() * 0.05,
      longitude: 106.69 + Math.random() * 0.05,
      estimatedArrival: "09:00",
      address: `Điểm giao hàng mới #${stops.length + 1}`,
      status: "PENDING",
      customerName: `Khách hàng #${stops.length + 1}`,
      customerPhone: "0900000000",
      orderCode: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      weightKg: 300,
      packageCount: 10,
      timeWindowStart: "09:00",
      timeWindowEnd: "10:00",
    };
    setStops([...stops, newStop]);
  };

  const handleUpdateStop = (index: number, field: keyof RouteStop, value: any) => {
    const updated = [...stops];
    updated[index] = { ...updated[index], [field]: value };
    setStops(updated);
  };

  const handleRemoveStop = (index: number) => {
    const updated = stops.filter((_, i) => i !== index).map((s, i) => ({
      ...s,
      sequence: i + 1,
    }));
    setStops(updated);
  };

  // Tự động tối ưu thứ tự chặng (TSP Optimizer)
  const handleOptimizeStops = async () => {
    if (!onOptimizeStops || stops.length < 2) return;

    try {
      setIsOptimizing(true);
      setNotificationMsg("");

      const originWh = warehouses.find((w) => w.id === warehouseId) || warehouses[0];
      const originCoords: [number, number] = originWh
        ? [originWh.latitude, originWh.longitude]
        : [10.7769, 106.7009];

      const optimized = await onOptimizeStops(originCoords, stops);
      setStops(optimized);
      setNotificationMsg(`Đã tối ưu hóa thứ tự ${optimized.length} điểm dừng theo khoảng cách gần nhất!`);
    } catch (err: any) {
      setErrorMessage("Không thể tối ưu chặng dừng. Vui lòng thử lại.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!routeCode.trim()) {
      setErrorMessage("Vui lòng nhập mã tuyến đường");
      return;
    }

    if (!warehouseId) {
      setErrorMessage("Vui lòng chọn kho xuất phát");
      return;
    }

    try {
      setIsSubmitting(true);

      const routeData: Partial<Route> = {
        routeCode: routeCode.trim(),
        routeName: routeName.trim() || routeCode.trim(),
        warehouseId,
        driverId: driverId || undefined,
        vehicleId: vehicleId || undefined,
        status,
        totalDistance: Number(totalDistance),
        estimatedDuration: Number(estimatedDuration),
        fuelEstLiters: Number(fuelEstLiters),
        tollFeeEstVND: Number(tollFeeEstVND),
        totalWeightKg: Number(totalWeightKg),
        totalVolumeM3: Number(totalVolumeM3),
        stops: stops.map((s, idx) => ({ ...s, sequence: idx + 1 })),
      };

      await onSubmit(routeData);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || "Đã xảy ra lỗi khi lưu tuyến đường");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* 1. Header */}
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold border border-primary/30 shadow-2xs shrink-0">
                <RouteIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-foreground">
                  {isEditing ? "Chỉnh sửa thông số tuyến đường" : "Lập kế hoạch tuyến đường vận chuyển"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tự động gom đơn hàng, áp dụng tuyến mẫu hoặc quy hoạch lộ trình tối ưu TSP
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 2. Fast Creation Mode Switcher (Chỉ hiển thị khi tạo mới) */}
          {!isEditing && (
            <div className="bg-muted/40 p-2 border-b border-border flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant={creationMode === "ORDERS" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCreationMode("ORDERS")}
                  className="h-8 text-xs gap-1.5 cursor-pointer font-semibold"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>1. Gom đơn hàng chờ giao ({warehousePendingOrders.length})</span>
                </Button>

                <Button
                  type="button"
                  variant={creationMode === "TEMPLATE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCreationMode("TEMPLATE")}
                  className="h-8 text-xs gap-1.5 cursor-pointer font-semibold"
                >
                  <Layers className="h-3.5 w-3.5 text-blue-500" />
                  <span>2. Chọn Tuyến Mẫu ({routeTemplates.length})</span>
                </Button>

                <Button
                  type="button"
                  variant={creationMode === "MANUAL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCreationMode("MANUAL")}
                  className="h-8 text-xs gap-1.5 cursor-pointer"
                >
                  <span>3. Tùy chỉnh lộ trình ({stops.length} điểm)</span>
                </Button>
              </div>

              {stops.length > 0 && creationMode !== "MANUAL" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCreationMode("MANUAL")}
                  className="h-8 text-xs text-primary font-semibold gap-1"
                >
                  <span>Xem {stops.length} chặng đã nạp</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* 3. Main Form Content */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Notification message */}
            {notificationMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{notificationMsg}</span>
              </div>
            )}

            {/* TAB 1: GOM TỪ ĐƠN HÀNG CHỜ GIAO */}
            {!isEditing && creationMode === "ORDERS" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-border pb-2 flex-wrap">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span>Danh sách Đơn hàng sẵn sàng xuất bến tại kho</span>
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Tích chọn các đơn hàng để hệ thống tự động gom vào chuyến và tính toán cự ly
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleToggleAllOrders}
                      className="h-7 text-xs px-2.5 gap-1.5"
                    >
                      {selectedOrderIds.length === warehousePendingOrders.length && warehousePendingOrders.length > 0 ? (
                        <>
                          <CheckSquare className="h-3.5 w-3.5 text-primary" />
                          <span>Bỏ chọn tất cả</span>
                        </>
                      ) : (
                        <>
                          <Square className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Chọn tất cả ({warehousePendingOrders.length})</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleConsolidateSelectedOrders}
                      disabled={selectedOrderIds.length === 0}
                      className="h-7 text-xs px-3 font-semibold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                    >
                      <Zap className="h-3.5 w-3.5 fill-current" />
                      <span>Gom {selectedOrderIds.length} đơn vào Tuyến</span>
                    </Button>
                  </div>
                </div>

                {/* Kho xuất phát filter */}
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 text-xs">
                  <span className="text-muted-foreground font-medium shrink-0">Kho xuất phát:</span>
                  <Select value={warehouseId} onValueChange={setWarehouseId}>
                    <SelectTrigger className="h-7 text-xs w-[240px] bg-card">
                      <SelectValue placeholder="Chọn kho hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground text-[11px] ml-auto font-mono">
                    Đã chọn: <strong className="text-primary font-bold">{selectedOrderIds.length}</strong> / {warehousePendingOrders.length} đơn
                  </span>
                </div>

                {/* Orders list */}
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {warehousePendingOrders.map((order) => {
                    const isChecked = selectedOrderIds.includes(order.id);

                    return (
                      <div
                        key={order.id}
                        onClick={() => handleToggleOrder(order.id)}
                        className={cn(
                          "p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 select-none",
                          isChecked
                            ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-2xs"
                            : "border-border/80 bg-card hover:border-primary/40"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer shrink-0"
                        />

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.2 rounded border border-border/60 text-[11px]">
                                {order.orderCode}
                              </span>
                              <span className="font-bold text-foreground text-xs">{order.receiverName}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {order.priority === "URGENT" && (
                                <Badge variant="destructive" className="text-[9px] py-0 px-1.5">
                                  Hỏa tốc
                                </Badge>
                              )}
                              {order.priority === "HIGH" && (
                                <Badge variant="outline" className="text-[9px] py-0 px-1.5 text-amber-600 border-amber-500/30">
                                  Ưu tiên
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {order.status}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/80" />
                            <span>{order.receiverAddress}</span>
                          </p>

                          <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1 font-mono">
                            <span className="flex items-center gap-1">
                              <Weight className="h-3 w-3 text-primary" />
                              <strong>{order.totalWeight} kg</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3 text-blue-500" />
                              <span>{order.items?.length || 1} kiện</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{order.receiverPhone}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: CHỌN TUYẾN MẪU (ROUTE TEMPLATES) */}
            {!isEditing && creationMode === "TEMPLATE" && (
              <div className="space-y-3">
                <div className="space-y-0.5 border-b border-border pb-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-blue-500" />
                    <span>Thư viện Tuyến Mẫu Định Kỳ ({routeTemplates.length} tuyến)</span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Chọn một tuyến mẫu có sẵn để nạp tức thì danh sách điểm dừng quen thuộc
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {routeTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="p-3.5 rounded-xl border border-border bg-card hover:border-primary/60 transition-all space-y-2.5 text-xs flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-bold text-foreground text-xs leading-tight">
                            {tpl.name}
                          </h5>
                          <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-mono">
                            {tpl.category}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {tpl.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-muted/40 text-[10px] font-mono">
                        <div>
                          <span className="text-muted-foreground block text-[9px]">Cự ly:</span>
                          <span className="font-bold text-foreground">{tpl.totalDistance} km (~{tpl.estimatedDuration}p)</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[9px]">Điểm dừng:</span>
                          <span className="font-bold text-primary">{tpl.stops.length} điểm giao</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[9px]">Dầu & BOT:</span>
                          <span>~{tpl.fuelEstLiters}L • {(tpl.tollFeeEstVND / 1000).toLocaleString()}k</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[9px]">Tải trọng:</span>
                          <span>{tpl.totalWeightKg} kg</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleApplyTemplate(tpl)}
                        className="w-full h-8 text-xs font-semibold gap-1.5"
                      >
                        <span>Áp dụng Tuyến Mẫu này</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: THÔNG SỐ ĐIỀU VẬN & DANH SÁCH CHẶNG DỪNG */}
            {(isEditing || creationMode === "MANUAL") && (
              <>
                {/* Section 1: Nguồn lực xe, tài xế, mã tuyến */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-1.5">
                    <RouteIcon className="h-3.5 w-3.5 text-primary" />
                    <span>1. Phân bổ Xe, Tài xế & Kho xuất phát</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="routeCode" className="text-xs font-semibold text-foreground">
                        Mã tuyến vận chuyển <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        id="routeCode"
                        value={routeCode}
                        onChange={(e) => setRouteCode(e.target.value)}
                        placeholder="VD: RT-HN-005"
                        className="h-8 text-xs font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="routeName" className="text-xs font-semibold text-foreground">
                        Tên hành trình / Lộ trình
                      </label>
                      <Input
                        id="routeName"
                        value={routeName}
                        onChange={(e) => setRouteName(e.target.value)}
                        placeholder="VD: Tuyến Nội đô Hà Nội - Chuyển phát nhanh"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* Kho xuất phát */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-primary" />
                        Kho xuất phát <span className="text-rose-500">*</span>
                      </label>
                      <Select value={warehouseId} onValueChange={setWarehouseId}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Chọn kho" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map((w) => (
                            <SelectItem key={w.id} value={w.id}>
                              {w.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tài xế */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <User className="h-3 w-3 text-primary" />
                        Tài xế phụ trách
                      </label>
                      <Select value={driverId} onValueChange={setDriverId}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Chọn tài xế" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNASSIGNED">Chưa phân công</SelectItem>
                          {drivers.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.fullName} ({d.phone})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Xe vận chuyển */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Truck className="h-3 w-3 text-primary" />
                        Phương tiện gán
                      </label>
                      <Select value={vehicleId} onValueChange={setVehicleId}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Chọn xe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNASSIGNED">Chưa gán xe</SelectItem>
                          {vehicles.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.licensePlate} ({v.brand} - {v.capacityWeight >= 1000 ? `${v.capacityWeight / 1000} tấn` : `${v.capacityWeight} kg`})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Định mức cự ly, dầu, BOT */}
                <div className="space-y-3 pt-1">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-1.5">
                    <Coins className="h-3.5 w-3.5 text-amber-500" />
                    <span>2. Định mức Kỹ thuật & Chi phí Thực tế</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="totalDistance" className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Navigation className="h-3 w-3 text-primary" />
                        Cự ly (km)
                      </label>
                      <Input
                        id="totalDistance"
                        type="number"
                        step="0.1"
                        value={totalDistance}
                        onChange={(e) => {
                          const dist = Number(e.target.value);
                          setTotalDistance(dist);
                          setFuelEstLiters(Math.round(dist * 0.22 * 10) / 10);
                        }}
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="estimatedDuration" className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary" />
                        Thời gian (phút)
                      </label>
                      <Input
                        id="estimatedDuration"
                        type="number"
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="fuelEstLiters" className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Fuel className="h-3 w-3 text-blue-500" />
                        Dầu Diesel (Lít)
                      </label>
                      <Input
                        id="fuelEstLiters"
                        type="number"
                        step="0.1"
                        value={fuelEstLiters}
                        onChange={(e) => setFuelEstLiters(Number(e.target.value))}
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="tollFeeEstVND" className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Coins className="h-3 w-3 text-amber-500" />
                        Phí BOT (VNĐ)
                      </label>
                      <Input
                        id="tollFeeEstVND"
                        type="number"
                        step="1000"
                        value={tollFeeEstVND}
                        onChange={(e) => setTollFeeEstVND(Number(e.target.value))}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="space-y-1">
                      <label htmlFor="totalWeightKg" className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Weight className="h-3 w-3 text-primary" />
                        Tổng khối lượng (kg)
                      </label>
                      <Input
                        id="totalWeightKg"
                        type="number"
                        value={totalWeightKg}
                        onChange={(e) => setTotalWeightKg(Number(e.target.value))}
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="totalVolumeM3" className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Package className="h-3 w-3 text-primary" />
                        Tổng thể tích (m³)
                      </label>
                      <Input
                        id="totalVolumeM3"
                        type="number"
                        step="0.1"
                        value={totalVolumeM3}
                        onChange={(e) => setTotalVolumeM3(Number(e.target.value))}
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Trạng thái tuyến</label>
                      <Select value={status} onValueChange={(v) => setStatus(v as RouteStatus)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLANNED">Đã lập lịch (Planned)</SelectItem>
                          <SelectItem value="ACTIVE">Đang chạy (Active)</SelectItem>
                          <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
                          <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Quản lý các chặng dừng */}
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span>3. Danh sách Chặng dừng ({stops.length} điểm)</span>
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Sắp xếp thứ tự giao hàng và thời gian cam kết (Time Window)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {onOptimizeStops && stops.length >= 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleOptimizeStops}
                          disabled={isOptimizing}
                          className="h-7 text-xs px-2.5 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 gap-1"
                        >
                          <Sparkles className={cn("h-3 w-3", isOptimizing && "animate-spin")} />
                          <span>{isOptimizing ? "Đang tối ưu..." : "Tự động tối ưu TSP"}</span>
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddStop}
                        className="h-7 text-xs px-2.5 gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Thêm chặng</span>
                      </Button>
                    </div>
                  </div>

                  {/* Stops list */}
                  {stops.length > 0 ? (
                    <div className="space-y-2.5">
                      {stops.map((stop, idx) => (
                        <div
                          key={stop.id || idx}
                          className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground font-bold font-mono text-[10px] flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-foreground">Chặng #{idx + 1}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveStop(idx)}
                              className="text-muted-foreground hover:text-rose-600 p-1 transition-colors cursor-pointer"
                              title="Xóa chặng này"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="space-y-0.5">
                              <label className="text-[10px] text-muted-foreground">Khách hàng nhận</label>
                              <Input
                                value={stop.customerName || ""}
                                onChange={(e) => handleUpdateStop(idx, "customerName", e.target.value)}
                                placeholder="Tên khách hàng"
                                className="h-7 text-xs"
                              />
                            </div>

                            <div className="space-y-0.5">
                              <label className="text-[10px] text-muted-foreground">Số điện thoại</label>
                              <Input
                                value={stop.customerPhone || ""}
                                onChange={(e) => handleUpdateStop(idx, "customerPhone", e.target.value)}
                                placeholder="SĐT người nhận"
                                className="h-7 text-xs font-mono"
                              />
                            </div>

                            <div className="space-y-0.5">
                              <label className="text-[10px] text-muted-foreground">Mã đơn hàng</label>
                              <Input
                                value={stop.orderCode || ""}
                                onChange={(e) => handleUpdateStop(idx, "orderCode", e.target.value)}
                                placeholder="VD: ORD-8812"
                                className="h-7 text-xs font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <div className="sm:col-span-2 space-y-0.5">
                              <label className="text-[10px] text-muted-foreground">Địa chỉ giao hàng</label>
                              <Input
                                value={stop.address}
                                onChange={(e) => handleUpdateStop(idx, "address", e.target.value)}
                                placeholder="Số nhà, đường, phường, quận"
                                className="h-7 text-xs"
                              />
                            </div>

                            <div className="space-y-0.5">
                              <label className="text-[10px] text-muted-foreground">Khung giờ giao</label>
                              <div className="flex items-center gap-1">
                                <Input
                                  value={stop.timeWindowStart || "08:00"}
                                  onChange={(e) => handleUpdateStop(idx, "timeWindowStart", e.target.value)}
                                  className="h-7 text-[11px] font-mono px-1.5 text-center"
                                />
                                <span className="text-muted-foreground">-</span>
                                <Input
                                  value={stop.timeWindowEnd || "10:00"}
                                  onChange={(e) => handleUpdateStop(idx, "timeWindowEnd", e.target.value)}
                                  className="h-7 text-[11px] font-mono px-1.5 text-center"
                                />
                              </div>
                            </div>

                            <div className="space-y-0.5">
                              <label className="text-[10px] text-muted-foreground">Khối lượng (kg)</label>
                              <Input
                                type="number"
                                value={stop.weightKg || 100}
                                onChange={(e) => handleUpdateStop(idx, "weightKg", Number(e.target.value))}
                                className="h-7 text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2">
                      <p>Chưa có chặng dừng nào trong lộ trình.</p>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCreationMode("ORDERS")}
                          className="h-7 text-xs gap-1"
                        >
                          <Zap className="h-3 w-3 text-amber-500" />
                          <span>Gom từ đơn hàng</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddStop}
                          className="h-7 text-xs gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Thêm chặng thủ công</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-2.5">
              <div className="text-[11px] text-muted-foreground font-mono">
                {stops.length > 0 && (
                  <span>
                    Tổng {stops.length} điểm • {totalWeightKg} kg • ~{totalDistance} km
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="h-9 px-4 text-xs cursor-pointer"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || stops.length === 0}
                  className="h-9 px-5 text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Đang lưu...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{isEditing ? "Cập nhật tuyến đường" : "Lưu & Kích hoạt tuyến"}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
