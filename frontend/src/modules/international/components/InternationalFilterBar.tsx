import React from "react";
import { Search, Plus, FileSpreadsheet } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { InternationalFilterParams } from "../types/international";

interface InternationalFilterBarProps {
  filters: InternationalFilterParams;
  onFilterChange: (filters: InternationalFilterParams) => void;
  onOpenCreateShipment: () => void;
  onOpenCustomsDialog: () => void;
}

export const InternationalFilterBar: React.FC<InternationalFilterBarProps> = ({
  filters,
  onFilterChange,
  onOpenCreateShipment,
  onOpenCustomsDialog,
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
      <div className="flex items-center gap-2 flex-1 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Tìm theo mã lô, số B/L, container, cảng, hãng tàu..."
            className="h-8 pl-8 text-xs bg-background/50"
          />
        </div>

        {/* Direction Select */}
        <div className="w-[140px]">
          <Select
            value={filters.direction || "ALL"}
            onValueChange={(val) => onFilterChange({ ...filters, direction: val })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Hướng vận tải" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả hướng</SelectItem>
              <SelectItem value="EXPORT">Xuất khẩu (Export)</SelectItem>
              <SelectItem value="IMPORT">Nhập khẩu (Import)</SelectItem>
              <SelectItem value="CROSS_BORDER">Xuyên biên giới</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transport Mode Select */}
        <div className="w-[150px]">
          <Select
            value={filters.mode || "ALL"}
            onValueChange={(val) => onFilterChange({ ...filters, mode: val })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Phương thức" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả phương thức</SelectItem>
              <SelectItem value="OCEAN_FCL">Đường biển FCL</SelectItem>
              <SelectItem value="OCEAN_LCL">Đường biển LCL</SelectItem>
              <SelectItem value="AIR_FREIGHT">Hàng không Air</SelectItem>
              <SelectItem value="ROAD_CROSS_BORDER">Đường bộ liên vận</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Incoterms Select */}
        <div className="w-[120px]">
          <Select
            value={filters.incoterm || "ALL"}
            onValueChange={(val) => onFilterChange({ ...filters, incoterm: val })}
          >
            <SelectTrigger className="h-8 text-xs font-mono font-medium">
              <SelectValue placeholder="Incoterms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Mọi Incoterm</SelectItem>
              <SelectItem value="FOB">FOB</SelectItem>
              <SelectItem value="CIF">CIF</SelectItem>
              <SelectItem value="EXW">EXW</SelectItem>
              <SelectItem value="DDP">DDP</SelectItem>
              <SelectItem value="DAP">DAP</SelectItem>
              <SelectItem value="CFR">CFR</SelectItem>
              <SelectItem value="FCA">FCA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Select */}
        <div className="w-[150px]">
          <Select
            value={filters.status || "ALL"}
            onValueChange={(val) => onFilterChange({ ...filters, status: val })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="BOOKING_CONFIRMED">Đã xác nhận Booking</SelectItem>
              <SelectItem value="CUSTOMS_PROCESSING">Đang làm Hải quan</SelectItem>
              <SelectItem value="CUSTOMS_CLEARED">Đã thông quan</SelectItem>
              <SelectItem value="SAILING">Đang trên biển / Bay</SelectItem>
              <SelectItem value="ARRIVED_PORT">Đã cập cảng đích</SelectItem>
              <SelectItem value="DELIVERED">Đã giao hàng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCustomsDialog}
          className="h-8 text-xs gap-1.5 border-border hover:bg-accent font-medium cursor-pointer"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500" />
          <span>Khai báo Hải quan</span>
        </Button>

        <Button
          size="sm"
          onClick={onOpenCreateShipment}
          className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold cursor-pointer shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tạo lô hàng XNK</span>
        </Button>
      </div>
    </div>
  );
};
