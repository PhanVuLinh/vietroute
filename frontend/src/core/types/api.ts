/**
 * Định dạng phản hồi chuẩn hóa từ backend NestJS của VietRoute
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/**
 * Cấu trúc phân trang chuẩn cho danh sách dữ liệu lớn
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Phản hồi phân trang chuẩn
 */
export type ApiPaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

/**
 * Cấu trúc lỗi trả về từ máy chủ
 */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error?: string;
}
