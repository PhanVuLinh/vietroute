import React from "react";
import { Package, User, MapPin, Truck, Warehouse as WarehouseIcon, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { EnrichedOrder } from "../hooks/useOrders";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderPriorityBadge } from "./OrderPriorityBadge";
import { OrderSlaIndicator } from "./OrderSlaIndicator";
import { OrderActionsMenu } from "./OrderActionsMenu";

interface OrderTableRowProps {
  order: EnrichedOrder;
  onViewDetail: (order: EnrichedOrder) => void;
}

export const OrderTableRow: React.FC<OrderTableRowProps> = ({
  order,
  onViewDetail,
}) => {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const isPending = order.status === "PENDING";

  return (
    <tr
      onClick={() => onViewDetail(order)}
      className="group hover:bg-accent/50 transition-colors border-b border-border/60 cursor-pointer text-xs"
    >
      {/* 1. Mã đơn */}
      <td className="py-3.5 px-4 font-mono font-medium text-primary group-hover:text-primary/80 transition-colors whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
          <span>{order.orderCode}</span>
        </div>
      </td>

      {/* 2. Khách hàng */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-foreground truncate max-w-[130px]">
              {order.receiverName}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              {order.receiverPhone}
            </div>
          </div>
        </div>
      </td>

      {/* 3. Điểm giao hàng */}
      <td className="py-3.5 px-4 max-w-[190px]">
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0 mt-0.5" />
          <div className="truncate text-foreground/80" title={order.receiverAddress}>
            {order.receiverAddress}
          </div>
        </div>
      </td>

      {/* 4. Kho xuất */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-foreground/80">
          <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
          <span className="truncate max-w-[120px]" title={order.warehouse?.name || order.warehouseId}>
            {order.warehouse?.name || order.warehouseId}
          </span>
        </div>
      </td>

      {/* 5. Khối lượng & COD */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="text-foreground font-medium tabular-nums">
          {order.totalWeight} kg
        </div>
        <div className="text-[11px] text-muted-foreground tabular-nums">
          {order.codAmount > 0 ? formatCurrency(order.codAmount) : "Không COD"}
        </div>
      </td>

      {/* 6. Tài xế & Xe */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        {order.driver ? (
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
            <div>
              <div className="font-medium text-foreground">
                {order.driver.fullName}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {order.vehicle?.licensePlate || "Xe tải"}
              </div>
            </div>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            Chưa phân công
          </span>
        )}
      </td>

      {/* 7. Mức ưu tiên */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <OrderPriorityBadge priority={order.priority} />
      </td>

      {/* 8. Trạng thái đơn */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <OrderStatusBadge status={order.status} />
      </td>

      {/* 9. Thời hạn / SLA */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <OrderSlaIndicator order={order} />
      </td>

      {/* 10. Thao tác */}
      <td
        className="py-3.5 px-4 whitespace-nowrap text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-1.5">
          {isPending && (
            <button
              type="button"
              onClick={() => navigate(`/dispatch?orderId=${order.id}`)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-md border border-amber-500/30 transition-colors"
              title="Điều phối đơn này"
            >
              <Send className="w-3 h-3" />
              <span>Điều phối</span>
            </button>
          )}
          <OrderActionsMenu order={order} onViewDetail={onViewDetail} />
        </div>
      </td>
    </tr>
  );
};
