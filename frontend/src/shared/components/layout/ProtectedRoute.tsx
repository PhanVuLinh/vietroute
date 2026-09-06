import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/shared/stores/authStore";
import { canAccessRoute } from "./roleNavigation";
import { Button } from "@/shared/components/ui/button";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra phân quyền theo vai trò (Role-based access control)
  const isAllowed = canAccessRoute(user?.role, location.pathname);

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Từ chối quyền truy cập (403)
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Tài khoản vai trò <span className="font-semibold text-foreground">[{user?.role}]</span> của bạn không được phân quyền truy cập vào phân hệ này.
          </p>
        </div>
        <Button onClick={() => window.history.back()} variant="outline" size="sm">
          Quay lại trang trước
        </Button>
      </div>
    );
  }

  return <Outlet />;
};
