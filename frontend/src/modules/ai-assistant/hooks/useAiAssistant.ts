import { useState, useCallback } from "react";
import {
  orderService,
  driverService,
  vehicleService,
  warehouseService,
  routeService,
  analyticsService,
} from "@/mocks/adapters/serviceFactory";
import { formatCurrency } from "@/shared/utils/formatters";
import type { Order } from "@/core/types/logistics";

export interface AiChatMessage {
  id: string;
  sender: "USER" | "AI";
  text: string;
  timestamp: string;
  insights?: {
    type: "SLA_ALERT" | "ROUTE_OPTIMIZATION" | "DRIVER_DISPATCH" | "FUEL_ANALYTICS" | "WAREHOUSE_OVERLOAD";
    title: string;
    description: string;
    metrics?: { label: string; value: string; positive?: boolean }[];
    actionLabel?: string;
    actionUrl?: string;
  };
}

export const SUGGESTED_PROMPTS = [
  {
    id: "p1",
    category: "Cảnh báo SLA",
    text: "Kiểm tra các đơn hàng có nguy cơ trễ hạn SLA hôm nay",
    icon: "Clock",
  },
  {
    id: "p2",
    category: "Điều phối xe",
    text: "Tìm tài xế và xe tải sẵn sàng nhận đơn gần Kho Tân Bình",
    icon: "Truck",
  },
  {
    id: "p3",
    category: "Tối ưu hóa tuyến",
    text: "Gợi ý tối ưu hóa lộ trình tuyến phân phối TP.HCM - Bình Dương",
    icon: "Navigation",
  },
  {
    id: "p4",
    category: "Phân tích chi phí",
    text: "Phân tích mức tiêu hao nhiên liệu và chi phí trạm thu phí BOT tuần qua",
    icon: "Fuel",
  },
  {
    id: "p5",
    category: "Cân bằng kho bãi",
    text: "Đánh giá tải trọng và tỷ lệ lấp đầy các Hub miền Nam",
    icon: "Building2",
  },
];

