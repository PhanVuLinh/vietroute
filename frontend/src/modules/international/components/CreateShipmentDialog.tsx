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
import { Globe2, Anchor } from "lucide-react";
import { useInternationalPorts } from "../hooks/useInternational";
import type {
  InternationalShipment,
  CreateShipmentInput,
  DirectionType,
  TransportModeType,
  IncotermType,
} from "../types/international";

interface CreateShipmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateShipmentInput) => Promise<void>;
  editingShipment?: InternationalShipment | null;
  isSubmitting?: boolean;
}

export const CreateShipmentDialog: React.FC<CreateShipmentDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingShipment,
  isSubmitting = false,
}) => {
  const isEdit = Boolean(editingShipment);
  const { data: ports = [] } = useInternationalPorts();

  const [formData, setFormData] = useState<CreateShipmentInput>({
    shipmentCode: "",
    direction: "EXPORT",
    transportMode: "OCEAN_FCL",
    incoterm: "FOB",
    carrierName: "Maersk Line",
    vesselFlightNo: "",
    polPort: "VNSGN - Cảng Tân Cảng Cát Lái",
    podPort: "USLAX - Port of Los Angeles",
    etdDate: new Date().toISOString().split("T")[0],
    etaDate: new Date(Date.now() + 18 * 86400000).toISOString().split("T")[0],
    blAwbNumber: "",
    containerNumber: "",
    sealNumber: "",
    containerType: "40HC",
    grossWeightKg: 20000,
    cbmVolume: 50,
    packageCount: 500,
    shipperName: "",
    consigneeName: "",
    currency: "USD",
    freightAmount: 3200,
    status: "BOOKING_CONFIRMED",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingShipment) {
      setFormData({
        shipmentCode: editingShipment.shipmentCode,
        direction: editingShipment.direction,
        transportMode: editingShipment.transportMode,
        incoterm: editingShipment.incoterm,
        carrierName: editingShipment.carrierName,
        vesselFlightNo: editingShipment.vesselFlightNo || "",
        polPort: editingShipment.polPort,
        podPort: editingShipment.podPort,
        etdDate: editingShipment.etdDate.split("T")[0],
        etaDate: editingShipment.etaDate.split("T")[0],
        blAwbNumber: editingShipment.blAwbNumber,
        containerNumber: editingShipment.containerNumber || "",
        sealNumber: editingShipment.sealNumber || "",
        containerType: editingShipment.containerType || "40HC",
        grossWeightKg: editingShipment.grossWeightKg,
        cbmVolume: editingShipment.cbmVolume,
        packageCount: editingShipment.packageCount,
        shipperName: editingShipment.shipperName,
        consigneeName: editingShipment.consigneeName,
        currency: editingShipment.currency,
        freightAmount: editingShipment.freightAmount,
        status: editingShipment.status,
        notes: editingShipment.notes || "",
      });
    } else {
      const rand = Math.floor(100 + Math.random() * 900);
      setFormData({
        shipmentCode: `EXP-2026-${rand}`,
        direction: "EXPORT",
        transportMode: "OCEAN_FCL",
        incoterm: "FOB",
        carrierName: "Maersk Line",
        vesselFlightNo: "MAERSK MC-KINNEY 2601E",
        polPort: "VNSGN - Cảng Tân Cảng Cát Lái",
        podPort: "USLAX - Port of Los Angeles",
        etdDate: new Date().toISOString().split("T")[0],
        etaDate: new Date(Date.now() + 18 * 86400000).toISOString().split("T")[0],
        blAwbNumber: `MAEU9821${rand}`,
        containerNumber: `MSKU${rand}192`,
        sealNumber: `ML-VN${rand}`,
        containerType: "40HC",
        grossWeightKg: 22500,
        cbmVolume: 65,
        packageCount: 800,
        shipperName: "Tập Đoàn Dệt May Việt Tiến",
        consigneeName: "Walmart Global Procurement Corp",
        currency: "USD",
        freightAmount: 3850,
        status: "BOOKING_CONFIRMED",
        notes: "",
      });
    }
    setErrors({});
  }, [editingShipment, isOpen]);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.shipmentCode.trim()) err.shipmentCode = "Mã lô hàng không được để trống";
    if (!formData.polPort) err.polPort = "Cảng bốc không được để trống";
    if (!formData.podPort) err.podPort = "Cảng dỡ không được để trống";
    if (!formData.carrierName) err.carrierName = "Hãng vận chuyển không được để trống";
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-border bg-card">
        <DialogHeader className="px-6 pt-5 pb-4 bg-muted/40 border-b border-border sticky top-0 z-10 backdrop-blur-md">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary" />
            <span>{isEdit ? "Cập nhật lô hàng xuất nhập khẩu" : "Tạo mới lô hàng xuất nhập khẩu (Booking FWD)"}</span>
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Khai báo thông tin vận chuyển quốc tế: POL/POD, Incoterms, Hãng tàu, B/L và Container
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 text-xs">
          {/* 1. Phân loại & Phương thức */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Mã lô hàng <span className="text-rose-500">*</span>
              </label>
              <Input
                value={formData.shipmentCode}
                onChange={(e) => setFormData({ ...formData, shipmentCode: e.target.value.toUpperCase() })}
                placeholder="EXP-2026-001"
                className="h-8 text-xs font-mono uppercase"
              />
              {errors.shipmentCode && <p className="text-[11px] text-destructive mt-1">{errors.shipmentCode}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Hướng vận chuyển</label>
              <Select
                value={formData.direction}
                onValueChange={(val: DirectionType) => setFormData({ ...formData, direction: val })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPORT">Xuất khẩu (Export)</SelectItem>
                  <SelectItem value="IMPORT">Nhập khẩu (Import)</SelectItem>
                  <SelectItem value="CROSS_BORDER">Xuyên biên giới (Cross-border)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Phương thức vận tải</label>
              <Select
                value={formData.transportMode}
                onValueChange={(val: TransportModeType) => setFormData({ ...formData, transportMode: val })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OCEAN_FCL">Đường biển nguyên Container (FCL)</SelectItem>
                  <SelectItem value="OCEAN_LCL">Đường biển ghép hàng lẻ (LCL)</SelectItem>
                  <SelectItem value="AIR_FREIGHT">Hàng không quốc tế (Air Freight)</SelectItem>
                  <SelectItem value="ROAD_CROSS_BORDER">Đường bộ xuyên biên giới</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 2. Điều kiện Incoterms & Hãng vận chuyển */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Incoterms 2020 <span className="text-rose-500">*</span>
              </label>
              <Select
                value={formData.incoterm}
                onValueChange={(val: IncotermType) => setFormData({ ...formData, incoterm: val })}
              >
                <SelectTrigger className="h-8 text-xs font-mono font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOB">FOB (Giao lên tàu tại cảng bốc)</SelectItem>
                  <SelectItem value="CIF">CIF (Cước biển + Bảo hiểm)</SelectItem>
                  <SelectItem value="EXW">EXW (Giao tại xưởng người bán)</SelectItem>
                  <SelectItem value="DDP">DDP (Giao tận cửa đã nộp thuế)</SelectItem>
                  <SelectItem value="DAP">DAP (Giao tại điểm đến)</SelectItem>
                  <SelectItem value="CFR">CFR (Tiền hàng và cước biển)</SelectItem>
                  <SelectItem value="FCA">FCA (Giao cho người chuyên chở)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Hãng tàu / Hãng hàng không</label>
              <Input
                value={formData.carrierName}
                onChange={(e) => setFormData({ ...formData, carrierName: e.target.value })}
                placeholder="Maersk, MSC, COSCO, Qatar Airways..."
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Số hiệu Tàu / Chuyến bay</label>
              <Input
                value={formData.vesselFlightNo}
                onChange={(e) => setFormData({ ...formData, vesselFlightNo: e.target.value })}
                placeholder="MAERSK MC-KINNEY 2601E"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          {/* 3. Cảng đi POL & Cảng đến POD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/20">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                <Anchor className="h-3.5 w-3.5 text-primary" />
                Cảng bốc / Sân bay đi (POL) <span className="text-rose-500">*</span>
              </label>
              <Select
                value={formData.polPort}
                onValueChange={(val) => setFormData({ ...formData, polPort: val })}
              >
                <SelectTrigger className="h-8 text-xs bg-card">
                  <SelectValue placeholder="Chọn cảng đi..." />
                </SelectTrigger>
                <SelectContent>
                  {ports.map((p) => (
                    <SelectItem key={p.code} value={`${p.code} - ${p.name}`} className="text-xs">
                      <span className="font-mono font-bold text-primary mr-1">[{p.code}]</span>
                      <span>{p.name} ({p.country})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                <Anchor className="h-3.5 w-3.5 text-blue-500" />
                Cảng dỡ / Sân bay đến (POD) <span className="text-rose-500">*</span>
              </label>
              <Select
                value={formData.podPort}
                onValueChange={(val) => setFormData({ ...formData, podPort: val })}
              >
                <SelectTrigger className="h-8 text-xs bg-card">
                  <SelectValue placeholder="Chọn cảng đến..." />
                </SelectTrigger>
                <SelectContent>
                  {ports.map((p) => (
                    <SelectItem key={p.code} value={`${p.code} - ${p.name}`} className="text-xs">
                      <span className="font-mono font-bold text-blue-500 mr-1">[{p.code}]</span>
                      <span>{p.name} ({p.country})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 4. Ngày ETD / ETA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Ngày khởi hành dự kiến (ETD)</label>
              <Input
                type="date"
                value={formData.etdDate}
                onChange={(e) => setFormData({ ...formData, etdDate: e.target.value })}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Ngày cập cảng dự kiến (ETA)</label>
              <Input
                type="date"
                value={formData.etaDate}
                onChange={(e) => setFormData({ ...formData, etaDate: e.target.value })}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          {/* 5. Vận đơn B/L & Container */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Số vận đơn (B/L / AWB)</label>
              <Input
                value={formData.blAwbNumber}
                onChange={(e) => setFormData({ ...formData, blAwbNumber: e.target.value.toUpperCase() })}
                placeholder="MAEU982180421"
                className="h-8 text-xs font-mono uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Số Container</label>
              <Input
                value={formData.containerNumber}
                onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value.toUpperCase() })}
                placeholder="MSKU8841920"
                className="h-8 text-xs font-mono uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Số Chì (Seal No)</label>
              <Input
                value={formData.sealNumber}
                onChange={(e) => setFormData({ ...formData, sealNumber: e.target.value.toUpperCase() })}
                placeholder="ML-VN98412"
                className="h-8 text-xs font-mono uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Loại Container</label>
              <Select
                value={formData.containerType}
                onValueChange={(val) => setFormData({ ...formData, containerType: val })}
              >
                <SelectTrigger className="h-8 text-xs font-mono font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20GP">20GP (20ft Thường)</SelectItem>
                  <SelectItem value="40GP">40GP (40ft Thường)</SelectItem>
                  <SelectItem value="40HC">40HC (40ft Cao)</SelectItem>
                  <SelectItem value="20RF">20RF (20ft Lạnh)</SelectItem>
                  <SelectItem value="40RF">40RF (40ft Lạnh)</SelectItem>
                  <SelectItem value="ULD Air Pallet">Pallet Hàng không</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 6. Trọng lượng & Thể tích & Cước */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Trọng lượng (Gross KG)</label>
              <Input
                type="number"
                value={formData.grossWeightKg}
                onChange={(e) => setFormData({ ...formData, grossWeightKg: Number(e.target.value) })}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Thể tích (CBM)</label>
              <Input
                type="number"
                step="0.1"
                value={formData.cbmVolume}
                onChange={(e) => setFormData({ ...formData, cbmVolume: Number(e.target.value) })}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Tiền tệ cước</label>
              <Select
                value={formData.currency}
                onValueChange={(val) => setFormData({ ...formData, currency: val })}
              >
                <SelectTrigger className="h-8 text-xs font-mono font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="CNY">CNY (¥)</SelectItem>
                  <SelectItem value="VND">VND (₫)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Giá cước quốc tế</label>
              <Input
                type="number"
                value={formData.freightAmount}
                onChange={(e) => setFormData({ ...formData, freightAmount: Number(e.target.value) })}
                className="h-8 text-xs font-mono font-semibold"
              />
            </div>
          </div>

          {/* 7. Shipper & Consignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Người gửi hàng (Shipper)</label>
              <Input
                value={formData.shipperName}
                onChange={(e) => setFormData({ ...formData, shipperName: e.target.value })}
                placeholder="Tập đoàn xuất khẩu..."
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Người nhận hàng (Consignee)</label>
              <Input
                value={formData.consigneeName}
                onChange={(e) => setFormData({ ...formData, consigneeName: e.target.value })}
                placeholder="Công ty đối tác nước ngoài..."
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Ghi chú vận hành</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Yêu cầu hun trùng, kiểm dịch, đóng pallet hun khói hoặc giờ cut-off SI..."
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-border sticky bottom-0 bg-card py-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="font-semibold">
              {isSubmitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo lô hàng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
