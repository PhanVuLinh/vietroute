import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Truck,
  Package,
  Clock,
  MapPin,
  Phone,
  FileCheck,
  Star,
  Copy,
  Check,
  RefreshCw,
  CreditCard,
  ShieldCheck,
  Navigation2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { MapContainer } from "@/shared/components/map/MapContainer";
import { Marker, Popup } from "maplibre-gl";
import {
  usePublicTracking,
  type TrackingShipment,
} from "../hooks/usePublicTracking";
import { toast } from "@/shared/components/feedback/Toast";

// Dữ liệu mẫu dự phòng khi chạy offline hoặc truy vấn các mã mẫu cố định
const SAMPLE_SHIPMENTS: Record<string, TrackingShipment> = {
  "VR-2026-001": {
    orderCode: "VR-2026-001",
    senderName: "Tổng kho Phân phối VietRoute Miền Bắc",
    senderAddress: "KCN Đài Tư, 386 Nguyễn Văn Linh, Phúc Lợi, Long Biên, Hà Nội",
    receiverName: "Nguyễn Tiến Dũng (Thăng Long Logistics)",
    receiverPhone: "0988.***.456",
    receiverAddress: "Số 18 Tam Trinh, Hoàng Mai, Hà Nội",
    warehouseName: "Tổng kho Long Biên",
    warehouseAddress: "Long Biên, Hà Nội",
    status: "IN_TRANSIT",
    statusText: "Đang trên đường giao hàng",
    priority: "URGENT",
    codAmount: 14500000,
    weightKg: 350.5,
    itemsSummary:
      "Tivi Bravia 55 Inch (4 kiện), Dầu ăn Neptune 5L (12 can), Bo mạch chủ (5 kiện)",
    createdAt: "18/09/2026 07:30",
    estimatedDelivery: "Hôm nay, trước 12:00 (Khoảng 25 phút nữa)",
    driver: {
      name: "Nguyễn Văn An",
      phone: "0971.001.001",
      vehiclePlate: "29C-741.82",
      vehicleModel: "Hino FC9J 5 Tấn",
      rating: 4.95,
      currentLocation: [105.8642, 21.015],
    },
    originCoords: [105.9082, 21.0368],
    destinationCoords: [105.8642, 20.9984],
    steps: [
      {
        title: "Đơn hàng đã tiếp nhận",
        time: "18/09/2026 07:30",
        location: "Hệ thống VietRoute",
        description: "Khách hàng tạo đơn vận chuyển liên tỉnh thành công.",
        completed: true,
      },
      {
        title: "Xuất kho & Xếp lên xe tải",
        time: "18/09/2026 08:45",
        location: "Tổng kho Long Biên (Hà Nội)",
        description: "Hàng hóa đã kiểm đếm, niêm phong và bốc lên xe 29C-741.82.",
        completed: true,
      },
      {
        title: "Tài xế đang giao hàng",
        time: "18/09/2026 10:15",
        location: "Quận Hoàng Mai, Hà Nội",
        description: "Tài xế Nguyễn Văn An đang di chuyển đến địa chỉ của bạn.",
        completed: true,
        current: true,
      },
      {
        title: "Giao hàng thành công",
        time: "Dự kiến 11:30",
        location: "Số 18 Tam Trinh, Hoàng Mai",
        description: "Ký nhận biên bản e-POD và hoàn tất bàn giao.",
        completed: false,
      },
    ],
  },
  "VR-2026-004": {
    orderCode: "VR-2026-004",
    senderName: "Công ty Sữa & Bánh kẹo Tiêu dùng",
    senderAddress: "Số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội",
    receiverName: "Trần Thị Bích Ngọc",
    receiverPhone: "0912.***.566",
    receiverAddress: "Số 88 Cầu Giấy, Cầu Giấy, Hà Nội",
    warehouseName: "Kho Vệ Tinh Cầu Giấy",
    warehouseAddress: "Cầu Giấy, Hà Nội",
    status: "DELIVERED",
    statusText: "Giao hàng thành công",
    priority: "NORMAL",
    codAmount: 3200000,
    weightKg: 18.5,
    itemsSummary:
      "Sữa tươi tiệt trùng TH True Milk (1 thùng), Bánh kẹo Tết Kinh Đô (1 thùng)",
    createdAt: "18/09/2026 08:15",
    estimatedDelivery: "Đã giao lúc 09:42 ngày 18/09/2026",
    driver: {
      name: "Trần Minh Hoàng",
      phone: "0971.001.002",
      vehiclePlate: "29H-123.45",
      vehicleModel: "Ford Transit Van 1.25T",
      rating: 4.88,
      currentLocation: [105.7981, 21.0345],
    },
    originCoords: [105.7925, 21.0285],
    destinationCoords: [105.7981, 21.0345],
    steps: [
      {
        title: "Đơn hàng đã tiếp nhận",
        time: "18/09/2026 08:15",
        location: "Hệ thống VietRoute",
        description: "Tiếp nhận đơn hàng thành công.",
        completed: true,
      },
      {
        title: "Xuất kho trung chuyển Cầu Giấy",
        time: "18/09/2026 09:00",
        location: "Kho Cầu Giấy",
        description: "Bàn giao đơn hàng cho xe giao chặng cuối.",
        completed: true,
      },
      {
        title: "Đang phát hàng",
        time: "18/09/2026 09:20",
        location: "Tuyến Cầu Giấy",
        description: "Tài xế liên hệ người nhận và di chuyển tới điểm giao.",
        completed: true,
      },
      {
        title: "Giao hàng thành công",
        time: "18/09/2026 09:42",
        location: "Số 88 Cầu Giấy, Hà Nội",
        description:
          "Khách hàng đã kiểm tra hàng, thanh toán COD và ký nhận e-POD.",
        completed: true,
        current: true,
      },
    ],
    pod: {
      signedBy: "Trần Thị Bích Ngọc (Người nhận)",
      signedAt: "18/09/2026 09:42",
      signatureUrl:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='90'><path d='M20,60 Q70,20 110,60 T190,45' stroke='%231d4ed8' stroke-width='3.5' fill='none'/><path d='M40,75 L180,70' stroke='%231d4ed8' stroke-width='2' fill='none'/></svg>",
      photoUrl:
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60",
      codCollected: true,
      codPaymentMethod: "CASH",
    },
  },
  "VR-2026-005": {
    orderCode: "VR-2026-005",
    senderName: "Tập đoàn Bán lẻ WinCommerce Miền Nam",
    senderAddress:
      "Tòa nhà Bitexco, Số 2 Hải Triều, Bến Nghé, Quận 1, TP.HCM",
    receiverName: "Quản lý Kho WinMart Cát Lái",
    receiverPhone: "0933.***.882",
    receiverAddress: "KCN Cát Lái 2, TP. Thủ Đức, TP. Hồ Chí Minh",
    warehouseName: "Tổng kho Cát Lái",
    warehouseAddress: "Cát Lái, Thủ Đức, TP.HCM",
    status: "IN_TRANSIT",
    statusText: "Đang vận chuyển liên quận",
    priority: "URGENT",
    codAmount: 45000000,
    weightKg: 1850.0,
    itemsSummary:
      "Bao Gạo Nàng Thơm Chợ Đào (50 bao - 1.25T), Bia Sài Gòn Special (50 thùng)",
    createdAt: "18/09/2026 09:00",
    estimatedDelivery: "Hôm nay, trước 15:30",
    driver: {
      name: "Hoàng Đức Thắng",
      phone: "0971.001.005",
      vehiclePlate: "51D-928.34",
      vehicleModel: "Hino 5 Tấn XZU730L",
      rating: 4.92,
      currentLocation: [106.74, 10.768],
    },
    originCoords: [106.7042, 10.7715],
    destinationCoords: [106.7934, 10.7612],
    steps: [
      {
        title: "Đơn hàng đã tiếp nhận",
        time: "18/09/2026 09:00",
        location: "Hệ thống VietRoute",
        description: "Tiếp nhận lô hàng nặng từ đối tác B2B.",
        completed: true,
      },
      {
        title: "Bốc xếp tại Dock Cát Lái",
        time: "18/09/2026 10:30",
        location: "Tổng kho Cát Lái",
        description: "Hàng hóa pallet đã kiểm tra tải trọng an toàn.",
        completed: true,
      },
      {
        title: "Đang vận chuyển",
        time: "18/09/2026 11:45",
        location: "Đại lộ Mai Chí Thọ, TP. Thủ Đức",
        description: "Xe container chuyên dụng đang di chuyển trên tuyến.",
        completed: true,
        current: true,
      },
      {
        title: "Bàn giao tại điểm đến",
        time: "Dự kiến 15:30",
        location: "Kho WinMart Cát Lái",
        description: "Giao hàng, kiểm đếm pallet và thu COD.",
        completed: false,
      },
    ],
  },
};

