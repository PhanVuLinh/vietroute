import React from "react";
import { Sparkles, Bot } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Badge } from "@/shared/components/ui/badge";

export const AiAssistantPage: React.FC = () => {
  usePageTitle("Trợ lý AI");

  return (
    <PageContainer
      title="Trợ lý AI Logistics"
      subtitle="Phân tích thông minh, phát hiện tắc nghẽn lộ trình và gợi ý ghép đơn tự động."
      action={
        <Badge variant="secondary" className="gap-1 py-1 px-3 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          RAG & AI Engine Foundation
        </Badge>
      }
    >
      <EmptyState
        icon={<Bot className="h-6 w-6 text-primary" />}
        title="Trợ lý AI Vận hành VietRoute"
        description="Nền tảng App Shell đã sẵn sàng. Giao diện trò chuyện tương tác và bảng khuyến nghị thông minh sẽ được triển khai ở giai đoạn tiếp theo."
      />
    </PageContainer>
  );
};
