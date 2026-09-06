import React from "react";
import { Warehouse } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export const WarehousesPage: React.FC = () => {
  usePageTitle("Quản lý kho hàng");

  return (
    <PageContainer
      title="Quản lý kho hàng & Hub"
      subtitle="Mạng lưới trung tâm phân phối, kho trung chuyển và kiểm soát tỷ lệ lấp đầy kho."
    >
      <EmptyState
        icon={<Warehouse className="h-6 w-6 text-muted-foreground" />}
        title="Phân hệ Quản lý kho hàng"
        description="Nền tảng App Shell đã sẵn sàng. Danh mục kho bãi và bản đồ mạng lưới Hub sẽ được triển khai ở giai đoạn tiếp theo."
      />
    </PageContainer>
  );
};
