import React, { useState } from "react";
import { ArrowRightLeft, Building2, User, Hash, Scale } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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
import type { TransferStatus } from "../types/wms";

interface StockTransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  warehouses: Warehouse[];
  currentWarehouseId?: string;
}

export const StockTransferDialog: React.FC<StockTransferDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  warehouses,
  currentWarehouseId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    fromWarehouseId: currentWarehouseId || warehouses[0]?.id || "",
    toWarehouseId: warehouses.find((w) => w.id !== currentWarehouseId)?.id || warehouses[1]?.id || "",
    transferCode: `TF-2026-${Math.floor(100 + Math.random() * 900)}`,
    itemCount: 10,
    totalWeight: 500,
    status: "IN_TRANSIT" as TransferStatus,
    createdBy: "Quản lý Vận hành",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.fromWarehouseId === form.toWarehouseId) {
      toast.error("Kho không hợp lệ", "Kho xuất và kho đích không thể trùng nhau");
      return;
    }

    const fromWh = warehouses.find((w) => w.id === form.fromWarehouseId);
    const toWh = warehouses.find((w) => w.id === form.toWarehouseId);

    setIsSubmitting(true);
    try {
      await inventoryService.createStockTransfer({
        ...form,
        fromWarehouseName: fromWh?.name || form.fromWarehouseId,
        toWarehouseName: toWh?.name || form.toWarehouseId,
        createdAt: new Date().toISOString(),
      });
      toast.success("Tạo lệnh điều chuyển thành công", `Mã: ${form.transferCode}`);
      onSuccess();
      onClose();
    } catch {
      toast.error("Lỗi", "Không thể tạo lệnh điều chuyển hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <ArrowRightLeft className="h-5 w-5 text-indigo-600" />
            Điều Chuyển Hàng Giữa Các Kho (Hub Transfer)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-rose-500" />
                Từ kho (Kho xuất)
              </label>
              <Select
                value={form.fromWarehouseId}
                onValueChange={(val) => setForm((p) => ({ ...p, fromWarehouseId: val }))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-emerald-500" />
                Đến kho (Kho nhập)
              </label>
              <Select
                value={form.toWarehouseId}
                onValueChange={(val) => setForm((p) => ({ ...p, toWarehouseId: val }))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                Số lượng kiện / SKU
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
                Người tạo lệnh
              </label>
              <Input
                value={form.createdBy}
                onChange={(e) => setForm((p) => ({ ...p, createdBy: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Trạng thái ban đầu</label>
              <Select
                value={form.status}
                onValueChange={(val) => setForm((p) => ({ ...p, status: val as TransferStatus }))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING" className="text-xs">Chờ phê duyệt</SelectItem>
                  <SelectItem value="IN_TRANSIT" className="text-xs">Đang luân chuyển xe</SelectItem>
                  <SelectItem value="RECEIVED" className="text-xs">Đã tiếp nhận kho đích</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              {isSubmitting ? "Đang xử lý..." : "Khởi tạo Điều chuyển"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
