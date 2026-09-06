import React from "react";
import { ChartNoAxesCombined } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export const ReportsPage: React.FC = () => {
  usePageTitle("Báo cáo & phân tích");

  return (
    <PageContainer
      title="Báo cáo & phân tích"
      subtitle="Thống kê chỉ số KPI vận tải, chi phí nhiên liệu, tỷ lệ giao đúng hạn (OTD) và hiệu suất đội xe."
    >
      <EmptyState
        icon={<ChartNoAxesCombined className="h-6 w-6 text-muted-foreground" />}
        title="Phân hệ Báo cáo & phân tích"
        description="Nền tảng App Shell đã sẵn sàng. Hệ thống biểu đồ phân tích số liệu sẽ được triển khai ở giai đoạn tiếp theo."
      />
    </PageContainer>
  );
};
