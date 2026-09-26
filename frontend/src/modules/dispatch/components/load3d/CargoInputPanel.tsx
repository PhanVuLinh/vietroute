import React from 'react';
import {
  Boxes,
  Truck,
  Plus,
  Trash2,
  Sparkles,
  Printer,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { TRUCK_PRESETS } from '../../types/load3d';
import type { CargoItemInput, VehicleContainerPreset } from '../../types/load3d';

interface CargoInputPanelProps {
  selectedVehicle: VehicleContainerPreset;
  onSelectVehicle: (v: VehicleContainerPreset) => void;
  cargoItems: CargoItemInput[];
  onAddCargoItem: () => void;
  onRemoveCargoItem: (id: string) => void;
  onLoadDemoBatch: () => void;
  onOpenSelectOrdersModal: () => void;
  onRunOptimization: () => void;
  onOpenDispatchConfirm: () => void;
  onPrintGuide: () => void;
}

export const CargoInputPanel: React.FC<CargoInputPanelProps> = ({
  selectedVehicle,
  onSelectVehicle,
  cargoItems,
  onAddCargoItem,
  onRemoveCargoItem,
  onLoadDemoBatch,
  onOpenSelectOrdersModal,
  onRunOptimization,
  onOpenDispatchConfirm,
  onPrintGuide,
}) => {
  const totalWeight = cargoItems.reduce((sum, item) => sum + (Number(item.weightKg) || 0), 0);
  const isOverWeight = totalWeight > selectedVehicle.maxWeightKg;

  return (
    <Card className="border-border/80 shadow-sm flex flex-col h-full">
      <CardHeader className="py-3 px-4 bg-muted/40 border-b border-border/60 space-y-3">
        {/* Chọn Loại Xe Tải / Container */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <Truck className="h-4 w-4 text-primary" />
            Phương tiện / Container bốc hàng
          </label>
          <Select
            value={selectedVehicle.id}
            onValueChange={(id) => {
              const found = TRUCK_PRESETS.find((p) => p.id === id);
              if (found) onSelectVehicle(found);
            }}
          >
            <SelectTrigger className="h-9 text-xs font-medium">
              <SelectValue placeholder="Chọn loại xe" />
            </SelectTrigger>
            <SelectContent>
              {TRUCK_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id} className="text-xs">
                  <div className="font-semibold text-foreground">{preset.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {preset.lengthM}m × {preset.widthM}m × {preset.heightM}m • Tải tối đa:{' '}
                    {preset.maxWeightKg.toLocaleString('vi-VN')} kg
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Thông số khoang xe */}
        <div className="grid grid-cols-3 gap-2 bg-background p-2.5 rounded-xl border border-border/70 text-[11px] text-center">
          <div>
            <div className="text-muted-foreground text-[10px]">Dài × Rộng × Cao</div>
            <strong className="text-foreground font-mono">
              {selectedVehicle.lengthM} × {selectedVehicle.widthM} × {selectedVehicle.heightM}m
            </strong>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px]">Thể tích khoang</div>
            <strong className="text-foreground font-mono">
              {(selectedVehicle.lengthM * selectedVehicle.widthM * selectedVehicle.heightM).toFixed(1)} m³
            </strong>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px]">Tải trọng tối đa</div>
            <strong className="text-primary font-mono">
              {selectedVehicle.maxWeightKg.toLocaleString('vi-VN')} kg
            </strong>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Header Danh Sách Kiện Hàng */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-primary" />
              <span className="font-bold text-xs text-foreground">
                Danh sách kiện hàng ({cargoItems.length} kiện)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenSelectOrdersModal}
                className="h-7 px-2.5 text-[11px] gap-1 cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 font-semibold"
              >
                <Boxes className="h-3 w-3" /> Nạp đơn từ kho
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadDemoBatch}
                className="h-7 px-2 text-[11px] gap-1 cursor-pointer text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 font-semibold"
                title="Nạp toàn bộ các đơn hàng thực tế đang chờ xếp xe từ cơ sở dữ liệu PostgreSQL"
              >
                <Sparkles className="h-3 w-3" /> Nạp tất cả đơn DB
              </Button>
              <Button
                size="sm"
                onClick={onAddCargoItem}
                className="h-7 px-2 text-[11px] gap-1 cursor-pointer bg-slate-800 hover:bg-slate-900 text-white"
              >
                <Plus className="h-3 w-3" /> Thêm
              </Button>
            </div>
          </div>

          {/* Danh Sách Scrollable Kiện Hàng */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {cargoItems.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors text-xs gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="h-7 w-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: item.color }}
                  >
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-foreground truncate flex items-center gap-1">
                      <span>{item.orderCode}</span>
                      {item.isFragile && (
                        <span className="text-[10px] text-amber-500 font-semibold" title="Hàng dễ vỡ">
                          ⚠️
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {item.customerName} • Giao điểm #{item.stopIndex}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-mono font-bold text-foreground">
                      {item.weightKg} kg
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {item.lengthCm}×{item.widthCm}×{item.heightCm}cm
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCargoItem(item.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tổng kết & Nút Kích Hoạt Tối Ưu */}
        <div className="space-y-3 pt-3 border-t border-border/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tổng khối lượng hàng:</span>
            <span className={`font-mono font-bold ${isOverWeight ? 'text-red-500 font-extrabold' : 'text-foreground'}`}>
              {totalWeight.toLocaleString('vi-VN')} kg / {selectedVehicle.maxWeightKg.toLocaleString('vi-VN')} kg
            </span>
          </div>

          {isOverWeight && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[11px] text-red-600 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Cảnh báo: Tổng hàng vượt quá tải trọng xe {totalWeight - selectedVehicle.maxWeightKg} kg!</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="default"
              onClick={onRunOptimization}
              className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-2 cursor-pointer shadow-md"
            >
              <RotateCw className="h-4 w-4" />
              Tối Ưu Xếp Hàng 3D
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={onPrintGuide}
              className="h-10 text-xs px-3 gap-1.5 cursor-pointer"
              title="In sơ đồ bốc xếp cho tài xế"
            >
              <Printer className="h-4 w-4" />
              In sơ đồ
            </Button>
          </div>

          <Button
            size="default"
            onClick={onOpenDispatchConfirm}
            className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 cursor-pointer shadow-md"
          >
            <Truck className="h-4 w-4" />
            🚀 Xác Nhận Tạo Chuyến Xe Điều Phối
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
