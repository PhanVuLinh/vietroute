import React from "react";
import { Truck, Eye, Edit, Fuel, Calendar, User } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { VehicleStatusBadge } from "./VehicleStatusBadge";
import type { EnrichedVehicle } from "../hooks/useVehicles";
import type { VehicleStatus } from "@/core/types/logistics";

interface VehiclesMobileListProps {
  vehicles: EnrichedVehicle[];
  onViewDetail: (vehicle: EnrichedVehicle) => void;
  onEdit: (vehicle: EnrichedVehicle) => void;
  onUpdateStatus: (id: string, status: VehicleStatus) => void;
}

export const VehiclesMobileList: React.FC<VehiclesMobileListProps> = ({
  vehicles,
  onViewDetail,
  onEdit,
}) => {
  return (
    <div className="space-y-3 block md:hidden">
      {vehicles.map((vehicle) => (
        <Card
          key={vehicle.id}
          className="border border-border shadow-2xs hover:border-primary/40 transition-colors"
        >
          <CardContent className="p-4 space-y-3">
            {/* Header: Icon, Plate, Code, Status */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-foreground font-mono">
                      {vehicle.licensePlate}
                    </h4>
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                      {vehicle.type}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {vehicle.brand} {vehicle.model}
                  </span>
                </div>
              </div>
              <VehicleStatusBadge status={vehicle.status} />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border/60 bg-muted/20 rounded-lg px-2.5">
              <div>
                <span className="text-muted-foreground block text-[10px]">Tải trọng định mức:</span>
                <span className="font-semibold font-mono">
                  {vehicle.capacityWeight} kg ({vehicle.capacityVolume} m³)
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Tài xế phụ trách:</span>
                <span className="font-semibold text-foreground truncate block">
                  {vehicle.driver?.fullName || "Chưa phân công"}
                </span>
              </div>
            </div>

            {/* Fuel & Maintenance */}
            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-1.5">
                <Fuel className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Xăng:</span>
                <span
                  className={`font-semibold font-mono ${
                    vehicle.fuelPercent <= 20
                      ? "text-rose-500"
                      : vehicle.fuelPercent <= 40
                      ? "text-amber-500"
                      : "text-emerald-500"
                  }`}
                >
                  {vehicle.fuelPercent}%
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Bảo dưỡng:</span>
                <span className="font-mono text-foreground">{vehicle.nextMaintenanceDate}</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(vehicle)}
                className="h-8 px-3 text-xs gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                Sửa thông tin
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onViewDetail(vehicle)}
                className="h-8 px-3 text-xs gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" />
                Xem hồ sơ xe
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
