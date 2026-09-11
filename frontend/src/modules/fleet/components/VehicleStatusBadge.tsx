import React from "react";
import { CheckCircle2, Truck, Package, Wrench, PowerOff } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { VehicleStatus } from "@/core/types/logistics";

interface VehicleStatusBadgeProps {
  status: VehicleStatus;
  className?: string;
  showDot?: boolean;
}

const STATUS_CONFIG: Record<
  VehicleStatus,
  {
    label: string;
    icon: React.ElementType;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  }
> = {
  AVAILABLE: {
    label: "Sẵn sàng",
    icon: CheckCircle2,
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/15",
    textClass: "text-emerald-700 dark:text-emerald-300",
    borderClass: "border-emerald-500/25 dark:border-emerald-500/30",
    dotClass: "bg-emerald-500",
  },
  EN_ROUTE: {
    label: "Đang chạy tuyến",
    icon: Truck,
    bgClass: "bg-primary/10 dark:bg-primary/15",
    textClass: "text-primary dark:text-primary-300",
    borderClass: "border-primary/25 dark:border-primary/30",
    dotClass: "bg-primary animate-pulse",
  },
  LOADING: {
    label: "Đang bốc dỡ hàng",
    icon: Package,
    bgClass: "bg-cyan-500/10 dark:bg-cyan-500/15",
    textClass: "text-cyan-700 dark:text-cyan-300",
    borderClass: "border-cyan-500/25 dark:border-cyan-500/30",
    dotClass: "bg-cyan-500",
  },
  MAINTENANCE: {
    label: "Đang bảo dưỡng",
    icon: Wrench,
    bgClass: "bg-amber-500/10 dark:bg-amber-500/15",
    textClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-500/25 dark:border-amber-500/30",
    dotClass: "bg-amber-500",
  },
  OFFLINE: {
    label: "Không khả dụng",
    icon: PowerOff,
    bgClass: "bg-muted/60 dark:bg-muted/40",
    textClass: "text-muted-foreground",
    borderClass: "border-border",
    dotClass: "bg-muted-foreground/60",
  },
};

export const VehicleStatusBadge: React.FC<VehicleStatusBadgeProps> = ({
  status,
  className,
  showDot = true,
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.OFFLINE;
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
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotClass)} />
      )}
      <Icon className="h-3 w-3 shrink-0 opacity-85" />
      <span>{config.label}</span>
    </span>
  );
};

/* ========================================================================= */
/* COMPONENT BADGE TRẠNG THÁI ĐĂNG KIỂM PHƯƠNG TIỆN                           */
/* ========================================================================= */
import { ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";
import { evaluateVehicleInspection } from "@/shared/utils/inspectionUtils";

interface VehicleInspectionBadgeProps {
  expiryDate?: string;
  showDetails?: boolean;
  className?: string;
}

export const VehicleInspectionBadge: React.FC<VehicleInspectionBadgeProps> = ({
  expiryDate,
  showDetails = true,
  className,
}) => {
  const evaluation = evaluateVehicleInspection({ inspectionExpiryDate: expiryDate });

  if (evaluation.isExpired) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 select-none",
          className
        )}
        title={`Hạn đăng kiểm: ${expiryDate || "Không xác định"} - Nghiêm cấm xuất bến`}
      >
        <ShieldAlert className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 animate-pulse shrink-0" />
        <span>QUÁ HẠN</span>
        {showDetails && (
          <span className="font-mono text-[10px] bg-rose-600/20 px-1 py-0.2 rounded font-normal">
            {evaluation.label}
          </span>
        )}
      </span>
    );
  }

  if (evaluation.isExpiringSoon) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 select-none",
          className
        )}
        title={`Hạn đăng kiểm: ${expiryDate} - Cần sớm đưa xe đi kiểm định`}
      >
        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>Sắp hết hạn</span>
        {showDetails && (
          <span className="font-mono text-[10px] bg-amber-600/20 px-1 py-0.2 rounded font-normal">
            {evaluation.label}
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 select-none",
        className
      )}
      title={`Hạn đăng kiểm: ${expiryDate || "Hợp lệ"}`}
    >
      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span>Còn hạn</span>
      {showDetails && expiryDate && (
        <span className="text-[11px] text-muted-foreground">
          ({expiryDate.slice(5).replace("-", "/")})
        </span>
      )}
    </span>
  );
};
