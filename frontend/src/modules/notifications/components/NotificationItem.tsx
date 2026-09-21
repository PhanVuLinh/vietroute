import React from "react";
import {
  Clock,
  Radio,
  Truck,
  AlertTriangle,
  PackagePlus,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import type { NotificationItem, NotificationType } from "@/core/types/logistics";
import { formatDateTime } from "@/shared/utils/formatters";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";

const NOTIFICATION_META: Record<
  NotificationType,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    bgClass: string;
    label: string;
  }
> = {
  LATE_WARNING: {
    icon: Clock,
    iconClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/10 border-amber-500/20",
    label: "Cảnh báo trễ",
  },
  GPS_ALERT: {
    icon: Radio,
    iconClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-500/10 border-rose-500/20",
    label: "GPS",
  },
  VEHICLE_ALERT: {
    icon: Truck,
    iconClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-500/10 border-blue-500/20",
    label: "Phương tiện",
  },
  DELIVERY_FAILED: {
    icon: AlertTriangle,
    iconClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-500/10 border-red-500/20",
    label: "Giao thất bại",
  },
  DELIVERY_SUCCESS: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10 border-emerald-500/20",
    label: "Giao thành công",
  },
  ORDER_ACCEPTED: {
    icon: UserCheck,
    iconClass: "text-teal-600 dark:text-teal-400",
    bgClass: "bg-teal-500/10 border-teal-500/20",
    label: "Tiếp nhận",
  },
  ORDER_CREATED: {
    icon: PackagePlus,
    iconClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10 border-emerald-500/20",
    label: "Đơn mới",
  },
  ORDER_ASSIGNED: {
    icon: PackagePlus,
    iconClass: "text-indigo-600 dark:text-indigo-400",
    bgClass: "bg-indigo-500/10 border-indigo-500/20",
    label: "Phân công",
  },
};

const PRIORITY_META: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  URGENT: { label: "Khẩn cấp", variant: "destructive" },
  HIGH: { label: "Cao", variant: "destructive" },
  NORMAL: { label: "Bình thường", variant: "secondary" },
  LOW: { label: "Thấp", variant: "outline" },
};

interface NotificationItemCardProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  compact?: boolean;
}

export const NotificationItemCard: React.FC<NotificationItemCardProps> = ({
  notification,
  onMarkAsRead,
  compact = false,
}) => {
  const meta = NOTIFICATION_META[notification.type];
  const NotifIcon = meta.icon;
  const priorityMeta = PRIORITY_META[notification.priority];

  return (
    <div
      onClick={() => {
        if (!notification.read) {
          onMarkAsRead(notification.id);
        }
      }}
      className={cn(
        "group relative flex items-start gap-3.5 rounded-xl border px-4 py-3.5 transition-all",
        !notification.read
          ? "bg-primary/[0.04] border-primary/15 hover:bg-primary/[0.07] cursor-pointer"
          : "bg-card border-border/50 hover:bg-accent/40",
        compact && "px-3 py-2.5"
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-primary" />
      )}

      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-2xs mt-0.5",
          meta.bgClass,
          compact && "h-7 w-7"
        )}
      >
        <NotifIcon className={cn("h-4 w-4", meta.iconClass, compact && "h-3.5 w-3.5")} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm font-semibold tracking-tight leading-snug",
              !notification.read ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {notification.title}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-primary shadow-xs shadow-primary/40 animate-pulse" />
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">
          {notification.message}
        </p>

        <div className="flex items-center gap-2 pt-0.5">
          <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-medium gap-1 border-border/60">
            <NotifIcon className={cn("h-2.5 w-2.5", meta.iconClass)} />
            {meta.label}
          </Badge>
          {priorityMeta && (notification.priority === "URGENT" || notification.priority === "HIGH") && (
            <Badge variant={priorityMeta.variant} className="text-[10px] h-5 px-1.5 font-bold">
              {priorityMeta.label}
            </Badge>
          )}
          <span className="font-mono text-[10px] text-muted-foreground/60 tabular-nums ml-auto">
            {formatDateTime(notification.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};
