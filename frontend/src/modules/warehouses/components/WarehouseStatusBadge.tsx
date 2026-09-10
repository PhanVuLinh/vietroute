import React from "react";
import {
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Building2,
  Boxes,
  MapPin,
  Flame,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type {
  WarehouseStatus,
  WarehouseType,
  WarehouseRegion,
  WarehouseStorageType,
} from "@/core/types/logistics";

interface WarehouseStatusBadgeProps {
  status: WarehouseStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  WarehouseStatus,
  {
    label: string;
    icon: React.ElementType;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  }
> = {
  ACTIVE: {
    label: "Hoạt động bình thường",
    icon: CheckCircle2,
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/15",
    textClass: "text-emerald-700 dark:text-emerald-300",
    borderClass: "border-emerald-500/25 dark:border-emerald-500/30",
    dotClass: "bg-emerald-500",
  },
  MAINTENANCE: {
    label: "Bảo trì bến bãi",
    icon: Wrench,
    bgClass: "bg-amber-500/10 dark:bg-amber-500/15",
    textClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-500/25 dark:border-amber-500/30",
    dotClass: "bg-amber-500",
  },
  FULL: {
    label: "Quá tải / Đầy tải",
    icon: AlertTriangle,
    bgClass: "bg-rose-500/15 dark:bg-rose-500/20",
    textClass: "text-rose-700 dark:text-rose-300 font-bold",
    borderClass: "border-rose-500/35 dark:border-rose-500/40",
    dotClass: "bg-rose-500 animate-pulse",
  },
};

export const WarehouseStatusBadge: React.FC<WarehouseStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all select-none",
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
/* BADGE PHÂN LOẠI HUB                                                       */
/* ========================================================================= */
interface WarehouseTypeBadgeProps {
  type?: WarehouseType;
  className?: string;
}

const TYPE_CONFIG: Record<
  WarehouseType,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  CENTRAL_HUB: {
    label: "Tổng kho phân phối",
    bgClass: "bg-purple-500/10 dark:bg-purple-500/15",
    textClass: "text-purple-700 dark:text-purple-300 font-bold",
    borderClass: "border-purple-500/25",
  },
  TRANSIT_HUB: {
    label: "Kho trung chuyển",
    bgClass: "bg-blue-500/10 dark:bg-blue-500/15",
    textClass: "text-blue-700 dark:text-blue-300 font-semibold",
    borderClass: "border-blue-500/25",
  },
  LAST_MILE_HUB: {
    label: "Hub chặng cuối",
    bgClass: "bg-teal-500/10 dark:bg-teal-500/15",
    textClass: "text-teal-700 dark:text-teal-300 font-semibold",
    borderClass: "border-teal-500/25",
  },
};

export const WarehouseTypeBadge: React.FC<WarehouseTypeBadgeProps> = ({
  type = "TRANSIT_HUB",
  className,
}) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.TRANSIT_HUB;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border select-none",
        config.bgClass,
        config.textClass,
        config.borderClass,
        className
      )}
    >
      <Building2 className="h-3 w-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};

/* ========================================================================= */
/* BADGE KHU VỰC MIỀN                                                        */
/* ========================================================================= */
interface WarehouseRegionBadgeProps {
  region?: WarehouseRegion;
  className?: string;
}

const REGION_CONFIG: Record<
  WarehouseRegion,
  { label: string; bgClass: string; textClass: string }
> = {
  NORTH: {
    label: "Miền Bắc",
    bgClass: "bg-sky-500/10 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/20",
  },
  CENTRAL: {
    label: "Miền Trung",
    bgClass: "bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  SOUTH: {
    label: "Miền Nam",
    bgClass: "bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
  },
};

export const WarehouseRegionBadge: React.FC<WarehouseRegionBadgeProps> = ({
  region = "NORTH",
  className,
}) => {
  const config = REGION_CONFIG[region] || REGION_CONFIG.NORTH;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold border select-none",
        config.bgClass,
        className
      )}
    >
      <MapPin className="h-2.5 w-2.5" />
      <span>{config.label}</span>
    </span>
  );
};
