import React from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Lightbulb,
  Info,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";

import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { AiRecommendation } from "@/mocks/adapters/serviceFactory";

interface AiOperationalAlertsProps {
  recommendations: AiRecommendation[];
  loading: boolean;
  onRefresh: () => void;
}

export const AiOperationalAlerts: React.FC<AiOperationalAlertsProps> = ({
  recommendations,
  loading,
  onRefresh,
}) => {
  const getBadge = (type: AiRecommendation["type"]) => {
    switch (type) {
      case "WARNING":
      case "ALERT":
        return {
          icon: AlertTriangle,
          variant: "destructive" as const,
          label: "Cảnh báo vận hành",
          color: "border-rose-500/30 bg-rose-500/5",
        };
      case "OPPORTUNITY":
        return {
          icon: Lightbulb,
          variant: "outline" as const,
          label: "Cơ hội tối ưu hóa",
          color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-600",
        };
      default:
        return {
          icon: Info,
          variant: "secondary" as const,
          label: "Thông tin mạng lưới",
          color: "border-blue-500/30 bg-blue-500/5 text-blue-600",
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground px-1">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Khuyến Nghị Vận Hành Chủ Động Từ AI Copilot</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2 cursor-pointer"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recommendations.map((rec) => {
          const cfg = getBadge(rec.type);
          const Icon = cfg.icon;

          return (
            <Card
              key={rec.id}
              className={`border transition-all hover:shadow-xs flex flex-col justify-between ${cfg.color}`}
            >
              <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between space-y-0">
                <Badge variant={cfg.variant} className="text-[10px] py-0 px-2 gap-1 font-semibold">
                  <Icon className="h-3 w-3" />
                  <span>{cfg.label}</span>
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {new Date(rec.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </CardHeader>

              <CardContent className="p-3 pt-1 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground leading-snug">
                    {rec.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                    {rec.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground truncate" title={rec.impact}>
                    {rec.impact}
                  </span>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-6 text-[11px] px-2 font-semibold gap-1 shrink-0"
                  >
                    <Link to={rec.actionUrl}>
                      <span>{rec.actionLabel}</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
