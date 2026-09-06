import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";

interface DriverLoadIndicatorProps {
  currentDeliveries: number;
  maxCapacity?: number;
  className?: string;
  showBadge?: boolean;
}

export const DriverLoadIndicator: React.FC<DriverLoadIndicatorProps> = ({
  currentDeliveries,
  maxCapacity = 5,
  className,
  showBadge = true,
}) => {
  const percentage = Math.min(100, Math.round((currentDeliveries / maxCapacity) * 100));
  const isOverloaded = currentDeliveries >= 4 || percentage >= 80;
  const isAvailable = currentDeliveries === 0;

  const getBarColor = () => {
    if (isOverloaded) return "bg-rose-500";
    if (percentage >= 60) return "bg-amber-500";
    if (percentage >= 20) return "bg-blue-500";
    return "bg-emerald-500";
  };

  return (
    <div className={cn("space-y-1 w-full", className)}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">Tải công việc:</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-foreground">
            {currentDeliveries}/{maxCapacity} đơn
          </span>
          {showBadge && (
            <>
              {isOverloaded ? (
                <Badge variant="destructive" className="text-[9px] px-1 py-0 font-bold">
                  Quá tải
                </Badge>
              ) : isAvailable ? (
                <Badge variant="success" className="text-[9px] px-1 py-0 font-semibold">
                  Trống ca
                </Badge>
              ) : (
                <span className="text-[10px] text-muted-foreground">({percentage}%)</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300 rounded-full", getBarColor())}
          style={{ width: `${Math.max(6, percentage)}%` }}
        />
      </div>
    </div>
  );
};
