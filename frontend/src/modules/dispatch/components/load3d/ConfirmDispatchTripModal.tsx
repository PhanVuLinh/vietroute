import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  Barcode,
  Navigation,
} from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';
import { playSound } from '@/shared/utils/soundEffects';
import type { LoadOptimizationResult, VehicleContainerPreset } from '../../types/load3d';

interface ConfirmDispatchTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: LoadOptimizationResult | null;
  selectedVehicle: VehicleContainerPreset;
  onDispatchSuccess?: () => void;
}

export const ConfirmDispatchTripModal: React.FC<ConfirmDispatchTripModalProps> = ({
  isOpen,
  onClose,
  result,
  selectedVehicle,
  onDispatchSuccess,
}) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const [tripCode] = useState(`TRIP-2026-${Math.floor(1000 + Math.random() * 9000)}`);

  if (!result) return null;

  const handleConfirmDispatch = async () => {
    setIsProcessing(true);
    try {
      // Giả lập lưu vào backend / phát sóng socket
      await new Promise((res) => setTimeout(res, 800));

      playSound('COMPLETE');
      setIsDispatched(true);
      toast.success(
        'Đã tạo Chuyến xe điều phối thành công!',
        `Chuyến xe ${tripCode} đã được kích hoạt. Sơ đồ bốc xếp 3D đã đồng bộ sang Trạm WMS Kiosk.`
      );
      if (onDispatchSuccess) onDispatchSuccess();
    } catch {
      toast.error('Có lỗi xảy ra', 'Không thể tạo chuyến điều phối.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-border/80">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-5 text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <Badge className="bg-white/20 text-white border-none text-[10px] font-bold">
                <ShieldCheck className="h-3 w-3 mr-1 inline" /> XÁC NHẬN ĐIỀU PHỐI VẬN TẢI
              </Badge>
              <span className="font-mono text-xs text-blue-100">{tripCode}</span>
            </div>
            <DialogTitle className="text-lg font-black text-white mt-1">
              Phê Duyệt Sơ Đồ Xếp Xe 3D & Kích Hoạt Chuyến Hàng
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-xs">
              Phương tiện: <strong className="text-white">{selectedVehicle.name}</strong> • Sức chứa:{' '}
              {selectedVehicle.maxWeightKg.toLocaleString('vi-VN')} kg
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-4">
          {!isDispatched ? (
            <>
              {/* Thống số tải trọng kiểm duyệt */}
              <div className="grid grid-cols-3 gap-2 text-center p-3 bg-muted/40 rounded-xl border border-border/60 text-xs">
                <div>
                  <div className="text-muted-foreground text-[10px]">Số kiện bốc xếp:</div>
                  <strong className="text-foreground text-sm">{result.placedBoxes.length} kiện</strong>
                </div>
                <div>
                  <div className="text-muted-foreground text-[10px]">Tải trọng hàng:</div>
                  <strong className="text-primary text-sm">{result.analysis.totalCargoWeightKg.toLocaleString('vi-VN')} kg</strong>
                </div>
                <div>
                  <div className="text-muted-foreground text-[10px]">Độ lấp đầy thể tích:</div>
                  <strong className="text-emerald-600 text-sm">{result.analysis.volumeUtilizationPercent}%</strong>
                </div>
              </div>

              {/* Thông tin Cân bằng trục */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1.5 text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Trọng tâm & Tải trọng trục an toàn tuyệt đối ({result.analysis.stabilityScore}/100 điểm)</span>
                </div>
                <div className="text-[11px] text-muted-foreground pl-5.5">
                  Cầu trước: {result.analysis.frontAxleLoadKg} kg • Cầu sau: {result.analysis.rearAxleLoadKg} kg. Đảm bảo quy chuẩn giao thông đường bộ.
                </div>
              </div>

              {/* Cam kết quy trình LIFO */}
              <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-xl border border-border/50">
                <div className="font-semibold text-foreground">Cam kết bốc dỡ LIFO tự động:</div>
                <p className="text-[11px]">
                  Các kiện hàng giao tại Điểm dừng đầu tiên (Stop 1) đã được bố trí sát cửa thùng xe. Thủ kho quét mã Barcode tại cửa Dock sẽ nhận chỉ dẫn bốc đúng theo trình tự từ sâu bên trong ra ngoài.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="default" onClick={onClose} className="flex-1 h-10 text-xs cursor-pointer">
                  Hủy & Xem lại
                </Button>
                <Button
                  size="default"
                  onClick={handleConfirmDispatch}
                  disabled={isProcessing}
                  className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-2 cursor-pointer shadow-md"
                >
                  <Zap className="h-4 w-4" />
                  {isProcessing ? 'Đang kích hoạt chuyến xe...' : 'Xác Nhận & Xuất Lệnh Điều Phối'}
                </Button>
              </div>
            </>
          ) : (
            /* Khi đã điều phối thành công */
            <div className="text-center py-4 space-y-4">
              <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">
                  KÍCH HOẠT CHUYẾN XE {tripCode} THÀNH CÔNG!
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  Sơ đồ xếp hàng 3D và danh mục kiện hàng đã được gửi trực tiếp đến Trạm Quét WMS Kiosk và App Tài xế.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    navigate('/warehouses');
                  }}
                  className="h-10 text-xs gap-1.5 cursor-pointer font-semibold"
                >
                  <Barcode className="h-4 w-4 text-primary" />
                  Sang Trạm Quét WMS Kiosk
                </Button>

                <Button
                  onClick={() => {
                    onClose();
                    navigate('/dispatch');
                  }}
                  className="h-10 text-xs gap-1.5 cursor-pointer font-semibold bg-primary text-primary-foreground shadow-md"
                >
                  <Navigation className="h-4 w-4" />
                  Xem Bảng Điều Phối Xe
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
