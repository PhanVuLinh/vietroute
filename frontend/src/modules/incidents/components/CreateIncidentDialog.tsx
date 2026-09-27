import React, { useState } from "react";
import { AlertTriangle, Package, User, Truck, FileText, Tag, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "@/shared/components/feedback/Toast";
import { incidentService } from "@/mocks/adapters/serviceFactory";
import { StaffSelect } from "@/modules/staff/components/StaffSelect";
import {
  type IncidentSeverity,
  type IncidentType,
  INCIDENT_TYPE_LABELS,
  SEVERITY_META,
} from "../types/incident";

interface CreateIncidentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateIncidentDialog: React.FC<CreateIncidentDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "DAMAGED_GOODS" as IncidentType,
    severity: "MEDIUM" as IncidentSeverity,
    description: "",
    orderCode: "",
    driverName: "",
    vehiclePlate: "",
    reportedBy: "Điều phối viên",
    assignedTo: "Đội Xử Lý Sự Cố",
    status: "NEW" as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Thiếu thông tin", "Vui lòng nhập tiêu đề và mô tả sự cố");
      return;
    }

    setIsSubmitting(true);
    try {
      await incidentService.createIncident({
        ...form,
        createdAt: new Date().toISOString(),
      });
      toast.success("Khai báo thành công", "Sự cố đã được ghi nhận vào hệ thống");
      onSuccess();
      onClose();
    } catch {
      toast.error("Lỗi", "Không thể tạo sự cố mới");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            Khai Báo Sự Cố & Khiếu Nại Mới
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Tiêu đề sự cố <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="VD: Hàng vỡ do xóc trên đèo Hải Vân xe 29C-882.11"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="h-9 text-xs"
              required
            />
          </div>

          {/* Type & Severity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                Phân loại
              </label>
              <Select
                value={form.type}
                onValueChange={(val) => setForm((p) => ({ ...p, type: val as IncidentType }))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INCIDENT_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                Mức độ nghiêm trọng
              </label>
              <Select
                value={form.severity}
                onValueChange={(val) => setForm((p) => ({ ...p, severity: val as IncidentSeverity }))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SEVERITY_META).map(([key, meta]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Associated Entities */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Package className="h-3 w-3 text-muted-foreground" />
                Mã đơn hàng
              </label>
              <Input
                placeholder="VR-2026-001"
                value={form.orderCode}
                onChange={(e) => setForm((p) => ({ ...p, orderCode: e.target.value }))}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <User className="h-3 w-3 text-muted-foreground" />
                Tài xế phụ trách
              </label>
              <StaffSelect
                value={form.driverName}
                roleFilter={["DRIVER"]}
                placeholder="Chọn tài xế..."
                onSelectStaff={(staff) => setForm((p) => ({ ...p, driverName: staff.fullName }))}
                onClear={() => setForm((p) => ({ ...p, driverName: "" }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Truck className="h-3 w-3 text-muted-foreground" />
                Biển số xe
              </label>
              <Input
                placeholder="29C-123.45"
                value={form.vehiclePlate}
                onChange={(e) => setForm((p) => ({ ...p, vehiclePlate: e.target.value }))}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Mô tả chi tiết nguyên nhân, hiện trường <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Ghi rõ diễn biến sự cố, mức độ tổn thất, hiện trạng hàng hóa hoặc xe..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="min-h-[85px] text-xs resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white">
              <AlertTriangle className="h-3.5 w-3.5" />
              {isSubmitting ? "Đang gửi..." : "Khai báo sự cố"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
