import React from "react";
import { Phone, Truck, Eye, Edit, Award } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { DriverStatusBadge } from "./DriverStatusBadge";
import type { EnrichedDriver } from "../hooks/useDrivers";
import type { DriverStatus } from "@/core/types/logistics";

interface DriversMobileListProps {
  drivers: EnrichedDriver[];
  onViewDetail: (driver: EnrichedDriver) => void;
  onEdit: (driver: EnrichedDriver) => void;
  onUpdateStatus: (id: string, status: DriverStatus) => void;
}

export const DriversMobileList: React.FC<DriversMobileListProps> = ({
  drivers,
  onViewDetail,
  onEdit,
}) => {
  return (
    <div className="space-y-3 block md:hidden">
      {drivers.map((driver) => (
        <Card
          key={driver.id}
          className="border border-border shadow-2xs hover:border-primary/40 transition-colors"
        >
          <CardContent className="p-4 space-y-3">
            {/* Header: Avatar, Name, Status */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm uppercase border border-primary/25">
                  {driver.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{driver.fullName}</h4>
                  <span className="font-mono text-xs text-muted-foreground">{driver.driverCode}</span>
                </div>
              </div>
              <DriverStatusBadge status={driver.status} />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border/60 bg-muted/20 rounded-lg px-2.5">
              <div>
                <span className="text-muted-foreground block text-[10px]">Giấy phép:</span>
                <span className="font-semibold font-mono">
                  Hạng {driver.licenseType} ({driver.licenseExpiredAt})
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Phương tiện:</span>
                <span className="font-semibold font-mono text-primary flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  {driver.vehicle?.licensePlate || "Chưa gán"}
                </span>
              </div>
            </div>

            {/* Performance */}
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Award className="h-3.5 w-3.5 text-violet-500" />
                <span>Đúng hạn:</span>
                <span className="font-semibold font-mono text-foreground">{driver.onTimeRate}%</span>
              </div>
              <div className="text-muted-foreground">
                Hoàn thành:{" "}
                <Badge variant="secondary" className="font-mono text-xs">
                  {driver.todayCompletedDeliveries} đơn
                </Badge>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <a
                href={`tel:${driver.phone}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold bg-muted hover:bg-accent rounded-lg border border-border text-foreground transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Gọi điện
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(driver)}
                className="h-8 px-3 text-xs gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                Sửa
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onViewDetail(driver)}
                className="h-8 px-3 text-xs gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" />
                Chi tiết
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
