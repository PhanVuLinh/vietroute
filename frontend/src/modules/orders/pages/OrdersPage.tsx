import React from "react";
import { Package } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export const OrdersPage: React.FC = () => {
  usePageTitle("Quản lý đơn hàng");

  return (
    <PageContainer
      title="Quản lý đơn hàng"
      subtitle="Theo dõi tiến độ đơn, phân bổ trạng thái và lịch sử giao hàng trên toàn mạng lưới."
    >
      <EmptyState
        icon={<Package className="h-6 w-6 text-muted-foreground" />}
        title="Phân hệ Quản lý đơn hàng"
        description="Nền tảng App Shell đã sẵn sàng. Bảng dữ liệu đơn hàng và bộ lọc nâng cao sẽ được triển khai ở giai đoạn tiếp theo."
      />
    </PageContainer>
  );
};
