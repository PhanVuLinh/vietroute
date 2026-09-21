import React from "react";
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface IncidentStatsCardsProps {
  stats: {
    total: number;
    critical: number;
    inProgress: number;
    pendingReview: number;
    resolved: number;
    resolutionRate: number;
  };
  isLoading?: boolean;
}

export const IncidentStatsCards: React.FC<IncidentStatsCardsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-card rounded-xl border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Tổng sự cố ghi nhận",
      value: stats.total,
      sub: "Trong tháng này",
      icon: AlertTriangle,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Nghiêm trọng (Critical)",
      value: stats.critical,
      sub: "Cần xử lý tức thời",
      icon: ShieldAlert,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      highlight: stats.critical > 0,
    },
    {
      label: "Đang xử lý & Chờ duyệt",
      value: stats.inProgress + stats.pendingReview,
      sub: `${stats.pendingReview} ca chờ phê duyệt`,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Tỷ lệ xử lý thành công",
      value: `${stats.resolutionRate}%`,
      sub: `${stats.resolved} ca đã giải quyết`,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={cn(
              "p-3.5 rounded-xl border bg-card/60 backdrop-blur-xs flex items-center justify-between transition-all hover:shadow-xs",
              c.border,
              c.highlight && "ring-1 ring-rose-500/30 bg-rose-500/5"
            )}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground block truncate">
                {c.label}
              </span>
              <div className="text-xl font-bold font-mono tracking-tight text-foreground">
                {c.value}
              </div>
              <span className="text-[10px] text-muted-foreground/80 block">
                {c.sub}
              </span>
            </div>

            <div className={cn("p-2.5 rounded-xl shrink-0", c.bg)}>
              <Icon className={cn("h-5 w-5", c.color)} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
