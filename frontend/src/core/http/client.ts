import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { ENV } from "@/core/config/env";
import type { ApiErrorResponse, ApiResponse } from "@/core/types/api";

const TOKEN_KEY = "vietroute_access_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

let onUnauthorizedCallback: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorizedCallback = handler;
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Tạo instance Axios trung tâm của VietRoute
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor gắn Token xác thực vào Header
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// Interceptor xử lý phản hồi và chuẩn hóa thông báo lỗi tiếng Việt
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    let friendlyMessage: string;

    if (!error.response) {
      friendlyMessage = "Không thể kết nối tới máy chủ VietRoute. Vui lòng kiểm tra mạng.";
    } else {
      const status = error.response.status;
      const serverMessage = error.response.data?.message;

      if (serverMessage && typeof serverMessage === "string") {
        friendlyMessage = serverMessage;
      } else {
        switch (status) {
          case 400:
            friendlyMessage = "Dữ liệu yêu cầu không hợp lệ.";
            break;
          case 401:
            friendlyMessage = "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.";
            removeStoredToken();
            if (onUnauthorizedCallback) {
              onUnauthorizedCallback();
            }
            break;
          case 403:
            friendlyMessage = "Bạn không có quyền thực hiện thao tác này.";
            break;
          case 404:
            friendlyMessage = "Không tìm thấy dữ liệu yêu cầu.";
            break;
          case 409:
            friendlyMessage = "Dữ liệu bị trùng lặp hoặc xung đột trạng thái.";
            break;
          case 500:
          default:
            friendlyMessage = "Lỗi hệ thống máy chủ VietRoute. Vui lòng liên hệ quản trị viên.";
            break;
        }
      }
    }

    const enhancedError: ApiErrorResponse = {
      success: false,
      statusCode: error.response?.status || 500,
      message: friendlyMessage,
      error: error.response?.data?.error || error.name,
    };

    return Promise.reject(enhancedError);
  }
);

/**
 * Lớp trừu tượng HTTP Client phục vụ các service module
 */
export const httpClient = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await axiosInstance.get<ApiResponse<T>>(url, config);
    return res.data;
  },

  async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await axiosInstance.post<ApiResponse<T>>(url, data, config);
    return res.data;
  },

  async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await axiosInstance.put<ApiResponse<T>>(url, data, config);
    return res.data;
  },

  async patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await axiosInstance.patch<ApiResponse<T>>(url, data, config);
    return res.data;
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await axiosInstance.delete<ApiResponse<T>>(url, config);
    return res.data;
  },
};
