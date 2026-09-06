import { useEffect, useState } from "react";

/**
 * Hook làm mượt giá trị nhập liệu (tìm kiếm, bộ lọc) tránh gọi hàm liên tục
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
