import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ArrowRight, CheckCircle2, TrendingUp, Cpu, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";
import { aiService, type AiRecommendation } from "@/mocks/adapters/serviceFactory";

interface AiInsightCardProps {
  className?: string;
}

export const AiInsightCard: React.FC<AiInsightCardProps> = ({ className }) => {
  const navigate = useNavigate();

  const { data: recommendations } = useQuery<AiRecommendation[]>({
    queryKey: ["ai-recommendations"],
    queryFn: async () => {
      const res = await aiService.getRecommendations();
      return res.data || [];
    },
    staleTime: 60000,
  });

  const topRec = recommendations && recommendations.length > 0 ? recommendations[0] : null;

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-primary/30 bg-gradient-to-r from-primary/[0.05] via-card to-primary/[0.02]",
        "dark:from-primary/[0.08] dark:via-card dark:to-primary/[0.03] shadow-xs",
        className
      )}
    >
      <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Khối bên trái: Icon + Tiêu đề + Khuyến nghị */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30 shadow-xs mt-0.5">
            <Sparkles className="h-5 w-5" />
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <span>Phân tích từ VietRoute AI Engine</span>
                <span className="text-muted-foreground font-normal text-xs">• Khuyến nghị vận hành</span>
              </span>
              <Badge
                variant="outline"
                className="gap-1 border-primary/40 bg-primary/10 text-primary text-[10px] font-semibold py-0"
              >
                <Cpu className="h-3 w-3" />
                Python AI Engine: Online
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-foreground/90 font-medium">
              <div className="flex items-center gap-1.5">
                {topRec?.type === "WARNING" ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
                <span>{topRec?.title || "Mạng lưới vận tải đang vận hành ở trạng thái tối ưu."}</span>
              </div>
              {topRec?.impact && (
                <>
                  <span className="hidden sm:inline text-muted-foreground">•</span>
                  <div className="flex items-center gap-1.5 text-foreground font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{topRec.impact}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Khối bên phải: Các nút CTA nghiệp vụ */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(topRec?.actionUrl || "/ai-assistant")}
            className="flex-1 sm:flex-none h-8 text-xs font-semibold cursor-pointer hover:border-primary/50"
            id="btn-view-ai-analysis"
          >
            <span>{topRec?.actionLabel || "Xem phân tích AI"}</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/dispatch")}
            className="flex-1 sm:flex-none h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
            id="btn-dispatch-now"
          >
            <span>Điều phối ngay</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

