import React, { useState, useEffect } from "react";
import {
  Building2,
  Edit,
  Save,
  AlertCircle,
  MapPin,
  Boxes,
  Clock,
  User,
  Phone,
  Mail,
  Compass,
} from "lucide-react";
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
import type {
  Warehouse,
  WarehouseStatus,
  WarehouseType,
  WarehouseRegion,
  WarehouseStorageType,
} from "@/core/types/logistics";

interface CreateWarehouseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingWarehouse?: Warehouse | null;
  onSubmit: (warehouseData: Omit<Warehouse, "id">, warehouseId?: string) => Promise<void>;
}

export const CreateWarehouseDialog: React.FC<CreateWarehouseDialogProps> = ({
  isOpen,
  onClose,
  editingWarehouse,
  onSubmit,
}) => {
  const isEditMode = Boolean(editingWarehouse);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<WarehouseType>("TRANSIT_HUB");
  const [region, setRegion] = useState<WarehouseRegion>("NORTH");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Hà Nội");
  const [latitude, setLatitude] = useState<number>(21.0285);
  const [longitude, setLongitude] = useState<number>(105.8542);
  const [openingTime, setOpeningTime] = useState("06:00");
  const [closingTime, setClosingTime] = useState("22:00");
  const [capacity, setCapacity] = useState<number>(800);
  const [usedCapacity, setUsedCapacity] = useState<number>(350);
  const [areaSqM, setAreaSqM] = useState<number>(5000);
  const [totalPallets, setTotalPallets] = useState<number>(2000);
  const [usedPallets, setUsedPallets] = useState<number>(800);
  const [dockDoors, setDockDoors] = useState<number>(6);
  const [storageType, setStorageType] = useState<WarehouseStorageType>("MIXED");
  const [managerName, setManagerName] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [status, setStatus] = useState<WarehouseStatus>("ACTIVE");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingWarehouse) {
      setCode(editingWarehouse.code);
      setName(editingWarehouse.name);
      setType(editingWarehouse.type || "TRANSIT_HUB");
      setRegion(editingWarehouse.region || "NORTH");
      setAddress(editingWarehouse.address);
      setCity(editingWarehouse.city);
      setLatitude(editingWarehouse.latitude);
      setLongitude(editingWarehouse.longitude);
      setOpeningTime(editingWarehouse.openingTime || "06:00");
      setClosingTime(editingWarehouse.closingTime || "22:00");
      setCapacity(editingWarehouse.capacity || 800);
      setUsedCapacity(editingWarehouse.usedCapacity || 0);
      setAreaSqM(editingWarehouse.areaSqM || 5000);
      setTotalPallets(editingWarehouse.totalPallets || 2000);
      setUsedPallets(editingWarehouse.usedPallets || 0);
      setDockDoors(editingWarehouse.dockDoors || 6);
      setStorageType(editingWarehouse.storageType || "MIXED");
      setManagerName(editingWarehouse.managerName || "");
      setManagerPhone(editingWarehouse.managerPhone || "");
      setManagerEmail(editingWarehouse.managerEmail || "");
      setStatus(editingWarehouse.status);
    } else {
      const rand = Math.floor(10 + Math.random() * 90);
      setCode(`HUB-NEW-${rand}`);
      setName("");
      setType("TRANSIT_HUB");
      setRegion("NORTH");
      setAddress("");
      setCity("Hà Nội");
      setLatitude(21.0285);
      setLongitude(105.8542);
      setOpeningTime("06:00");
      setClosingTime("22:00");
      setCapacity(800);
      setUsedCapacity(0);
      setAreaSqM(4500);
      setTotalPallets(1800);
      setUsedPallets(0);
      setDockDoors(6);
      setStorageType("MIXED");
      setManagerName("");
      setManagerPhone("");
      setManagerEmail("");
      setStatus("ACTIVE");
    }
    setError(null);
  }, [editingWarehouse, isOpen]);

  // Cập nhật tọa độ mặc định khi đổi thành phố
  const handleCityChange = (cityName: string) => {
    setCity(cityName);
    if (cityName === "Hà Nội") {
      setRegion("NORTH");
      setLatitude(21.0285);
      setLongitude(105.8542);
    } else if (cityName === "Hải Phòng") {
      setRegion("NORTH");
      setLatitude(20.8449);
      setLongitude(106.6881);
    } else if (cityName === "Đà Nẵng") {
      setRegion("CENTRAL");
      setLatitude(16.0544);
      setLongitude(108.2022);
    } else if (cityName === "Nha Trang") {
      setRegion("CENTRAL");
      setLatitude(12.2388);
      setLongitude(109.1967);
    } else if (cityName === "TP. Hồ Chí Minh") {
      setRegion("SOUTH");
      setLatitude(10.8231);
      setLongitude(106.6297);
    } else if (cityName === "Cần Thơ") {
      setRegion("SOUTH");
      setLatitude(10.0452);
      setLongitude(105.7469);
    } else if (cityName === "Bình Dương") {
      setRegion("SOUTH");
      setLatitude(10.9805);
      setLongitude(106.6519);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError("Vui lòng nhập mã định danh kho bãi / Hub.");
      return;
    }
    if (!name.trim()) {
      setError("Vui lòng nhập tên đầy đủ của kho bãi.");
      return;
    }
    if (!address.trim()) {
      setError("Vui lòng nhập địa chỉ chi tiết của kho.");
      return;
    }
    if (capacity <= 0) {
      setError("Sức chứa tối đa (Tấn) phải lớn hơn 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          type,
          region,
          address: address.trim(),
          city,
          latitude: Number(latitude),
          longitude: Number(longitude),
          openingTime,
          closingTime,
          capacity: Number(capacity),
          usedCapacity: Number(usedCapacity),
          areaSqM: Number(areaSqM),
          totalPallets: Number(totalPallets),
          usedPallets: Number(usedPallets),
          dockDoors: Number(dockDoors),
          storageType,
          managerName: managerName.trim() || undefined,
          managerPhone: managerPhone.trim() || undefined,
          managerEmail: managerEmail.trim() || undefined,
          status,
        },
        editingWarehouse?.id
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi lưu thông tin kho bãi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold">
              {isEditMode ? <Edit className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {isEditMode ? "Chỉnh sửa thông tin kho bãi" : "Thêm mới kho hàng / Hub trung chuyển"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditMode
                  ? "Cập nhật công suất, cổng dock, nhân sự và thông số vận hành Hub."
                  : "Đăng ký điểm trung chuyển hoặc trung tâm phân phối vào mạng lưới VietRoute."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Thông tin cơ bản */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span>1. Thông tin định danh & Phân loại Hub</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Mã kho / Hub <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="VD: HUB-HAN-01"
                  className="h-8 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Tên kho bãi <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Tổng kho Miền Bắc (Long Biên)"
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Loại hình kho Hub</label>
                <Select value={type} onValueChange={(val) => setType(val as WarehouseType)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Chọn loại hình" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CENTRAL_HUB">Tổng kho phân phối (Central)</SelectItem>
                    <SelectItem value="TRANSIT_HUB">Kho trung chuyển (Transit)</SelectItem>
                    <SelectItem value="LAST_MILE_HUB">Hub chặng cuối (Last-Mile)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Loại hình lưu kho</label>
                <Select value={storageType} onValueChange={(val) => setStorageType(val as WarehouseStorageType)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Chọn loại lưu kho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MIXED">Kho hỗn hợp (Khô + Lạnh)</SelectItem>
                    <SelectItem value="DRY">Kho khô tiêu chuẩn</SelectItem>
                    <SelectItem value="COLD">Kho lạnh / Bảo quản mát</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 2. Vị trí địa lý & Địa chỉ */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-rose-500" />
              <span>2. Vị trí địa lý & Tọa độ GPS</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Tỉnh / Thành phố</label>
                <Select value={city} onValueChange={handleCityChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Chọn thành phố" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                    <SelectItem value="Hải Phòng">Hải Phòng</SelectItem>
                    <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                    <SelectItem value="Quảng Ngãi">Quảng Ngãi</SelectItem>
                    <SelectItem value="Nha Trang">Nha Trang (Khánh Hòa)</SelectItem>
                    <SelectItem value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</SelectItem>
                    <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
                    <SelectItem value="Bình Dương">Bình Dương</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Vùng miền</label>
                <Select value={region} onValueChange={(val) => setRegion(val as WarehouseRegion)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Chọn vùng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORTH">Miền Bắc</SelectItem>
                    <SelectItem value="CENTRAL">Miền Trung</SelectItem>
                    <SelectItem value="SOUTH">Miền Nam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Trạng thái vận hành</label>
                <Select value={status} onValueChange={(val) => setStatus(val as WarehouseStatus)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Hoạt động bình thường</SelectItem>
                    <SelectItem value="MAINTENANCE">Bảo trì bến bãi</SelectItem>
                    <SelectItem value="FULL">Quá tải / Đầy tải</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Địa chỉ chi tiết <span className="text-rose-500">*</span>
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: Khu công nghiệp Đài Tư, 386 Nguyễn Văn Linh, Long Biên, Hà Nội"
                className="h-8 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div>
                <label className="text-xs font-sans font-medium text-foreground block mb-1">Vĩ độ (Latitude)</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-sans font-medium text-foreground block mb-1">Kinh độ (Longitude)</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* 3. Công suất & Quy mô */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="h-3.5 w-3.5 text-blue-500" />
              <span>3. Công suất, Ô Pallet & Cổng Dock</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Sức chứa tối đa (Tấn) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                  className="h-8 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Đã dùng (Tấn)</label>
                <Input
                  type="number"
                  value={usedCapacity}
                  onChange={(e) => setUsedCapacity(parseInt(e.target.value) || 0)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Tổng Pallet</label>
                <Input
                  type="number"
                  value={totalPallets}
                  onChange={(e) => setTotalPallets(parseInt(e.target.value) || 0)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Pallet đang xếp</label>
                <Input
                  type="number"
                  value={usedPallets}
                  onChange={(e) => setUsedPallets(parseInt(e.target.value) || 0)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Diện tích sàn (m²)</label>
                <Input
                  type="number"
                  value={areaSqM}
                  onChange={(e) => setAreaSqM(parseInt(e.target.value) || 0)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Số Cửa Dock</label>
                <Input
                  type="number"
                  value={dockDoors}
                  onChange={(e) => setDockDoors(parseInt(e.target.value) || 0)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Giờ mở cửa</label>
                <Input
                  type="text"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  placeholder="06:00"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Giờ đóng cửa</label>
                <Input
                  type="text"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  placeholder="22:00"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* 4. Ban quản lý kho */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-emerald-500" />
              <span>4. Thông tin Quản lý phụ trách</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Họ tên quản lý</label>
                <Input
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="VD: Trần Hữu Nam"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Số điện thoại / Hotline</label>
                <Input
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  placeholder="VD: 0912.834.192"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Email liên hệ</label>
                <Input
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  placeholder="VD: nam.th@vietroute.vn"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 text-xs"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 text-xs gap-1.5 font-semibold"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? "Đang lưu..." : isEditMode ? "Cập nhật kho" : "Thêm kho mới"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
