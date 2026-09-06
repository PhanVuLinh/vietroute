import React from "react";
import { Route } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export const RoutesPage: React.FC = () => {
  usePageTitle("Quản lý tuyến đường");

  return (
    <PageContainer
      title="Quản lý tuyến đường"
      subtitle="Định tuyến cố định, quy hoạch luồng di chuyển tối ưu và các điểm dừng giao nhận."
    >
      <EmptyState
        icon={<Route className="h-6 w-6 text-muted-foreground" />}
        title="Phân hệ Quản lý tuyến đường"
        description="Nền tảng App Shell đã sẵn sàng. Bản đồ hành trình tuyến và quy hoạch chặng dừng sẽ được triển khai ở giai đoạn tiếp theo."
      />
    </PageContainer>
  );
};
