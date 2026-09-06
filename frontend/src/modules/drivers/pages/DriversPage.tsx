import React from "react";
import { UserRound } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export const DriversPage: React.FC = () => {
  usePageTitle("Quản lý tài xế");

  return (
    <PageContainer
      title="Quản lý tài xế"
      subtitle="Hồ sơ tài xế, hạng giấy phép lái xe, phân bổ ca làm việc và đánh giá hiệu suất."
    >
      <EmptyState
        icon={<UserRound className="h-6 w-6 text-muted-foreground" />}
        title="Phân hệ Quản lý tài xế"
        description="Nền tảng App Shell đã sẵn sàng. Danh sách tài xế và chấm công vận hành sẽ được triển khai ở giai đoạn tiếp theo."
      />
    </PageContainer>
  );
};
