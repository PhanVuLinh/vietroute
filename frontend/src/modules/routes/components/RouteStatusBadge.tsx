import React from "react";
import {
  Clock,
  Navigation,
  CheckCircle2,
  XCircle,
  MapPin,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { RouteStatus, RouteStopStatus } from "@/core/types/logistics";

interface RouteStatusBadgeProps {
  status: RouteStatus;
  className?: string;
}

const ROUTE_STATUS_CONFIG: Record<
  RouteStatus,
  {
    label: string;
    icon: React.ElementType;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  }
> = {
  PLANNED: {
    label: "Đã lập lịch",
    icon: Clock,
    bgClass: "bg-blue-500/10 dark:bg-blue-500/15",
    textClass: "text-blue-700 dark:text-blue-300 font-semibold",
    borderClass: "border-blue-500/25 dark:border-blue-500/30",
    dotClass: "bg-blue-500",
  },
  ACTIVE: {
    label: "Đang chạy",
    icon: Navigation,
    bgClass: "bg-amber-500/15 dark:bg-amber-500/20",
    textClass: "text-amber-700 dark:text-amber-300 font-bold",
    borderClass: "border-amber-500/35 dark:border-amber-500/40",
    dotClass: "bg-amber-500 animate-pulse",
  },
  COMPLETED: {
    label: "Hoàn thành",
    icon: CheckCircle2,
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/15",
    textClass: "text-emerald-700 dark:text-emerald-300 font-semibold",
    borderClass: "border-emerald-500/25 dark:border-emerald-500/30",
    dotClass: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Đã hủy",
    icon: XCircle,
    bgClass: "bg-rose-500/10 dark:bg-rose-500/15",
    textClass: "text-rose-700 dark:text-rose-300",
    borderClass: "border-rose-500/25 dark:border-rose-500/30",
    dotClass: "bg-rose-500",
  },
};

export const RouteStatusBadge: React.FC<RouteStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = ROUTE_STATUS_CONFIG[status] || ROUTE_STATUS_CONFIG.PLANNED;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap shrink-0 select-none transition-all",
        config.bgClass,
        config.textClass,
        config.borderClass,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotClass)} />
      <Icon className="h-3 w-3 shrink-0 opacity-90" />
      <span>{config.label}</span>
    </span>
  );
};

/* ========================================================================= */
/* STOP STATUS BADGE (CHẶNG DỪNG)                                            */
/* ========================================================================= */
interface StopStatusBadgeProps {
  status: RouteStopStatus;
  className?: string;
}

const STOP_STATUS_CONFIG: Record<
  RouteStopStatus,
  {
    label: string;
    icon: React.ElementType;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  }
> = {
  PENDING: {
    label: "Chờ giao",
    icon: Clock,
    bgClass: "bg-slate-500/10 dark:bg-slate-500/15",
    textClass: "text-slate-700 dark:text-slate-300",
    borderClass: "border-slate-500/25",
    dotClass: "bg-slate-400",
  },
  ARRIVED: {
    label: "Đã đến điểm",
    icon: MapPin,
    bgClass: "bg-amber-500/10 dark:bg-amber-500/15",
    textClass: "text-amber-700 dark:text-amber-300 font-semibold",
    borderClass: "border-amber-500/30",
    dotClass: "bg-amber-500 animate-pulse",
  },
  COMPLETED: {
    label: "Đã giao xong",
    icon: CheckCircle2,
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/15",
    textClass: "text-emerald-700 dark:text-emerald-300 font-semibold",
    borderClass: "border-emerald-500/25",
    dotClass: "bg-emerald-500",
  },
  SKIPPED: {
    label: "Bỏ qua",
    icon: XCircle,
    bgClass: "bg-rose-500/10 dark:bg-rose-500/15",
    textClass: "text-rose-700 dark:text-rose-300",
    borderClass: "border-rose-500/25",
    dotClass: "bg-rose-500",
  },
};

export const StopStatusBadge: React.FC<StopStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = STOP_STATUS_CONFIG[status] || STOP_STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border whitespace-nowrap shrink-0 select-none",
        config.bgClass,
        config.textClass,
        config.borderClass,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotClass)} />
      <Icon className="h-2.5 w-2.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};

export const RouteStopStatusBadge = StopStatusBadge;

