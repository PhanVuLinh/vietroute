import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/mocks/adapters/serviceFactory";
import type { NotificationItem } from "@/core/types/logistics";
import {
  type NotificationFilters,
  NOTIFICATION_CATEGORY_MAP,
} from "../types/notification";

const PAGE_SIZE = 10;

export function useNotifications() {
  // 1. Fetch data
  const notificationsQuery = useQuery<NotificationItem[]>({
    queryKey: ["notifications", "list"],
    queryFn: async () => {
      const res = await notificationService.getNotifications();
      return res.data;
    },
    staleTime: 15 * 1000,
  });

  // 2. Filters state
  const [filters, setFilters] = useState<NotificationFilters>({
    tab: "ALL",
    category: "ALL",
    priority: "ALL",
    searchQuery: "",
  });

  const [currentPage, setCurrentPage] = useState(1);

  // 3. Update filters helper
  const updateFilters = useCallback(
    (patch: Partial<NotificationFilters>) => {
      setFilters((prev) => ({ ...prev, ...patch }));
      setCurrentPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({ tab: "ALL", category: "ALL", priority: "ALL", searchQuery: "" });
    setCurrentPage(1);
  }, []);

  // 4. Filtered notifications
  const filteredNotifications = useMemo(() => {
    const all = notificationsQuery.data || [];

    return all.filter((n) => {
      // Tab filter
      if (filters.tab === "UNREAD" && n.read) return false;
      if (filters.tab === "ALERTS") {
        const cat = NOTIFICATION_CATEGORY_MAP[n.type];
        if (cat !== "ALERT") return false;
      }

      // Category filter
      if (filters.category !== "ALL") {
        const cat = NOTIFICATION_CATEGORY_MAP[n.type];
        if (cat !== filters.category) return false;
      }

      // Priority filter
      if (filters.priority !== "ALL" && n.priority !== filters.priority) return false;

      // Search filter
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        if (
          !n.title.toLowerCase().includes(q) &&
          !n.message.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [notificationsQuery.data, filters]);

  // 5. Stats
  const stats = useMemo(() => {
    const all = notificationsQuery.data || [];
    let unread = 0;
    let alerts = 0;
    let orderNotifs = 0;
    let deliveryNotifs = 0;

    for (const n of all) {
      if (!n.read) unread++;
      const cat = NOTIFICATION_CATEGORY_MAP[n.type];
      if (cat === "ALERT") alerts++;
      if (cat === "ORDER") orderNotifs++;
      if (cat === "DELIVERY") deliveryNotifs++;
    }

    return { total: all.length, unread, alerts, orderNotifs, deliveryNotifs };
  }, [notificationsQuery.data]);

  // 6. Pagination
  const totalCount = filteredNotifications.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedNotifications = useMemo(
    () => filteredNotifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredNotifications, currentPage]
  );

  // 7. Actions
  const markAsRead = useCallback(
    async (id: string) => {
      await notificationService.markAsRead(id);
      notificationsQuery.refetch();
    },
    [notificationsQuery]
  );

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    notificationsQuery.refetch();
  }, [notificationsQuery]);

  return {
    notifications: paginatedNotifications,
    allNotifications: notificationsQuery.data || [],
    stats,
    filters,
    updateFilters,
    resetFilters,
    currentPage,
    setPage: setCurrentPage,
    totalCount,
    totalPages,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    refetch: notificationsQuery.refetch,
    markAsRead,
    markAllAsRead,
  };
}
