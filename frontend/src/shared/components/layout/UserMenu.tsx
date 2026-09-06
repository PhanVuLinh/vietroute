import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/shared/stores/authStore";
import { ROLE_LABELS } from "@/core/types/auth";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const fullName = user?.full_name || "Nguyễn Minh Anh";
  const email = user?.email || "dieuphoi@vietroute.vn";
  const roleLabel = user?.role ? ROLE_LABELS[user.role] : "Điều phối viên";
  const initial = fullName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2.5 rounded-lg py-1 px-1.5 hover:bg-muted/70 transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring"
          title="Tài khoản người dùng"
        >
          <div className="relative shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-xs ring-1 ring-border">
              {initial}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground tracking-tight truncate max-w-[130px]">
              {fullName}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium truncate">
              {roleLabel}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 shadow-lg">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1.5 p-0.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground truncate">{fullName}</p>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                <ShieldCheck className="mr-1 h-3 w-3 text-primary" />
                {roleLabel}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => navigate("/profile")}
          className="cursor-pointer text-xs"
        >
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Thông tin tài khoản</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate("/settings")}
          className="cursor-pointer text-xs"
        >
          <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Cài đặt hệ thống</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
