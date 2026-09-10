import React from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Truck,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useUiStore } from "@/shared/stores/uiStore";
import { useAuthStore } from "@/shared/stores/authStore";
import {
  NAV_GROUPS,
  BOTTOM_NAV_ITEMS,
  type NavItemConfig,
} from "./roleNavigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Separator } from "@/shared/components/ui/separator";

interface SidebarProps {
  className?: string;
  isMobileDrawer?: boolean;
  onMobileItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  isMobileDrawer = false,
  onMobileItemClick,
}) => {
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const { user } = useAuthStore();

  // Trên Mobile Drawer luôn hiển thị expanded
  const isExpanded = isMobileDrawer ? true : sidebarOpen;

  // Lọc menu theo vai trò người dùng
  const filterByRole = (items: NavItemConfig[]) => {
    if (!user?.role || user.role === "ADMIN") return items;
    return items.filter(
      (item) => !item.allowedRoles || item.allowedRoles.includes(user.role)
    );
  };

  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: filterByRole(group.items),
  })).filter((group) => group.items.length > 0);

  const visibleBottomItems = filterByRole(BOTTOM_NAV_ITEMS);

  const renderNavLink = (item: NavItemConfig) => {
    const Icon = item.icon;

    const linkContent = (
      <NavLink
        to={item.path}
        onClick={onMobileItemClick}
        className={({ isActive }) =>
          cn(
            "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 outline-none",
            isExpanded
              ? isActive
                ? "bg-primary text-primary-foreground font-semibold shadow-xs shadow-primary/25"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              : cn(
                  "justify-center px-0 h-10 w-10 mx-auto rounded-xl",
                  isActive
                    ? "bg-primary/12 text-primary ring-1 ring-primary/30 shadow-xs shadow-primary/10"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110",
                isExpanded
                  ? isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  : isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            {isExpanded && <span className="truncate tracking-tight">{item.label}</span>}
          </>
        )}
      </NavLink>
    );

    if (!isExpanded) {
      return (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="font-medium text-xs bg-popover text-popover-foreground shadow-md border border-border">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <React.Fragment key={item.path}>{linkContent}</React.Fragment>;
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full border-r border-border/80 bg-card transition-all duration-300 select-none z-30 shrink-0",
        isExpanded ? "w-64" : "w-[72px]",
        className
      )}
    >
      {/* 1. Header Thương hiệu sắc nét */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border/80 shrink-0 transition-all",
          isExpanded ? "justify-between px-4" : "justify-center relative"
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold shadow-xs ring-1 ring-white/20">
            <Truck className="h-5 w-5" />
          </div>
          {isExpanded && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-foreground text-sm leading-tight">
                  VietRoute
                </span>
                <span className="rounded bg-primary/10 px-1 py-0.2 text-[9px] font-semibold text-primary">
                  TMS
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium truncate leading-tight mt-0.5">
                Quản lý vận hành logistics
              </span>
            </div>
          )}
        </div>

        {/* Nút toggle thu gọn / mở rộng Sidebar */}
        {!isMobileDrawer && (
          <button
            onClick={toggleSidebar}
            className={cn(
              "hidden md:flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer",
              isExpanded
                ? "h-7 w-7"
                : "absolute -right-3 top-5 h-6 w-6 rounded-full border border-border bg-card shadow-xs z-40 text-foreground hover:bg-muted"
            )}
            title={isExpanded ? "Thu gọn thanh điều hướng (72px)" : "Mở rộng thanh điều hướng (256px)"}
          >
            {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* 2. Menu Nghiệp vụ chính chia nhóm */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-3">
        {filteredGroups.map((group, groupIdx) => (
          <div key={group.groupTitle || groupIdx} className="space-y-0.5">
            {isExpanded ? (
              group.groupTitle && (
                <div className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 select-none">
                  {group.groupTitle}
                </div>
              )
            ) : (
              groupIdx > 0 && <div className="my-2.5 border-t border-border/40 mx-3" />
            )}
            <div className={cn("space-y-1", !isExpanded && "space-y-1.5 flex flex-col items-center")}>
              {group.items.map(renderNavLink)}
            </div>
          </div>
        ))}
      </nav>

      <Separator className="my-0.5 bg-border/60" />

      {/* 3. Menu Tiện ích dưới chân */}
      <div className="p-2.5 space-y-1 shrink-0">
        {visibleBottomItems.map(renderNavLink)}
      </div>

      {/* 4. Phiên bản hệ thống */}
      <div className={cn(
        "border-t border-border/60 shrink-0 transition-all",
        isExpanded ? "px-4 py-2.5" : "px-2 py-2"
      )}>
        {isExpanded ? (
          <div className="text-[10px] text-muted-foreground/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>VietRoute Enterprise</span>
            </div>
            <span className="font-mono text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              v1.0
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="VietRoute Enterprise v1.0" />
          </div>
        )}
      </div>
    </aside>
  );
};
