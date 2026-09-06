import React from "react";
import { AlertTriangle, Clock, Radio, X } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import type { NotificationItem } from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

interface DispatchAlertsProps {
  alerts: NotificationItem[];
  onDismiss?: (id: string) => void;
  className?: string;
}

export const DispatchAlerts: React.FC<DispatchAlertsProps> = ({
  alerts,
  onDismiss,
  className,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
        <span>Cảnh báo điều phối tức thời</span>
        <Badge variant="destructive" className="text-[10px] py-0 px-1 font-bold animate-pulse">
          {alerts.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
        {alerts.map((alert) => {
          const isUrgent = alert.priority === "URGENT";

          return (
            <div
              key={alert.id}
              className={cn(
                "relative flex items-start gap-2.5 p-2.5 rounded-lg border text-xs transition-colors",
                isUrgent
                  ? "bg-rose-500/[0.06] border-rose-500/30 text-rose-950 dark:text-rose-100"
                  : "bg-amber-500/[0.06] border-amber-500/30 text-amber-950 dark:text-amber-100"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md mt-0.5",
                  isUrgent ? "bg-rose-500/20 text-rose-600" : "bg-amber-500/20 text-amber-600"
                )}
              >
                {alert.type === "GPS_ALERT" ? (
                  <Radio className="h-3.5 w-3.5" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5 pr-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold truncate text-[11px]">{alert.title}</span>
                  <span className="text-[9px] font-mono text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                  {alert.message}
                </p>
              </div>

              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
