import React, { useState } from "react";
import { ArrowDownToLine, Building2, User, Hash, Scale, FileText } from "lucide-react";
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
import { inventoryService } from "@/mocks/adapters/serviceFactory";
import type { Warehouse } from "@/core/types/logistics";
import type { InboundStatus } from "../types/wms";

interface InboundReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  warehouseId?: string;
  warehouses?: Warehouse[];
}

export const InboundReceiptDialog: React.FC<InboundReceiptDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  warehouseId,
  warehouses = [],
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    warehouseId: warehouseId || (warehouses[0]?.id ?? "wh-hn-lb"),
    receiptCode: `INB-2026-${Math.floor(100 + Math.random() * 900)}`,
    supplierName: "",
    itemCount: 1,
    totalWeight: 100,
    status: "RECEIVING" as InboundStatus,
    receivedBy: "Trần Văn Hùng",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplierName.trim()) {
      toast.error("Thiếu thông tin", "Vui lòng nhập tên nhà cung cấp");
      return;
    }

    setIsSubmitting(true);
    try {
      await inventoryService.createInboundReceipt({
        ...form,
        warehouseId: warehouseId || form.warehouseId,
        createdAt: new Date().toISOString(),
      });
      toast.success("Tạo phiếu nhập thành công", `Mã phiếu: ${form.receiptCode}`);
      onSuccess();
      onClose();
    } catch {
      toast.error("Lỗi", "Không thể tạo phiếu nhập kho");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <ArrowDownToLine className="h-5 w-5 text-emerald-600" />
            Tạo Phiếu Nhập Kho (Inbound)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {!warehouseId && warehouses.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Kho nhận hàng
              </label>
              <Select
                value={form.warehouseId}
                onValueChange={(val) => setForm((p) => ({ ...p, warehouseId: val }))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Chọn kho" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id} className="text-xs">
                      {wh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              Nhà cung cấp / Đơn vị giao <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="VD: Công ty TNHH Nhựa Tiền Phong"
              value={form.supplierName}
              onChange={(e) => setForm((p) => ({ ...p, supplierName: e.target.value }))}
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                Số lượng kiện / mặt hàng
              </label>
              <Input
                type="number"
                min={1}
                value={form.itemCount}
                onChange={(e) => setForm((p) => ({ ...p, itemCount: parseInt(e.target.value) || 1 }))}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                Tổng trọng lượng (kg)
              </label>
              <Input
                type="number"
                min={1}
                value={form.totalWeight}
                onChange={(e) => setForm((p) => ({ ...p, totalWeight: parseFloat(e.target.value) || 0 }))}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Nhân sự tiếp nhận
              </label>
              <Input
                value={form.receivedBy}
                onChange={(e) => setForm((p) => ({ ...p, receivedBy: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Trạng thái ban đầu</label>
              <Select
                value={form.status}
                onValueChange={(val) => setForm((p) => ({ ...p, status: val as InboundStatus }))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING" className="text-xs">Chờ tiếp nhận</SelectItem>
                  <SelectItem value="RECEIVING" className="text-xs">Đang hạ hàng</SelectItem>
                  <SelectItem value="INSPECTING" className="text-xs">Đang kiểm đếm</SelectItem>
                  <SelectItem value="COMPLETED" className="text-xs">Đã nhập kho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Ghi chú nhập kho / Yêu cầu bảo quản
            </label>
            <Textarea
              placeholder="Ghi chú về quy cách đóng gói, nhiệt độ bảo quản hoặc kiểm tra niêm chì..."
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="min-h-[70px] text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              <ArrowDownToLine className="h-3.5 w-3.5" />
              {isSubmitting ? "Đang tạo..." : "Xác nhận Nhập kho"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
