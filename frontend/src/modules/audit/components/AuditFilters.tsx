import React from 'react';
import { Search, RotateCcw, Download } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { AuditFilterParams } from '../types/audit';

interface AuditFiltersProps {
  filters: AuditFilterParams;
  onChange: (filters: AuditFilterParams) => void;
  onReset: () => void;
  onExport: () => void;
}

export const AuditFilters: React.FC<AuditFiltersProps> = ({
  filters,
  onChange,
  onReset,
  onExport,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-card p-3 rounded-xl border border-border/80 shadow-xs">
      <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        {/* Tìm kiếm */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo nội dung, người dùng, đối tượng, IP..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Lọc theo Hành động */}
        <Select
          value={filters.action || 'ALL'}
          onValueChange={(val) => onChange({ ...filters, action: val, page: 1 })}
        >
          <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs">
            <SelectValue placeholder="Hành động" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả hành động</SelectItem>
            <SelectItem value="LOGIN">Đăng nhập (LOGIN)</SelectItem>
            <SelectItem value="DISPATCH">Điều phối (DISPATCH)</SelectItem>
            <SelectItem value="CREATE">Tạo mới (CREATE)</SelectItem>
            <SelectItem value="UPDATE">Cập nhật (UPDATE)</SelectItem>
            <SelectItem value="APPROVE">Phê duyệt (APPROVE)</SelectItem>
            <SelectItem value="PAYMENT">Thanh toán (PAYMENT)</SelectItem>
            <SelectItem value="EXPORT">Xuất file (EXPORT)</SelectItem>
            <SelectItem value="DELETE">Xóa (DELETE)</SelectItem>
          </SelectContent>
        </Select>

        {/* Lọc theo Phân hệ */}
        <Select
          value={filters.entityType || 'ALL'}
          onValueChange={(val) => onChange({ ...filters, entityType: val, page: 1 })}
        >
          <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs">
            <SelectValue placeholder="Phân hệ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Mọi phân hệ</SelectItem>
            <SelectItem value="Order">Đơn hàng (Order)</SelectItem>
            <SelectItem value="Driver">Tài xế (Driver)</SelectItem>
            <SelectItem value="Vehicle">Phương tiện (Vehicle)</SelectItem>
            <SelectItem value="Warehouse">Kho hàng (Warehouse)</SelectItem>
            <SelectItem value="CodReconciliation">Đối soát COD</SelectItem>
            <SelectItem value="Invoice">Hóa đơn (Invoice)</SelectItem>
            <SelectItem value="Incident">Sự cố (Incident)</SelectItem>
            <SelectItem value="Report">Báo cáo (Report)</SelectItem>
            <SelectItem value="Auth">Xác thực (Auth)</SelectItem>
          </SelectContent>
        </Select>

        {/* Lọc theo Mức độ */}
        <Select
          value={filters.severity || 'ALL'}
          onValueChange={(val) => onChange({ ...filters, severity: val, page: 1 })}
        >
          <SelectTrigger className="w-full sm:w-[130px] h-9 text-xs">
            <SelectValue placeholder="Mức độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Mọi mức độ</SelectItem>
            <SelectItem value="INFO">Thông tin (Info)</SelectItem>
            <SelectItem value="WARNING">Cảnh báo (Warning)</SelectItem>
            <SelectItem value="CRITICAL">Nghiêm trọng (Critical)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Nút Reset & Xuất CSV */}
      <div className="flex items-center gap-2 self-end lg:self-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-9 px-3 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Đặt lại
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="h-9 px-3 text-xs gap-1.5 cursor-pointer hover:bg-accent"
        >
          <Download className="h-3.5 w-3.5" />
          Xuất CSV
        </Button>
      </div>
    </div>
  );
};
