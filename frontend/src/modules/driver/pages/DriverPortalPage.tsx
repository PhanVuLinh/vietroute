import React, { useState, useEffect } from "react";
import {
  Truck,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  Banknote,
  Package,
  MapPin,
  FileCheck,
  Smartphone,
  Maximize2,
  RefreshCw,
  Database,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ProofOfDeliveryModal } from "../components/ProofOfDeliveryModal";
import type { DriverShift, DriverStop, PodData } from "../types/driverPortal";
import { orderService, driverService } from "@/mocks/adapters/serviceFactory";
import { toast } from "@/shared/components/feedback/Toast";

// Dữ liệu ca chạy mẫu ban đầu
const INITIAL_SHIFT: DriverShift = {
  driverId: "drv-01",
  driverName: "Nguyễn Văn An",
  driverCode: "TX-HAN-01",
  phone: "0971.001.001",
  vehiclePlate: "29C-741.82",
  vehicleName: "Hino 5 Tấn (Thùng bạt)",
  routeCode: "ROUTE-HAN-001",
  routeName: "Tuyến Long Biên - Tam Trinh - La Thành - Cầu Giấy",
  totalStops: 4,
  completedStops: 1,
  pendingStops: 3,
  totalDistanceKm: 34.8,
  totalCodExpected: 26600000,
  totalCodCollected: 3200000,
  stops: [
    {
      id: "stop-01",
      sequence: 1,
      orderId: "ord-04",
      orderCode: "VR-2026-004",
      customerName: "Trần Thị Bích Ngọc",
      customerPhone: "0912.445.566",
      address: "Số 88 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội",
      lat: 21.0345,
      lng: 105.7981,
      weightKg: 18.5,
      packagesCount: 2,
      codAmount: 3200000,
      priority: "NORMAL",
      status: "DELIVERED",
      estimatedArrival: "09:30",
      timeWindow: "08:30 - 10:30",
      itemsSummary: "Sữa tươi TH True Milk (1 thùng), Bánh kẹo Tết Kinh Đô (1 thùng)",
      pod: {
        signatureUrl:
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='80'><path d='M20,50 Q60,10 100,50 T180,40' stroke='%232563eb' stroke-width='3' fill='none'/></svg>",
        photoUrl:
          "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60",
        codCollected: true,
        codAmount: 3200000,
        codPaymentMethod: "CASH",
        receiverName: "Trần Thị Bích Ngọc",
        receiverRelation: "SELF",
        completedAt: "2026-09-18T09:42:00Z",
      },
    },
    {
      id: "stop-02",
      sequence: 2,
      orderId: "ord-01",
      orderCode: "VR-2026-001",
      customerName: "Nguyễn Tiến Dũng (Tiếp vận Thăng Long)",
      customerPhone: "0988.123.456",
      address: "Số 18 Tam Trinh, Mai Động, Hoàng Mai, Hà Nội",
      lat: 20.9984,
      lng: 105.8642,
      weightKg: 350.5,
      packagesCount: 21,
      codAmount: 14500000,
      priority: "URGENT",
      status: "DELIVERING",
      estimatedArrival: "11:15",
      timeWindow: "10:30 - 12:00",
      itemsSummary: "Tivi Bravia 55 Inch (4 kiện), Dầu ăn Neptune (12 can), Bo mạch chủ (5 kiện)",
    },
    {
      id: "stop-03",
      sequence: 3,
      orderId: "ord-02",
      orderCode: "VR-2026-002",
      customerName: "Dược sĩ Hoàng Kim Chi (Hapharco)",
      customerPhone: "0912.876.543",
      address: "Số 170 La Thành, Ô Chợ Dừa, Đống Đa, Hà Nội",
      lat: 21.0185,
      lng: 105.8247,
      weightKg: 45.0,
      packagesCount: 21,
      codAmount: 8900000,
      priority: "HIGH",
      status: "PENDING",
      estimatedArrival: "14:00",
      timeWindow: "13:30 - 15:30",
      itemsSummary: "Dược phẩm kháng sinh (6 thùng), Găng tay y tế Vglove (15 hộp)",
    },
    {
      id: "stop-04",
      sequence: 4,
      orderId: "ord-03",
      orderCode: "VR-2026-003",
      customerName: "Anh Tuấn (Kỹ thuật An Phát PC)",
      customerPhone: "0904.332.119",
      address: "Số 49 Thái Hà, Trung Liệt, Đống Đa, Hà Nội",
      lat: 21.0128,
      lng: 105.8194,
      weightKg: 120.0,
      packagesCount: 14,
      codAmount: 0,
      priority: "NORMAL",
      status: "PENDING",
      estimatedArrival: "16:15",
      timeWindow: "15:00 - 17:30",
      itemsSummary: "Kiện Linh Kiện Máy Tính (12 kiện), Dây Cáp Mạng Cat6 (2 cuộn)",
    },
  ],
};

