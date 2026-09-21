import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Clock,
  Radio,
  Truck,
  PackagePlus,
  AlertTriangle,
  ChevronRight,
  Inbox,
  Volume2,
} from "lucide-react";
import { notificationService } from "@/mocks/adapters/serviceFactory";
import type { NotificationItem, NotificationType } from "@/core/types/logistics";
import { formatTime } from "@/shared/utils/formatters";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/shared/stores/authStore";

const getNotificationMeta = (type: NotificationType) => {
  switch (type) {
    case "LATE_WARNING":
      return {
        icon: Clock,
        iconClass: "text-amber-600 dark:text-amber-400",
        bgClass: "bg-amber-500/10 border-amber-500/20",
        label: "Cảnh báo trễ",
      };
    case "GPS_ALERT":
      return {
        icon: Radio,
        iconClass: "text-rose-600 dark:text-rose-400",
        bgClass: "bg-rose-500/10 border-rose-500/20",
        label: "GPS",
      };
    case "VEHICLE_ALERT":
      return {
        icon: Truck,
        iconClass: "text-blue-600 dark:text-blue-400",
        bgClass: "bg-blue-500/10 border-blue-500/20",
        label: "Phương tiện",
      };
    case "DELIVERY_FAILED":
      return {
        icon: AlertTriangle,
        iconClass: "text-red-600 dark:text-red-400",
        bgClass: "bg-red-500/10 border-red-500/20",
        label: "Giao thất bại",
      };
    case "ORDER_CREATED":
    case "ORDER_ASSIGNED":
    default:
      return {
        icon: PackagePlus,
        iconClass: "text-emerald-600 dark:text-emerald-400",
        bgClass: "bg-emerald-500/10 border-emerald-500/20",
        label: "Đơn hàng",
      };
  }
};

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    notificationService
      .getNotifications()
      .then((res) => {
        if (isMounted) {
          if (res.success) {
            setNotifications(res.data);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleItemClick = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Thông báo vận hành"
          className="relative text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-card animate-in zoom-in-50">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[360px] sm:w-[400px] p-0 shadow-xl rounded-xl overflow-hidden border-border/80">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-card">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Volume2 className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground leading-none">Thông báo vận hành</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-[9px] h-4 px-1.5 ml-2 font-bold">
                  {unreadCount} mới
                </Badge>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 cursor-pointer font-semibold transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Đánh dấu đã đọc
            </button>
          )}
        </div>

        {/* Danh sách thông báo */}
        <div className="max-h-[380px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <span className="text-xs text-muted-foreground">Đang tải thông báo...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs font-medium text-muted-foreground">Không có thông báo mới</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">Hệ thống đang hoạt động bình thường</p>
            </div>
          ) : (
            notifications.slice(0, 8).map((notif, index) => {
              const meta = getNotificationMeta(notif.type);
              const NotifIcon = meta.icon;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif.id)}
                  className={cn(
                    "group px-4 py-3 flex items-start gap-3 hover:bg-accent/50 transition-all cursor-pointer relative",
                    !notif.read && "bg-primary/[0.04]",
                    index < notifications.slice(0, 8).length - 1 && "border-b border-border/40"
                  )}
                >
                  {/* Unread indicator bar */}
                  {!notif.read && (
                    <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary" />
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-2xs mt-0.5",
                      meta.bgClass
                    )}
                  >
                    <NotifIcon className={cn("h-3.5 w-3.5", meta.iconClass)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-xs font-semibold tracking-tight leading-snug",
                          !notif.read ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {notif.title}
                      </p>
                      <span className="font-mono text-[10px] text-muted-foreground/70 shrink-0 tabular-nums">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/80 line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notif.read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 self-center shadow-xs shadow-primary/40 animate-pulse" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-border/60 bg-muted/20">
          <button
            onClick={() => {
              setIsOpen(false);
              navigate("/notifications");
            }}
            className="text-[11px] text-primary hover:text-primary/80 font-semibold flex items-center justify-center gap-1 w-full py-1.5 rounded-md hover:bg-accent/60 transition-colors cursor-pointer"
          >
            <span>Xem tất cả thông báo</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