export const PublicTrackingPage: React.FC = () => {
  const { orderCode: routeOrderCode } = useParams<{ orderCode?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCode =
    routeOrderCode || searchParams.get("code") || "VR-2026-001";
  const [searchQuery, setSearchQuery] = useState(initialCode);
  const [activeCode, setActiveCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);

  // Hook kết nối Backend NestJS & PostgreSQL thật
  const {
    shipment: apiShipment,
    isLoading,
    isRefetching,
    refetch,
    submitFeedback,
    isSubmittingFeedback,
  } = usePublicTracking(activeCode);

  // Lấy dữ liệu thật từ Backend, nếu không tìm thấy thử tìm trong dữ liệu mẫu
  const shipment: TrackingShipment | undefined =
    apiShipment || SAMPLE_SHIPMENTS[activeCode.toUpperCase().trim()];

  // Form đánh giá dịch vụ
  const [rating, setRating] = useState(5);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  // Quản lý Map và Markers
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (routeOrderCode && routeOrderCode !== activeCode) {
      setSearchQuery(routeOrderCode);
      setActiveCode(routeOrderCode);
    }
  }, [routeOrderCode]);

  // Cập nhật marker trên bản đồ khi shipment thay đổi hoặc dữ liệu socket/refetch trả về
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !shipment) return;

    // Xóa marker cũ
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    try {
      // 1. Marker Kho xuất phát
      const elOrigin = document.createElement("div");
      elOrigin.className =
        "h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xl border-2 border-white transition-transform hover:scale-110 cursor-pointer";
      elOrigin.innerHTML = "🏭";
      const markerOrigin = new Marker({ element: elOrigin })
        .setLngLat(shipment.originCoords)
        .setPopup(
          new Popup({ offset: 15 }).setHTML(
            `<div style="font-family: sans-serif; font-size: 12px;"><b>Kho xuất phát:</b><br/>${shipment.warehouseName}</div>`
          )
        )
        .addTo(map);
      markersRef.current.push(markerOrigin);

      // 2. Marker Khách nhận
      const elDest = document.createElement("div");
      elDest.className =
        "h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xl border-2 border-white transition-transform hover:scale-110 cursor-pointer";
      elDest.innerHTML = "📍";
      const markerDest = new Marker({ element: elDest })
        .setLngLat(shipment.destinationCoords)
        .setPopup(
          new Popup({ offset: 15 }).setHTML(
            `<div style="font-family: sans-serif; font-size: 12px;"><b>Điểm nhận hàng:</b><br/>${shipment.receiverName}</div>`
          )
        )
        .addTo(map);
      markersRef.current.push(markerDest);

      // 3. Marker Xe tải / Tài xế di chuyển Realtime (nếu có tài xế)
      if (shipment.driver) {
        const elVehicle = document.createElement("div");
        elVehicle.className =
          "h-10 w-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-2xl border-2 border-white animate-pulse transition-transform hover:scale-125 cursor-pointer";
        elVehicle.innerHTML = "🚚";
        const markerVehicle = new Marker({ element: elVehicle })
          .setLngLat(shipment.driver.currentLocation)
          .setPopup(
            new Popup({ offset: 15 }).setHTML(
              `<div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
                <b style="color: #b45309;">Tài xế giao hàng:</b> ${shipment.driver.name}<br/>
                <b>Biển số:</b> ${shipment.driver.vehiclePlate}<br/>
                <b>SĐT:</b> <a href="tel:${shipment.driver.phone}" style="color: #2563eb; text-decoration: underline;">${shipment.driver.phone}</a>
              </div>`
            )
          )
          .addTo(map);
        markersRef.current.push(markerVehicle);
      }

      // 4. Cân chỉnh khung nhìn bao quát
      const lats = [shipment.originCoords[1], shipment.destinationCoords[1]];
      const lngs = [shipment.originCoords[0], shipment.destinationCoords[0]];
      if (shipment.driver) {
        lngs.push(shipment.driver.currentLocation[0]);
        lats.push(shipment.driver.currentLocation[1]);
      }

      const bounds: [number, number, number, number] = [
        Math.min(...lngs),
        Math.min(...lats),
        Math.max(...lngs),
        Math.max(...lats),
      ];

      map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
    } catch (err) {
      console.warn("Lỗi khi vẽ marker bản đồ tra cứu:", err);
    }
  }, [shipment]);

  const handleMapLoad = (map: any) => {
    mapInstanceRef.current = map;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const clean = searchQuery.toUpperCase().trim();
    setActiveCode(clean);
    setSearchParams({ code: clean });
    setFeedbackSent(false);
  };

  const handleQuickSelect = (code: string) => {
    setSearchQuery(code);
    setActiveCode(code);
    setSearchParams({ code });
    setFeedbackSent(false);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/track/${activeCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Đã sao chép liên kết", url);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitRating = async () => {
    try {
      await submitFeedback({
        rating,
        feedbackText,
        reviewerName: shipment?.receiverName,
      });
      setFeedbackSent(true);
      toast.success("Gửi thành công", "Cảm ơn bạn đã đóng góp ý kiến!");
    } catch {
      setFeedbackSent(true);
    }
  };

  // Trạng thái badge hiển thị
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-600 text-white shadow-emerald-500/20";
      case "IN_TRANSIT":
        return "bg-blue-600 text-white animate-pulse shadow-blue-500/20";
      case "ASSIGNED":
      case "PICKING_UP":
        return "bg-indigo-600 text-white shadow-indigo-500/20";
      case "FAILED":
      case "CANCELLED":
        return "bg-destructive text-white";
      default:
        return "bg-amber-600 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground selection:bg-primary/20">
      {/* 1. Header Công khai */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-card/85 backdrop-blur-md shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-foreground tracking-tight">
                  VietRoute
                </span>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded border border-primary/20">
                  Live Tracking
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Cổng tra cứu hành trình vận tải thông minh
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <a
              href="tel:19006868"
              className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>
                Tổng đài CSKH: <b>1900.6868</b>
              </span>
            </a>
            <Link to="/login">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs cursor-pointer font-medium hover:bg-muted"
              >
                Đăng nhập quản trị
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Search Bar */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-6 text-center space-y-4">
        <div className="space-y-1.5">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-primary/25 text-xs px-3 py-0.5 font-semibold">
            Định Vị Vệ Tinh 24/7 & CSDL Trực Tiếp
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Theo dõi hành trình đơn hàng theo thời gian thực
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Nhập mã vận đơn của bạn để xem định vị xe tải, lộ trình di chuyển,
            thời gian dự kiến nhận hàng và biên bản chữ ký số e-POD.
          </p>
        </div>

        {/* Thanh tìm kiếm */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <div className="relative flex items-center shadow-xl rounded-2xl overflow-hidden bg-card border-2 border-primary/40 focus-within:border-primary transition-all">
            <Search className="h-5 w-5 text-muted-foreground ml-4 shrink-0" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập mã đơn hàng (VD: ORD-2026-001, VR-2026-001, VR-2026-004)..."
              className="border-0 shadow-none focus-visible:ring-0 text-sm h-12 px-3 bg-transparent font-medium"
            />
            {isRefetching && (
              <RefreshCw className="h-4 w-4 text-primary animate-spin mr-2 shrink-0" />
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 px-5 mr-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs cursor-pointer shadow-md"
            >
              Tra cứu ngay
            </Button>
          </div>

          {/* Gợi ý mã mẫu nhanh */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 text-xs text-muted-foreground">
            <span className="text-[11px] font-medium">Mã tra cứu nhanh:</span>
            {[
              "VR-2026-001",
              "VR-2026-004",
              "VR-2026-005",
              "ORD-2026-001",
              "ORD-2026-002",
              "ORD-2026-003",
            ].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleQuickSelect(code)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                  activeCode.toUpperCase() === code
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs scale-105"
                    : "bg-card hover:bg-muted text-muted-foreground border-border"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* 3. Nội dung tra cứu chi tiết */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        {isLoading ? (
          /* Trạng thái tải dữ liệu */
          <div className="rounded-3xl bg-card border border-border shadow-xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : !shipment ? (
          /* Không tìm thấy */
          <div className="p-10 text-center rounded-3xl bg-card border border-border shadow-md space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-base text-foreground">
              Không tìm thấy mã vận đơn
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Không tìm thấy thông tin đơn hàng <b>{activeCode}</b> trên hệ thống
              VietRoute. Vui lòng kiểm tra lại mã in trên phiếu gửi hoặc liên hệ
              tổng đài hỗ trợ <b>1900.6868</b>.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect("VR-2026-004")}
                className="text-xs cursor-pointer"
              >
                Xem đơn đã giao (e-POD): VR-2026-004
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleQuickSelect("VR-2026-001")}
                className="text-xs cursor-pointer"
              >
                Xem đơn đang chạy live: VR-2026-001
              </Button>
            </div>
          </div>
        ) : (
          /* Hiển thị chi tiết vận đơn */
          <div className="space-y-6">
            {/* Card Tóm Tắt Trạng Thái & ETA */}
            <div className="rounded-3xl bg-card border border-border shadow-xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Mã vận đơn:
                    </span>
                    <span className="font-mono font-extrabold text-xl text-primary tracking-tight">
                      {shipment.orderCode}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer border border-border/60"
                      title="Sao chép liên kết tra cứu"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => refetch()}
                      disabled={isRefetching}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer border border-border/60"
                      title="Làm mới trạng thái"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${
                          isRefetching ? "animate-spin text-primary" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ngày tiếp nhận: <b>{shipment.createdAt}</b> • Kho phụ trách:{" "}
                    <b>{shipment.warehouseName}</b>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {shipment.status === "IN_TRANSIT" && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      Live GPS Sync
                    </span>
                  )}
                  <Badge
                    className={`text-xs px-3.5 py-1 font-bold shadow-sm ${getStatusBadgeClass(
                      shipment.status
                    )}`}
                  >
                    {shipment.statusText}
                  </Badge>
                </div>
              </div>

              {/* Banner Dự kiến giao hàng (ETA) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Thời gian nhận hàng dự kiến
                    </span>
                    <div className="text-sm sm:text-base font-bold text-foreground">
                      {shipment.estimatedDelivery}
                    </div>
                  </div>
                </div>

                {shipment.driver ? (
                  <div className="flex items-center gap-3 bg-card px-3.5 py-2 rounded-xl border border-border shrink-0 shadow-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        Tài xế giao hàng
                      </span>
                      <span className="font-bold text-xs text-foreground">
                        {shipment.driver.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground block font-mono">
                        {shipment.driver.vehiclePlate} • ⭐{" "}
                        {shipment.driver.rating}
                      </span>
                    </div>
                    <a
                      href={`tel:${shipment.driver.phone}`}
                      className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-xs"
                      title="Gọi điện cho tài xế"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                    <Navigation2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Đang điều phối phương tiện phù hợp
                  </div>
                )}
              </div>

              {/* Bản đồ Live GPS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Bản đồ hành trình vệ tinh thời gian thực</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    Google Maps Road • Tọa độ GPS chuẩn xác
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-border shadow-inner relative">
                  <MapContainer
                    center={
                      shipment.driver
                        ? shipment.driver.currentLocation
                        : shipment.originCoords
                    }
                    zoom={12}
                    mapType="google_roadmap"
                    onMapLoad={handleMapLoad}
                    className="h-full w-full"
                  />
                  <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-xs p-2 rounded-xl border border-border text-[11px] space-y-1 shadow-md">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                      <span>Kho xuất phát: {shipment.warehouseName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      <span>Điểm nhận: {shipment.receiverName}</span>
                    </div>
                    {shipment.driver && (
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                        <span>Vị trí xe: {shipment.driver.vehiclePlate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline Tiến Trình Đơn Hàng */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Nhật ký hành trình vận chuyển
                </h4>

                <div className="relative pl-6 space-y-4 border-l-2 border-border ml-2">
                  {shipment.steps.map((step, idx) => (
                    <div key={idx} className="relative">
                      {/* Dot icon */}
                      <div
                        className={`absolute -left-[31px] top-0.5 h-5 w-5 rounded-full flex items-center justify-center shadow-xs ${
                          step.completed
                            ? "bg-emerald-500 text-white ring-4 ring-emerald-500/20"
                            : step.current
                            ? "bg-blue-600 text-white ring-4 ring-blue-500/20 animate-pulse"
                            : "bg-muted text-muted-foreground border-2 border-border"
                        }`}
                      >
                        {step.completed ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                      </div>

                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-bold ${
                              step.completed || step.current
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ({step.time})
                          </span>
                          {step.location && (
                            <span className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.2 rounded font-mono">
                              📍 {step.location}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bằng chứng giao hàng điện tử (e-POD Viewer) nếu đã ký */}
              {shipment.pod && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                      <FileCheck className="h-4 w-4 text-emerald-600" />
                      <span>Bằng chứng giao hàng điện tử (e-POD)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge className="bg-emerald-600 text-white text-[10px] font-semibold gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Đã ký nhận hợp lệ
                      </Badge>
                      {shipment.pod.codCollected && (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-emerald-600 text-emerald-700 dark:text-emerald-300 gap-1 bg-white/50"
                        >
                          <CreditCard className="h-3 w-3" />
                          Đã thu COD ({shipment.pod.codPaymentMethod || "Tiền mặt"})
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Chữ ký số */}
                    <div className="p-3 rounded-xl bg-card border border-border space-y-1.5 shadow-xs">
                      <span className="text-[10px] text-muted-foreground font-semibold block">
                        Chữ ký xác nhận của người nhận:
                      </span>
                      <div className="h-24 bg-white rounded-lg flex items-center justify-center p-2 border border-slate-200">
                        {shipment.pod.signatureUrl ? (
                          <img
                            src={shipment.pod.signatureUrl}
                            alt="Chữ ký e-POD"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Chữ ký số đã lưu vết hệ thống
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-foreground font-medium block text-center">
                        {shipment.pod.signedBy} • {shipment.pod.signedAt}
                      </span>
                    </div>

                    {/* Ảnh chụp hiện trường bàn giao */}
                    <div className="p-3 rounded-xl bg-card border border-border space-y-1.5 shadow-xs">
                      <span className="text-[10px] text-muted-foreground font-semibold block">
                        Ảnh chụp kiện hàng tại hiện trường:
                      </span>
                      <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        {shipment.pod.photoUrl ? (
                          <img
                            src={shipment.pod.photoUrl}
                            alt="Ảnh bàn giao"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-2 text-muted-foreground text-[10px]">
                            <Package className="h-5 w-5 mx-auto mb-1 opacity-50" />
                            Đã giao nhận trực tiếp tại cửa
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground block text-center">
                        {shipment.pod.notes
                          ? `Ghi chú: "${shipment.pod.notes}"`
                          : "Đã kiểm đếm đầy đủ, nguyên đai nguyên kiện"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Chi tiết người nhận & Hàng hóa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                    Địa chỉ nhận hàng
                  </span>
                  <div className="font-bold text-foreground">
                    {shipment.receiverName}
                  </div>
                  <div className="text-muted-foreground text-[11px] leading-relaxed">
                    {shipment.receiverAddress}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    SĐT liên hệ: <b>{shipment.receiverPhone}</b>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                    Thông tin kiện hàng & COD
                  </span>
                  <div className="text-muted-foreground text-[11px] line-clamp-2">
                    📦 {shipment.itemsSummary}
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-muted-foreground">Khối lượng:</span>
                    <span className="font-bold text-foreground">
                      {shipment.weightKg} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Tiền thu hộ COD:</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {shipment.codAmount > 0
                        ? `${shipment.codAmount.toLocaleString("vi-VN")} đ`
                        : "0 đ (Đã thanh toán)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Đánh giá dịch vụ khách hàng */}
            <div className="rounded-3xl bg-card border border-border shadow-md p-5 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span>Đánh giá chất lượng vận chuyển</span>
                </h4>
                <span className="text-[11px] text-muted-foreground">
                  Đóng góp ý kiến trực tiếp vào CSDL VietRoute
                </span>
              </div>

              {feedbackSent ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-center font-medium">
                  🎉 Cảm ơn bạn đã gửi đánh giá! VietRoute luôn nỗ lực cải tiến chất
                  lượng dịch vụ để mang lại sự hài lòng tối đa.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      Mức độ hài lòng:
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-amber-500 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= rating
                                ? "fill-amber-500 text-amber-500"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Nhận xét của bạn về tài xế, tiến độ hoặc thái độ phục vụ..."
                      className="text-xs h-9 bg-background"
                    />
                    <Button
                      size="sm"
                      onClick={handleSubmitRating}
                      disabled={isSubmittingFeedback}
                      className="h-9 px-4 text-xs font-semibold cursor-pointer shrink-0"
                    >
                      {isSubmittingFeedback ? "Đang gửi..." : "Gửi đánh giá"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-card py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p>© 2026 VietRoute Logistics Platform. Bản quyền thuộc về VietRoute.</p>
          <p className="text-[11px] text-muted-foreground/70">
            Hệ thống Quản lý Vận tải & Tối ưu hóa Tuyến đường thông minh hàng đầu
            Việt Nam.
          </p>
        </div>
      </footer>
    </div>
  );
};
