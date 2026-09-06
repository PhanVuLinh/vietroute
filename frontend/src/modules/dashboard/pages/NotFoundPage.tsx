import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

export const NotFoundPage: React.FC = () => {
  usePageTitle("Không tìm thấy trang");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">404 — Không tìm thấy trang</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Đường dẫn bạn truy cập không tồn tại hoặc đã được chuyển sang vị trí khác trong hệ thống VietRoute.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link to="/dashboard">Quay lại Tổng quan</Link>
        </Button>
      </div>
    </div>
  );
};
