import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Plus, Trash2, Receipt, FileText } from "lucide-react";
import { useCreateInvoiceMutation } from "../hooks/useFinance";
import { useCustomers } from "@/modules/customers/hooks/useCustomers";

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LineItemForm {
  description: string;
  quantity: number;
  unitPrice: number;
}

export const CreateInvoiceDialog: React.FC<CreateInvoiceDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const createMutation = useCreateInvoiceMutation();
  const { allCustomers = [], customers = [] } = useCustomers();
  const customerList = allCustomers.length > 0 ? allCustomers : customers;

  const [customerId, setCustomerId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [paymentTerms, setPaymentTerms] = useState<string>("Net 30");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const [items, setItems] = useState<LineItemForm[]>([
    { description: "Cước vận chuyển tuyến đường tiêu chuẩn", quantity: 1, unitPrice: 10000000 },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (
    index: number,
    field: keyof LineItemForm,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  // Tính toán số liệu
  const subtotal = items.reduce(
    (acc, curr) => acc + (Number(curr.quantity) || 0) * (Number(curr.unitPrice) || 0),
    0
  );
  const vatAmount = Math.round(subtotal * 0.08); // 8% VAT
  const totalAmount = subtotal + vatAmount - (Number(discountAmount) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    await createMutation.mutateAsync({
      customer_id: customerId,
      due_date: new Date(dueDate).toISOString(),
      payment_terms: paymentTerms,
      vat_rate: 0.08,
      discount_amount: Number(discountAmount) || 0,
      notes,
      items: items.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity) || 1,
        unit_price: Number(it.unitPrice) || 0,
      })),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Receipt className="h-5 w-5 text-primary" />
              <span>Lập Hóa đơn Cước Vận chuyển B2B</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {/* Khách hàng & Hạn thanh toán */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="customer" className="text-xs font-semibold">
                  Khách hàng doanh nghiệp <span className="text-destructive">*</span>
                </Label>
                <Select value={customerId} onValueChange={setCustomerId} required>
                  <SelectTrigger id="customer" className="h-9 text-xs">
                    <SelectValue placeholder="Chọn khách hàng..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customerList.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.taxCode ? `(MST: ${c.taxCode})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="due_date" className="text-xs font-semibold">
                  Hạn thanh toán <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="payment_terms" className="text-xs">
                  Điều khoản thanh toán
                </Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger id="payment_terms" className="h-9 text-xs">
                    <SelectValue placeholder="Điều khoản" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15">Net 15 (15 ngày)</SelectItem>
                    <SelectItem value="Net 30">Net 30 (30 ngày)</SelectItem>
                    <SelectItem value="Net 60">Net 60 (60 ngày)</SelectItem>
                    <SelectItem value="COD">Thanh toán ngay (COD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="discount" className="text-xs">
                  Chiết khấu hợp đồng (VNĐ)
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min={0}
                  step={100000}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Dòng cước vận chuyển */}
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Dòng cước vận chuyển & Dịch vụ ({items.length})
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm dòng</span>
                </Button>
              </div>

              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/20">
                    <div className="flex-1">
                      <Input
                        placeholder="Mô tả tuyến đường, dịch vụ..."
                        value={item.description}
                        required
                        onChange={(e) => handleUpdateItem(idx, "description", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="w-16">
                      <Input
                        type="number"
                        min={1}
                        placeholder="SL"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(idx, "quantity", Number(e.target.value))}
                        className="h-8 text-xs text-center font-mono"
                      />
                    </div>
                    <div className="w-28">
                      <Input
                        type="number"
                        min={0}
                        step={100000}
                        placeholder="Đơn giá"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(idx, "unitPrice", Number(e.target.value))}
                        className="h-8 text-xs text-right font-mono"
                      />
                    </div>
                    <div className="w-24 text-right font-mono font-bold text-foreground text-xs pr-1">
                      {((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString("vi-VN")} đ
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(idx)}
                        className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bảng tổng kết tiền */}
            <div className="p-3 rounded-lg bg-muted/60 space-y-1.5 font-mono text-xs border">
              <div className="flex justify-between text-muted-foreground">
                <span>Cước trước thuế (Subtotal):</span>
                <span>{subtotal.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Thuế VAT (8%):</span>
                <span>+{vatAmount.toLocaleString("vi-VN")} đ</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Chiết khấu:</span>
                  <span>-{Number(discountAmount).toLocaleString("vi-VN")} đ</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-primary border-t pt-1.5">
                <span>Tổng tiền thanh toán:</span>
                <span>{totalAmount.toLocaleString("vi-VN")} đ</span>
              </div>
            </div>

            {/* Ghi chú */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs">
                Ghi chú trên hóa đơn
              </Label>
              <Input
                id="notes"
                placeholder="Điều khoản bổ sung, thông tin ngân hàng thụ hưởng..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !customerId}
              className="gap-1.5"
            >
              <FileText className="h-4 w-4" />
              <span>{createMutation.isPending ? "Đang lưu..." : "Phát hành hóa đơn"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
