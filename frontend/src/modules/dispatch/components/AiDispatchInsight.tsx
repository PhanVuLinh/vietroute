import React from "react";
import { Sparkles, ArrowRight, Cpu } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";

interface AiDispatchInsightProps {
  onApplyRecommendation?: () => void;
  className?: string;
}

export const AiDispatchInsight: React.FC<AiDispatchInsightProps> = ({
  onApplyRecommendation,
  className,
}) => {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-primary/30 bg-gradient-to-r from-primary/[0.05] via-card to-primary/[0.02] shadow-2xs",
        className
      )}
    >
      <CardContent className="p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30 mt-0.5">
            <Sparkles className="h-4 w-4" />
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-foreground">
                Gợi ý gom tuyến thông minh (AI Dispatch Engine)
              </span>
              <Badge
                variant="outline"
                className="gap-0.5 border-primary/30 bg-primary/10 text-primary text-[9px] font-bold py-0"
              >
                <Cpu className="h-2.5 w-2.5" />
                Độ tin cậy: 89%
              </Badge>
            </div>

            <p className="text-[11px] text-muted-foreground leading-snug">
              Phát hiện 3 đơn cùng trục tuyến Long Biên - Gia Lâm có thể gom cho tài xế{" "}
              <b className="text-foreground font-semibold">Trần Minh Hoàng (29H-123.45)</b>, dự kiến tiết kiệm 18.5% quãng đường.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={onApplyRecommendation}
          className="h-7 text-xs font-semibold gap-1 shrink-0 self-end sm:self-center cursor-pointer hover:border-primary/50"
        >
          <span>Xem đề xuất</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
};
