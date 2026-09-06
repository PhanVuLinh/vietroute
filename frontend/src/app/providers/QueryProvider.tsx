import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface QueryProviderProps {
  children: React.ReactNode;
}

// Khởi tạo QueryClient với cấu hình tối ưu cho Enterprise Dashboard
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Dữ liệu còn mới trong 1 phút
      gcTime: 5 * 60 * 1000, // Giữ cache trong 5 phút
      retry: 1, // Thử lại tối đa 1 lần nếu lỗi mạng
      refetchOnWindowFocus: false, // Tránh tự động reload khi chuyển tab làm gián đoạn điều phối
    },
  },
});

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
