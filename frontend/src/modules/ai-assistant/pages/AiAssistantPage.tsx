import React from "react";
import {
  Cpu,
  Zap,
  MessageSquare,
  Calculator,
  Database,
  Navigation,
  Users,
  ShieldAlert,
} from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { useAiAssistant } from "../hooks/useAiAssistant";
import { AiChatConsole } from "../components/AiChatConsole";
import { AiPromptSuggestions } from "../components/AiPromptSuggestions";
import { AiOperationalAlerts } from "../components/AiOperationalAlerts";
import { AiEtaCalculator } from "../components/AiEtaCalculator";
import { AiRouteOptimizer } from "../components/AiRouteOptimizer";
import { AiDriverMatcher } from "../components/AiDriverMatcher";
import { AiAnomalyMonitor } from "../components/AiAnomalyMonitor";

export const AiAssistantPage: React.FC = () => {
  usePageTitle("Trợ lý AI Logistics & Vận Hành");

  const {
    messages,
    isTyping,
    recommendations,
    isLoadingRecs,
    sendMessage,
    clearChat,
    fetchRecommendations,
  } = useAiAssistant();

  return (
    <PageContainer
      title="Trung Tâm Trí Tuệ Nhân Tạo Logistics & Điều Hành Toàn Mạng Lưới"
      subtitle="Ứng dụng mô hình RAG thời gian thực, thuật toán 2-Opt TSP tối ưu lộ trình, động cơ ghép tài xế đa tiêu chí và phát hiện gian lận vận tải."
      action={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1.5 py-1 px-2.5 text-xs bg-primary/5 text-primary border-primary/20">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold">VietRoute AI Suite v3.0</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1 px-2.5 text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <Database className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-semibold">Live PostgreSQL</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1 px-2.5 text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Zap className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-semibold">Phản hồi &lt;300ms</span>
          </Badge>
        </div>
      }
    >
      <div className="space-y-5">
        {/* 1. Khuyến nghị chủ động từ AI Copilot */}
        {recommendations.length > 0 && (
          <AiOperationalAlerts
            recommendations={recommendations}
            loading={isLoadingRecs}
            onRefresh={fetchRecommendations}
          />
        )}

        {/* 2. Tabs phân hệ AI cao cấp */}
        <Tabs defaultValue="chat" className="space-y-4">
          <TabsList className="bg-muted/80 p-1 flex-wrap h-auto gap-1">
            <TabsTrigger value="chat" className="gap-1.5 text-xs font-semibold py-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Hội Thoại Copilot & Voice</span>
            </TabsTrigger>
            <TabsTrigger value="route-opt" className="gap-1.5 text-xs font-semibold py-1.5">
              <Navigation className="h-3.5 w-3.5" />
              <span>Tối Ưu Tuyến (2-Opt TSP)</span>
            </TabsTrigger>
            <TabsTrigger value="driver-match" className="gap-1.5 text-xs font-semibold py-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>Ghép Xe & Tài Xế (AI Score)</span>
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="gap-1.5 text-xs font-semibold py-1.5">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Giám Sát Bất Thường</span>
            </TabsTrigger>
            <TabsTrigger value="eta" className="gap-1.5 text-xs font-semibold py-1.5">
              <Calculator className="h-3.5 w-3.5" />
              <span>Dự Báo ETA & Giờ Cao Điểm</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Chat Copilot */}
          <TabsContent value="chat" className="space-y-4 m-0">
            <AiPromptSuggestions onSelectPrompt={sendMessage} disabled={isTyping} />
            <div className="h-[560px]">
              <AiChatConsole
                messages={messages}
                isTyping={isTyping}
                onSendMessage={sendMessage}
                onClearChat={clearChat}
              />
            </div>
          </TabsContent>

          {/* Tab 2: Tối ưu tuyến 2-Opt TSP */}
          <TabsContent value="route-opt" className="m-0">
            <AiRouteOptimizer />
          </TabsContent>

          {/* Tab 3: Ghép tài xế thông minh */}
          <TabsContent value="driver-match" className="m-0">
            <AiDriverMatcher />
          </TabsContent>

          {/* Tab 4: Giám sát an ninh & bất thường */}
          <TabsContent value="anomalies" className="m-0">
            <AiAnomalyMonitor />
          </TabsContent>

          {/* Tab 5: Dự báo ETA */}
          <TabsContent value="eta" className="m-0">
            <AiEtaCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};
