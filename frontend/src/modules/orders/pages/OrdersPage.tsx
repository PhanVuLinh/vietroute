import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import type { Order } from "@/core/types/logistics";
import { useOrders, type EnrichedOrder } from "../hooks/useOrders";
import { useOrderFilters } from "../hooks/useOrderFilters";
import { calculateOrderSla } from "../utils/slaCalculator";
import { OrdersHeader } from "../components/OrdersHeader";
import { OrdersSummary } from "../components/OrdersSummary";
import { OrdersToolbar } from "../components/OrdersToolbar";
import { OrdersTable } from "../components/OrdersTable";
import { OrdersMobileList } from "../components/OrdersMobileList";
import { OrderDetailDrawer } from "../components/OrderDetailDrawer";
import { CreateOrderDialog } from "../components/CreateOrderDialog";

export const OrdersPage: React.FC = () => {
  usePageTitle("Quản lý đơn hàng");

  // 1. Data Layer
  const { orders, warehouses, isLoading, isError, refetchAll } = useOrders();

  // 2. Filters, Search, Sorting, Pagination
  const {
    filters,
    updateFilters,
    paginatedOrders,
    totalCount,
    totalPages,
    currentPage,
    setPage,
    activeFilterCount,
    resetFilters,
  } = useOrderFilters(orders);

  // 3. UI States
  const [selectedOrder, setSelectedOrder] = useState<EnrichedOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Thống kê nhanh các chỉ số
  const summaryCounts = useMemo(() => {
    let pending = 0;
    let inTransit = 0;
    let delivered = 0;
    let delayed = 0;
    let failed = 0;

    for (const order of orders) {
      if (order.status === "PENDING") pending++;
      else if (order.status === "IN_TRANSIT" || order.status === "PICKING_UP" || order.status === "ASSIGNED") inTransit++;
      else if (order.status === "DELIVERED") delivered++;
      else if (order.status === "FAILED") failed++;

      const sla = calculateOrderSla(order);
      if (sla.status === "BREACHED" || sla.status === "WARNING") {
        delayed++;
      }
    }

    return {
      total: orders.length,
      pending,
      inTransit,
      delivered,
      delayed,
      failed,
    };
  }, [orders]);

  // Tự động tắt Toast thông báo sau 4 giây
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handler mở drawer chi tiết
  const handleViewDetail = (order: EnrichedOrder) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  // Handler khi làm mới dữ liệu
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchAll();
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage("Đã cập nhật dữ liệu đơn hàng mới nhất");
    }, 400);
  };

  // Handler khi tạo đơn hàng thành công
  const handleCreateSuccess = (newOrder: Order) => {
    setToastMessage(`Đã khởi tạo thành công đơn hàng [${newOrder.orderCode}]!`);
  };

  return (
    <PageContainer
      title="Quản lý đơn hàng"
      subtitle="Theo dõi toàn bộ vòng đời đơn hàng, giám sát cam kết SLA, phân loại trạng thái và tích hợp điều phối thông minh."
    >
      <div className="space-y-6">
        {/* Toast thông báo nổi bật */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/95 border border-emerald-500/40 text-emerald-300 rounded-2xl shadow-2xl backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-medium">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* 1. Header tác vụ: Tạo đơn, Điều phối, Làm mới */}
        <OrdersHeader
          totalOrdersCount={orders.length}
          onOpenCreateOrder={() => setIsCreateOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* 2. Summary KPI Cards tương tác */}
        <OrdersSummary
          totalCount={summaryCounts.total}
          pendingCount={summaryCounts.pending}
          inTransitCount={summaryCounts.inTransit}
          deliveredCount={summaryCounts.delivered}
          delayedCount={summaryCounts.delayed}
          failedCount={summaryCounts.failed}
          activeStatusFilter={filters.status}
          onSelectFilter={(status) => {
            if (status === "ALL") {
              updateFilters({ status: "ALL", sla: "ALL" });
            } else if (status === "DELAYED") {
              updateFilters({ status: "DELAYED", sla: "ALL" });
            } else {
              updateFilters({ status, sla: "ALL" });
            }
          }}
        />

        {/* 3. Toolbar: Tìm kiếm debounce + Bộ lọc đa chiều + Sắp xếp */}
        <OrdersToolbar
          filters={filters}
          warehouses={warehouses}
          activeFilterCount={activeFilterCount}
          totalResults={totalCount}
          onUpdateFilters={updateFilters}
          onResetFilters={resetFilters}
        />

        {/* 4. Trạng thái lỗi tải dữ liệu */}
        {isError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-4 text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Không thể đồng bộ danh sách đơn hàng từ máy chủ.</span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-xl font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* 5. Skeleton Loading State */}
        {isLoading && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-800 rounded w-1/4" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-800/60 rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {/* 6. Danh sách đơn hàng: Desktop (Table) & Mobile (Card List) */}
        {!isLoading && (
          <>
            <div className="hidden md:block">
              <OrdersTable
                orders={paginatedOrders}
                totalCount={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={filters.pageSize}
                onPageChange={setPage}
                onViewDetail={handleViewDetail}
                onResetFilters={resetFilters}
              />
            </div>

            <div className="block md:hidden">
              <OrdersMobileList
                orders={paginatedOrders}
                totalCount={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={filters.pageSize}
                onPageChange={setPage}
                onViewDetail={handleViewDetail}
                onResetFilters={resetFilters}
              />
            </div>
          </>
        )}

        {/* 7. Drawer chi tiết đơn hàng */}
        <OrderDetailDrawer
          order={selectedOrder}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedOrder(null);
          }}
        />

        {/* 8. Dialog tạo đơn hàng mới */}
        <CreateOrderDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          warehouses={warehouses}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </PageContainer>
  );
};
