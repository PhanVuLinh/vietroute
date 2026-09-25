import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  Thermometer,
  ShieldCheck,
  Navigation,
  X,
} from 'lucide-react';
import type { B2BCargoItem } from '../../types/b2bPortal';

interface B2BCargoDetailDrawerProps {
  cargo: B2BCargoItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const B2BCargoDetailDrawer: React.FC<B2BCargoDetailDrawerProps> = ({
  cargo,
  isOpen,
  onClose,
}) => {
  if (!cargo) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg p-0 flex flex-col h-full overflow-hidden">
        <SheetHeader className="p-5 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base font-extrabold text-foreground font-mono">
                  {cargo.orderCode}
                </SheetTitle>
                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                  Đang giao hàng
                </Badge>
              </div>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {cargo.cargoName}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="p-5 space-y-5 flex-1 overflow-y-auto">
          {/* Tiến độ hành trình */}
          <div className="bg-card border border-border/70 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Tiến độ vận chuyển</span>
              <span className="font-extrabold text-primary">{cargo.progressPercent}% Đã hoàn thành</span>
            </div>
            <Progress value={cargo.progressPercent} className="h-2" />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Còn <strong>{cargo.etaMinutes} phút nữa tới đích</strong></span>
              <span>Dự kiến: <strong className="text-foreground">{cargo.etaTime} hôm nay</strong></span>
            </div>
          </div>

          {/* Lộ trình Điểm xuất phát - Điểm đến */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-foreground uppercase text-[11px] tracking-wider text-muted-foreground">
              Hành Trình Vận Chuyển
            </h4>
            <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {/* Điểm xuất phát */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-blue-500 ring-4 ring-background" />
                <div className="font-bold text-foreground">Kho xuất phát: {cargo.originName}</div>
                <div className="text-[11px] text-muted-foreground">Đã xuất bến và hoàn tất kiểm đếm WMS</div>
              </div>

              {/* Vị trí hiện tại */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-background animate-pulse" />
                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                  Vị trí GPS thời gian thực của xe tải
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Tọa độ: {cargo.currentCoords[1].toFixed(4)}°N, {cargo.currentCoords[0].toFixed(4)}°E (Live telemetry)
                </div>
              </div>

              {/* Điểm giao */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-red-500 ring-4 ring-background" />
                <div className="font-bold text-foreground">Điểm nhận hàng: {cargo.receiverName}</div>
                <div className="text-[11px] text-muted-foreground">{cargo.receiverAddress}</div>
              </div>
            </div>
          </div>

          {/* Thông tin Tài xế & Phương tiện */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-muted/40 p-3.5 rounded-xl border border-border/60 space-y-1.5">
              <div className="text-[10px] text-muted-foreground font-semibold uppercase">Tài xế chuyên trách</div>
              <div className="font-bold text-sm text-foreground">{cargo.driverName}</div>
              <div className="text-[11px] text-muted-foreground">Bằng FC • 8 năm kinh nghiệm B2B</div>
              <a
                href={`tel:${cargo.driverPhone}`}
                className="inline-flex items-center gap-1.5 text-primary font-semibold text-xs mt-1 hover:underline"
              >
                <Phone className="h-3.5 w-3.5" /> Gọi: {cargo.driverPhone}
              </a>
            </div>

            <div className="bg-muted/40 p-3.5 rounded-xl border border-border/60 space-y-1.5">
              <div className="text-[10px] text-muted-foreground font-semibold uppercase">Phương tiện chuyên dụng</div>
              <div className="font-bold text-sm text-foreground">{cargo.vehiclePlate}</div>
              <div className="text-[11px] text-muted-foreground">Tải trọng: 5.0 Tấn • Thùng Composite</div>
              {cargo.temperature && (
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold text-xs mt-1">
                  <Thermometer className="h-3.5 w-3.5" /> {cargo.temperature}
                </div>
              )}
            </div>
          </div>

          {/* Cam kết B2B & Chữ ký số e-POD */}
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3 text-xs text-blue-700 dark:text-blue-300">
            <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5 text-blue-600" />
            <div>
              <strong>Bảo đảm e-POD B2B:</strong> Ngay khi tài xế giao hàng tới điểm nhận, hệ thống sẽ tự động gửi chữ ký số và biên bản bàn giao điện tử về hệ thống của quý doanh nghiệp.
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border/60 bg-muted/20 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs cursor-pointer">
            Đóng
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
