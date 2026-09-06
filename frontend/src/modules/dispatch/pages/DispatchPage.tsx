import React from "react";
import { Waypoints } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export const DispatchPage: React.FC = () => {
  usePageTitle("Điều phối xe");

  return (
    <PageContainer
      title="Điều phối xe thông minh"
      subtitle="Trung tâm phân bổ đơn hàng vào chuyến xe, ghép tuyến tự động và kiểm soát tải trọng."
    >
      <EmptyState
        icon={<Waypoints className="h-6 w-6 text-muted-foreground" />}
        title="Trung tâm Điều phối xe"
        description="Nền tảng App Shell đã sẵn sàng. Giao diện chia màn hình (Split-screen) và Kanban điều phối sẽ được triển khai ở giai đoạn tiếp theo."
      />
    </PageContainer>
  );
};
