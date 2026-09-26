import React, { useState, useEffect } from 'react';
import {
  Boxes,
  RotateCw,
  Printer,
  Package,
} from 'lucide-react';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from '@/shared/components/feedback/Toast';
import { playSound } from '@/shared/utils/soundEffects';
import { useOrders } from '@/modules/orders/hooks/useOrders';
import { TRUCK_PRESETS } from '../types/load3d';
import { optimize3DLoad } from '../utils/loadOptimizerEngine';
import { Cargo3DCanvas } from '../components/load3d/Cargo3DCanvas';
import { AxleLoadIndicator } from '../components/load3d/AxleLoadIndicator';
import { CargoInputPanel } from '../components/load3d/CargoInputPanel';
import { StackingGuideModal } from '../components/load3d/StackingGuideModal';
import { SelectOrdersModal } from '../components/load3d/SelectOrdersModal';
import { ConfirmDispatchTripModal } from '../components/load3d/ConfirmDispatchTripModal';
import type {
  VehicleContainerPreset,
  CargoItemInput,
  LoadOptimizationResult,
  PlacedCargoBox,
} from '../types/load3d';

// Chuyển đổi đơn hàng thật từ database PostgreSQL thành kiện hàng 3D
function convertRealOrdersToCargo(orders: any[]): CargoItemInput[] {
  const result: CargoItemInput[] = [];
  const stopColors = ['#059669', '#D97706', '#1E40AF', '#7C3AED', '#DC2626', '#0891B2'];

  orders.forEach((order, ordIdx) => {
    const stopIndex = (ordIdx % 3) + 1;
    const color = stopColors[stopIndex - 1] || '#3B82F6';

    if (order.items && order.items.length > 0) {
      order.items.forEach((item: any, itemIdx: number) => {
        const sideCm = Math.round(Math.cbrt((item.volume || 0.05) * 1000000));
        const lengthCm = Math.max(30, Math.min(100, Math.round(sideCm * 1.2)));
        const widthCm = Math.max(25, Math.min(80, Math.round(sideCm * 0.9)));
        const heightCm = Math.max(20, Math.min(80, Math.round(sideCm * 0.9)));

        result.push({
          id: `cargo-${order.id}-${itemIdx}`,
          orderCode: `${order.orderCode} (#${itemIdx + 1})`,
          customerName: order.receiverName || order.customerName,
          destination: order.receiverAddress || 'Hà Nội',
          stopIndex,
          lengthCm,
          widthCm,
          heightCm,
          weightKg: Math.max(5, Math.round(item.weight || 20)),
          color,
          isFragile: Boolean(item.isFragile),
          allowRotate: true,
        });
      });
    } else {
      const packageCount = Math.max(1, Math.min(4, Math.ceil((order.totalWeight || 50) / 50)));
      const weightPerPkg = Math.round((order.totalWeight || 50) / packageCount);

      for (let i = 1; i <= packageCount; i++) {
        result.push({
          id: `cargo-${order.id}-${i}`,
          orderCode: `${order.orderCode} [Kiện ${i}/${packageCount}]`,
          customerName: order.receiverName || order.customerName,
          destination: order.receiverAddress || 'Hà Nội',
          stopIndex,
          lengthCm: 60 + (i % 2) * 15,
          widthCm: 45 + (i % 2) * 10,
          heightCm: 40 + (i % 3) * 10,
          weightKg: weightPerPkg || 30,
          color,
          isFragile: order.priority === 'URGENT' || i === packageCount,
          allowRotate: true,
        });
      }
    }
  });

  return result;
}

