import React from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils/cn";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export type StatColorVariant =
  | "default"
  | "primary"
  | "emerald"
  | "amber"
  | "blue"
  | "indigo"
  | "purple"
  | "violet"
  | "rose"
  | "cyan";

export interface StatCardProps {
  id?: string;
  title: string;
  value: React.ReactNode;
  unit?: string;
  icon: React.ElementType;
  description?: React.ReactNode;
  badge?: {
    text: string;
    variant?: "default" | "success" | "warning" | "destructive" | "info";
    icon?: React.ElementType;
  };
  trend?: {
    value: string | number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  progress?: {
    value: number; // 0 - 100
    color?: string;
  };
  variant?: StatColorVariant;
  isLoading?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  actionText?: string;
}

const VARIANT_STYLES: Record<
  StatColorVariant,
  {
    iconBg: string;
    iconText: string;
    iconBorder: string;
    glowBg: string;
    hoverBorder: string;
    activeBorder: string;
    activeBg: string;
    valueText?: string;
  }
> = {
  default: {
    iconBg: "bg-muted text-foreground",
    iconText: "text-foreground",
    iconBorder: "border-border",
    glowBg: "bg-muted/10",
    hoverBorder: "hover:border-border",
    activeBorder: "border-foreground/30",
    activeBg: "bg-muted/10",
  },
  primary: {
    iconBg: "bg-primary/10",
    iconText: "text-primary",
    iconBorder: "border-primary/20",
    glowBg: "bg-primary/5",
    hoverBorder: "hover:border-primary/40",
    activeBorder: "border-primary/60",
    activeBg: "bg-primary/5",
    valueText: "text-primary",
  },
  emerald: {
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-600 dark:text-emerald-400",
    iconBorder: "border-emerald-500/20",
    glowBg: "bg-emerald-500/5",
    hoverBorder: "hover:border-emerald-500/40",
    activeBorder: "border-emerald-500/60",
    activeBg: "bg-emerald-500/5",
    valueText: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    iconBg: "bg-amber-500/15",
    iconText: "text-amber-600 dark:text-amber-400",
    iconBorder: "border-amber-500/20",
    glowBg: "bg-amber-500/5",
    hoverBorder: "hover:border-amber-500/40",
    activeBorder: "border-amber-500/60",
    activeBg: "bg-amber-500/5",
    valueText: "text-amber-600 dark:text-amber-400",
  },
  blue: {
    iconBg: "bg-blue-500/10",
    iconText: "text-blue-600 dark:text-blue-400",
    iconBorder: "border-blue-500/20",
    glowBg: "bg-blue-500/5",
    hoverBorder: "hover:border-blue-500/40",
    activeBorder: "border-blue-500/60",
    activeBg: "bg-blue-500/5",
    valueText: "text-blue-600 dark:text-blue-400",
  },
  indigo: {
    iconBg: "bg-indigo-500/10",
    iconText: "text-indigo-600 dark:text-indigo-400",
    iconBorder: "border-indigo-500/20",
    glowBg: "bg-indigo-500/5",
    hoverBorder: "hover:border-indigo-500/40",
    activeBorder: "border-indigo-500/60",
    activeBg: "bg-indigo-500/5",
    valueText: "text-indigo-600 dark:text-indigo-400",
  },
  purple: {
    iconBg: "bg-purple-500/10",
    iconText: "text-purple-600 dark:text-purple-400",
    iconBorder: "border-purple-500/20",
    glowBg: "bg-purple-500/5",
    hoverBorder: "hover:border-purple-500/40",
    activeBorder: "border-purple-500/60",
    activeBg: "bg-purple-500/5",
    valueText: "text-purple-600 dark:text-purple-400",
  },
  violet: {
    iconBg: "bg-violet-500/10",
    iconText: "text-violet-600 dark:text-violet-400",
    iconBorder: "border-violet-500/20",
    glowBg: "bg-violet-500/5",
    hoverBorder: "hover:border-violet-500/40",
    activeBorder: "border-violet-500/60",
    activeBg: "bg-violet-500/5",
    valueText: "text-violet-600 dark:text-violet-400",
  },
  rose: {
    iconBg: "bg-rose-500/15",
    iconText: "text-rose-600 dark:text-rose-400",
    iconBorder: "border-rose-500/25",
    glowBg: "bg-rose-500/5",
    hoverBorder: "hover:border-rose-500/40",
    activeBorder: "border-rose-500/60",
    activeBg: "bg-rose-500/5",
    valueText: "text-rose-600 dark:text-rose-400",
  },
  cyan: {
    iconBg: "bg-cyan-500/10",
    iconText: "text-cyan-600 dark:text-cyan-400",
    iconBorder: "border-cyan-500/20",
    glowBg: "bg-cyan-500/5",
    hoverBorder: "hover:border-cyan-500/40",
    activeBorder: "border-cyan-500/60",
    activeBg: "bg-cyan-500/5",
    valueText: "text-cyan-600 dark:text-cyan-400",
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  unit,
  icon: Icon,
  description,
  badge,
  trend,
  progress,
  variant = "primary",
  isLoading = false,
  isSelected = false,
  onClick,
  className,
  actionText,
}) => {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const isClickable = Boolean(onClick);

  return (
    <Card
      id={id}
      onClick={onClick}
      className={cn(
        "border shadow-2xs transition-all relative overflow-hidden flex flex-col justify-between h-full bg-card select-none",
        isClickable && "cursor-pointer",
        isSelected
          ? cn(styles.activeBorder, styles.activeBg)
          : cn("border-border/80", isClickable && styles.hoverBorder),
        className
      )}
    >
      {/* Decorative subtle ambient circle */}
      <div
        className={cn(
          "absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 pointer-events-none transition-opacity",
          styles.glowBg
        )}
      />

      <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-2 h-full">
        <div className="space-y-1 min-w-0 flex-1">
          {/* Header Row: Label & Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground truncate" title={title}>
              {title}
            </span>
            {badge && (
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 flex items-center gap-0.5",
                  badge.variant === "success" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                  badge.variant === "warning" && "bg-amber-500/15 text-amber-700 dark:text-amber-400",
                  badge.variant === "destructive" && "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                  badge.variant === "info" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                  (!badge.variant || badge.variant === "default") && "bg-primary/10 text-primary"
                )}
              >
                {badge.icon && <badge.icon className="h-2.5 w-2.5 shrink-0" />}
                <span>{badge.text}</span>
              </span>
            )}
          </div>

          {/* Main Stat Value Row */}
          {isLoading ? (
            <div className="py-1">
              <Skeleton className="h-7 w-24 rounded-md" />
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span
                className={cn(
                  "text-2xl font-bold font-mono tracking-tight tabular-nums whitespace-nowrap",
                  styles.valueText || "text-foreground"
                )}
              >
                {value}
              </span>
              {unit && (
                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                  {unit}
                </span>
              )}
              {trend && (
                <span
                  className={cn(
                    "text-[11px] font-semibold flex items-center gap-0.5 whitespace-nowrap ml-0.5",
                    trend.direction === "up" && "text-emerald-600 dark:text-emerald-400",
                    trend.direction === "down" && "text-rose-600 dark:text-rose-400",
                    trend.direction === "neutral" && "text-muted-foreground"
                  )}
                >
                  {trend.direction === "up" && <TrendingUp className="h-3 w-3 shrink-0" />}
                  {trend.direction === "down" && <TrendingDown className="h-3 w-3 shrink-0" />}
                  {trend.direction === "neutral" && <Minus className="h-3 w-3 shrink-0" />}
                  <span>{trend.value}</span>
                </span>
              )}
            </div>
          )}

          {/* Progress Bar (if specified) */}
          {progress && !isLoading && (
            <div className="space-y-0.5 pt-0.5">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    progress.color || "bg-primary"
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, progress.value))}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Subtext or Action */}
          {description && (
            <div className="text-[11px] text-muted-foreground truncate pt-0.5">
              {description}
            </div>
          )}
          {actionText && (
            <div className="text-[10px] font-medium text-primary hover:underline truncate pt-0.5">
              {actionText} →
            </div>
          )}
        </div>

        {/* Right Icon Container */}
        <div
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ml-1 border transition-colors",
            styles.iconBg,
            styles.iconText,
            styles.iconBorder
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
};
