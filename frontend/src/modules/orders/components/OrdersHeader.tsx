import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Send, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface OrdersHeaderProps {
  onCreateOrder?: () => void;
  onOpenCreateOrder?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  totalOrdersCount?: number;
}

export const OrdersHeader: React.FC<OrdersHeaderProps> = ({
  onCreateOrder,
  onOpenCreateOrder,
  onRefresh,
  isRefreshing,
}) => {
  const navigate = useNavigate();
  const handleCreate = onOpenCreateOrder || onCreateOrder;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border/60">
      {/* 1. Tiêu đề & Mô tả */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Quản lý đơn hàng
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Quản lý và theo dõi toàn bộ vòng đời đơn giao hàng
        </p>
      </div>

      {/* 2. Nút Thao Tác Chính */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 w-9 cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dispatch")}
          className="h-9 gap-1.5 text-xs font-semibold cursor-pointer hover:border-primary/50 hover:bg-primary/5"
          id="btn-goto-dispatch"
        >
          <Send className="h-3.5 w-3.5 text-primary" />
          <span>Điều phối</span>
        </Button>

        <Button
          size="sm"
          onClick={handleCreate}
          className="h-9 gap-1.5 text-xs font-semibold shadow-xs cursor-pointer"
          id="btn-open-create-order"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tạo đơn hàng</span>
        </Button>
      </div>
    </div>
  );
};
