import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { MapContainer } from "@/shared/components/map/MapContainer";
import { Marker, Popup } from "maplibre-gl";

// Dữ liệu mẫu các đơn hàng tra cứu công khai
interface TrackingShipment {
  orderCode: string;
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  warehouseName: string;
  warehouseAddress: string;
  status: "PENDING" | "CONFIRMED" | "IN_TRANSIT" | "DELIVERED";
  statusText: string;
  priority: "NORMAL" | "HIGH" | "URGENT";
  codAmount: number;
  weightKg: number;
  itemsSummary: string;
  createdAt: string;
  estimatedDelivery: string;
  driver?: {
    name: string;
    phone: string;
    vehiclePlate: string;
    vehicleModel: string;
    rating: number;
    currentLocation: [number, number]; // [lng, lat]
  };
  steps: {
    title: string;
    time: string;
    location: string;
    description: string;
    completed: boolean;
    current?: boolean;
  }[];
  originCoords: [number, number];
  destinationCoords: [number, number];
  pod?: {
    signedBy: string;
    signedAt: string;
    signatureUrl: string;
    photoUrl?: string;
  };
}

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
    itemsSummary: "Tivi Bravia 55 Inch (4 kiện), Dầu ăn Neptune 5L (12 can), Bo mạch chủ (5 kiện)",
    createdAt: "18/09/2026 07:30",
    estimatedDelivery: "Hôm nay, trước 12:00 (Khoảng 25 phút nữa)",
    driver: {
      name: "Nguyễn Văn An",
      phone: "0971.001.001",
      vehiclePlate: "29C-741.82",
      vehicleModel: "Hino FC9J 5 Tấn",
      rating: 4.95,
      currentLocation: [105.8642, 21.015], // Đang di chuyển gần Tam Trinh
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
    itemsSummary: "Sữa tươi tiệt trùng TH True Milk (1 thùng), Bánh kẹo Tết Kinh Đô (1 thùng)",
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
        description: "Khách hàng đã kiểm tra hàng, thanh toán COD và ký nhận e-POD.",
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
    },
  },
  "VR-2026-005": {
    orderCode: "VR-2026-005",
    senderName: "Tập đoàn Bán lẻ WinCommerce Miền Nam",
    senderAddress: "Tòa nhà Bitexco, Số 2 Hải Triều, Bến Nghé, Quận 1, TP.HCM",
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
    itemsSummary: "Bao Gạo Nàng Thơm Chợ Đào (50 bao - 1.25T), Bia Sài Gòn Special (50 thùng)",
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

  const initialCode = routeOrderCode || searchParams.get("code") || "VR-2026-001";
  const [searchQuery, setSearchQuery] = useState(initialCode);
  const [activeCode, setActiveCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);

  // Form đánh giá
  const [rating, setRating] = useState(5);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const shipment = SAMPLE_SHIPMENTS[activeCode.toUpperCase().trim()];

  useEffect(() => {
    if (routeOrderCode) {
      setSearchQuery(routeOrderCode);
      setActiveCode(routeOrderCode);
    }
  }, [routeOrderCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const clean = searchQuery.toUpperCase().trim();
    setActiveCode(clean);
    setSearchParams({ code: clean });
  };

  const handleQuickSelect = (code: string) => {
    setSearchQuery(code);
    setActiveCode(code);
    setSearchParams({ code });
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Map load callback
  const handleMapLoad = (map: any) => {
    if (!shipment) return;

    // Add Origin Marker (Kho xuất phát)
    const elOrigin = document.createElement("div");
    elOrigin.className = "h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white";
    elOrigin.innerHTML = "🏭";
    new Marker({ element: elOrigin })
      .setLngLat(shipment.originCoords)
      .setPopup(new Popup().setHTML(`<b>Kho xuất:</b> ${shipment.warehouseName}`))
      .addTo(map);

    // Add Destination Marker (Khách hàng)
    const elDest = document.createElement("div");
    elDest.className = "h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white";
    elDest.innerHTML = "📍";
    new Marker({ element: elDest })
      .setLngLat(shipment.destinationCoords)
      .setPopup(new Popup().setHTML(`<b>Điểm nhận:</b> ${shipment.receiverName}`))
      .addTo(map);

    // Add Live Vehicle Marker (nếu có tài xế)
    if (shipment.driver) {
      const elVehicle = document.createElement("div");
      elVehicle.className = "h-9 w-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xl border-2 border-white animate-pulse";
      elVehicle.innerHTML = "🚚";
      new Marker({ element: elVehicle })
        .setLngLat(shipment.driver.currentLocation)
        .setPopup(new Popup().setHTML(`<b>Tài xế:</b> ${shipment.driver.name}<br/>Biển số: ${shipment.driver.vehiclePlate}`))
        .addTo(map);
    }

    // Fit map bounds
    const bounds: [number, number, number, number] = [
      Math.min(shipment.originCoords[0], shipment.destinationCoords[0]),
      Math.min(shipment.originCoords[1], shipment.destinationCoords[1]),
      Math.max(shipment.originCoords[0], shipment.destinationCoords[0]),
      Math.max(shipment.originCoords[1], shipment.destinationCoords[1]),
    ];
    map.fitBounds(bounds, { padding: 50 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground">
      {/* 1. Header Công khai sang trọng */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-card/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-sm">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-foreground tracking-tight">VietRoute</span>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded">
                  Tracking
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">Cổng tra cứu hành trình vận đơn</p>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <a
              href="tel:19006868"
              className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium"
            >
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>Tổng đài CSKH: <b>1900.6868</b></span>
            </a>
            <Link to="/login">
              <Button size="sm" variant="outline" className="h-8 text-xs cursor-pointer">
                Đăng nhập quản trị
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Search Bar */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-6 text-center space-y-4">
        <div className="space-y-1.5">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-primary/20 text-xs px-3 py-0.5">
            Tra Cứu Trực Tuyến 24/7
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Theo dõi hành trình đơn hàng theo thời gian thực
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Nhập mã vận đơn của bạn để xem định vị xe tải, lộ trình di chuyển và thời gian dự kiến nhận hàng chính xác nhất.
          </p>
        </div>

        {/* Thanh tìm kiếm */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden bg-card border-2 border-primary/30 focus-within:border-primary transition-all">
            <Search className="h-5 w-5 text-muted-foreground ml-4 shrink-0" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập mã vận đơn (VD: VR-2026-001, VR-2026-004, VR-2026-005)..."
              className="border-0 shadow-none focus-visible:ring-0 text-sm h-12 px-3 bg-transparent"
            />
            <Button
              type="submit"
              className="h-10 px-5 mr-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs cursor-pointer"
            >
              Tra cứu ngay
            </Button>
          </div>

          {/* Gợi ý mã mẫu nhanh */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 text-xs text-muted-foreground">
            <span className="text-[11px]">Mã đơn mẫu thử nghiệm:</span>
            {["VR-2026-001", "VR-2026-004", "VR-2026-005"].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleQuickSelect(code)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                  activeCode === code
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
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
        {!shipment ? (
          <div className="p-10 text-center rounded-3xl bg-card border border-border shadow-md space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-base text-foreground">Không tìm thấy mã vận đơn</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Không tìm thấy thông tin đơn hàng <b>{activeCode}</b> trên hệ thống VietRoute. Vui lòng kiểm tra lại mã trên phiếu gửi hoặc liên hệ tổng đài hỗ trợ <b>1900.6868</b>.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect("VR-2026-001")}
              className="text-xs cursor-pointer"
            >
              Xem thử đơn mẫu VR-2026-001
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Card Tóm Tắt Trạng Thái & ETA */}
            <div className="rounded-3xl bg-card border border-border shadow-xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Mã vận đơn:</span>
                    <span className="font-mono font-bold text-lg text-primary">{shipment.orderCode}</span>
                    <button
                      onClick={handleCopyLink}
                      className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                      title="Sao chép liên kết tra cứu"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ngày gửi: <b>{shipment.createdAt}</b> • Kho xuất: <b>{shipment.warehouseName}</b>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-xs px-3 py-1 font-bold ${
                      shipment.status === "DELIVERED"
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 text-white animate-pulse"
                    }`}
                  >
                    {shipment.statusText}
                  </Badge>
                </div>
              </div>

              {/* Banner Dự kiến giao hàng (ETA) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                      Thời gian nhận hàng dự kiến
                    </span>
                    <div className="text-sm sm:text-base font-bold text-foreground">
                      {shipment.estimatedDelivery}
                    </div>
                  </div>
                </div>

                {shipment.driver && (
                  <div className="flex items-center gap-3 bg-card px-3.5 py-2 rounded-xl border border-border shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block">Tài xế giao hàng</span>
                      <span className="font-bold text-xs text-foreground">{shipment.driver.name}</span>
                      <span className="text-[10px] text-muted-foreground block">{shipment.driver.vehiclePlate}</span>
                    </div>
                    <a
                      href={`tel:${shipment.driver.phone}`}
                      className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-xs"
                      title="Gọi điện cho tài xế"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>

              {/* Bản đồ Live GPS vệ tinh / đường phố */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Hành trình trên bản đồ thời gian thực</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    Google Maps • Cập nhật mỗi 10 giây
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-border shadow-inner relative">
                  <MapContainer
                    center={shipment.driver ? shipment.driver.currentLocation : shipment.originCoords}
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
                      <span>Điểm nhận hàng của bạn</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Tiến Trình Đơn Hàng (Stepper) */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Nhật ký hành trình vận chuyển
                </h4>

                <div className="relative pl-6 space-y-4 border-l-2 border-border ml-2">
                  {shipment.steps.map((step, idx) => (
                    <div key={idx} className="relative">
                      {/* Dot icon */}
                      <div
                        className={`absolute -left-[31px] top-0.5 h-5 w-5 rounded-full flex items-center justify-center ${
                          step.completed
                            ? "bg-emerald-500 text-white ring-4 ring-emerald-500/20"
                            : "bg-muted text-muted-foreground border-2 border-border"
                        }`}
                      >
                        {step.completed ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      </div>

                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">({step.time})</span>
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bằng chứng giao hàng điện tử (e-POD Viewer) nếu đã giao */}
              {shipment.pod && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                      <FileCheck className="h-4 w-4 text-emerald-600" />
                      <span>Bằng chứng giao hàng điện tử (e-POD)</span>
                    </div>
                    <Badge className="bg-emerald-600 text-white text-[10px]">
                      Đã ký nhận hợp lệ
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Chữ ký */}
                    <div className="p-3 rounded-xl bg-card border border-border space-y-1.5">
                      <span className="text-[10px] text-muted-foreground block">Chữ ký người nhận:</span>
                      <div className="h-20 bg-white rounded-lg flex items-center justify-center p-1 border">
                        <img src={shipment.pod.signatureUrl} alt="Chữ ký" className="max-h-full" />
                      </div>
                      <span className="text-[11px] text-foreground font-medium block text-center">
                        {shipment.pod.signedBy} • {shipment.pod.signedAt}
                      </span>
                    </div>

                    {/* Ảnh kiện hàng */}
                    {shipment.pod.photoUrl && (
                      <div className="p-3 rounded-xl bg-card border border-border space-y-1.5">
                        <span className="text-[10px] text-muted-foreground block">Ảnh chụp bàn giao:</span>
                        <div className="h-20 bg-black/10 rounded-lg overflow-hidden border">
                          <img
                            src={shipment.pod.photoUrl}
                            alt="Ảnh bàn giao"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground block text-center">
                          Ảnh xác thực kiện hàng tại cửa
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chi tiết người nhận & Hàng hóa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                    Địa chỉ nhận hàng
                  </span>
                  <div className="font-bold text-foreground">{shipment.receiverName}</div>
                  <div className="text-muted-foreground text-[11px] leading-relaxed">
                    {shipment.receiverAddress}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    SĐT liên hệ: <b>{shipment.receiverPhone}</b>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                    Thông tin kiện hàng
                  </span>
                  <div className="text-muted-foreground text-[11px] line-clamp-2">
                    📦 {shipment.itemsSummary}
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-muted-foreground">Khối lượng:</span>
                    <span className="font-bold text-foreground">{shipment.weightKg} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Tiền thu hộ COD:</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {shipment.codAmount > 0 ? `${shipment.codAmount.toLocaleString("vi-VN")} đ` : "0 đ (Đã thanh toán)"}
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
                <span className="text-[11px] text-muted-foreground">Đóng góp ý kiến của bạn</span>
              </div>

              {feedbackSent ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-center font-medium">
                  🎉 Cảm ơn bạn đã gửi đánh giá! VietRoute luôn nỗ lực để mang lại trải nghiệm vận chuyển tốt nhất.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">Mức độ hài lòng:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
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
                      placeholder="Nhận xét của bạn về tài xế hoặc tiến độ giao hàng..."
                      className="text-xs h-9"
                    />
                    <Button
                      size="sm"
                      onClick={() => setFeedbackSent(true)}
                      className="h-9 px-4 text-xs font-semibold cursor-pointer shrink-0"
                    >
                      Gửi đánh giá
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
            Hệ thống Quản lý Vận tải & Tối ưu hóa Tuyến đường thông minh hàng đầu Việt Nam.
          </p>
        </div>
      </footer>
    </div>
  );
};
