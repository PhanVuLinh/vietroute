import React from "react";
import { Search, Plus, Users, ShieldCheck } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useNavigate } from "react-router-dom";

interface DepartmentFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  onOpenCreate: () => void;
}

export const DepartmentFilterBar: React.FC<DepartmentFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onOpenCreate,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
      {/* Tìm kiếm & Lọc trạng thái */}
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên phòng ban, mã số, trưởng phòng, địa điểm..."
            className="pl-8 h-8 text-xs bg-background/50"
          />
        </div>

        <div className="w-full sm:w-[170px]">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="h-8 text-xs bg-background/50">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Tạm ngưng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/staff")}
          className="h-8 text-xs gap-1.5 border-border hover:bg-accent"
        >
          <Users className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">DS Nhân sự</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/roles")}
          className="h-8 text-xs gap-1.5 border-border hover:bg-accent"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">Phân quyền</span>
        </Button>

        <Button
          onClick={onOpenCreate}
          size="sm"
          className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Thêm phòng ban mới</span>
        </Button>
      </div>
    </div>
  );
};
