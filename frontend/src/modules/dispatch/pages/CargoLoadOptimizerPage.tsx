import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Truck,
  RotateCw,
  Printer,
  Sparkles,
  ShieldCheck,
  Scale,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from '@/shared/components/feedback/Toast';
import { playSound } from '@/shared/utils/soundEffects';
import { TRUCK_PRESETS } from '../types/load3d';
import {
  optimize3DLoad,
  generateDemoCargoBatch,
} from '../utils/loadOptimizerEngine';
import { Cargo3DCanvas } from '../components/load3d/Cargo3DCanvas';
import { AxleLoadIndicator } from '../components/load3d/AxleLoadIndicator';
import { CargoInputPanel } from '../components/load3d/CargoInputPanel';
import { StackingGuideModal } from '../components/load3d/StackingGuideModal';
import type {
  VehicleContainerPreset,
  CargoItemInput,
  LoadOptimizationResult,
  PlacedCargoBox,
} from '../types/load3d';

export const CargoLoadOptimizerPage: React.FC = () => {
  usePageTitle('Mô Phỏng Xếp Hàng 3D & Tải Trọng Trục — VietRoute');

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleContainerPreset>(TRUCK_PRESETS[1]); // Hyundai Mighty 3.5T
  const [cargoItems, setCargoItems] = useState<CargoItemInput[]>(generateDemoCargoBatch());
  const [optimizationResult, setOptimizationResult] = useState<LoadOptimizationResult | null>(null);
  const [selectedBox, setSelectedBox] = useState<PlacedCargoBox | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Chạy tối ưu hóa xếp hàng 3D
  const runOptimization = () => {
    const result = optimize3DLoad(selectedVehicle, cargoItems);
    setOptimizationResult(result);
    playSound('SUCCESS');
    toast.success(
      'Tối ưu hóa xếp hàng 3D thành công!',
      `Đã xếp ${result.placedBoxes.length}/${cargoItems.length} kiện hàng. Thể tích sử dụng: ${result.analysis.volumeUtilizationPercent}%.`
    );
  };

  // Khởi chạy tối ưu lần đầu
  useEffect(() => {
    runOptimization();
  }, [selectedVehicle]);

  // Thêm kiện hàng mới
  const handleAddCargoItem = () => {
    const randomStop = Math.floor(1 + Math.random() * 3);
    const colors = ['#1E40AF', '#D97706', '#059669', '#7C3AED', '#DC2626'];
    const newItem: CargoItemInput = {
      id: `item-${Date.now()}`,
      orderCode: `VR-PKG-${Math.floor(100 + Math.random() * 900)}`,
      customerName: 'Khách hàng ký gửi',
      destination: `Điểm giao #${randomStop}`,
      stopIndex: randomStop,
      lengthCm: 60,
      widthCm: 45,
      heightCm: 40,
      weightKg: 40,
      color: colors[randomStop - 1] || '#3B82F6',
      isFragile: false,
      allowRotate: true,
    };
    setCargoItems([...cargoItems, newItem]);
    toast.info('Đã thêm 1 kiện', 'Bấm "Tối Ưu Hóa Xếp Hàng 3D" để cập nhật vị trí mới');
  };

  // Xóa kiện hàng
  const handleRemoveCargoItem = (id: string) => {
    setCargoItems(cargoItems.filter((item) => item.id !== id));
  };

  // Nạp 24 kiện hàng mẫu
  const handleLoadDemoBatch = () => {
    const demo = generateDemoCargoBatch();
    setCargoItems(demo);
    const result = optimize3DLoad(selectedVehicle, demo);
    setOptimizationResult(result);
    toast.success('Đã nạp 24 kiện hàng mẫu', 'Đã phân bổ 3 điểm giao hàng theo LIFO');
  };

  return (
    <PageContainer className="space-y-5 pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Tối Ưu Xếp Hàng 3D & Phân Bổ Tải Trọng Trục
              </h1>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                3D Bin Packing AI
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Mô phỏng 3D không gian thùng xe tải & container, triệt tiêu quá tải trục cầu và tuân thủ quy chuẩn bốc dỡ LIFO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={runOptimization}
            className="h-9 text-xs gap-1.5 cursor-pointer font-semibold shadow-xs"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Tính toán lại
          </Button>
          <Button
            size="sm"
            onClick={() => setIsPrintModalOpen(true)}
            className="h-9 text-xs gap-1.5 font-semibold cursor-pointer bg-slate-800 hover:bg-slate-900 text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            In phiếu bốc xếp
          </Button>
        </div>
      </div>

      {/* 2. Main 3D Canvas & Optimization Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Cột Trái (8 cols): 3D Canvas & Thước Đo Tải Trọng */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Canvas 3D */}
          <div className="h-[520px] w-full">
            <Cargo3DCanvas
              vehicle={selectedVehicle}
              placedBoxes={optimizationResult ? optimizationResult.placedBoxes : []}
              selectedBoxId={selectedBox?.id}
              onSelectBox={setSelectedBox}
            />
          </div>

          {/* Phân Tích Tải Trọng & Trọng Tâm Trục */}
          {optimizationResult && (
            <AxleLoadIndicator
              vehicle={selectedVehicle}
              analysis={optimizationResult.analysis}
            />
          )}
        </div>

        {/* Cột Phải (4 cols): Bảng Điều Khiển & Danh Sách Kiện Hàng */}
        <div className="lg:col-span-4 flex flex-col">
          <CargoInputPanel
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
            cargoItems={cargoItems}
            onAddCargoItem={handleAddCargoItem}
            onRemoveCargoItem={handleRemoveCargoItem}
            onLoadDemoBatch={handleLoadDemoBatch}
            onRunOptimization={runOptimization}
            onPrintGuide={() => setIsPrintModalOpen(true)}
          />
        </div>
      </div>

      {/* 3. Modal In Sơ Đồ Bốc Xếp Cho Tài Xế & Thủ Kho */}
      <StackingGuideModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        result={optimizationResult}
      />
    </PageContainer>
  );
};
