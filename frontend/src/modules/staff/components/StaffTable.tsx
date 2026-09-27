import React from "react";
import {
  ShieldCheck,
  Warehouse,
  Waypoints,
  Boxes,
  Truck,
  Wallet,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { StaffMember, OperationalRole } from "../types/staff";

interface StaffTableProps {
  staffList: StaffMember[];
  isLoading?: boolean;
  onEditStaff: (staff: StaffMember) => void;
  onToggleStatus: (staff: StaffMember) => void;
  onDeleteStaff: (staff: StaffMember) => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  staffList,
  isLoading,
  onEditStaff,
  onToggleStatus,
  onDeleteStaff,
}) => {
  const getRoleConfig = (role: OperationalRole | string) => {
    switch (role) {
      case "ADMIN":
        return {
          label: "Quản trị viên",
          icon: ShieldCheck,
          className: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
        };
      case "MANAGER":
        return {
          label: "Quản lý kho",
          icon: Warehouse,
          className: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
        };
      case "DISPATCHER":
        return {
          label: "Điều phối viên",
          icon: Waypoints,
          className: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
        };
      case "WAREHOUSE_STAFF":
        return {
          label: "Thủ kho bến bãi",
          icon: Boxes,
          className: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30",
        };
      case "DRIVER":
        return {
          label: "Tài xế vận tải",
          icon: Truck,
          className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
        };
      case "ACCOUNTANT":
        return {
          label: "Kế toán viên",
          icon: Wallet,
          className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
        };
      default:
        return {
          label: role,
          icon: Building2,
          className: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30",
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px]">
            <CheckCircle2 className="h-3 w-3" />
            <span>Hoạt động</span>
          </Badge>
        );
      case "INACTIVE":
        return (
          <Badge variant="outline" className="gap-1 border-slate-500/30 text-slate-500 bg-slate-500/10 text-[10px]">
            <Lock className="h-3 w-3" />
            <span>Tạm khóa</span>
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge variant="outline" className="gap-1 border-rose-500/30 text-rose-600 bg-rose-500/10 text-[10px]">
            <AlertCircle className="h-3 w-3" />
            <span>Đình chỉ</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-muted/40 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (staffList.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center space-y-2">
        <Building2 className="h-8 w-8 text-muted-foreground mx-auto" />
        <h4 className="text-sm font-semibold text-foreground">Không tìm thấy nhân sự phù hợp</h4>
        <p className="text-xs text-muted-foreground">
          Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc chức vụ.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider select-none">
            <tr>
              <th className="py-3 px-4">Nhân sự / Mã NV</th>
              <th className="py-3 px-4">Chức vụ & Vai trò</th>
              <th className="py-3 px-4">Liên hệ</th>
              <th className="py-3 px-4">Phòng ban / Điểm trực</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {staffList.map((staff) => {
              const roleConfig = getRoleConfig(staff.roleName);
              const RoleIcon = roleConfig.icon;

              return (
                <tr
                  key={staff.id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  {/* Cột 1: Tên & Mã NV */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                        {staff.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors text-xs">
                          {staff.fullName}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          {staff.employeeCode || `NV-${staff.id.slice(-6)}`}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Chức vụ / Role */}
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={`gap-1 font-medium text-[11px] ${roleConfig.className}`}>
                      <RoleIcon className="h-3 w-3 shrink-0" />
                      <span>{roleConfig.label}</span>
                    </Badge>
                  </td>

                  {/* Cột 3: Liên hệ */}
                  <td className="py-3 px-4">
                    <div className="space-y-0.5 text-[11px]">
                      <div className="flex items-center gap-1.5 text-foreground font-mono">
                        <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>{staff.phone || "Chưa cập nhật"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[10px]">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-[160px]">{staff.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Cột 4: Phòng ban / Kho phụ trách */}
                  <td className="py-3 px-4">
                    <div className="text-[11px] text-foreground font-medium">
                      {staff.department || "Khối Vận Hành"}
                    </div>
                    {staff.assignedWarehouse && (
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                        <Warehouse className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate max-w-[180px]">{staff.assignedWarehouse}</span>
                      </div>
                    )}
                  </td>

                  {/* Cột 5: Trạng thái */}
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(staff.status)}
                  </td>

                  {/* Cột 6: Thao tác */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditStaff(staff)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-primary cursor-pointer"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleStatus(staff)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-600 cursor-pointer"
                        title={staff.status === "ACTIVE" ? "Khóa tài khoản" : "Kích hoạt tài khoản"}
                      >
                        {staff.status === "ACTIVE" ? (
                          <Lock className="h-3.5 w-3.5" />
                        ) : (
                          <Unlock className="h-3.5 w-3.5" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteStaff(staff)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 cursor-pointer"
                        title="Xóa nhân viên"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
