import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  Radio,
  Wrench,
  XCircle,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { NotificationItem, NotificationType } from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

interface OperationsAlertsProps {
  alerts: NotificationItem[];
  isLoading?: boolean;
  className?: string;
}

export const OperationsAlerts: React.FC<OperationsAlertsProps> = ({
  alerts,
  isLoading,
  className,
}) => {
  const navigate = useNavigate();

  const getAlertIcon = (type: NotificationType) => {
    switch (type) {
      case "LATE_WARNING":
        return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case "GPS_ALERT":
        return <Radio className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case "VEHICLE_ALERT":
        return <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case "DELIVERY_FAILED":
        return <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  const getCtaConfig = (type: NotificationType) => {
    switch (type) {
      case "LATE_WARNING":
      case "DELIVERY_FAILED":
        return {
          label: "Xem đơn",
          path: "/orders",
        };
      case "VEHICLE_ALERT":
        return {
          label: "Xem phương tiện",
          path: "/fleet",
        };
      case "GPS_ALERT":
        return {
          label: "Xử lý ngay",
          path: "/tracking",
        };
      case "ORDER_CREATED":
      case "ORDER_ASSIGNED":
        return {
          label: "Phân công",
          path: "/dispatch",
        };
      default:
        return {
          label: "Xử lý ngay",
          path: "/dispatch",
        };
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch {
      return "Vừa xong";
    }
  };

  return (
    <Card className={cn("border-border/80 shadow-xs", className)}>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/60 shrink-0 bg-card/60 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Cần xử lý</span>
          </CardTitle>
          <Badge variant="warning" className="text-[10px] font-semibold px-1.5 py-0 animate-pulse">
            {alerts.length} cảnh báo ưu tiên
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Ưu tiên xử lý sự cố vận hành
        </span>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-border/50">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-2">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-7 w-20" />
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Hệ thống đang vận hành ổn định, không có sự cố nào cần xử lý ngay.
          </div>
        ) : (
          alerts.map((alert) => {
            const cta = getCtaConfig(alert.type);
            const isUrgent = alert.priority === "URGENT";

            return (
              <div
                key={alert.id}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-4 transition-colors",
                  isUrgent
                    ? "bg-rose-500/[0.04] dark:bg-rose-500/[0.07] hover:bg-rose-500/[0.08]"
                    : "hover:bg-accent/60"
                )}
              >
                {/* Nội dung cảnh báo */}
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 mt-0.5",
                      isUrgent
                        ? "bg-rose-500/15 ring-rose-500/30"
                        : "bg-amber-500/15 ring-amber-500/30"
                    )}
                  >
                    {getAlertIcon(alert.type)}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-semibold text-foreground">
                        {alert.title}
                      </span>
                      <Badge
                        variant={isUrgent ? "destructive" : "warning"}
                        className="text-[10px] py-0 px-1.5 font-bold"
                      >
                        {isUrgent ? "Khẩn cấp" : "Quan trọng"}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {formatRelativeTime(alert.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-1">
                      {alert.message}
                    </p>
                  </div>
                </div>

                {/* Nút hành động CTA */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    size="sm"
                    variant={isUrgent ? "destructive" : "outline"}
                    onClick={() => navigate(cta.path)}
                    className="h-8 text-xs font-semibold gap-1 cursor-pointer hover:shadow-xs"
                  >
                    <span>{cta.label}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
