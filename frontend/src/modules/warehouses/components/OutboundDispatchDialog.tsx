import React, { useState } from "react";
import { ArrowUpFromLine, Building2, User, Hash, Scale, FileText, PackageCheck, Route } from "lucide-react";
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
import type { OutboundStatus } from "../types/wms";

interface OutboundDispatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  warehouseId?: string;
  warehouses?: Warehouse[];
}

export const OutboundDispatchDialog: React.FC<OutboundDispatchDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  warehouseId,
  warehouses = [],
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    warehouseId: warehouseId || (warehouses[0]?.id ?? "wh-hn-lb"),
    dispatchCode: `OUT-2026-${Math.floor(100 + Math.random() * 900)}`,
    orderCode: "",
    routeCode: "",
    itemCount: 1,
    totalWeight: 50,
    status: "PICKING" as OutboundStatus,
    pickedBy: "Đặng Văn Minh",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      await inventoryService.createOutboundDispatch({
        ...form,
        warehouseId: warehouseId || form.warehouseId,
        createdAt: new Date().toISOString(),
      });
      toast.success("Tạo lệnh xuất kho thành công", `Mã phiếu: ${form.dispatchCode}`);
      onSuccess();
      onClose();
    } catch {
      toast.error("Lỗi", "Không thể tạo lệnh xuất kho");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <ArrowUpFromLine className="h-5 w-5 text-blue-600" />
            Tạo Lệnh Xuất Kho (Outbound)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {!warehouseId && warehouses.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Kho xuất hàng
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <PackageCheck className="h-3.5 w-3.5 text-muted-foreground" />
                Mã đơn hàng liên quan
              </label>
              <Input
                placeholder="VD: VR-2026-003"
                value={form.orderCode}
                onChange={(e) => setForm((p) => ({ ...p, orderCode: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Route className="h-3.5 w-3.5 text-muted-foreground" />
                Mã tuyến đường (nếu có)
              </label>
              <Input
                placeholder="VD: TUYEN-HAN-01"
                value={form.routeCode}
                onChange={(e) => setForm((p) => ({ ...p, routeCode: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                Số lượng kiện hàng
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
                Nhân viên soạn hàng (Picker)
              </label>
              <Input
                value={form.pickedBy}
                onChange={(e) => setForm((p) => ({ ...p, pickedBy: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Trạng thái xuất</label>
              <Select
                value={form.status}
                onValueChange={(val) => setForm((p) => ({ ...p, status: val as OutboundStatus }))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING" className="text-xs">Chờ chuẩn bị</SelectItem>
                  <SelectItem value="PICKING" className="text-xs">Đang lấy hàng</SelectItem>
                  <SelectItem value="PACKING" className="text-xs">Đang đóng gói</SelectItem>
                  <SelectItem value="DISPATCHED" className="text-xs">Đã xuất lên xe</SelectItem>
                  <SelectItem value="COMPLETED" className="text-xs">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Ghi chú xuất kho
            </label>
            <Textarea
              placeholder="Ghi chú giao xe, số niêm chì seal xe tải, v.v..."
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="min-h-[70px] text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
              <ArrowUpFromLine className="h-3.5 w-3.5" />
              {isSubmitting ? "Đang tạo..." : "Xác nhận Xuất kho"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
