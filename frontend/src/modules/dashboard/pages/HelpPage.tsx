import React from "react";
import { CircleHelp, BookOpen } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Badge } from "@/shared/components/ui/badge";

export const HelpPage: React.FC = () => {
  usePageTitle("Trung tâm trợ giúp");

  return (
    <PageContainer
      title="Trung tâm trợ giúp"
      subtitle="Tài liệu hướng dẫn quy trình vận hành điều phối, giám sát hạm đội và hỗ trợ kỹ thuật."
      action={
        <Badge variant="outline" className="text-xs py-1 px-2.5 gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          Tài liệu nội bộ
        </Badge>
      }
    >
      <EmptyState
        icon={<CircleHelp className="h-6 w-6 text-muted-foreground" />}
        title="Trung tâm Trợ giúp VietRoute"
        description="Nền tảng App Shell đã sẵn sàng. Tài liệu hướng dẫn sử dụng và FAQ nghiệp vụ sẽ được cập nhật đồng bộ với các màn hình giao diện."
      />
    </PageContainer>
  );
};
