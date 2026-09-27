import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { User, Mail, Phone, Building2, KeyRound } from "lucide-react";
import type { StaffMember, RolePermissionItem } from "../types/staff";

interface StaffFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingStaff?: StaffMember | null;
  roles: RolePermissionItem[];
  isSubmitting?: boolean;
}

export const StaffFormDialog: React.FC<StaffFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingStaff,
  roles,
  isSubmitting,
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState("");
  const [department, setDepartment] = useState("Trung Tâm Vận Hành");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("ACTIVE");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingStaff) {
      setFullName(editingStaff.fullName);
      setEmail(editingStaff.email);
      setPhone(editingStaff.phone || "");
      setRoleId(editingStaff.roleId);
      setDepartment(editingStaff.department || "Khối Vận Hành");
      setStatus(editingStaff.status);
      setPassword("");
    } else {
      setFullName("");
      setEmail("");
      setPhone("");
      setRoleId(roles[1]?.id || roles[0]?.id || "");
      setDepartment("Khối Vận Hành");
      setStatus("ACTIVE");
      setPassword("123456");
    }
    setError(null);
  }, [editingStaff, roles, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Vui lòng nhập họ và tên nhân viên.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    if (!editingStaff && (!password || password.length < 6)) {
      setError("Mật khẩu khởi tạo phải từ 6 ký tự trở lên.");
      return;
    }

    try {
      await onSubmit({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        roleId,
        department: department.trim(),
        status,
        ...(password ? { password } : {}),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra khi lưu nhân viên");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <User className="h-4 w-4 text-primary" />
            <span>{editingStaff ? "Chỉnh sửa thông tin nhân sự" : "Thêm mới nhân sự vận hành"}</span>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          {/* Họ tên */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Họ và tên nhân sự <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Trần Hữu Nam"
                className="h-8 pl-8 text-xs"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Địa chỉ Email (Tài khoản) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: nam.th@vietroute.vn"
                className="h-8 pl-8 text-xs font-mono"
                required
              />
            </div>
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Số điện thoại liên hệ
            </label>
            <div className="relative">
              <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912.834.192"
                className="h-8 pl-8 text-xs font-mono"
              />
            </div>
          </div>

          {/* Vai trò / Role */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Vai trò & Chức vụ <span className="text-rose-500">*</span>
            </label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.displayName || r.name} ({r.description})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phòng ban */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Phòng ban / Điểm trực
            </label>
            <div className="relative">
              <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="VD: Khối Quản Lý Kho Bãi Long Biên"
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>

          {/* Mật khẩu nếu tạo mới */}
          {!editingStaff && (
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Mật khẩu khởi tạo <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="h-8 pl-8 text-xs font-mono"
                  required
                />
              </div>
            </div>
          )}

          {/* Trạng thái */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Trạng thái tài khoản
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Hoạt động (Active)</SelectItem>
                <SelectItem value="INACTIVE">Tạm khóa (Inactive)</SelectItem>
                <SelectItem value="SUSPENDED">Đình chỉ (Suspended)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 text-xs bg-primary text-primary-foreground font-semibold cursor-pointer"
            >
              {isSubmitting ? "Đang lưu..." : editingStaff ? "Lưu thay đổi" : "Tạo nhân viên"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
