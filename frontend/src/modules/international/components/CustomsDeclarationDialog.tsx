import React, { useState } from "react";
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
import { FileSpreadsheet, ShieldAlert, ShieldCheck } from "lucide-react";
import type {
  InternationalShipment,
  CreateCustomsInput,
} from "../types/international";

interface CustomsDeclarationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomsInput) => Promise<void>;
  shipments: InternationalShipment[];
  isSubmitting?: boolean;
}

export const CustomsDeclarationDialog: React.FC<CustomsDeclarationDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  shipments,
  isSubmitting = false,
}) => {
  const randNo = Math.floor(100000000000 + Math.random() * 900000000000).toString();

  const [formData, setFormData] = useState<CreateCustomsInput>({
    declarationNo: randNo,
    shipmentId: shipments[0]?.shipmentCode || "",
    customsBranch: "Chi cục HQ CK Cảng Sài Gòn KV1 (Cát Lái)",
    declarationType: "B11 (Xuất kinh doanh)",
    channel: "GREEN",
    hsCode: "6109.10.00",
    commodityDescription: "Hàng dệt may xuất khẩu",
    invoiceValue: 85000,
    currency: "USD",
    importTaxAmount: 0,
    vatTaxAmount: 0,
    status: "REGISTERED",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.declarationNo.trim() || formData.declarationNo.length < 10) {
      err.declarationNo = "Số tờ khai hải quan hợp lệ phải từ 10-12 số";
    }
    if (!formData.shipmentId) {
      err.shipmentId = "Vui lòng chọn lô hàng xuất nhập khẩu liên kết";
    }
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
      <DialogContent className="max-w-lg p-0 border-border bg-card">
        <DialogHeader className="px-6 pt-5 pb-4 bg-muted/40 border-b border-border">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-500" />
            <span>Khai báo Tờ khai Hải quan Điện tử (VNACCS)</span>
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Đăng ký số tờ khai, phân luồng hải quan Xanh / Vàng / Đỏ và tính thuế xuất nhập khẩu
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 text-xs">
          {/* Số tờ khai & Lô hàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Số tờ khai hải quan (12 số) <span className="text-rose-500">*</span>
              </label>
              <Input
                value={formData.declarationNo}
                onChange={(e) => setFormData({ ...formData, declarationNo: e.target.value })}
                placeholder="104829104820"
                className="h-8 text-xs font-mono font-bold"
              />
              {errors.declarationNo && <p className="text-[11px] text-destructive mt-1">{errors.declarationNo}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Lô hàng liên kết <span className="text-rose-500">*</span>
              </label>
              <Select
                value={formData.shipmentId}
                onValueChange={(val) => setFormData({ ...formData, shipmentId: val })}
              >
                <SelectTrigger className="h-8 text-xs font-mono">
                  <SelectValue placeholder="Chọn lô hàng..." />
                </SelectTrigger>
                <SelectContent>
                  {shipments.map((s) => (
                    <SelectItem key={s.id} value={s.shipmentCode} className="text-xs font-mono">
                      {s.shipmentCode} ({s.transportMode} - {s.incoterm})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.shipmentId && <p className="text-[11px] text-destructive mt-1">{errors.shipmentId}</p>}
            </div>
          </div>

          {/* Chi cục Hải quan & Mã loại hình */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Chi cục Hải quan tiếp nhận</label>
              <Select
                value={formData.customsBranch}
                onValueChange={(val) => setFormData({ ...formData, customsBranch: val })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chi cục HQ CK Cảng Sài Gòn KV1 (Cát Lái)">HQ Cảng Cát Lái (TP.HCM)</SelectItem>
                  <SelectItem value="Chi cục Hải quan CK Cảng Đình Vũ - Hải Phòng">HQ Cảng Đình Vũ (Hải Phòng)</SelectItem>
                  <SelectItem value="Chi cục HQ CK Sân bay Quốc tế Nội Bài">HQ Sân bay Nội Bài (Hà Nội)</SelectItem>
                  <SelectItem value="Chi cục HQ CK Sân bay Tân Sơn Nhất">HQ Sân bay Tân Sơn Nhất</SelectItem>
                  <SelectItem value="Chi cục HQ Cửa khẩu Hữu Nghị - Lạng Sơn">HQ Cửa khẩu Hữu Nghị (Lạng Sơn)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Mã loại hình XNK</label>
              <Select
                value={formData.declarationType}
                onValueChange={(val) => setFormData({ ...formData, declarationType: val })}
              >
                <SelectTrigger className="h-8 text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B11 (Xuất kinh doanh)">B11 - Xuất kinh doanh</SelectItem>
                  <SelectItem value="A11 (Nhập kinh doanh tiêu dùng)">A11 - Nhập kinh doanh tiêu dùng</SelectItem>
                  <SelectItem value="A12 (Nhập kinh doanh sản xuất máy móc)">A12 - Nhập sản xuất máy móc</SelectItem>
                  <SelectItem value="E31 (Nhập / Xuất sản xuất gia công)">E31 - Nhập nguyên liệu gia công</SelectItem>
                  <SelectItem value="G11 (Tạm nhập tái xuất)">G11 - Tạm nhập tái xuất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Phân luồng Hải quan */}
          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
            <label className="text-xs font-semibold text-foreground block">
              Kết quả Phân luồng Hải quan (VNACCS Channel)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, channel: "GREEN" })}
                className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  formData.channel === "GREEN"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 ring-1 ring-emerald-500 font-bold"
                    : "border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <ShieldCheck className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                <span className="block text-xs">Luồng XANH</span>
                <span className="text-[10px] opacity-80">Thông quan ngay</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, channel: "YELLOW" })}
                className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  formData.channel === "YELLOW"
                    ? "bg-amber-500/15 border-amber-500 text-amber-600 ring-1 ring-amber-500 font-bold"
                    : "border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <ShieldAlert className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                <span className="block text-xs">Luồng VÀNG</span>
                <span className="text-[10px] opacity-80">Kiểm tra hồ sơ</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, channel: "RED" })}
                className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                  formData.channel === "RED"
                    ? "bg-rose-500/15 border-rose-500 text-rose-600 ring-1 ring-rose-500 font-bold"
                    : "border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <ShieldAlert className="h-4 w-4 mx-auto mb-1 text-rose-500" />
                <span className="block text-xs">Luồng ĐỎ</span>
                <span className="text-[10px] opacity-80">Kiểm hóa thực tế</span>
              </button>
            </div>
          </div>

          {/* Mã HS Code & Tên hàng hóa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Mã HS Code (8 số)</label>
              <Input
                value={formData.hsCode}
                onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
                placeholder="VD: 8542.31.00"
                className="h-8 text-xs font-mono font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground block mb-1">Mô tả hàng hóa theo tờ khai</label>
              <Input
                value={formData.commodityDescription}
                onChange={(e) => setFormData({ ...formData, commodityDescription: e.target.value })}
                placeholder="Linh kiện điện tử, chip vi xử lý..."
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Trị giá hóa đơn & Thuế VAT */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Trị giá Invoice (USD)</label>
              <Input
                type="number"
                value={formData.invoiceValue}
                onChange={(e) => setFormData({ ...formData, invoiceValue: Number(e.target.value) })}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Thuế Nhập khẩu (VNĐ)</label>
              <Input
                type="number"
                value={formData.importTaxAmount}
                onChange={(e) => setFormData({ ...formData, importTaxAmount: Number(e.target.value) })}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Thuế VAT hàng nhập (VNĐ)</label>
              <Input
                type="number"
                value={formData.vatTaxAmount}
                onChange={(e) => setFormData({ ...formData, vatTaxAmount: Number(e.target.value) })}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="font-semibold bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Đang truyền dữ liệu..." : "Truyền tờ khai VNACCS"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
