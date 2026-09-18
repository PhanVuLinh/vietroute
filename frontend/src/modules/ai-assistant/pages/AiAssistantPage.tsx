import React from "react";
import { Cpu, Zap } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Badge } from "@/shared/components/ui/badge";
import { useAiAssistant } from "../hooks/useAiAssistant";
import { AiChatConsole } from "../components/AiChatConsole";
import { AiPromptSuggestions } from "../components/AiPromptSuggestions";

export const AiAssistantPage: React.FC = () => {
  usePageTitle("Trợ lý AI Logistics");

  const { messages, isTyping, sendMessage, clearChat } = useAiAssistant();

  return (
    <PageContainer
      title="Trợ lý AI Logistics & Vận Hành"
      subtitle="Phân tích dữ liệu tự động, phát hiện rủi ro trễ SLA và đề xuất tối ưu hóa hành trình thông minh."
      action={
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1.5 py-1 px-2.5 text-xs bg-primary/5 text-primary border-primary/20">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold">VietRoute RAG Engine v2.5</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1 px-2.5 text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <Zap className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-semibold">Độ trễ &lt;500ms</span>
          </Badge>
        </div>
      }
    >
      <div className="space-y-4">
        {/* 1. Gợi ý câu hỏi mẫu */}
        <AiPromptSuggestions onSelectPrompt={sendMessage} disabled={isTyping} />

        {/* 2. Giao diện Chat Console chính */}
        <div className="h-[560px]">
          <AiChatConsole
            messages={messages}
            isTyping={isTyping}
            onSendMessage={sendMessage}
            onClearChat={clearChat}
          />
        </div>
      </div>
    </PageContainer>
  );
};
