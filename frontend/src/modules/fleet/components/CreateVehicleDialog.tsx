import React, { useState, useEffect } from "react";
import { Truck, Edit, Save, AlertCircle, Gauge, Calendar, User } from "lucide-react";
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
import type { Vehicle, VehicleStatus, VehicleType, Driver } from "@/core/types/logistics";
import type { EnrichedVehicle } from "../hooks/useVehicles";

interface CreateVehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingVehicle?: EnrichedVehicle | null;
  drivers: Driver[];
  onSubmit: (vehicleData: Omit<Vehicle, "id">, vehicleId?: string) => Promise<void>;
}

export const CreateVehicleDialog: React.FC<CreateVehicleDialogProps> = ({
  isOpen,
  onClose,
  editingVehicle,
  drivers,
  onSubmit,
}) => {
  const isEditMode = Boolean(editingVehicle);

  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleCode, setVehicleCode] = useState("");
  const [type, setType] = useState<VehicleType>("TRUCK");
  const [brand, setBrand] = useState("Isuzu");
  const [model, setModel] = useState("");
  const [capacityWeight, setCapacityWeight] = useState<number>(2500);
  const [capacityVolume, setCapacityVolume] = useState<number>(15.0);
  const [currentMileage, setCurrentMileage] = useState<number>(10000);
  const [fuelPercent, setFuelPercent] = useState<number>(85);
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState("");
  const [status, setStatus] = useState<VehicleStatus>("AVAILABLE");
  const [driverId, setDriverId] = useState<string>("NONE");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingVehicle) {
      setLicensePlate(editingVehicle.licensePlate);
      setVehicleCode(editingVehicle.vehicleCode);
      setType(editingVehicle.type);
      setBrand(editingVehicle.brand);
      setModel(editingVehicle.model);
      setCapacityWeight(editingVehicle.capacityWeight);
      setCapacityVolume(editingVehicle.capacityVolume);
      setCurrentMileage(editingVehicle.currentMileage);
      setFuelPercent(editingVehicle.fuelPercent);
      setNextMaintenanceDate(editingVehicle.nextMaintenanceDate);
      setStatus(editingVehicle.status);
      setDriverId(editingVehicle.driverId || "NONE");
    } else {
      setLicensePlate("");
      const rand = Math.floor(10 + Math.random() * 90);
      setVehicleCode(`XE-TRK-${rand}`);
      setType("TRUCK");
      setBrand("Isuzu");
      setModel("Forward 5 Tấn");
      setCapacityWeight(5000);
      setCapacityVolume(22.0);
      setCurrentMileage(15000);
      setFuelPercent(80);
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      setNextMaintenanceDate(d.toISOString().split("T")[0]);
      setStatus("AVAILABLE");
      setDriverId("NONE");
    }
    setError(null);
  }, [editingVehicle, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate.trim()) {
      setError("Vui lòng nhập biển kiểm soát xe.");
      return;
    }
    if (!model.trim()) {
      setError("Vui lòng nhập thông tin mẫu xe / model.");
      return;
    }
    if (capacityWeight <= 0) {
      setError("Tải trọng định mức phải lớn hơn 0 kg.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: Omit<Vehicle, "id"> = {
        vehicleCode: vehicleCode.trim().toUpperCase(),
        licensePlate: licensePlate.trim().toUpperCase(),
        type,
        brand: brand.trim(),
        model: model.trim(),
        capacityWeight: Number(capacityWeight),
        capacityVolume: Number(capacityVolume),
        currentMileage: Number(currentMileage),
        fuelPercent: Number(fuelPercent),
        nextMaintenanceDate: nextMaintenanceDate || "2026-12-31",
        status,
        driverId: driverId === "NONE" ? undefined : driverId,
      };

      await onSubmit(payload, editingVehicle?.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi lưu phương tiện.");
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
                  Cập nhật thông tin phương tiện
                </>
              ) : (
                <>
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Truck className="h-4 w-4" />
                  </div>
                  Đăng ký phương tiện mới vào đội xe
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {isEditMode
                ? "Chỉnh sửa thông số kỹ thuật, hạn bảo dưỡng và tài xế phụ trách."
                : "Khai báo biển số, dòng xe và tải trọng định mức để đưa xe vào luồng điều phối."}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="my-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5 py-4">
            {/* 1. Thông tin biển số & Nhận diện xe */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <Truck className="h-4 w-4 text-primary" />
                1. Biển kiểm soát & Nhận diện xe
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Biển số xe <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="29C-123.45"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                    className="h-9 text-xs font-mono uppercase font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Mã quản lý xe <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="XE-TRK-01"
                    value={vehicleCode}
                    onChange={(e) => setVehicleCode(e.target.value.toUpperCase())}
                    className="h-9 text-xs font-mono uppercase"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Phân loại phương tiện
                  </label>
                  <Select value={type} onValueChange={(val: VehicleType) => setType(val)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Chọn loại xe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRUCK" className="text-xs">Xe tải</SelectItem>
                      <SelectItem value="VAN" className="text-xs">Xe Van</SelectItem>
                      <SelectItem value="CAR" className="text-xs">Xe bán tải/con</SelectItem>
                      <SelectItem value="MOTORBIKE" className="text-xs">Xe máy giao nhanh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Hãng sản xuất <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="Hino, Isuzu, Ford, Hyundai..."
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Tên mẫu xe (Model) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="FC9J 5 Tấn, Transit Van 1.25T..."
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Thông số kỹ thuật & Tải trọng */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <Gauge className="h-4 w-4 text-emerald-500" />
                2. Thông số tải trọng & Trạng thái máy móc
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Tải trọng (kg) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={capacityWeight}
                    onChange={(e) => setCapacityWeight(Number(e.target.value))}
                    className="h-9 text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Thể tích thùng (m³)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={capacityVolume}
                    onChange={(e) => setCapacityVolume(Number(e.target.value))}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Đồng hồ ODO (km)
                  </label>
                  <Input
                    type="number"
                    value={currentMileage}
                    onChange={(e) => setCurrentMileage(Number(e.target.value))}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Nhiên liệu (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={fuelPercent}
                    onChange={(e) => setFuelPercent(Number(e.target.value))}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. Lịch bảo dưỡng & Phân công tài xế */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <Calendar className="h-4 w-4 text-amber-500" />
                3. Lịch bảo dưỡng & Phân công điều hành
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Lần bảo dưỡng kế tiếp
                  </label>
                  <Input
                    type="date"
                    value={nextMaintenanceDate}
                    onChange={(e) => setNextMaintenanceDate(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Trạng thái vận hành
                  </label>
                  <Select value={status} onValueChange={(val: VehicleStatus) => setStatus(val)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE" className="text-xs">Sẵn sàng điều động</SelectItem>
                      <SelectItem value="EN_ROUTE" className="text-xs">Đang chạy tuyến</SelectItem>
                      <SelectItem value="LOADING" className="text-xs">Bốc dỡ hàng</SelectItem>
                      <SelectItem value="MAINTENANCE" className="text-xs">Đang bảo dưỡng</SelectItem>
                      <SelectItem value="OFFLINE" className="text-xs">Không khả dụng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Tài xế quản lý xe
                  </label>
                  <Select value={driverId} onValueChange={(val) => setDriverId(val)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Chọn tài xế" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE" className="text-xs">Chưa phân công</SelectItem>
                      {drivers.map((d) => (
                        <SelectItem key={d.id} value={d.id} className="text-xs">
                          {d.fullName} ({d.driverCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                ? "Cập nhật phương tiện"
                : "Đăng ký xe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
