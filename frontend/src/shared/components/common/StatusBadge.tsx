import React from "react";
import { cn } from "@/shared/utils/cn";

export type StatusBadgeVariant =
  | "emerald"
  | "blue"
  | "amber"
  | "rose"
  | "purple"
  | "cyan"
  | "slate"
  | "primary";

export interface StatusBadgeProps {
  label: string;
  icon?: React.ElementType;
  variant?: StatusBadgeVariant;
  showDot?: boolean;
  pulseDot?: boolean;
  size?: "xs" | "sm" | "md";
  className?: string;
  dotClassName?: string;
}

const VARIANT_STYLES: Record<
  StatusBadgeVariant,
  {
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  }
> = {
  emerald: {
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/15",
    textClass: "text-emerald-700 dark:text-emerald-300",
    borderClass: "border-emerald-500/25 dark:border-emerald-500/30",
    dotClass: "bg-emerald-500",
  },
  blue: {
    bgClass: "bg-blue-500/10 dark:bg-blue-500/15",
    textClass: "text-blue-700 dark:text-blue-300",
    borderClass: "border-blue-500/25 dark:border-blue-500/30",
    dotClass: "bg-blue-500",
  },
  amber: {
    bgClass: "bg-amber-500/10 dark:bg-amber-500/15",
    textClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-500/25 dark:border-amber-500/30",
    dotClass: "bg-amber-500",
  },
  rose: {
    bgClass: "bg-rose-500/10 dark:bg-rose-500/15",
    textClass: "text-rose-700 dark:text-rose-300",
    borderClass: "border-rose-500/25 dark:border-rose-500/30",
    dotClass: "bg-rose-500",
  },
  purple: {
    bgClass: "bg-purple-500/10 dark:bg-purple-500/15",
    textClass: "text-purple-700 dark:text-purple-300",
    borderClass: "border-purple-500/25 dark:border-purple-500/30",
    dotClass: "bg-purple-500",
  },
  cyan: {
    bgClass: "bg-cyan-500/10 dark:bg-cyan-500/15",
    textClass: "text-cyan-700 dark:text-cyan-300",
    borderClass: "border-cyan-500/25 dark:border-cyan-500/30",
    dotClass: "bg-cyan-500",
  },
  slate: {
    bgClass: "bg-slate-500/10 dark:bg-slate-500/15",
    textClass: "text-slate-700 dark:text-slate-300",
    borderClass: "border-slate-500/25 dark:border-slate-500/30",
    dotClass: "bg-slate-400",
  },
  primary: {
    bgClass: "bg-primary/10 dark:bg-primary/15",
    textClass: "text-primary dark:text-primary-300",
    borderClass: "border-primary/25 dark:border-primary/30",
    dotClass: "bg-primary",
  },
};

const SIZE_STYLES = {
  xs: "text-[10px] px-2 py-0.2 gap-1",
  sm: "text-xs px-2.5 py-0.5 gap-1.5",
  md: "text-sm px-3 py-1 gap-2",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  icon: Icon,
  variant = "slate",
  showDot = true,
  pulseDot = false,
  size = "sm",
  className,
  dotClassName,
}) => {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.slate;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold border whitespace-nowrap shrink-0 select-none transition-all",
        SIZE_STYLES[size],
        styles.bgClass,
        styles.textClass,
        styles.borderClass,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            styles.dotClass,
            pulseDot && "animate-pulse",
            dotClassName
          )}
        />
      )}
      {Icon && <Icon className="h-3 w-3 shrink-0 opacity-85" />}
      <span>{label}</span>
    </span>
  );
};
