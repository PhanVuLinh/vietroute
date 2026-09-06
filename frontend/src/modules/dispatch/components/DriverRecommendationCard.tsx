import React from "react";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Navigation,
  Send,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { DriverCandidate } from "../utils/driverScoring";
import { DriverLoadIndicator } from "./DriverLoadIndicator";
import { cn } from "@/shared/utils/cn";

interface DriverRecommendationCardProps {
  candidate: DriverCandidate;
  onAssign: (candidate: DriverCandidate) => void;
  isSelected?: boolean;
}

export const DriverRecommendationCard: React.FC<DriverRecommendationCardProps> = ({
  candidate,
  onAssign,
  isSelected,
}) => {
  const { driver, vehicle, matchScore, isBestMatch, reasons, isEligible, ineligibleReason } =
    candidate;

  const getAvatarInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div
      className={cn(
        "flex flex-col p-3 rounded-lg border transition-all duration-200 text-xs space-y-2.5",
        isBestMatch
          ? "border-primary/60 bg-gradient-to-br from-primary/[0.06] via-card to-primary/[0.02] shadow-xs ring-1 ring-primary/20"
          : isSelected
          ? "border-primary bg-primary/[0.04]"
          : "border-border/70 bg-card hover:border-border hover:bg-accent/40",
        !isEligible && "opacity-60 bg-muted/30 border-dashed"
      )}
    >
      {/* Top row: Avatar + Name + Match Score */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs ring-1 ring-primary/20">
            {getAvatarInitials(driver.fullName)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-foreground truncate max-w-[130px]">
                {driver.fullName}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1 rounded">
                {driver.driverCode}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
              <span className="font-mono font-medium text-foreground">
                {vehicle?.licensePlate || "Chưa gán xe"}
              </span>
              <span>•</span>
              <span className="text-primary font-semibold">{driver.licenseType}</span>
            </div>
          </div>
        </div>

        {/* Điểm phù hợp */}
        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-center gap-1">
            {isBestMatch && <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />}
            <span
              className={cn(
                "font-mono font-extrabold text-sm",
                matchScore >= 90
                  ? "text-emerald-600 dark:text-emerald-400"
                  : matchScore >= 75
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-amber-600 dark:text-amber-400"
              )}
            >
              {matchScore}%
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">Mức phù hợp</span>
        </div>
      </div>

      {/* Huy hiệu Đề xuất tốt nhất */}
      {isBestMatch && (
        <Badge
          variant="outline"
          className="gap-1 border-primary/40 bg-primary/10 text-primary text-[10px] font-bold py-0.5 justify-center w-full"
        >
          <Sparkles className="h-3 w-3" />
          Đề xuất tốt nhất từ VietRoute
        </Badge>
      )}

      {/* Thông số tiếp cận (Khoảng cách & ETA) */}
      {isEligible ? (
        <div className="grid grid-cols-2 gap-1.5 py-1 px-2 rounded bg-muted/40 border border-border/40 text-[11px]">
          <div className="flex items-center gap-1 text-muted-foreground truncate">
            <Navigation className="h-3 w-3 text-blue-500 shrink-0" />
            <span>Cách kho: <b className="text-foreground">{candidate.distanceKm} km</b></span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground truncate justify-end">
            <Clock className="h-3 w-3 text-amber-500 shrink-0" />
            <span>ETA: <b className="text-foreground">{candidate.estimatedEtaMinutes} phút</b></span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 p-1.5 rounded bg-destructive/10 text-destructive text-[11px]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{ineligibleReason}</span>
        </div>
      )}

      {/* Tải công việc hiện tại */}
      <DriverLoadIndicator currentDeliveries={driver.currentDeliveryCount} maxCapacity={5} />

      {/* Vì sao tài xế này được đề xuất? */}
      {reasons.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-border/40">
          <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
            <HelpCircle className="h-3 w-3 text-primary" />
            Vì sao tài xế này được đề xuất?
          </span>
          <ul className="space-y-0.5 text-[11px] text-muted-foreground pl-1">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-tight">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Nút hành động Phân công */}
      {isEligible && (
        <Button
          size="sm"
          onClick={() => onAssign(candidate)}
          className={cn(
            "w-full h-8 text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs mt-1",
            isBestMatch ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
          )}
        >
          <Send className="h-3 w-3" />
          <span>Phân công đơn hàng</span>
        </Button>
      )}
    </div>
  );
};
