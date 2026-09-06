import React, { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  Clock,
  Radio,
  Truck,
  PackagePlus,
  AlertTriangle,
  ChevronRight,
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
import { Separator } from "@/shared/components/ui/separator";

const getNotificationBadge = (type: NotificationType) => {
  switch (type) {
    case "LATE_WARNING":
      return {
        icon: <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />,
        containerClass: "bg-amber-500/10 border-amber-500/20",
      };
    case "GPS_ALERT":
      return {
        icon: <Radio className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />,
        containerClass: "bg-rose-500/10 border-rose-500/20",
      };
    case "VEHICLE_ALERT":
      return {
        icon: <Truck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />,
        containerClass: "bg-blue-500/10 border-blue-500/20",
      };
    case "DELIVERY_FAILED":
      return {
        icon: <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />,
        containerClass: "bg-red-500/10 border-red-500/20",
      };
    case "ORDER_CREATED":
    case "ORDER_ASSIGNED":
    default:
      return {
        icon: <PackagePlus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
        containerClass: "bg-emerald-500/10 border-emerald-500/20",
      };
  }
};

export const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, []);

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
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground animate-in zoom-in-50">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 sm:w-96 p-0 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Thông báo vận hành</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                {unreadCount} mới
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer font-medium"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Đánh dấu đã đọc
            </button>
          )}
        </div>

        {/* Danh sách thông báo */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
          {isLoading ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Đang tải thông báo...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Không có thông báo mới</div>
          ) : (
            notifications.slice(0, 8).map((notif) => {
              const badge = getNotificationBadge(notif.type);
              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif.id)}
                  className={`p-3 flex items-start gap-3 hover:bg-muted/60 transition-all cursor-pointer text-left relative ${
                    !notif.read ? "bg-primary/[0.03] border-l-2 border-primary" : "border-l-2 border-transparent"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg border shrink-0 mt-0.5 shadow-2xs ${badge.containerClass}`}
                  >
                    {badge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <p
                        className={`text-xs font-semibold truncate tracking-tight ${
                          !notif.read ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span className="font-mono text-[10px] text-muted-foreground/80 shrink-0">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 self-center shadow-xs shadow-primary/50" />
                  )}
                </div>
              );
            })
          )}
        </div>

        <Separator />

        {/* Footer */}
        <div className="p-2 text-center bg-muted/20">
          <button
            onClick={() => setIsOpen(false)}
            className="text-[11px] text-muted-foreground hover:text-foreground font-medium flex items-center justify-center gap-1 w-full py-1"
          >
            <span>Đóng thông báo</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
