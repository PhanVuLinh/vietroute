import type { ApiResponse } from "@/core/types/api";
import type { AnalyticsDashboardData } from "@/core/types/logistics";
import { MOCK_ANALYTICS } from "../data/analytics";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";

export const mockAnalyticsService = {
  /** Lấy toàn bộ số liệu thống kê vận hành và biểu đồ phân tích */
  async getDashboardAnalytics(options?: MockServiceOptions): Promise<ApiResponse<AnalyticsDashboardData>> {
    await simulateLatency(options);
    return {
      success: true,
      statusCode: 200,
      message: "Lấy dữ liệu phân tích vận hành thành công",
      data: MOCK_ANALYTICS,
    };
  },
};
