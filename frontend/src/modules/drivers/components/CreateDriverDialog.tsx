import React, { useState, useEffect } from "react";
import { UserPlus, Edit, Save, AlertCircle, User, ShieldCheck, Truck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { StaffSelect } from "@/modules/staff/components/StaffSelect";
import type { Driver, DriverStatus, Vehicle } from "@/core/types/logistics";
import type { EnrichedDriver } from "../hooks/useDrivers";

interface CreateDriverDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingDriver?: EnrichedDriver | null;
  vehicles: Vehicle[];
  onSubmit: (driverData: Omit<Driver, "id">, driverId?: string) => Promise<void>;
}

export const CreateDriverDialog: React.FC<CreateDriverDialogProps> = ({
  isOpen,
  onClose,
  editingDriver,
  vehicles,
  onSubmit,
}) => {
  const isEditMode = Boolean(editingDriver);

  const [fullName, setFullName] = useState("");
  const [driverCode, setDriverCode] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseType, setLicenseType] = useState<"B2" | "C" | "D" | "E" | "FC">("B2");
  const [licenseExpiredAt, setLicenseExpiredAt] = useState("");
  const [status, setStatus] = useState<DriverStatus>("AVAILABLE");
  const [currentVehicleId, setCurrentVehicleId] = useState<string>("NONE");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load form khi mở modal hoặc thay đổi editingDriver
  useEffect(() => {
    if (editingDriver) {
      setFullName(editingDriver.fullName);
      setDriverCode(editingDriver.driverCode);
      setPhone(editingDriver.phone);
      setLicenseNumber(editingDriver.licenseNumber);
      setLicenseType(editingDriver.licenseType);
      setLicenseExpiredAt(editingDriver.licenseExpiredAt);
      setStatus(editingDriver.status);
      setCurrentVehicleId(editingDriver.currentVehicleId || "NONE");
    } else {
      setFullName("");
      const randNum = Math.floor(10 + Math.random() * 90);
      setDriverCode(`TX-HAN-${randNum}`);
      setPhone("");
      setLicenseNumber("");
      setLicenseType("B2");
      // Mặc định hạn 5 năm sau
      const d = new Date();
      d.setFullYear(d.getFullYear() + 5);
      setLicenseExpiredAt(d.toISOString().split("T")[0]);
      setStatus("AVAILABLE");
      setCurrentVehicleId("NONE");
    }
    setError(null);
  }, [editingDriver, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ và tên tài xế.");
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      setError("Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9-10 chữ số).");
      return;
    }
    if (!licenseNumber.trim()) {
      setError("Vui lòng nhập số giấy phép lái xe.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const driverPayload: Omit<Driver, "id"> = {
        userId: editingDriver?.userId || `usr-${Date.now()}`,
        driverCode: driverCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        licenseNumber: licenseNumber.trim(),
        licenseType,
        licenseExpiredAt: licenseExpiredAt || "2030-01-01",
        status,
        currentLocation: editingDriver?.currentLocation || [105.8544, 21.0285],
        currentVehicleId: currentVehicleId === "NONE" ? undefined : currentVehicleId,
        currentDeliveryCount: editingDriver?.currentDeliveryCount || 0,
        todayCompletedDeliveries: editingDriver?.todayCompletedDeliveries || 0,
        onTimeRate: editingDriver?.onTimeRate || 98.0,
        successRate: editingDriver?.successRate || 99.0,
      };

      await onSubmit(driverPayload, editingDriver?.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi lưu hồ sơ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3 border-b border-border">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              {isEditMode ? (
                <>
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Edit className="h-4 w-4" />
                  </div>
                  Chỉnh sửa hồ sơ tài xế
                </>
              ) : (
                <>
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  Thêm mới tài xế vào đội ngũ vận hành
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {isEditMode
                ? "Cập nhật thông tin cá nhân, giấy phép lái xe và phân công phương tiện phụ trách."
                : "Khai báo đầy đủ hồ sơ tài xế để phân bổ ca trực và điều phối đơn hàng tự động."}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="my-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5 py-4">
            {/* 1. Thông tin cá nhân */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <User className="h-4 w-4 text-primary" />
                1. Thông tin cá nhân & Định danh
              </h4>
              <div className="space-y-1 mb-2">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Chọn từ danh sách nhân sự nội bộ</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Tự động điền họ tên & số điện thoại</span>
                </label>
                <StaffSelect
                  value={fullName}
                  roleFilter={["DRIVER", "DISPATCHER"]}
                  placeholder="Tìm theo tên, email, SĐT hoặc mã nhân viên..."
                  onSelectStaff={(staff) => {
                    setFullName(staff.fullName);
                    if (staff.phone) setPhone(staff.phone);
                  }}
                  onClear={() => {
                    setFullName("");
                    setPhone("");
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">
                    Họ và tên tài xế <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="Nguyễn Văn An"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Mã tài xế <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="TX-HAN-01"
                    value={driverCode}
                    onChange={(e) => setDriverCode(e.target.value.toUpperCase())}
                    className="h-9 text-xs font-mono uppercase font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Số điện thoại liên hệ <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="0971001001"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Trạng thái trực tuyến ban đầu
                  </label>
                  <Select
                    value={status}
                    onValueChange={(val: DriverStatus) => setStatus(val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE" className="text-xs">Sẵn sàng nhận đơn</SelectItem>
                      <SelectItem value="BUSY" className="text-xs">Đang giao hàng</SelectItem>
                      <SelectItem value="ON_BREAK" className="text-xs">Nghỉ ca</SelectItem>
                      <SelectItem value="OFFLINE" className="text-xs">Ngoại tuyến (Offline)</SelectItem>
                      <SelectItem value="SUSPENDED" className="text-xs">Tạm khóa tài khoản</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 2. Giấy phép lái xe */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                2. Hồ sơ giấy phép lái xe (GPLX)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Hạng GPLX <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={licenseType}
                    onValueChange={(val: "B2" | "C" | "D" | "E" | "FC") => setLicenseType(val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Hạng GPLX" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B2" className="text-xs">Hạng B2 (Xe con / Tải nhẹ &lt; 3.5T)</SelectItem>
                      <SelectItem value="C" className="text-xs">Hạng C (Xe tải từ 3.5T trở lên)</SelectItem>
                      <SelectItem value="D" className="text-xs">Hạng D</SelectItem>
                      <SelectItem value="E" className="text-xs">Hạng E</SelectItem>
                      <SelectItem value="FC" className="text-xs">Hạng FC (Xe đầu kéo / Container)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Số hiệu GPLX <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="010192837465"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="h-9 text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Ngày hết hạn bằng lái
                  </label>
                  <Input
                    type="date"
                    value={licenseExpiredAt}
                    onChange={(e) => setLicenseExpiredAt(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. Phân công phương tiện */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <Truck className="h-4 w-4 text-primary" />
                3. Phân công phương tiện vận chuyển
              </h4>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Phương tiện phụ trách chính
                </label>
                <Select
                  value={currentVehicleId}
                  onValueChange={(val) => setCurrentVehicleId(val)}
                >
                  <SelectTrigger className="h-9 text-xs font-mono">
                    <SelectValue placeholder="Chọn xe phân công" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE" className="text-xs font-sans">Chưa phân công xe cố định</SelectItem>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="text-xs font-mono">
                        {v.licensePlate} — {v.type} ({v.brand} {v.model}) • Tải: {v.capacityWeight}kg
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Có thể thay đổi xe linh hoạt trong trung tâm điều phối bất kỳ lúc nào.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-3 border-t border-border flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs px-4 cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-semibold gap-1.5 px-5 shadow-xs shadow-primary/25 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              {isSubmitting
                ? "Đang lưu..."
                : isEditMode
                ? "Cập nhật hồ sơ"
                : "Lưu & Tạo tài xế"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
