import React from "react";
import { ChevronLeft, ChevronRight, PackageX } from "lucide-react";
import type { EnrichedOrder } from "../hooks/useOrders";
import { OrderTableRow } from "./OrderTableRow";

interface OrdersTableProps {
  orders: EnrichedOrder[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewDetail: (order: EnrichedOrder) => void;
  onResetFilters: () => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onViewDetail,
  onResetFilters,
}) => {
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  if (orders.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-4 text-muted-foreground">
          <PackageX className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          Không tìm thấy đơn hàng nào
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto mb-5">
          Không có đơn hàng nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại. Thử thay đổi từ khóa hoặc đặt lại bộ lọc.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-foreground bg-muted hover:bg-accent border border-border rounded-xl transition-colors"
        >
          Đặt lại bộ lọc
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
      {/* Table Container */}
      <div className="overflow-x-auto min-h-[380px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none">
              <th className="py-3 px-4">Mã đơn</th>
              <th className="py-3 px-4">Khách hàng</th>
              <th className="py-3 px-4">Điểm giao</th>
              <th className="py-3 px-4">Kho xuất</th>
              <th className="py-3 px-4">Trọng lượng / COD</th>
              <th className="py-3 px-4">Tài xế / Xe</th>
              <th className="py-3 px-4">Ưu tiên</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4">Hạn giao / SLA</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {orders.map((order) => (
              <OrderTableRow
                key={order.id}
                order={order}
                onViewDetail={onViewDetail}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
        <div>
          Hiển thị <span className="font-semibold text-foreground">{startItem}</span> -{" "}
          <span className="font-semibold text-foreground">{endItem}</span> trên{" "}
          <span className="font-semibold text-foreground">{totalCount}</span> đơn hàng
        </div>

        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          {/* Previous Page */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="inline-flex items-center justify-center p-1.5 rounded-lg border border-border text-foreground/70 hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Trang trước"
            aria-label="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Indicators */}
          <div className="flex items-center gap-1 px-2 text-xs">
            <span className="font-medium text-foreground">Trang {currentPage}</span>
            <span>/</span>
            <span className="text-muted-foreground">{totalPages}</span>
          </div>

          {/* Next Page */}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="inline-flex items-center justify-center p-1.5 rounded-lg border border-border text-foreground/70 hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Trang tiếp"
            aria-label="Trang tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
