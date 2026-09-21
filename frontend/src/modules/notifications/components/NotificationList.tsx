import React from "react";
import { Inbox } from "lucide-react";
import type { NotificationItem } from "@/core/types/logistics";
import { NotificationItemCard } from "./NotificationItem";
import { Button } from "@/shared/components/ui/button";

interface NotificationListProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  isLoading,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onResetFilters,
}) => {
  // Loading
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border/50 rounded-xl p-4 animate-pulse space-y-2"
          >
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 bg-muted rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted/60 rounded w-full" />
                <div className="h-3 bg-muted/40 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 bg-card border border-border/50 rounded-xl">
        <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Inbox className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-muted-foreground">
            Không có thông báo nào
          </p>
          <p className="text-xs text-muted-foreground/60">
            Thử điều chỉnh bộ lọc hoặc kiểm tra lại sau
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onResetFilters}
          className="text-xs mt-1 cursor-pointer"
        >
          Xóa bộ lọc
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* List */}
      <div className="space-y-2.5">
        {notifications.map((notif) => (
          <NotificationItemCard
            key={notif.id}
            notification={notif}
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <span className="text-[11px] text-muted-foreground tabular-nums">
            Trang {currentPage}/{totalPages} • {totalCount} thông báo
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-7 px-2.5 text-[11px] cursor-pointer"
            >
              Trước
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="h-7 w-7 p-0 text-[11px] tabular-nums cursor-pointer"
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-7 px-2.5 text-[11px] cursor-pointer"
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
