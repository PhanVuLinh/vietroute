import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const ROUTE_NAME_MAP: Record<string, string> = {
  dashboard: "Tổng quan",
  orders: "Đơn hàng",
  dispatch: "Điều phối",
  tracking: "Giám sát",
  drivers: "Tài xế",
  fleet: "Phương tiện",
  warehouses: "Kho hàng",
  routes: "Tuyến đường",
  reports: "Báo cáo & phân tích",
  "ai-assistant": "Trợ lý AI",
  settings: "Cài đặt",
  help: "Trợ giúp",
  profile: "Tài khoản",
};

export interface BreadcrumbNavigationProps {
  className?: string;
  customSegments?: { label: string; path?: string }[];
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  className,
  customSegments,
}) => {
  const location = useLocation();

  // Tách các path segments từ pathname hiện tại
  const pathSegments = location.pathname
    .split("/")
    .filter((segment) => Boolean(segment));

  const items: { label: string; path: string; isLast: boolean }[] = [
    { label: "VietRoute", path: "/dashboard", isLast: pathSegments.length === 0 },
  ];

  if (customSegments && customSegments.length > 0) {
    customSegments.forEach((seg, idx) => {
      items.push({
        label: seg.label,
        path: seg.path || "",
        isLast: idx === customSegments.length - 1,
      });
    });
  } else {
    let accumulatedPath = "";
    pathSegments.forEach((segment, idx) => {
      accumulatedPath += `/${segment}`;
      const label =
        ROUTE_NAME_MAP[segment] ||
        (segment.startsWith("ord-") || segment.startsWith("del-") || segment.startsWith("VR-")
          ? segment.toUpperCase()
          : segment);

      items.push({
        label,
        path: accumulatedPath,
        isLast: idx === pathSegments.length - 1,
      });
    });
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-xs font-medium text-muted-foreground min-w-0 overflow-hidden", className)}
    >
      <ol className="flex items-center gap-1.5 flex-nowrap overflow-hidden">
        {items.map((item, index) => {
          const isFirst = index === 0;

          return (
            <li key={`${item.path}-${index}`} className="flex items-center gap-1.5 shrink-0 min-w-0">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />}

              {item.isLast ? (
                <span className="font-semibold text-foreground truncate max-w-[140px] sm:max-w-[220px] whitespace-nowrap" title={item.label}>
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="flex items-center gap-1 hover:text-foreground transition-colors hover:underline underline-offset-4 whitespace-nowrap shrink-0"
                >
                  {isFirst && <Home className="h-3.5 w-3.5 shrink-0" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
