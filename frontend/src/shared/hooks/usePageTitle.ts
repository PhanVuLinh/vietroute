import { useEffect } from "react";

/**
 * Hook cập nhật tiêu đề trang trình duyệt chuẩn VietRoute
 */
export function usePageTitle(title: string): void {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title ? `${title} — VietRoute` : "VietRoute — Quản Lý Giao Hàng & Điều Phối Xe";
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
