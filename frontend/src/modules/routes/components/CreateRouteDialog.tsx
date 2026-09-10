import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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
} from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

interface CreateRouteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (routeData: Partial<Route>) => Promise<void>;
  onOptimizeStops?: (originCoords: [number, number], stops: RouteStop[]) => Promise<RouteStop[]>;
  initialRoute?: Route | null;
  warehouses: Warehouse[];
  drivers: Driver[];
  vehicles: Vehicle[];
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
}) => {
  const isEditing = !!initialRoute;

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

  // Stops list
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [optimizationSuccessMsg, setOptimizationSuccessMsg] = useState<string>("");

  useEffect(() => {
    if (initialRoute) {
      setRouteCode(initialRoute.routeCode);
      setRouteName(initialRoute.routeName || "");
      setWarehouseId(initialRoute.warehouseId);
      setDriverId(initialRoute.driverId || "");
      setVehicleId(initialRoute.vehicleId || "");
      setStatus(initialRoute.status);
      setTotalDistance(initialRoute.totalDistance);
      setEstimatedDuration(initialRoute.estimatedDuration);
      setFuelEstLiters(initialRoute.fuelEstLiters || Math.round(initialRoute.totalDistance * 0.22 * 10) / 10);
      setTollFeeEstVND(initialRoute.tollFeeEstVND || 0);
      setTotalWeightKg(initialRoute.totalWeightKg || 1200);
      setTotalVolumeM3(initialRoute.totalVolumeM3 || 4.5);
      setStops(initialRoute.stops || []);
    } else {
      // Default new route
      const autoCode = `RT-VN-${Math.floor(100 + Math.random() * 900)}`;
      setRouteCode(autoCode);
      setRouteName("");
      setWarehouseId(warehouses[0]?.id || "");
      setDriverId(drivers[0]?.id || "");
      setVehicleId(vehicles[0]?.id || "");
      setStatus("PLANNED");
      setTotalDistance(42);
      setEstimatedDuration(85);
      setFuelEstLiters(9.2);
      setTollFeeEstVND(35000);
      setTotalWeightKg(1500);
      setTotalVolumeM3(5.0);

      // 3 Default stops for quick start
      setStops([
        {
          id: `stop-${Date.now()}-1`,
          routeId: "",
          deliveryId: "dlv-001",
          sequence: 1,
          latitude: 10.7769,
          longitude: 106.7009,
          estimatedArrival: "08:30",
          address: "123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
          status: "PENDING",
          customerName: "Đại lý Bách Hóa Xanh Q1",
          customerPhone: "0912345678",
          orderCode: "ORD-8801",
          weightKg: 450,
          packageCount: 15,
          timeWindowStart: "08:30",
          timeWindowEnd: "09:30",
          notes: "Giao cổng hông tòa nhà",
        },
        {
          id: `stop-${Date.now()}-2`,
          routeId: "",
          deliveryId: "dlv-002",
          sequence: 2,
          latitude: 10.795,
          longitude: 106.68,
          estimatedArrival: "10:00",
          address: "45 Phan Xích Long, Phường 2, Phú Nhuận, TP.HCM",
          status: "PENDING",
          customerName: "Siêu thị Co.op Food PN",
          customerPhone: "0987654321",
          orderCode: "ORD-8802",
          weightKg: 600,
          packageCount: 22,
          timeWindowStart: "10:00",
          timeWindowEnd: "11:00",
          notes: "Kiểm tra tem niêm phong",
        },
      ]);
    }
    setErrorMessage("");
    setOptimizationSuccessMsg("");
  }, [initialRoute, isOpen, warehouses, drivers, vehicles]);

  if (!isOpen) return null;

  // Thêm điểm dừng mới
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

  // Cập nhật thông tin của 1 điểm dừng
  const handleUpdateStop = (index: number, field: keyof RouteStop, value: any) => {
    const updated = [...stops];
    updated[index] = { ...updated[index], [field]: value };
    setStops(updated);
  };

  // Xóa 1 điểm dừng
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
      setOptimizationSuccessMsg("");

      const originWh = warehouses.find((w) => w.id === warehouseId) || warehouses[0];
      const originCoords: [number, number] = originWh
        ? [originWh.latitude, originWh.longitude]
        : [10.7769, 106.7009];

      const optimized = await onOptimizeStops(originCoords, stops);
      setStops(optimized);
      setOptimizationSuccessMsg(`Đã tối ưu hóa thứ tự ${optimized.length} điểm dừng theo khoảng cách gần nhất!`);
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
        <div className="relative w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold border border-primary/30 shadow-2xs shrink-0">
                <RouteIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-foreground">
                  {isEditing ? "Chỉnh sửa thông số tuyến đường" : "Lập kế hoạch tuyến đường mới"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Quy hoạch luồng giao nhận đa điểm dừng & Tối ưu hóa thứ tự vận chuyển
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success optimization notification */}
            {optimizationSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{optimizationSuccessMsg}</span>
              </div>
            )}

            {/* Section 1: Thông tin định tuyến cơ bản */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-1.5">
                <RouteIcon className="h-3.5 w-3.5 text-primary" />
                <span>1. Thông tin Tuyến đường & Phân bổ Nguồn lực</span>
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
                          {d.fullName} ({d.phoneNumber})
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
                          {v.licensePlate} ({v.brand} - {v.capacity}T)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Định mức chi phí & Chỉ số kỹ thuật */}
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

            {/* Section 3: Quản lý các chặng dừng giao hàng */}
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

              {/* Stops list items */}
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
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-9 px-4 text-xs"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 px-5 text-xs font-semibold gap-1.5"
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
          </form>
        </div>
      </div>
    </div>
  );
};
