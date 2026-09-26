import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Printer, Truck, CheckCircle2 } from 'lucide-react';
import type { LoadOptimizationResult } from '../../types/load3d';

interface StackingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: LoadOptimizationResult | null;
}

export const StackingGuideModal: React.FC<StackingGuideModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!result) return null;

  const { vehicle, placedBoxes, analysis } = result;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden border-border/80">
        <DialogHeader className="p-5 border-b border-border/60 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-foreground">
                  Sơ Đồ Hướng Dẫn Bốc Xếp Hàng Hóa Lên Xe (Loading Manifest)
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Phương tiện: <strong>{vehicle.name}</strong> • Tỷ lệ thể tích: <strong>{analysis.volumeUtilizationPercent}%</strong>
                </DialogDescription>
              </div>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
              <CheckCircle2 className="h-3 w-3 mr-1 inline" /> Quy chuẩn LIFO
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-5 flex-1 overflow-y-auto space-y-4 print:p-0">
          {/* Thông số tóm tắt */}
          <div className="grid grid-cols-4 gap-2 text-center p-3 bg-muted/40 rounded-xl border border-border/60 text-xs">
            <div>
              <div className="text-muted-foreground text-[10px]">Tổng số kiện xếp:</div>
              <strong className="text-foreground text-sm">{placedBoxes.length} kiện</strong>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px]">Tổng tải trọng hàng:</div>
              <strong className="text-primary text-sm">{analysis.totalCargoWeightKg.toLocaleString('vi-VN')} kg</strong>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px]">Tải trọng cầu trước:</div>
              <strong className="text-foreground text-sm">{analysis.frontAxleLoadKg.toLocaleString('vi-VN')} kg</strong>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px]">Tải trọng cầu sau:</div>
              <strong className="text-foreground text-sm">{analysis.rearAxleLoadKg.toLocaleString('vi-VN')} kg</strong>
            </div>
          </div>

          {/* Bảng Trình Tự Bốc Hàng */}
          <div className="border border-border/60 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/70 text-muted-foreground uppercase text-[10px] font-bold border-b border-border/60">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">Thứ tự</th>
                  <th className="py-2.5 px-3">Mã vận đơn</th>
                  <th className="py-2.5 px-3">Khách hàng / Điểm giao</th>
                  <th className="py-2.5 px-3 text-center">Điểm dỡ hàng</th>
                  <th className="py-2.5 px-3 text-right">Kích thước (cm)</th>
                  <th className="py-2.5 px-3 text-right">Trọng lượng</th>
                  <th className="py-2.5 px-3">Vị trí trong thùng xe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {placedBoxes.map((box) => (
                  <tr key={box.id} className="hover:bg-muted/30">
                    <td className="py-2 px-3 text-center font-bold text-primary font-mono">
                      #{box.stepIndex}
                    </td>
                    <td className="py-2 px-3 font-bold font-mono text-foreground">
                      {box.cargo.orderCode}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-foreground">{box.cargo.customerName}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                        {box.cargo.destination}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        Stop #{box.cargo.stopIndex}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                      {box.cargo.lengthCm}×{box.cargo.widthCm}×{box.cargo.heightCm}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-foreground">
                      {box.cargo.weightKg} kg
                    </td>
                    <td className="py-2 px-3 text-[11px] text-muted-foreground font-mono">
                      X={box.xM.toFixed(2)}m, Y={box.yM.toFixed(2)}m, Z={box.zM.toFixed(2)}m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phần Ký Tên Xác Nhận */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-border/60 text-xs text-center">
            <div>
              <div className="font-bold text-foreground">Thủ Kho Bốc Xếp (Ký và ghi rõ họ tên)</div>
              <div className="h-16" />
              <div className="text-muted-foreground text-[11px]">Đã kiểm tra chằng buộc và thứ tự LIFO</div>
            </div>
            <div>
              <div className="font-bold text-foreground">Tài Xế Nhận Xe (Ký và ghi rõ họ tên)</div>
              <div className="h-16" />
              <div className="text-muted-foreground text-[11px]">Đã kiểm tra cân bằng tải trọng và e-POD</div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            VietRoute 3D Load Optimization Engine • Phiên bản 2026
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs cursor-pointer">
              Đóng
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              In phiếu bốc xếp
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
