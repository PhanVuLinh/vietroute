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
      const res = await aiService.chat(promptText);
      const data: AiChatMessageResponse = res.data;
      if (data) {
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
      }
    } catch (error) {
      console.error("Lỗi khi tương tác AI Copilot:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "AI",
          text: "Xin lỗi, đã xảy ra lỗi trong quá trình kết nối AI Copilot máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.",
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
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
