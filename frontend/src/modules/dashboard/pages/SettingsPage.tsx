import React from "react";
import { Settings, Sliders } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Badge } from "@/shared/components/ui/badge";

export const SettingsPage: React.FC = () => {
  usePageTitle("Cài đặt hệ thống");

  return (
    <PageContainer
      title="Cài đặt hệ thống"
      subtitle="Quản lý cấu hình vận hành, tham số thuật toán điều phối và tích hợp API."
      action={
        <Badge variant="outline" className="text-xs py-1 px-2.5 gap-1.5">
          <Sliders className="h-3.5 w-3.5 text-primary" />
          Phiên bản Enterprise v1.0
        </Badge>
      }
    >
      <EmptyState
        icon={<Settings className="h-6 w-6 text-muted-foreground" />}
        title="Trung tâm Cài đặt hệ thống"
        description="Nền tảng App Shell đã sẵn sàng. Các cấu hình tham số vận hành xe, kho bãi và bảo mật sẽ được triển khai ở bước kế tiếp."
      />
    </PageContainer>
  );
};
