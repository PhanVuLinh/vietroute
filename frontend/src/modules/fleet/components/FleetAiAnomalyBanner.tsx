import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Fuel, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { aiService, type AiAnomaliesResponse } from "@/mocks/adapters/serviceFactory";

export const FleetAiAnomalyBanner: React.FC = () => {
  const navigate = useNavigate();

  const { data } = useQuery<AiAnomaliesResponse>({
    queryKey: ["ai-anomalies"],
    queryFn: async () => {
      const res = await aiService.getAnomalies();
      return res.data;
    },
    staleTime: 45000,
  });

  const anomalies = data?.anomalies || [];
  const criticalCount = data?.criticalCount || 0;
  const topAnomaly = anomalies.length > 0 ? anomalies[0] : null;

  if (anomalies.length === 0) {
    return (
      <div className="flex items-center justify-between p-2.5 px-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs">
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>Giám sát AI Telemetry & Bình nhiên liệu: <b>An toàn 100%</b> (Không phát hiện rò rỉ hoặc lệch tuyến).</span>
        </div>
        <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold py-0">
          AI Engine Bảo Vệ
        </Badge>
      </div>
    );
  }

  return (
    <Card className="border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-card to-amber-500/5 shadow-xs overflow-hidden">
      <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30 mt-0.5">
            <Fuel className="h-4 w-4" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                <span>AI Phát hiện bất thường nhiên liệu & Hành lang GPS</span>
              </span>
              <Badge variant="destructive" className="text-[10px] font-bold py-0 gap-1">
                <AlertTriangle className="h-2.5 w-2.5" />
                <span>{criticalCount} Cảnh báo khẩn cấp</span>
              </Badge>

              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[10px] font-semibold py-0 gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                Python AI Telemetry
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-1 leading-snug">
              {topAnomaly?.description || "Phát hiện dấu hiệu sụt giảm mức dầu nhanh vượt định mức trên xe tải."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/ai-assistant")}
            className="h-8 text-xs font-semibold gap-1.5 cursor-pointer hover:border-amber-500/50"
            id="btn-view-ai-fleet-anomalies"
          >
            <span>Chi tiết cảnh báo ({anomalies.length})</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
