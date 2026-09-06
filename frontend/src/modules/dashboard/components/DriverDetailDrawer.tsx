import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Truck,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  User,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/components/ui/sheet";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import type { DashboardDriverItem } from "../hooks/useDashboardData";

interface DriverDetailDrawerProps {
  driver: DashboardDriverItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DriverDetailDrawer: React.FC<DriverDetailDrawerProps> = ({
  driver,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!driver) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge variant="success">Sẵn sàng nhận chuyến</Badge>;
      case "BUSY":
        return <Badge variant="info">Đang thực hiện chuyến</Badge>;
      case "ON_BREAK":
        return <Badge variant="warning">Đang nghỉ ca</Badge>;
      default:
        return <Badge variant="secondary">Ngoại tuyến</Badge>;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-6 overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg ring-2 ring-primary/20">
              {driver.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(-2)
                .join("")}
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-foreground">
                {driver.fullName}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <span className="font-mono font-medium text-foreground">{driver.driverCode}</span>
                <span>•</span>
                <span>Hạng bằng {driver.licenseType}</span>
              </SheetDescription>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            {getStatusBadge(driver.status)}
            {driver.estimatedEtaMinutes && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Clock className="h-3 w-3" />
                ETA: {driver.estimatedEtaMinutes} phút
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* Thông tin phương tiện đang gán */}
        <div className="py-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-primary" />
              Phương tiện vận hành
            </h4>
            <div className="rounded-lg border border-border/80 bg-card p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Biển số xe:</span>
                <span className="font-mono font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">
                  {driver.vehiclePlate || "Chưa gán xe"}
                </span>
              </div>
              {driver.vehicleModel && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dòng xe:</span>
                  <span className="font-medium text-foreground">{driver.vehicleModel}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Đơn đang giao:</span>
                <span className="font-bold text-primary">{driver.currentDeliveryCount} đơn hàng</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Chỉ số hiệu suất */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-primary" />
              Hiệu suất hôm nay
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-lg border border-border/70 bg-card p-3">
                <span className="text-[11px] text-muted-foreground">Đơn hoàn tất</span>
                <div className="text-xl font-bold text-foreground mt-1">
                  {driver.todayCompletedDeliveries}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  Giao thành công
                </span>
              </div>
              <div className="rounded-lg border border-border/70 bg-card p-3">
                <span className="text-[11px] text-muted-foreground">Tỷ lệ đúng giờ (OTD)</span>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {driver.onTimeRate}%
                </div>
                <span className="text-[10px] text-muted-foreground">Cam kết khung giờ</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Hồ sơ lái xe & Liên hệ */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              Thông tin pháp lý & Liên hệ
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span>Số GPLX:</span>
                <span className="font-mono text-foreground">{driver.licenseNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span>Hạn GPLX:</span>
                <span className="text-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {driver.licenseExpiredAt}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Số điện thoại:</span>
                <a
                  href={`tel:${driver.phone}`}
                  className="font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <Phone className="h-3 w-3" />
                  {driver.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="pt-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-1.5 cursor-pointer text-xs"
              onClick={() => window.open(`tel:${driver.phone}`)}
            >
              <Phone className="h-3.5 w-3.5" />
              Gọi tài xế
            </Button>
            <Button
              className="flex-1 gap-1.5 cursor-pointer text-xs"
              onClick={() => {
                onClose();
                navigate("/dispatch");
              }}
            >
              <Send className="h-3.5 w-3.5" />
              Điều phối chuyến
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
