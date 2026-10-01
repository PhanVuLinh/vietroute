import React from "react";
import { Cpu, Zap, MessageSquare, Calculator, Database } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { useAiAssistant } from "../hooks/useAiAssistant";
import { AiChatConsole } from "../components/AiChatConsole";
import { AiPromptSuggestions } from "../components/AiPromptSuggestions";
import { AiOperationalAlerts } from "../components/AiOperationalAlerts";
import { AiEtaCalculator } from "../components/AiEtaCalculator";

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
      title="Trợ lý AI Logistics & Điều Hành Vận Tải"
      subtitle="Phân tích dữ liệu vận hành thời gian thực từ PostgreSQL, cảnh báo rủi ro vi phạm SLA và dự báo ETA đa phương thức."
      action={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1.5 py-1 px-2.5 text-xs bg-primary/5 text-primary border-primary/20">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold">VietRoute RAG Engine v2.5</span>
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

        {/* 2. Tabs phân hệ AI */}
        <Tabs defaultValue="chat" className="space-y-4">
          <TabsList className="bg-muted/80 p-1">
            <TabsTrigger value="chat" className="gap-1.5 text-xs font-semibold">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Hội Thoại Điều Hành Copilot</span>
            </TabsTrigger>
            <TabsTrigger value="eta" className="gap-1.5 text-xs font-semibold">
              <Calculator className="h-3.5 w-3.5" />
              <span>Dự Báo ETA & Giờ Cao Điểm</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4 m-0">
            {/* Gợi ý câu hỏi mẫu */}
            <AiPromptSuggestions onSelectPrompt={sendMessage} disabled={isTyping} />

            {/* Giao diện Chat Console chính */}
            <div className="h-[560px]">
              <AiChatConsole
                messages={messages}
                isTyping={isTyping}
                onSendMessage={sendMessage}
                onClearChat={clearChat}
              />
            </div>
          </TabsContent>

          <TabsContent value="eta" className="m-0">
            <AiEtaCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};
