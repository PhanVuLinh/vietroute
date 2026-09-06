import type { ApiResponse } from "@/core/types/api";
import type { NotificationItem } from "@/core/types/logistics";
import { MOCK_NOTIFICATIONS } from "../data/notifications";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";

export const mockNotificationService = {
  /** Lấy danh sách thông báo hệ thống */
  async getNotifications(
    params?: { unreadOnly?: boolean },
    options?: MockServiceOptions
  ): Promise<ApiResponse<NotificationItem[]>> {
    await simulateLatency(options);
    let result = [...MOCK_NOTIFICATIONS];

    if (params?.unreadOnly) {
      result = result.filter((n) => !n.read);
    }

    return {
      success: true,
      statusCode: 200,
      message: "Lấy danh sách thông báo thành công",
      data: result,
    };
  },

  /** Đánh dấu một thông báo là đã đọc */
  async markAsRead(id: string, options?: MockServiceOptions): Promise<ApiResponse<boolean>> {
    await simulateLatency(options);
    const notif = MOCK_NOTIFICATIONS.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
    }
    return {
      success: true,
      statusCode: 200,
      message: "Đã đánh dấu đọc thông báo",
      data: true,
    };
  },

  /** Đánh dấu toàn bộ thông báo là đã đọc */
  async markAllAsRead(options?: MockServiceOptions): Promise<ApiResponse<boolean>> {
    await simulateLatency(options);
    MOCK_NOTIFICATIONS.forEach((n) => {
      n.read = true;
    });
    return {
      success: true,
      statusCode: 200,
      message: "Đã đánh dấu đọc toàn bộ thông báo",
      data: true,
    };
  },
};