export const DriverPortalPage: React.FC = () => {
  const [shift, setShift] = useState<DriverShift>(() => {
    const saved = localStorage.getItem("vietroute_driver_shift");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SHIFT;
      }
    }
    return INITIAL_SHIFT;
  });

  const [isLoadingShift, setIsLoadingShift] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "DELIVERED">("ALL");
  const [activePodStop, setActivePodStop] = useState<DriverStop | null>(null);
  const [viewingPodStop, setViewingPodStop] = useState<DriverStop | null>(null);
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  // Tải ca chạy thực tế từ PostgreSQL
  const fetchActiveShift = async () => {
    setIsLoadingShift(true);
    try {
      const res = await driverService.getActiveShift();
      const shiftData = res?.data || res;
      if (shiftData && shiftData.stops && shiftData.stops.length > 0) {
        setShift(shiftData);
      }
    } catch {
      // Giữ shift hiện tại
    } finally {
      setIsLoadingShift(false);
    }
  };

  useEffect(() => {
    fetchActiveShift();
  }, []);

  // Lưu trạng thái vào localStorage
  useEffect(() => {
    localStorage.setItem("vietroute_driver_shift", JSON.stringify(shift));
  }, [shift]);

  // Cập nhật trạng thái điểm dừng
  const handleUpdateStatus = (stopId: string, newStatus: DriverStop["status"]) => {
    setShift((prev) => {
      const newStops = prev.stops.map((s) => (s.id === stopId ? { ...s, status: newStatus } : s));
      const completed = newStops.filter((s) => s.status === "DELIVERED").length;
      return {
        ...prev,
        stops: newStops,
        completedStops: completed,
        pendingStops: newStops.length - completed,
      };
    });
  };

  // Xác nhận e-POD từ Modal
  const handleConfirmPod = async (stopId: string, pod: PodData) => {
    const targetStop = shift.stops.find((s) => s.id === stopId);
    const addedCod = targetStop?.codAmount || 0;

    // Đồng bộ lên backend DB nếu có orderId thật
    if (targetStop?.orderId) {
      try {
        await (orderService as any).submitPod(targetStop.orderId, pod);
        toast.success(`Đã lưu e-POD lên hệ thống cho đơn ${targetStop.orderCode}!`);
      } catch (err: any) {
        toast.info("Đã lưu e-POD cục bộ ca chạy (lỗi đồng bộ API: " + (err?.message || "offline") + ")");
      }
    } else {
      toast.success("Đã ghi nhận e-POD thành công!");
    }

    setShift((prev) => {
      const newStops = prev.stops.map((s) =>
        s.id === stopId ? { ...s, status: "DELIVERED" as const, pod } : s
      );

      const completed = newStops.filter((s) => s.status === "DELIVERED").length;

      return {
        ...prev,
        stops: newStops,
        completedStops: completed,
        pendingStops: newStops.length - completed,
        totalCodCollected: prev.totalCodCollected + addedCod,
      };
    });
  };

  // Nạp đơn hàng thực tế từ DB PostgreSQL
  const handleSyncRealOrders = async () => {
    try {
      const res = await orderService.getOrders({ pageSize: 10 });
      const items = res?.data?.items || [];
      if (items.length > 0) {
        const stops: DriverStop[] = items.slice(0, 6).map((ord: any, idx: number) => ({
          id: ord.id,
          sequence: idx + 1,
          orderId: ord.id,
          orderCode: ord.orderCode,
          customerName: ord.receiverName || "Khách nhận hàng",
          customerPhone: ord.receiverPhone || "0912.345.678",
          address: ord.receiverAddress || "Hà Nội",
          lat: ord.receiverLatitude || 21.0285 + idx * 0.005,
          lng: ord.receiverLongitude || 105.8544 + idx * 0.005,
          weightKg: ord.totalWeight || 20,
          packagesCount: ord.items?.length || 1,
          codAmount: ord.codAmount || 0,
          priority: (ord.priority as any) || "NORMAL",
          status: ord.status === "DELIVERED" ? "DELIVERED" : ord.status === "IN_TRANSIT" ? "DELIVERING" : "PENDING",
          estimatedArrival: `${9 + idx}:30`,
          timeWindow: "08:30 - 17:30",
          itemsSummary: ord.items?.map((it: any) => `${it.productName} (x${it.quantity})`).join(", ") || `Bưu phẩm ${ord.totalWeight} kg`,
          pod: (ord as any).pod,
        }));
        const completed = stops.filter((s) => s.status === "DELIVERED").length;
        const totalCod = stops.reduce((acc, s) => acc + s.codAmount, 0);
        const collectedCod = stops.filter((s) => s.status === "DELIVERED").reduce((acc, s) => acc + s.codAmount, 0);

        setShift((prev) => ({
          ...prev,
          totalStops: stops.length,
          completedStops: completed,
          pendingStops: stops.length - completed,
          totalCodExpected: totalCod,
          totalCodCollected: collectedCod,
          stops,
        }));
        toast.success(`Đã nạp ${stops.length} đơn hàng thực từ CSDL vào ca chạy!`);
      } else {
        toast.info("Chưa tìm thấy đơn hàng trong CSDL");
      }
    } catch (err: any) {
      toast.error("Không thể lấy dữ liệu đơn hàng: " + (err?.message || "Lỗi kết nối"));
    }
  };

  // Reset ca chạy về ban đầu
  const handleResetShift = () => {
    if (window.confirm("Bạn có muốn đặt lại ca chạy mẫu để trải nghiệm lại từ đầu?")) {
      setShift(INITIAL_SHIFT);
      localStorage.removeItem("vietroute_driver_shift");
      toast.info("Đã khôi phục ca chạy ban đầu");
    }
  };

  const filteredStops = shift.stops.filter((s) => {
    if (filterStatus === "PENDING") return s.status !== "DELIVERED";
    if (filterStatus === "DELIVERED") return s.status === "DELIVERED";
    return true;
  });

  const progressPercent = Math.round((shift.completedStops / shift.totalStops) * 100);

  return (
    <div className="space-y-4 pb-12">
      {/* Top Bar điều khiển & chuyển đổi chế độ xem */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-lg font-bold text-foreground">
              Ứng dụng Tài xế & POD Điện tử (Driver Portal)
            </h1>
            <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px]">
              PWA Mobile-First
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Giao diện thực địa dành riêng cho tài xế: Nhận lộ trình, gọi điện 1 chạm, thu tiền COD và ký biên bản giao nhận.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleSyncRealOrders}
            className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
            title="Tải đơn hàng thực tế từ cơ sở dữ liệu PostgreSQL"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Nạp đơn từ DB</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            {isPhoneFrame ? <Maximize2 className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
            <span>{isPhoneFrame ? "Toàn màn hình" : "Mô phỏng Mobile"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetShift}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Khôi phục ca chạy ban đầu"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Khôi phục ca</span>
          </Button>
        </div>
      </div>

      {/* Main Container (Có thể chuyển sang khung điện thoại hoặc responsive) */}
      <div className={`mx-auto transition-all duration-300 ${isPhoneFrame ? "max-w-md" : "max-w-4xl"}`}>
        <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
          {/* Header Thông tin tài xế & Ca chạy */}
          <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 text-white p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white/10 ring-2 ring-white/20 flex items-center justify-center font-bold text-lg text-white">
                  AN
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base text-white leading-tight">
                      {shift.driverName}
                    </h2>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-semibold border border-emerald-400/30">
                      {shift.driverCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-100/80 mt-1">
                    <Truck className="h-3.5 w-3.5" />
                    <span>{shift.vehiclePlate} • {shift.vehicleName}</span>
                  </div>
                </div>
              </div>

              <Badge className="bg-white/15 text-white hover:bg-white/20 border-white/20 text-[11px]">
                Đang trực ca
              </Badge>
            </div>

            {/* Thẻ tiến trình ca chạy */}
            <div className="p-3.5 rounded-2xl bg-black/20 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-200">Tiến độ ca chạy hôm nay</span>
                <span className="font-bold text-white font-mono">
                  {shift.completedStops} / {shift.totalStops} điểm ({progressPercent}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Chỉ số COD & Quãng đường */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-blue-200/80 block">Tổng COD cần thu</span>
                  <span className="font-bold font-mono text-amber-300">
                    {shift.totalCodExpected.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-200/80 block">Đã thu về ví ca</span>
                  <span className="font-bold font-mono text-emerald-300">
                    {shift.totalCodCollected.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bộ lọc trạng thái điểm dừng */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
            <span className="text-xs font-bold text-foreground">
              Lộ trình dừng ({shift.stops.length} điểm)
            </span>
            <div className="flex items-center gap-1 bg-card p-0.5 rounded-lg border border-border">
              {(
                [
                  { key: "ALL", label: "Tất cả" },
                  { key: "PENDING", label: "Cần giao" },
                  { key: "DELIVERED", label: "Đã xong" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterStatus(tab.key)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    filterStatus === tab.key
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Danh sách các Điểm dừng Timeline */}
          <div className="p-4 space-y-3">
            {filteredStops.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                Không có điểm dừng nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              filteredStops.map((stop) => {
                const isDelivered = stop.status === "DELIVERED";
                const isDelivering = stop.status === "DELIVERING";

                return (
                  <div
                    key={stop.id}
                    className={`rounded-2xl border transition-all p-4 space-y-3.5 ${
                      isDelivering
                        ? "bg-primary/5 border-primary/50 shadow-md ring-1 ring-primary/20"
                        : isDelivered
                        ? "bg-emerald-500/5 border-emerald-500/30 opacity-90"
                        : "bg-card border-border hover:border-muted-foreground/30 shadow-xs"
                    }`}
                  >
                    {/* Header điểm dừng */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isDelivered
                              ? "bg-emerald-500 text-white"
                              : isDelivering
                              ? "bg-primary text-primary-foreground animate-bounce"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isDelivered ? <CheckCircle2 className="h-4 w-4" /> : stop.sequence}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">
                              {stop.customerName}
                            </span>
                            {stop.priority === "URGENT" && (
                              <Badge className="bg-red-500 text-white text-[9px] px-1 py-0">
                                HỎA TỐC
                              </Badge>
                            )}
                          </div>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            Đơn hàng: {stop.orderCode}
                          </span>
                        </div>
                      </div>

                      {/* Trạng thái */}
                      <div>
                        {isDelivered ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Đã giao
                          </Badge>
                        ) : isDelivering ? (
                          <Badge className="bg-primary text-primary-foreground text-[10px] gap-1 animate-pulse">
                            <Clock className="h-3 w-3" />
                            Đang giao
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Chờ giao
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Địa chỉ & Khung giờ hẹn */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-start gap-2 text-foreground/90">
                        <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="font-medium leading-relaxed">{stop.address}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-[11px] pl-6">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                          <span>Khung giờ hẹn: <b>{stop.timeWindow}</b></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-3.5 w-3.5 text-blue-500" />
                          <span>{stop.packagesCount} kiện ({stop.weightKg} kg)</span>
                        </div>
                      </div>
                    </div>

                    {/* Mặt hàng tóm tắt & Tiền COD */}
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                      <div className="line-clamp-1 text-muted-foreground text-[11px] pr-2 flex items-center gap-1.5">
                        <Package className="h-3 w-3 text-muted-foreground shrink-0 inline" />
                        <span>{stop.itemsSummary}</span>
                      </div>

                      {stop.codAmount > 0 ? (
                        <div className="flex items-center gap-1 shrink-0 font-bold font-mono text-amber-600 dark:text-amber-400">
                          <Banknote className="h-3.5 w-3.5" />
                          <span>{stop.codAmount.toLocaleString("vi-VN")} đ</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                          Đã thanh toán trước
                        </Badge>
                      )}
                    </div>

                    {/* Action buttons nghiệp vụ tài xế */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* Nút gọi điện nhanh */}
                      <a
                        href={`tel:${stop.customerPhone}`}
                        className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 h-9 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Gọi khách ({stop.customerPhone})</span>
                      </a>

                      {/* Nút mở chỉ đường Google Maps */}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        title="Mở Google Maps dẫn đường"
                      >
                        <Navigation className="h-3.5 w-3.5 text-blue-600" />
                        <span className="hidden sm:inline">Chỉ đường</span>
                      </a>

                      {/* Nút thao tác hoàn tất hoặc xem biên bản e-POD */}
                      {isDelivered ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingPodStop(stop)}
                          className="flex-1 min-w-[140px] h-9 text-xs border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
                        >
                          <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Xem biên bản e-POD</span>
                        </Button>
                      ) : (
                        <div className="flex-1 min-w-[140px] flex items-center gap-1.5">
                          {stop.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(stop.id, "DELIVERING")}
                              className="h-9 text-xs border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
                            >
                              Đến nơi
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => setActivePodStop(stop)}
                            className="flex-1 h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <FileCheck className="h-4 w-4" />
                            <span>Ký nhận (e-POD)</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal Ký nhận e-POD */}
      {activePodStop && (
        <ProofOfDeliveryModal
          isOpen={!!activePodStop}
          stop={activePodStop}
          onClose={() => setActivePodStop(null)}
          onConfirmPod={handleConfirmPod}
        />
      )}

      {/* Modal Xem chi tiết e-POD đã ký */}
      {viewingPodStop && viewingPodStop.pod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card text-card-foreground border border-border rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm">Biên bản bàn giao đã ký (e-POD)</h3>
              </div>
              <button
                onClick={() => setViewingPodStop(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã đơn:</span>
                  <span className="font-mono font-bold text-foreground">{viewingPodStop.orderCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Người nhận:</span>
                  <span className="font-semibold text-foreground">{viewingPodStop.pod.receiverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời gian ký nhận:</span>
                  <span className="text-foreground">
                    {new Date(viewingPodStop.pod.completedAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thu tiền COD:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {viewingPodStop.pod.codAmount.toLocaleString("vi-VN")} đ (Đã nhận đủ)
                  </span>
                </div>
              </div>

              {/* Chữ ký */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  Chữ ký điện tử người nhận:
                </span>
                <div className="h-28 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden p-2">
                  <img
                    src={viewingPodStop.pod.signatureUrl}
                    alt="Chữ ký"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              {/* Ảnh bàn giao */}
              {viewingPodStop.pod.photoUrl && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    Hình ảnh kiện hàng tại điểm giao:
                  </span>
                  <div className="h-32 rounded-xl border border-border overflow-hidden bg-black/10">
                    <img
                      src={viewingPodStop.pod.photoUrl}
                      alt="Ảnh kiện hàng"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full text-xs h-9 cursor-pointer"
              onClick={() => setViewingPodStop(null)}
            >
              Đóng biên bản
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
