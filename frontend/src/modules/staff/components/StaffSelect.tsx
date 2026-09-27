import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Check,
  ChevronsUpDown,
  User,
  ShieldCheck,
  Warehouse,
  Waypoints,
  Boxes,
  Truck,
  Wallet,
  Building2,
  X,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { useStaffList } from "../hooks/useStaff";
import type { StaffMember, OperationalRole } from "../types/staff";
import { cn } from "@/shared/utils/cn";

interface StaffSelectProps {
  value?: string; // id hoặc tên nhân sự hiện tại
  onSelectStaff: (staff: StaffMember) => void;
  onClear?: () => void;
  roleFilter?: (OperationalRole | string)[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const StaffSelect: React.FC<StaffSelectProps> = ({
  value,
  onSelectStaff,
  onClear,
  roleFilter,
  placeholder = "Chọn nhân viên từ hệ thống...",
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { data: staffList = [], isLoading } = useStaffList();

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lọc theo roleFilter nếu có
  const filteredByRole = roleFilter && roleFilter.length > 0
    ? staffList.filter((s) => roleFilter.includes(s.roleName))
    : staffList;

  // Lọc theo từ khóa tìm kiếm
  const displayList = filteredByRole.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      (s.employeeCode && s.employeeCode.toLowerCase().includes(q))
    );
  });

  // Nhân sự đang được chọn
  const selectedStaff = staffList.find(
    (s) => s.id === value || s.fullName.toLowerCase() === value?.toLowerCase() || s.email.toLowerCase() === value?.toLowerCase()
  );

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "ADMIN":
        return <ShieldCheck className="h-3 w-3 text-rose-500" />;
      case "MANAGER":
        return <Warehouse className="h-3 w-3 text-amber-500" />;
      case "DISPATCHER":
        return <Waypoints className="h-3 w-3 text-blue-500" />;
      case "WAREHOUSE_STAFF":
        return <Boxes className="h-3 w-3 text-teal-500" />;
      case "DRIVER":
        return <Truck className="h-3 w-3 text-emerald-500" />;
      case "ACCOUNTANT":
        return <Wallet className="h-3 w-3 text-indigo-500" />;
      default:
        return <User className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getRoleLabel = (roleName: string) => {
    switch (roleName) {
      case "ADMIN":
        return "Admin";
      case "MANAGER":
        return "Quản lý kho";
      case "DISPATCHER":
        return "Điều phối";
      case "WAREHOUSE_STAFF":
        return "Thủ kho";
      case "DRIVER":
        return "Tài xế";
      case "ACCOUNTANT":
        return "Kế toán";
      default:
        return roleName;
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      {/* Nút bấm hiển thị dropdown */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full h-8 px-2.5 rounded-md border border-input bg-background/50 text-xs flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors select-none",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "ring-1 ring-primary border-primary"
        )}
      >
        {selectedStaff ? (
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
              {selectedStaff.fullName.charAt(0)}
            </div>
            <span className="font-semibold text-foreground truncate text-xs">
              {selectedStaff.fullName}
            </span>
            <Badge variant="outline" className="text-[9px] px-1 py-0 gap-0.5 border-border shrink-0">
              {getRoleIcon(selectedStaff.roleName)}
              <span>{getRoleLabel(selectedStaff.roleName)}</span>
            </Badge>
            <span className="text-[10px] font-mono text-muted-foreground truncate hidden sm:inline">
              ({selectedStaff.phone})
            </span>
          </div>
        ) : value ? (
          <span className="text-foreground font-medium truncate">{value}</span>
        ) : (
          <span className="text-muted-foreground truncate">{placeholder}</span>
        )}

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {selectedStaff && onClear && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Menu thả xuống với ô tìm kiếm */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-popover border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95">
          {/* Ô tìm kiếm nhanh */}
          <div className="p-2 border-b border-border bg-muted/30">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhân viên theo tên, SĐT, mã NV..."
                className="w-full h-7 pl-8 pr-2.5 text-xs bg-background rounded-md border border-input outline-none focus:border-primary font-medium"
                autoFocus
              />
            </div>
          </div>

          {/* Danh sách kết quả */}
          <div className="max-h-56 overflow-y-auto divide-y divide-border/40 p-1">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Đang tải dữ liệu nhân sự...
              </div>
            ) : displayList.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground space-y-1">
                <Building2 className="h-4 w-4 mx-auto text-muted-foreground/60" />
                <p>Không tìm thấy nhân viên phù hợp</p>
              </div>
            ) : (
              displayList.map((staff) => {
                const isSelected = selectedStaff?.id === staff.id;
                return (
                  <div
                    key={staff.id}
                    onClick={() => {
                      onSelectStaff(staff);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={cn(
                      "p-2 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer flex items-center justify-between text-xs gap-2",
                      isSelected && "bg-primary/10 text-primary font-semibold"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                        {staff.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground truncate">
                            {staff.fullName}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {staff.employeeCode || `NV-${staff.id.slice(-6)}`}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 font-mono">
                          <span>{staff.phone || "Không có SĐT"}</span>
                          <span>•</span>
                          <span className="truncate">{staff.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 border-border">
                        {getRoleIcon(staff.roleName)}
                        <span>{getRoleLabel(staff.roleName)}</span>
                      </Badge>
                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
