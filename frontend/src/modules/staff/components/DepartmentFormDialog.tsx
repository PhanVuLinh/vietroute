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
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Building2, User, MapPin, FileText, CheckCircle2 } from "lucide-react";
import { StaffSelect } from "./StaffSelect";
import type { DepartmentItem, CreateDepartmentInput, UpdateDepartmentInput } from "../types/department";

interface DepartmentFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDepartmentInput | UpdateDepartmentInput) => Promise<void>;
  editingDepartment?: DepartmentItem | null;
  isSubmitting?: boolean;
}

export const DepartmentFormDialog: React.FC<DepartmentFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingDepartment,
  isSubmitting = false,
}) => {
  const isEdit = Boolean(editingDepartment);

  const [formData, setFormData] = useState<CreateDepartmentInput>({
    code: "",
    name: "",
    description: "",
    headId: "",
    headName: "",
    headPhone: "",
    headEmail: "",
    location: "Trụ sở chính Hà Nội",
    status: "ACTIVE",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingDepartment) {
      setFormData({
        code: editingDepartment.code,
        name: editingDepartment.name,
        description: editingDepartment.description || "",
        headId: editingDepartment.headId || "",
        headName: editingDepartment.headName || "",
        headPhone: editingDepartment.headPhone || "",
        headEmail: editingDepartment.headEmail || "",
        location: editingDepartment.location || "Trụ sở chính",
        status: editingDepartment.status,
      });
    } else {
      const randomSuffix = Math.floor(10 + Math.random() * 90);
      setFormData({
        code: `DEP-OP-${randomSuffix}`,
        name: "",
        description: "",
        headId: "",
        headName: "",
        headPhone: "",
        headEmail: "",
        location: "Trụ sở chính Hà Nội",
        status: "ACTIVE",
      });
    }
    setErrors({});
  }, [editingDepartment, isOpen]);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.code.trim()) err.code = "Mã phòng ban không được để trống";
    if (!formData.name.trim()) err.name = "Tên phòng ban không được để trống";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-border bg-card">
        <DialogHeader className="px-6 pt-5 pb-4 bg-muted/40 border-b border-border">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span>{isEdit ? "Chỉnh sửa thông tin phòng ban" : "Thêm phòng ban cơ cấu mới"}</span>
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cấu hình bộ phận phòng ban, phân bổ nhân sự phụ trách và địa bàn hoạt động
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 text-xs">
          {/* Mã phòng & Tên phòng */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                Mã phòng ban <span className="text-rose-500">*</span>
              </label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="VD: DEP-WH"
                className="h-8 text-xs font-mono uppercase"
              />
              {errors.code && <p className="text-[11px] text-destructive mt-1">{errors.code}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                Tên phòng ban <span className="text-rose-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Phòng Quản Trị Kho Bãi & WMS"
                className="h-8 text-xs"
              />
              {errors.name && <p className="text-[11px] text-destructive mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Chọn Trưởng phòng bằng StaffSelect (Không nhập tay!) */}
          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>Trưởng phòng / Phụ trách trực tiếp</span>
              </label>
              <span className="text-[10px] text-muted-foreground">Chọn trực tiếp từ danh sách nhân sự</span>
            </div>

            <StaffSelect
              value={formData.headName}
              placeholder="Tìm và chọn nhân viên bổ nhiệm làm Trưởng phòng..."
              onSelectStaff={(staff) => {
                setFormData({
                  ...formData,
                  headId: staff.id,
                  headName: staff.fullName,
                  headPhone: staff.phone || "",
                  headEmail: staff.email || "",
                });
              }}
              onClear={() => {
                setFormData({
                  ...formData,
                  headId: "",
                  headName: "",
                  headPhone: "",
                  headEmail: "",
                });
              }}
            />

            {formData.headName && (
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 px-1">
                {formData.headPhone && (
                  <span>
                    SĐT: <strong className="text-foreground font-mono">{formData.headPhone}</strong>
                  </span>
                )}
                {formData.headEmail && (
                  <span>
                    Email: <strong className="text-foreground">{formData.headEmail}</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Địa điểm & Trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                Địa điểm / Cơ sở trực thuộc
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="VD: Trụ sở chính Hà Nội - Tầng 4"
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                Trạng thái hoạt động
              </label>
              <Select
                value={formData.status}
                onValueChange={(val: 'ACTIVE' | 'INACTIVE') =>
                  setFormData({ ...formData, status: val })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE" className="text-xs text-emerald-600 font-medium">
                    Đang hoạt động
                  </SelectItem>
                  <SelectItem value="INACTIVE" className="text-xs text-muted-foreground">
                    Tạm ngưng hoạt động
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mô tả chức năng nhiệm vụ */}
          <div>
            <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
              <FileText className="h-3 w-3 text-muted-foreground" />
              Mô tả chức năng & phạm vi nhiệm vụ
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chức năng chính, quyền hạn phê duyệt và trách nhiệm quản lý..."
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="font-semibold">
              {isSubmitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo phòng ban"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
