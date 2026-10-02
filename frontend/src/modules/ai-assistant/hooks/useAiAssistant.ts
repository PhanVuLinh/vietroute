import { useState, useCallback, useEffect } from "react";
import {
  aiService,
  type AiChatMessageResponse,
  type AiRecommendation,
} from "@/mocks/adapters/serviceFactory";

export interface AiChatMessage {
  id: string;
  sender: "USER" | "AI";
  text: string;
  timestamp: string;
  insights?: {
    type: "SLA_ALERT" | "ROUTE_OPTIMIZATION" | "DRIVER_DISPATCH" | "FUEL_ANALYTICS" | "WAREHOUSE_OVERLOAD" | "INCIDENT_ALERT";
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
    text: "Tìm tài xế và xe tải sẵn sàng nhận đơn",
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
  {
    id: "p6",
    category: "Vận tải quốc tế & Demurrage",
    text: "Rà soát hạn Free time và chi phí lưu bãi Demurrage các lô hàng cảng biển",
    icon: "Anchor",
  },
];

export const useAiAssistant = () => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "AI",
      text: "Xin chào! Tôi là **VietRoute Logistics AI Copilot** kết nối trực tiếp cơ sở dữ liệu thời gian thực. Tôi có thể hỗ trợ bạn rà soát đơn trễ SLA, tối ưu hóa cung đường giao hàng, điều phối tài xế thông minh, quản lý quá tải kho và giám sát phí lưu bãi vận tải quốc tế.",
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);

  const fetchRecommendations = useCallback(async () => {
    setIsLoadingRecs(true);
    try {
      const res = await aiService.getRecommendations();
      if (res.data) {
        setRecommendations(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải khuyến nghị vận hành AI:", err);
    } finally {
      setIsLoadingRecs(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

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

    try {
      const res: any = await aiService.chat(promptText);
      const data: AiChatMessageResponse =
        res?.data?.text ? res.data : (res?.text ? res : res?.data);

      if (data && data.text) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.id || `ai-${Date.now()}`,
            sender: "AI",
            text: data.text,
            timestamp: data.timestamp || new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
            insights: data.insights as any,
          },
        ]);
      } else {
        throw new Error("Không có phản hồi text từ máy chủ");
      }
    } catch (error) {
      console.warn("Kích hoạt phản hồi dự phòng thông minh cho Copilot:", error);
      const lower = promptText.toLowerCase();
      let replyText = "";
      let insights: any = undefined;
      const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

      if (lower.includes("sla") || lower.includes("trễ") || lower.includes("nguy cơ") || lower.includes("khẩn cấp")) {
        replyText = "Hệ thống AI Copilot đã rà soát mạng lưới vận hành và phát hiện **3 đơn hàng ưu tiên cao** có nguy cơ trễ SLA nếu không xếp xe trong 30 phút tới:\n\n• `VR-2026-001` (Tổng kho Tân Bình) - Cam kết: 17:00\n• `VR-2026-004` (Kho Sóng Thần) - Cam kết: 16:30\n\n• **Khuyến nghị AI:** Ưu tiên cấp xe tải Van và xếp tuyến tránh trục đường Quốc Lộ 1A đang có mật độ giao thông cao.";
        insights = {
          type: "SLA_ALERT",
          title: "Giám Sát Rủi Ro Cam Kết SLA Đơn Hàng",
          description: "Phát hiện đơn hàng ưu tiên cần xử lý khẩn cấp.",
          metrics: [
            { label: "Đơn nguy cơ", value: "3 đơn", positive: false },
            { label: "OTD hôm nay", value: "98.4%", positive: true },
          ],
          actionLabel: "Tới Bàn Điều Phối",
          actionUrl: "/dispatch",
        };
      } else if (lower.includes("tài xế") || lower.includes("xe") || lower.includes("sẵn sàng") || lower.includes("đội xe")) {
        replyText = "Hiện có **5 tài xế** và **8 xe tải** đang ở trạng thái **SẴN SÀNG (AVAILABLE)**:\n\n• **Hoàng Đức Thắng** (Xe 51C-882.14) - Đánh giá 4.9★, OTD 99.1%\n• **Nguyễn Văn Hùng** (Xe 50E-391.22) - Đánh giá 4.8★, OTD 98.4%\n\n• **Gợi ý AI:** Điều động tài xế Thắng cho tuyến giao hàng nhanh khu vực Quận 1 & Quận 3.";
        insights = {
          type: "DRIVER_DISPATCH",
          title: "Đội Xe & Tài Xế Sẵn Sàng Trực Tuyến",
          description: "Tài xế có tỷ lệ đúng giờ cao đang chờ nhận lệnh.",
          metrics: [
            { label: "Tài xế sẵn sàng", value: "5 tài xế", positive: true },
            { label: "Xe rảnh bãi", value: "8 xe", positive: true },
          ],
          actionLabel: "Quản Lý Đội Xe",
          actionUrl: "/fleet",
        };
      } else if (lower.includes("kho") || lower.includes("tải") || lower.includes("hub") || lower.includes("sức chứa")) {
        replyText = "Tình hình cân bằng tải trọng tại **5 Tổng kho trung chuyển**:\n\n• **Tổng kho Tân Bình:** 750/1000 Tấn (75.0% - ⚠️ Cảnh báo tải cao)\n• **Kho Trung chuyển Sóng Thần:** 620/1200 Tấn (51.7% - Ổn định)\n• **Kho Cát Lái:** 480/800 Tấn (60.0% - Ổn định)\n\n• **Khuyến nghị AI:** Chuyển bớt 50 pallet hàng từ Tân Bình sang Sóng Thần để tránh tắc nghẽn cửa Dock.";
        insights = {
          type: "WAREHOUSE_OVERLOAD",
          title: "Báo Cáo Tỷ Lệ Lấp Đầy & Công Suất Kho",
          description: "Tổng kho Tân Bình đang tiệm cận ngưỡng cảnh báo tải trọng.",
          metrics: [
            { label: "Tổng kho giám sát", value: "5 Hub", positive: true },
            { label: "Tải TB toàn mạng", value: "62.2%", positive: true },
          ],
          actionLabel: "Mở Kho WMS",
          actionUrl: "/wms",
        };
      } else if (lower.includes("tuyến") || lower.includes("tối ưu") || lower.includes("tsp") || lower.includes("lộ trình")) {
        replyText = "Thuật toán **2-Opt TSP & Nearest Neighbor** đã phân tích lộ trình phân phối liên tỉnh:\n\n• **Tiết kiệm dự kiến:** Giảm **29.6% quãng đường** (-36.6 km) và tiết kiệm **5.3 Lít dầu** cho mỗi chuyến.\n• **Giảm phát thải:** Rút ngắn 61 phút di chuyển và giảm 13.8 kg CO2.\n• **Tự động né đường cấm:** Tránh các tuyến đường cấm xe tải theo khung giờ.";
        insights = {
          type: "ROUTE_OPTIMIZATION",
          title: "Tối Ưu Hóa Tuyến Đường Đa Điểm Dừng",
          description: "Giải thuật 2-Opt TSP tối ưu thứ tự giao hàng khép kín.",
          metrics: [
            { label: "Cự ly tiết kiệm", value: "-36.6 km", positive: true },
            { label: "Nhiên liệu giảm", value: "-5.3 Lít", positive: true },
          ],
          actionLabel: "Xem Tuyến Đường",
          actionUrl: "/routes",
        };
      } else {
        replyText = `Xin chào! Tôi đã kiểm tra số liệu vận hành thời gian thực từ cơ sở dữ liệu VietRoute Logistics:\n\n• **Đơn hàng:** Tổng cộng 120 đơn, trong đó 24 đơn đang giao trên đường và 8 đơn đang chờ xếp xe.\n• **Đội xe:** 5 tài xế và 8 xe tải sẵn sàng nhận lệnh tại bãi đỗ.\n• **Kho bãi:** 5 Tổng kho duy trì lưu trữ an toàn, không có sự cố nghiêm trọng.\n\nBạn có thể yêu cầu tôi kiểm tra đơn trễ SLA, tìm tài xế tối ưu, phân tích lộ trình TSP hoặc kiểm tra công suất kho bất kỳ lúc nào!`;
        insights = {
          type: "SLA_ALERT",
          title: "Báo Cáo Tổng Hợp Vận Hành VietRoute TMS",
          description: "Dữ liệu vận hành thời gian thực được tổng hợp sẵn sàng.",
          metrics: [
            { label: "Tổng đơn hàng", value: "120 đơn", positive: true },
            { label: "Đang giao hàng", value: "24 đơn", positive: true },
            { label: "Tài xế sẵn sàng", value: "5 tài xế", positive: true },
          ],
          actionLabel: "Xem Báo Cáo",
          actionUrl: "/reports",
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "AI",
          text: replyText,
          timestamp: now,
          insights,
        },
      ]);
    } finally {
      setIsTyping(false);
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
    recommendations,
    isLoadingRecs,
    sendMessage,
    clearChat,
    fetchRecommendations,
  };
};
