import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ChevronRight, Clock, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { DashboardDriverItem } from "../hooks/useDashboardData";
import { DriverDetailDrawer } from "./DriverDetailDrawer";

interface ActiveDriversPanelProps {
  drivers: DashboardDriverItem[];
  isLoading?: boolean;
  className?: string;
}

export const ActiveDriversPanel: React.FC<ActiveDriversPanelProps> = ({
  drivers,
  isLoading,
  className,
}) => {
  const navigate = useNavigate();
  const [selectedDriver, setSelectedDriver] = useState<DashboardDriverItem | null>(null);

  // Hiển thị 6-8 tài xế tiêu biểu
  const displayedDrivers = drivers.slice(0, 7);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <Badge variant="success" className="text-[10px] py-0 px-1.5 font-semibold shrink-0">
            Sẵn sàng
          </Badge>
        );
      case "BUSY":
        return (
          <Badge variant="info" className="text-[10px] py-0 px-1.5 font-semibold shrink-0">
            Đang giao
          </Badge>
        );
      case "ON_BREAK":
        return (
          <Badge variant="warning" className="text-[10px] py-0 px-1.5 font-semibold shrink-0">
            Nghỉ ca
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-semibold shrink-0">
            Ngoại tuyến
          </Badge>
        );
    }
  };

  const getAvatarInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <>
      <Card
        className={`flex flex-col h-[460px] sm:h-[520px] overflow-hidden border-border/80 shadow-xs ${className || ""}`}
      >
        {/* Header Panel */}
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/60 shrink-0 bg-card/60 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Đội xe đang hoạt động</span>
            </CardTitle>
            <Badge variant="secondary" className="text-[11px] font-mono font-semibold">
              {drivers.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/drivers")}
            className="h-7 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 cursor-pointer p-0 px-2"
          >
            Quản lý
          </Button>
        </CardHeader>

        {/* Danh sách tài xế */}
        <CardContent className="p-0 flex-1 overflow-y-auto divide-y divide-border/50">
          {isLoading ? (
            <div className="p-3 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : displayedDrivers.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Không có tài xế nào đang trực tuyến
            </div>
          ) : (
            displayedDrivers.map((driver) => (
              <div
                key={driver.id}
                onClick={() => setSelectedDriver(driver)}
                className="group flex items-center justify-between p-3 sm:px-4 hover:bg-accent/60 transition-colors cursor-pointer"
              >
                {/* Cột trái: Avatar + Tên + Mã TX */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs ring-1 ring-primary/20 group-hover:scale-105 transition-transform">
                    {getAvatarInitials(driver.fullName)}
                    <span
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card ${
                        driver.status === "AVAILABLE"
                          ? "bg-emerald-500"
                          : driver.status === "BUSY"
                          ? "bg-blue-500"
                          : "bg-amber-500"
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {driver.fullName}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground bg-muted/60 px-1 rounded">
                        {driver.driverCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <span className="font-mono font-medium text-foreground/80">
                        {driver.vehiclePlate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-primary">
                        <Package className="h-3 w-3" />
                        {driver.currentDeliveryCount} đơn
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cột phải: ETA + Trạng thái */}
                <div className="flex items-center gap-2 shrink-0 text-right">
                  <div className="flex flex-col items-end">
                    {getStatusBadge(driver.status)}
                    {driver.estimatedEtaMinutes ? (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-1 font-mono">
                        <Clock className="h-2.5 w-2.5" />
                        ETA: {driver.estimatedEtaMinutes}p
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground mt-1">Sẵn sàng</span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </CardContent>

        {/* Footer: Xem tất cả tài xế */}
        <div className="p-3 border-t border-border/70 bg-card/60 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/drivers")}
            className="w-full text-xs font-semibold cursor-pointer justify-between hover:border-primary/50"
          >
            <span>Xem tất cả tài xế ({drivers.length})</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>

      {/* Drawer xem chi tiết tài xế */}
      <DriverDetailDrawer
        driver={selectedDriver}
        isOpen={Boolean(selectedDriver)}
        onClose={() => setSelectedDriver(null)}
      />
    </>
  );
};
