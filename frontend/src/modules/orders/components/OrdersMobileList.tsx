import React from "react";
import { ChevronLeft, ChevronRight, PackageX, User, MapPin, Warehouse, Truck, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { EnrichedOrder } from "../hooks/useOrders";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderPriorityBadge } from "./OrderPriorityBadge";
import { OrderSlaIndicator } from "./OrderSlaIndicator";
import { OrderActionsMenu } from "./OrderActionsMenu";

interface OrdersMobileListProps {
  orders: EnrichedOrder[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewDetail: (order: EnrichedOrder) => void;
  onResetFilters: () => void;
}

export const OrdersMobileList: React.FC<OrdersMobileListProps> = ({
  orders,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onViewDetail,
  onResetFilters,
}) => {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  if (orders.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center md:hidden">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <PackageX className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">
          Không tìm thấy đơn hàng nào
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Thử thay đổi từ khóa hoặc thiết lập lại bộ lọc.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
        >
          Đặt lại bộ lọc
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {orders.map((order) => {
        const isPending = order.status === "PENDING";

        return (
          <div
            key={order.id}
            onClick={() => onViewDetail(order)}
            className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 active:bg-slate-800/80 transition-colors shadow-lg space-y-3 cursor-pointer"
          >
            {/* Header: Code + Priority + Status + Action */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-primary-400">
                    {order.orderCode}
                  </span>
                  <OrderPriorityBadge priority={order.priority} />
                </div>
                <div className="mt-1">
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <OrderActionsMenu order={order} onViewDetail={onViewDetail} />
              </div>
            </div>

            {/* Customer & Address */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-200 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{order.receiverName}</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  ({order.receiverPhone})
                </span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  {order.receiverAddress}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Warehouse className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Kho: {order.warehouse?.name || order.warehouseId}</span>
              </div>
            </div>

            {/* Weight, COD & Driver */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="text-slate-300">
                <span className="font-semibold">{order.totalWeight} kg</span>
                <span className="mx-1.5 text-slate-600">•</span>
                <span className="text-slate-400">
                  {order.codAmount > 0 ? formatCurrency(order.codAmount) : "Không COD"}
                </span>
              </div>

              <div>
                {order.driver ? (
                  <div className="flex items-center gap-1.5 text-primary-400 font-medium text-[11px]">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{order.driver.fullName}</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Chưa phân công
                  </span>
                )}
              </div>
            </div>

            {/* SLA & Quick Action */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <OrderSlaIndicator order={order} />
              {isPending && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dispatch?orderId=${order.id}`);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Điều phối</span>
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Pagination Mobile */}
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
        <div>
          {startItem}-{endItem} / {totalCount} đơn
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg border border-slate-700 text-slate-300 disabled:opacity-30"
            aria-label="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>{currentPage}/{totalPages}</span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-slate-700 text-slate-300 disabled:opacity-30"
            aria-label="Trang tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