export const useAiAssistant = () => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "AI",
      text: "Xin chào! Tôi là **VietRoute Logistics AI Copilot**. Tôi có thể hỗ trợ bạn rà soát đơn trễ SLA, tối ưu hóa cung đường giao hàng, điều phối tài xế thông minh và phân tích chi phí vận hành toàn mạng lưới.",
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const sendMessage = useCallback(async (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: AiChatMessage = {
      id: userMsgId,
      sender: "USER",
      text: promptText,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Lấy dữ liệu thực từ các service mock
    try {
      const [ordersRes, driversRes, vehiclesRes, warehousesRes, routesRes, analyticsRes] = await Promise.all([
        orderService.getOrders({ pageSize: 50 }),
        driverService.getDrivers(),
        vehicleService.getVehicles(),
        warehouseService.getWarehouses(),
        routeService.getRoutes(),
        analyticsService.getDashboardAnalytics(),
      ]);

      const orders: Order[] = (ordersRes.data as any)?.items || (ordersRes.data as any) || [];
      const drivers = driversRes.data || [];
      const vehicles = vehiclesRes.data || [];
      const warehouses = warehousesRes.data || [];
      const routes = routesRes.data || [];
      const analytics = analyticsRes.data;

      // Phân tích câu hỏi người dùng
      const lowerQuery = promptText.toLowerCase();

      setTimeout(() => {
        let aiReply: AiChatMessage;
        const nowTime = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

        if (lowerQuery.includes("sla") || lowerQuery.includes("trễ") || lowerQuery.includes("nguy cơ")) {
          const urgentOrders = orders.filter((o: Order) => o.priority === "URGENT" || o.status === "PENDING");
          aiReply = {
            id: `ai-${Date.now()}`,
            sender: "AI",
            text: `Qua rà soát hệ thống, hiện có **${urgentOrders.length} đơn hàng** cần ưu tiên xử lý khẩn cấp trước khi vi phạm cam kết thời gian giao hàng (SLA). Các đơn này chủ yếu xuất phát từ **Kho Tân Bình** và **Kho Long Biên**.`,
            timestamp: nowTime,
            insights: {
              type: "SLA_ALERT",
              title: "Cảnh báo Đơn hàng Nguy cơ Trễ Hạn",
              description: `Khuyến nghị: Tiến hành gán tài xế ngay lập tức trong bảng điều phối để tránh vi phạm OTD vượt ngưỡng 2%.`,
              metrics: [
                { label: "Đơn khẩn cấp", value: `${urgentOrders.length} đơn`, positive: false },
                { label: "Tỷ lệ OTD hiện tại", value: `${analytics?.summary?.onTimeDeliveryRate || 98.2}%`, positive: true },
                { label: "Thời gian xử lý TB", value: "32 phút", positive: true },
              ],
              actionLabel: "Chuyển tới Bàn Điều Phối",
              actionUrl: "/dispatch",
            },
          };
        } else if (lowerQuery.includes("tài xế") || lowerQuery.includes("xe") || lowerQuery.includes("tân bình") || lowerQuery.includes("sẵn sàng")) {
          const availableDrivers = drivers.filter((d) => d.status === "AVAILABLE");
          const availableVehicles = vehicles.filter((v) => v.status === "AVAILABLE");
          aiReply = {
            id: `ai-${Date.now()}`,
            sender: "AI",
            text: `Hiện có **${availableDrivers.length} tài xế** và **${availableVehicles.length} phương tiện** đang ở trạng thái sẵn sàng trực tuyến tại các bãi xe trung tâm. Đội xe sẵn sàng tiếp nhận thêm 18 chuyến vận tải liên vùng.`,
            timestamp: nowTime,
            insights: {
              type: "DRIVER_DISPATCH",
              title: "Khả Năng Điều Động Đội Xe Trực Tuyến",
              description: `Tài xế xếp hạng cao nhất: ${availableDrivers[0]?.fullName || "Nguyễn Văn Hùng"} (⭐ 4.9, OTD 99.1%) sẵn sàng nhận chuyến tại Hub Tân Bình.`,
              metrics: [
                { label: "Tài xế sẵn sàng", value: `${availableDrivers.length} người`, positive: true },
                { label: "Xe rảnh bãi", value: `${availableVehicles.length} xe`, positive: true },
                { label: "Hiệu suất khai thác", value: `${analytics?.summary?.fleetUtilizationRate || 85.5}%`, positive: true },
              ],
              actionLabel: "Xem Danh Sách Tài Xế",
              actionUrl: "/drivers",
            },
          };
        } else if (lowerQuery.includes("tuyến") || lowerQuery.includes("tối ưu") || lowerQuery.includes("lộ trình") || lowerQuery.includes("bình dương")) {
          const activeRoutes = routes.filter((r) => r.status === "ACTIVE" || r.status === "PLANNED");
          aiReply = {
            id: `ai-${Date.now()}`,
            sender: "AI",
            text: `Thuật toán **2-Opt TSP & Clustering** đã phân tích **${activeRoutes.length} tuyến vận chuyển**. Đề xuất gom 4 điểm dừng tại Thuận An và Dĩ An vào cùng một chuyến xe tải 3.5T giúp cắt giảm cự ly di chuyển đáng kể.`,
            timestamp: nowTime,
            insights: {
              type: "ROUTE_OPTIMIZATION",
              title: "Đề Xuất Ghép Tuyến Thông Minh (Batching)",
              description: "Tối ưu hóa thứ tự 8 điểm dừng giao hàng giúp giảm thời gian chờ và tránh khung giờ cao điểm Quốc lộ 13.",
              metrics: [
                { label: "Quãng đường tiết kiệm", value: "-14.2 km", positive: true },
                { label: "Nhiên liệu dự kiến", value: "-3.8 Lít", positive: true },
                { label: "Thời gian rút ngắn", value: "-28 phút", positive: true },
              ],
              actionLabel: "Xem Bảng Quản Lý Tuyến",
              actionUrl: "/routes",
            },
          };
        } else if (lowerQuery.includes("chi phí") || lowerQuery.includes("nhiên liệu") || lowerQuery.includes("bot") || lowerQuery.includes("dầu")) {
          const totalCost = ((analytics as any)?.fuelAndCostTrends || []).reduce((acc: number, cur: any) => acc + (cur.totalCostVND || 0), 0);
          aiReply = {
            id: `ai-${Date.now()}`,
            sender: "AI",
            text: `Tổng hợp chi phí vận hành chu kỳ hiện tại ghi nhận mức tiêu hao nhiên liệu trung bình là **14.8 Lít / 100km**. Nhờ áp dụng định tuyến AI tránh cung đường ùn tắc, toàn đội xe đã tiết kiệm được hơn 14.5 triệu đồng chi phí nhiên liệu.`,
            timestamp: nowTime,
            insights: {
              type: "FUEL_ANALYTICS",
              title: "Hiệu Quả Tối Ưu Chi Phí Nhiên Liệu & Phí Đường Bộ",
              description: "Hệ thống khuyến nghị bảo dưỡng định kỳ đối với 2 xe tải có mức tiêu hao thực tế vượt định mức 8%.",
              metrics: [
                { label: "Tổng chi phí vận tải", value: formatCurrency(totalCost || 128500000), positive: true },
                { label: "Định mức tiêu hao", value: "14.8 L/100km", positive: true },
                { label: "Chi phí tiết kiệm", value: "+14.5 tr ₫", positive: true },
              ],
              actionLabel: "Mở Báo Cáo Tài Chính Logistics",
              actionUrl: "/reports",
            },
          };
        } else if (lowerQuery.includes("kho") || lowerQuery.includes("hub") || lowerQuery.includes("lấp đầy") || lowerQuery.includes("miền nam")) {
          const southWarehouses = warehouses.filter((w) => w.region === "SOUTH");
          aiReply = {
            id: `ai-${Date.now()}`,
            sender: "AI",
            text: `Khu vực Miền Nam hiện có **${southWarehouses.length} Hub trung chuyển**. Trong đó, **Tổng kho Tân Bình** đang đạt mức lấp đầy 86% (ngưỡng cảnh báo cao), các kho còn lại dao động từ 65% - 74% công suất thiết kế.`,
            timestamp: nowTime,
            insights: {
              type: "WAREHOUSE_OVERLOAD",
              title: "Cân Bằng Tải Trọng Kho Bãi Miền Nam",
              description: "Khuyến nghị điều hướng 15% hàng tồn luân chuyển sang Hub Sóng Thần hoặc Hub Bình Chánh để giảm áp lực dỡ hàng tại cửa Dock.",
              metrics: [
                { label: "Số kho Miền Nam", value: `${southWarehouses.length} Hub`, positive: true },
                { label: "Lấp đầy bình quân", value: "76.4%", positive: true },
                { label: "Kho đầy tải", value: "1 kho (>85%)", positive: false },
              ],
              actionLabel: "Xem Hệ Thống Kho Hàng",
              actionUrl: "/warehouses",
            },
          };
        } else {
          aiReply = {
            id: `ai-${Date.now()}`,
            sender: "AI",
            text: `Tôi đã tiếp nhận yêu cầu: "${promptText}". Hệ thống đang giám sát trực tiếp **${orders.length} đơn hàng**, **${drivers.length} tài xế**, **${vehicles.length} phương tiện** và **${warehouses.length} kho bãi**. Bạn có thể chọn các tác vụ mẫu bên dưới hoặc yêu cầu phân tích chi tiết bất kỳ phân hệ nào.`,
            timestamp: nowTime,
          };
        }

        setMessages((prev) => [...prev, aiReply]);
        setIsTyping(false);
      }, 650);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "AI",
          text: "Xin lỗi, đã xảy ra lỗi trong quá trình phân tích dữ liệu vận hành. Vui lòng thử lại.",
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: "msg-welcome-new",
        sender: "AI",
        text: "Cuộc trò chuyện đã được làm mới. Hãy nhập câu hỏi hoặc chọn các chỉ mục phân tích nhanh bên dưới.",
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearChat,
  };
};
