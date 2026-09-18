import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BreadcrumbNavigation } from "./BreadcrumbNavigation";
import { Sheet, SheetContent, SheetTitle } from "@/shared/components/ui/sheet";
import { ToastContainer } from "@/shared/components/feedback/Toast";

export const AppLayout: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-background">
      {/* 1. Sidebar cố định trên Desktop (md trở lên) */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar />
      </div>

      {/* 2. Mobile Drawer Navigation cho màn hình nhỏ */}
      <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r border-border">
          <SheetTitle className="sr-only">Menu Điều Hướng VietRoute</SheetTitle>
          <Sidebar
            isMobileDrawer
            onMobileItemClick={() => setMobileDrawerOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* 3. Vùng làm việc chính (Main Area) */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {/* Header cố định trên cùng */}
        <Header onOpenMobileMenu={() => setMobileDrawerOpen(true)} />

        {/* Thanh Breadcrumb phụ cho màn hình điện thoại (khi Breadcrumb ở header bị ẩn) */}
        <div className="sm:hidden px-4 py-2 border-b border-border/60 bg-muted/20 shrink-0">
          <BreadcrumbNavigation />
        </div>

        {/* Nội dung trang cuộn độc lập */}
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 sm:p-6 bg-background">
          <Outlet />
        </main>
      </div>

      {/* Global Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};
