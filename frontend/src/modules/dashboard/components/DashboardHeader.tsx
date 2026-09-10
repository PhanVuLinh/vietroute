import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Send, Calendar, Building2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Warehouse } from "@/core/types/logistics";

interface DashboardHeaderProps {
  warehouses: Warehouse[];
  selectedWarehouse: string;
  onWarehouseChange: (val: string) => void;
  selectedDateRange: string;
  onDateRangeChange: (val: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  warehouses,
  selectedWarehouse,
  onWarehouseChange,
  selectedDateRange,
  onDateRangeChange,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-3 border-b border-border/60">
      {/* 1. Tiêu đề & Mô tả */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Trung tâm điều phối
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Theo dõi hoạt động giao hàng theo thời gian thực
        </p>
      </div>

      {/* 2. Bộ lọc & Nút hành động chính */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Bộ lọc Ngày */}
        <div className="w-[140px]">
          <Select value={selectedDateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="h-9 bg-card border-border/80 text-xs font-medium">
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Chọn thời gian" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAY">Hôm nay</SelectItem>
              <SelectItem value="YESTERDAY">Hôm qua</SelectItem>
              <SelectItem value="LAST_7_DAYS">7 ngày qua</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bộ lọc Kho hàng */}
        <div className="w-[170px]">
          <Select value={selectedWarehouse} onValueChange={onWarehouseChange}>
            <SelectTrigger className="h-9 bg-card border-border/80 text-xs font-medium">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Kho bãi" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Kho: Tất cả</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nút Điều phối -> /dispatch */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dispatch")}
          className="h-9 gap-1.5 text-xs font-semibold cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
          id="btn-dispatch-center"
        >
          <Send className="h-3.5 w-3.5 text-primary" />
          <span>Điều phối</span>
        </Button>

        {/* Nút Tạo đơn hàng -> /orders */}
        <Button
          size="sm"
          onClick={() => navigate("/orders")}
          className="h-9 gap-1.5 text-xs font-semibold shadow-xs cursor-pointer"
          id="btn-create-order"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tạo đơn hàng</span>
        </Button>
      </div>
    </div>
  );
};