export const CargoLoadOptimizerPage: React.FC = () => {
  usePageTitle('Mô Phỏng Xếp Hàng 3D & Tải Trọng Trục — VietRoute');

  // Lấy danh sách đơn hàng thực tế từ cơ sở dữ liệu PostgreSQL
  const { orders } = useOrders();
  const realOrders = orders || [];

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleContainerPreset>(TRUCK_PRESETS[1]); // Hyundai Mighty 3.5T
  const [cargoItems, setCargoItems] = useState<CargoItemInput[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<LoadOptimizationResult | null>(null);
  const [selectedBox, setSelectedBox] = useState<PlacedCargoBox | null>(null);
  const [hasInitializedWithRealData, setHasInitializedWithRealData] = useState(false);

  // Modals state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSelectOrdersModalOpen, setIsSelectOrdersModalOpen] = useState(false);
  const [isConfirmDispatchOpen, setIsConfirmDispatchOpen] = useState(false);

  // Tự động nạp toàn bộ đơn hàng thật từ database PostgreSQL khi tải trang
  useEffect(() => {
    if (realOrders.length > 0 && !hasInitializedWithRealData) {
      const realItems = convertRealOrdersToCargo(realOrders);
      setCargoItems(realItems);
      const result = optimize3DLoad(selectedVehicle, realItems);
      setOptimizationResult(result);
      setHasInitializedWithRealData(true);
    }
  }, [realOrders, selectedVehicle, hasInitializedWithRealData]);

  // Chạy tối ưu hóa xếp hàng 3D
  const runOptimization = () => {
    if (cargoItems.length === 0) {
      toast.warning('Chưa có kiện hàng nào để tính toán');
      return;
    }
    const result = optimize3DLoad(selectedVehicle, cargoItems);
    setOptimizationResult(result);
    playSound('SUCCESS');
    toast.success(
      'Tối ưu hóa xếp hàng 3D thành công!',
      `Đã xếp ${result.placedBoxes.length}/${cargoItems.length} kiện hàng từ database. Thể tích sử dụng: ${result.analysis.volumeUtilizationPercent}%.`
    );
  };

  // Cập nhật kết quả khi đổi loại phương tiện
  useEffect(() => {
    if (cargoItems.length > 0) {
      const result = optimize3DLoad(selectedVehicle, cargoItems);
      setOptimizationResult(result);
    }
  }, [selectedVehicle]);

  // Nạp danh sách kiện hàng thật từ đơn hàng được chọn trong kho
  const handleImportRealOrders = (importedItems: CargoItemInput[]) => {
    setCargoItems(importedItems);
    const result = optimize3DLoad(selectedVehicle, importedItems);
    setOptimizationResult(result);
    playSound('SUCCESS');
    toast.success(
      'Đã nạp đơn hàng thực tế từ PostgreSQL!',
      `Đã chuyển đổi ${importedItems.length} kiện hàng từ các vận đơn được chọn và tối ưu hóa vị trí LIFO.`
    );
  };

  // Thêm kiện hàng mới
  const handleAddCargoItem = () => {
    const randomStop = Math.floor(1 + Math.random() * 3);
    const colors = ['#1E40AF', '#D97706', '#059669', '#7C3AED', '#DC2626'];
    const newItem: CargoItemInput = {
      id: `item-${Date.now()}`,
      orderCode: `VR-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName: 'Khách hàng vận chuyển',
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
    const nextItems = [...cargoItems, newItem];
    setCargoItems(nextItems);
    const result = optimize3DLoad(selectedVehicle, nextItems);
    setOptimizationResult(result);
    toast.info('Đã thêm 1 kiện', 'Đã tự động tính toán lại vị trí');
  };

  // Xóa kiện hàng
  const handleRemoveCargoItem = (id: string) => {
    const nextItems = cargoItems.filter((item) => item.id !== id);
    setCargoItems(nextItems);
    if (nextItems.length > 0) {
      setOptimizationResult(optimize3DLoad(selectedVehicle, nextItems));
    } else {
      setOptimizationResult(null);
    }
  };

  // Nạp toàn bộ đơn hàng thật từ database PostgreSQL
  const handleLoadAllDbOrders = () => {
    if (realOrders.length === 0) {
      toast.warning('Chưa có đơn hàng nào trong cơ sở dữ liệu');
      return;
    }
    const realItems = convertRealOrdersToCargo(realOrders);
    setCargoItems(realItems);
    const result = optimize3DLoad(selectedVehicle, realItems);
    setOptimizationResult(result);
    toast.success('Đã nạp toàn bộ đơn hàng từ PostgreSQL', `Đã chuyển đổi ${realItems.length} kiện hàng thật`);
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
                Thực Tế Vận Hành
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
                Quy Chuẩn LIFO
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Mô phỏng 3D thể tích thùng xe tải & container, triệt tiêu quá tải trục cầu và tự động xuất lệnh bốc dỡ cho kho vận
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => setIsSelectOrdersModalOpen(true)}
            className="h-9 text-xs gap-1.5 font-bold cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <Package className="h-3.5 w-3.5" />
            Nạp đơn hàng từ kho
          </Button>
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
            onLoadDemoBatch={handleLoadAllDbOrders}
            onOpenSelectOrdersModal={() => setIsSelectOrdersModalOpen(true)}
            onRunOptimization={runOptimization}
            onOpenDispatchConfirm={() => setIsConfirmDispatchOpen(true)}
            onPrintGuide={() => setIsPrintModalOpen(true)}
          />
        </div>
      </div>

      {/* 3. Modal Nạp Đơn Hàng Thực Tế Trong Kho */}
      <SelectOrdersModal
        isOpen={isSelectOrdersModalOpen}
        onClose={() => setIsSelectOrdersModalOpen(false)}
        availableOrders={realOrders}
        onImportOrders={handleImportRealOrders}
      />

      {/* 4. Modal In Sơ Đồ Bốc Xếp Cho Tài Xế & Thủ Kho */}
      <StackingGuideModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        result={optimizationResult}
      />

      {/* 5. Modal Xác Nhận & Xuất Lệnh Điều Phối Chuyến Xe */}
      <ConfirmDispatchTripModal
        isOpen={isConfirmDispatchOpen}
        onClose={() => setIsConfirmDispatchOpen(false)}
        result={optimizationResult}
        selectedVehicle={selectedVehicle}
        onDispatchSuccess={() => {
          // Callback sau khi điều phối thành công
        }}
      />
    </PageContainer>
  );
};
