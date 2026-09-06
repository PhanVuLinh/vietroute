import React from "react";
import { LayoutDashboard } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export const DashboardPage: React.FC = () => {
  usePageTitle("Tổng quan vận hành");

  return (
    <PageContainer
      title="Tổng quan vận hành"
      subtitle="Bảng chỉ số hiệu suất logistics, trạng thái hạm đội và đơn hàng thời gian thực."
    >
      <EmptyState
        icon={<LayoutDashboard className="h-6 w-6 text-muted-foreground" />}
        title="Phân hệ Tổng quan vận hành"
        description="Nền tảng App Shell đã sẵn sàng. Giao diện bảng điều khiển chỉ số chi tiết sẽ được triển khai ở giai đoạn tiếp theo."
      />
    </PageContainer>
  );
};
