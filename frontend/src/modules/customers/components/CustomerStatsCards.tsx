import React from "react";
import { Users, Building2, User, Crown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/shared/utils/formatters";
import { cn } from "@/shared/utils/cn";

interface CustomerStatsCardsProps {
  total: number;
  enterprise: number;
  individual: number;
  vip: number;
  totalRevenue: number;
}

export const CustomerStatsCards: React.FC<CustomerStatsCardsProps> = ({
  total,
  enterprise,
  individual,
  vip,
  totalRevenue,
}) => {
  const cards = [
    {
      label: "Tổng khách hàng",
      value: total.toString(),
      icon: Users,
      color: "text-foreground",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      label: "Doanh nghiệp (B2B)",
      value: enterprise.toString(),
      icon: Building2,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Cá nhân (B2C)",
      value: individual.toString(),
      icon: User,
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20",
    },
    {
      label: "VIP & Gold",
      value: vip.toString(),
      icon: Crown,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Tổng doanh thu",
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      isWide: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-sm bg-card",
              card.borderColor
            )}
          >
            <div
              className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                card.bgColor
              )}
            >
              <Icon className={cn("h-4 w-4", card.color)} />
            </div>
            <div className="min-w-0">
              <p className={cn("font-bold tabular-nums text-foreground truncate", card.isWide ? "text-sm" : "text-xl")}>
                {card.value}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium truncate">
                {card.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
