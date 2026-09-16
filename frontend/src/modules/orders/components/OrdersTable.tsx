import React from "react";
import { PackageX } from "lucide-react";
import { TablePagination } from "@/shared/components/common";
import { EmptyState } from "@/shared/components/feedback";
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
  if (orders.length === 0) {
    return (
      <EmptyState
        title="Không tìm thấy đơn hàng nào"
        description="Không có đơn hàng nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại. Thử thay đổi từ khóa hoặc đặt lại bộ lọc."
        icon={<PackageX className="w-7 h-7 text-muted-foreground" />}
        action={
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-foreground bg-muted hover:bg-accent border border-border rounded-xl transition-colors cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        }
      />
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
      {/* Table Container */}
      <div className="overflow-x-auto min-h-[380px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none whitespace-nowrap">
              <th className="py-3 px-4 min-w-[120px]">Mã đơn</th>
              <th className="py-3 px-4 min-w-[160px]">Khách hàng</th>
              <th className="py-3 px-4 min-w-[190px]">Điểm giao</th>
              <th className="py-3 px-4 min-w-[130px]">Kho xuất</th>
              <th className="py-3 px-4 min-w-[140px]">Trọng lượng / COD</th>
              <th className="py-3 px-4 min-w-[140px]">Tài xế / Xe</th>
              <th className="py-3 px-4 min-w-[100px]">Ưu tiên</th>
              <th className="py-3 px-4 min-w-[130px]">Trạng thái</th>
              <th className="py-3 px-4 min-w-[130px]">Hạn giao / SLA</th>
              <th className="py-3 px-4 text-right min-w-[100px]">Thao tác</th>
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
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        itemName="đơn hàng"
        onPageChange={onPageChange}
        pageSize={pageSize}
      />
    </div>
  );
};
