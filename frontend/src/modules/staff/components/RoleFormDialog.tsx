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
import { ShieldCheck, KeyRound, FileText } from "lucide-react";
import type { RolePermissionItem } from "../types/staff";

interface RoleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => Promise<void>;
  editingRole?: RolePermissionItem | null;
  isSubmitting?: boolean;
}

export const RoleFormDialog: React.FC<RoleFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingRole,
  isSubmitting = false,
}) => {
  const isEdit = Boolean(editingRole);
  const isSystem = editingRole?.isSystem ?? false;

  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingRole) {
      setRoleName(editingRole.name);
      setDescription(editingRole.description || "");
    } else {
      setRoleName("");
      setDescription("");
    }
    setError(null);
  }, [editingRole, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setError("Mã định danh vai trò không được để trống");
      return;
    }

    try {
      await onSubmit({
        name: roleName.toUpperCase().trim().replace(/\s+/g, "_"),
        description: description.trim(),
      });
    } catch {
      // error handled in caller
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border-border bg-card">
        <DialogHeader className="px-6 pt-5 pb-4 bg-muted/40 border-b border-border">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>{isEdit ? "Chỉnh sửa vai trò vận hành" : "Tạo vai trò phân quyền mới"}</span>
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Định nghĩa vai trò và mô tả quyền hạn nghiệp vụ trong hệ thống VietRoute
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
              <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
              Mã định danh vai trò <span className="text-rose-500">*</span>
            </label>
            <Input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
              placeholder="VD: SHIFT_LEADER, QC_INSPECTOR..."
              disabled={isEdit && isSystem}
              className="h-8 text-xs font-mono uppercase"
            />
            {isEdit && isSystem ? (
              <p className="text-[10px] text-amber-500 mt-1">
                Vai trò hệ thống mặc định không thể thay đổi mã định danh
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground mt-1">
                Tự động viết hoa, cách nhau bởi dấu gạch dưới (_)
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Mô tả trách nhiệm & quyền hạn
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Trưởng ca chịu trách nhiệm điều phối xuất nhập kho theo ca và ký bàn giao biên bản..."
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="font-semibold">
              {isSubmitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo vai trò"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
