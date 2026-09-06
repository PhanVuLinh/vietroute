import React from "react";
import { Truck } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export const FleetPage: React.FC = () => {
  usePageTitle("Quản lý phương tiện");

  return (
    <PageContainer
      title="Quản lý phương tiện"
      subtitle="Quản lý danh sách phương tiện, trọng tải định mức, hạn đăng kiểm và bảo dưỡng định kỳ."
    >
      <EmptyState
        icon={<Truck className="h-6 w-6 text-muted-foreground" />}
        title="Phân hệ Quản lý phương tiện"
        description="Nền tảng App Shell đã sẵn sàng. Danh mục phương tiện và hồ sơ kỹ thuật xe sẽ được triển khai ở giai đoạn tiếp theo."
      />
    </PageContainer>
  );
};
