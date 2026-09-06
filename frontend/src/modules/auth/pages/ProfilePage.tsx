import React from "react";
import { CircleUser, ShieldCheck, Mail, Phone } from "lucide-react";
import { useAuthStore } from "@/shared/stores/authStore";
import { ROLE_LABELS } from "@/core/types/auth";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Badge } from "@/shared/components/ui/badge";

export const ProfilePage: React.FC = () => {
  usePageTitle("Thông tin tài khoản");
  const { user } = useAuthStore();

  const fullName = user?.full_name || "Nguyễn Minh Anh";
  const email = user?.email || "dieuphoi@vietroute.vn";
  const phone = user?.phone || "0987654321";
  const roleLabel = user?.role ? ROLE_LABELS[user.role] : "Điều phối viên";

  return (
    <PageContainer
      title="Thông tin tài khoản"
      subtitle="Xem và quản lý hồ sơ cá nhân, vai trò phân quyền và ca trực vận hành."
    >
      <div className="max-w-xl rounded-lg border border-border bg-card p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-2xl shadow-2xs">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{fullName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <ShieldCheck className="mr-1 h-3.5 w-3.5 text-primary" />
                {roleLabel}
              </Badge>
              <Badge variant="success" className="text-xs">
                Đang hoạt động
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email làm việc
            </span>
            <span className="font-medium text-foreground font-mono">{email}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Số điện thoại
            </span>
            <span className="font-medium text-foreground font-mono">{phone}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-muted-foreground flex items-center gap-2">
              <CircleUser className="h-4 w-4" />
              Mã tài khoản
            </span>
            <span className="font-medium text-foreground font-mono">{user?.id || "usr-dispatch-01"}</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
