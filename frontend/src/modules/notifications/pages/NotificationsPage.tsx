import React from "react";
import {
  Bell,
  BellOff,
  AlertTriangle,
  Package,
  Truck,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { toast } from "@/shared/components/feedback/Toast";
import { cn } from "@/shared/utils/cn";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationFiltersBar } from "../components/NotificationFilters";
import { NotificationList } from "../components/NotificationList";
import { AlertRulesManager } from "../components/AlertRulesManager";
import type { NotificationTab } from "../types/notification";

export const NotificationsPage: React.FC = () => {
  usePageTitle("Trung tâm thông báo");

  const {
    notifications,
    stats,
    filters,
    updateFilters,
    resetFilters,
    currentPage,
    setPage,
    totalCount,
    totalPages,
    isLoading,
    refetch,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success("Đánh dấu thành công", "Đã đánh dấu tất cả thông báo là đã đọc");
  };

  const handleRefresh = async () => {
    await refetch();
    toast.success("Đồng bộ thành công", "Đã cập nhật danh sách thông báo");
  };

  // Stats cards
  const statCards = [
    {
      label: "Tổng thông báo",
      value: stats.total,
      icon: Bell,
      color: "text-foreground",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      label: "Chưa đọc",
      value: stats.unread,
      icon: BellOff,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Cảnh báo",
      value: stats.alerts,
      icon: AlertTriangle,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
    },
    {
      label: "Đơn hàng",
      value: stats.orderNotifs,
      icon: Package,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "Giao hàng",
      value: stats.deliveryNotifs,
      icon: Truck,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
  ];

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Trung tâm Thông báo
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Quản lý thông báo vận hành, cảnh báo hệ thống và quy tắc tự động
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {stats.unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-9 text-xs gap-1.5 font-semibold cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Đánh dấu tất cả đã đọc
              <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-bold">
                {stats.unread}
              </Badge>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-9 text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-sm",
                card.borderColor,
                "bg-card"
              )}
            >
              <div
                className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                  card.bgColor
                )}
              >
                <Icon className={cn("h-4 w-4", card.color)} />
              </div>
              <div>
                <p className="text-xl font-bold tabular-nums text-foreground">
                  {card.value}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {card.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs: Thông báo / Quy tắc cảnh báo */}
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="notifications" className="text-xs gap-1.5 cursor-pointer">
            <Bell className="h-3.5 w-3.5" />
            Thông báo
            {stats.unread > 0 && (
              <Badge variant="destructive" className="text-[9px] h-4 px-1 font-bold ml-0.5">
                {stats.unread}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs gap-1.5 cursor-pointer">
            <AlertTriangle className="h-3.5 w-3.5" />
            Quy tắc cảnh báo
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {/* Sub-tabs */}
          <div className="flex items-center gap-1.5">
            {(
              [
                { key: "ALL", label: "Tất cả", count: stats.total },
                { key: "UNREAD", label: "Chưa đọc", count: stats.unread },
                { key: "ALERTS", label: "Cảnh báo", count: stats.alerts },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => updateFilters({ tab: tab.key as NotificationTab })}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  filters.tab === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md",
                    filters.tab === tab.key
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background/80 text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <NotificationFiltersBar
            filters={filters}
            onUpdateFilters={updateFilters}
            onResetFilters={resetFilters}
            totalResults={totalCount}
          />

          {/* Notification List */}
          <NotificationList
            notifications={notifications}
            onMarkAsRead={markAsRead}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={setPage}
            onResetFilters={resetFilters}
          />
        </TabsContent>

        {/* Alert Rules Tab */}
        <TabsContent value="alerts">
          <div className="bg-card border border-border/60 rounded-xl p-5">
            <AlertRulesManager />
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};
