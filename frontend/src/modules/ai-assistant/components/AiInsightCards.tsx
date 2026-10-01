import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Navigation,
  Truck,
  Fuel,
  ShieldAlert,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import type { AiChatMessage } from "../hooks/useAiAssistant";

interface AiInsightCardsProps {
  insights: NonNullable<AiChatMessage["insights"]>;
}

export const AiInsightCards: React.FC<AiInsightCardsProps> = ({ insights }) => {
  const getHeaderStyle = () => {
    switch (insights.type) {
      case "SLA_ALERT":
        return {
          icon: AlertTriangle,
          color: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-500/10 border-amber-500/30",
        };
      case "ROUTE_OPTIMIZATION":
        return {
          icon: Navigation,
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-500/10 border-blue-500/30",
        };
      case "WAREHOUSE_OVERLOAD":
        return {
          icon: Building2,
          color: "text-rose-600 dark:text-rose-400",
          bg: "bg-rose-500/10 border-rose-500/30",
        };
      case "DRIVER_DISPATCH":
        return {
          icon: Truck,
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-500/10 border-emerald-500/30",
        };
      case "FUEL_ANALYTICS":
        return {
          icon: Fuel,
          color: "text-violet-600 dark:text-violet-400",
          bg: "bg-violet-500/10 border-violet-500/30",
        };
      case "INCIDENT_ALERT":
        return {
          icon: ShieldAlert,
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-500/10 border-red-500/30",
        };
      default:
        return {
          icon: Sparkles,
          color: "text-primary",
          bg: "bg-primary/10 border-primary/30",
        };
    }
  };

  const style = getHeaderStyle();
  const Icon = style.icon;

  return (
    <Card className={`mt-3 border shadow-xs overflow-hidden ${style.bg}`}>
      <CardHeader className="py-2.5 px-3.5 flex flex-row items-center justify-between border-b border-border/40 shrink-0">
        <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Icon className={`h-3.5 w-3.5 ${style.color} shrink-0`} />
          <span>{insights.title}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3.5 space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {insights.description}
        </p>

        {insights.metrics && insights.metrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {insights.metrics.map((metric, i) => (
              <div
                key={i}
                className="bg-card/80 p-2 rounded-lg border border-border/60 flex flex-col justify-between"
              >
                <span className="text-[10px] text-muted-foreground truncate" title={metric.label}>
                  {metric.label}
                </span>
                <span className="text-xs sm:text-sm font-bold font-mono tracking-tight text-foreground whitespace-nowrap mt-0.5">
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {insights.actionUrl && (
          <div className="pt-1 flex justify-end">
            <Button
              asChild
              size="sm"
              className="h-7 text-xs font-semibold gap-1 px-3"
            >
              <Link to={insights.actionUrl}>
                <span>{insights.actionLabel || "Xem chi tiết"}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
