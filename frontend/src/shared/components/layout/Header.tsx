import React from "react";
import { Moon, Sun, Menu, Wifi, WifiOff } from "lucide-react";
import { useUiStore } from "@/shared/stores/uiStore";
import { useSocketContext } from "@/app/providers/SocketProvider";
import { Button } from "@/shared/components/ui/button";
import { BreadcrumbNavigation } from "./BreadcrumbNavigation";
import { SearchBar } from "./SearchBar";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { theme, toggleTheme } = useUiStore();
  const { isConnected } = useSocketContext();

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border/80 bg-card/90 backdrop-blur-md px-3 sm:px-5 shrink-0 z-20 gap-3">
      {/* 1. Bên trái: Hamburger mobile + Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Nút mở menu trên Mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="md:hidden shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground cursor-pointer"
          title="Mở thanh điều hướng"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumbs */}
        <div className="hidden sm:flex items-center min-w-0">
          <BreadcrumbNavigation />
        </div>
      </div>

      {/* 2. Ở giữa: Thanh tìm kiếm toàn hệ thống */}
      <div className="flex-1 max-w-xs md:max-w-sm lg:max-w-md mx-auto hidden lg:flex justify-center">
        <SearchBar />
      </div>

      {/* 3. Bên phải: Realtime status + Notification + Theme + User profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Chỉ báo trạng thái Realtime dạng viên thuốc công nghệ cao */}
        <div className="flex items-center">
          {isConnected ? (
            <div
              className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 py-1 xl:px-2.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 shadow-2xs shadow-emerald-500/10 select-none transition-all"
              title="Dữ liệu GPS và máy chủ đang đồng bộ thời gian thực"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 duration-1000" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 ring-2 ring-emerald-500/20" />
              </span>
              <span className="hidden xl:inline tracking-tight font-semibold">Realtime đang kết nối</span>
              <Wifi className="h-3.5 w-3.5 xl:hidden shrink-0" />
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-destructive/10 border border-destructive/25 px-2 py-1 xl:px-2.5 text-[11px] font-medium text-destructive shadow-2xs select-none transition-all"
              title="Mất kết nối máy chủ dữ liệu thời gian thực"
            >
              <span className="h-2 w-2 rounded-full bg-destructive ring-2 ring-destructive/20 shrink-0" />
              <span className="hidden xl:inline tracking-tight font-semibold">Realtime mất kết nối</span>
              <WifiOff className="h-3.5 w-3.5 xl:hidden shrink-0" />
            </div>
          )}
        </div>

        {/* Nút thông báo với unread count & popover */}
        <NotificationDropdown />

        {/* Chuyển đổi Theme Sáng / Tối */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground h-9 w-9 cursor-pointer"
          title={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Profile người dùng */}
        <UserMenu />
      </div>
    </header>
  );
};
