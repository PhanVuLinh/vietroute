import React from "react";
import {
  Ship,
  Plane,
  Truck,
  ArrowRight,
  Box,
  FileText,
  ShieldCheck,
  ShieldAlert,
  MoreVertical,
  Edit2,
  Trash2,
  Globe2,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { InternationalShipment } from "../types/international";

interface ShipmentTableProps {
  shipments: InternationalShipment[];
  onEdit: (shipment: InternationalShipment) => void;
  onDelete: (shipment: InternationalShipment) => void;
  isLoading?: boolean;
}

export const ShipmentTable: React.FC<ShipmentTableProps> = ({
  shipments,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-2xs">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground mt-3">Đang tải danh sách lô hàng quốc tế...</p>
      </div>
    );
  }

  if (shipments.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-2xs">
        <Globe2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-semibold text-foreground">Không tìm thấy lô hàng quốc tế nào</p>
        <p className="text-xs text-muted-foreground mt-1">
          Hãy thử thay đổi điều kiện lọc hoặc tạo lô hàng xuất nhập khẩu mới
        </p>
      </div>
    );
  }

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case "AIR_FREIGHT":
        return <Plane className="h-3.5 w-3.5 text-blue-500" />;
      case "ROAD_CROSS_BORDER":
        return <Truck className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <Ship className="h-3.5 w-3.5 text-primary" />;
    }
  };

  const getDirectionBadge = (dir: string) => {
    switch (dir) {
      case "EXPORT":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] px-1 py-0">Xuất khẩu</Badge>;
      case "IMPORT":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[9px] px-1 py-0">Nhập khẩu</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] px-1 py-0">Liên vận</Badge>;
    }
  };

  const getCustomsBadge = (customsStatus: string) => {
    switch (customsStatus) {
      case "CLEARED":
      case "GREEN":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[9px] gap-1 px-1.5 py-0">
            <ShieldCheck className="h-2.5 w-2.5" />
            Luồng Xanh (Đã thông quan)
          </Badge>
        );
      case "YELLOW":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[9px] gap-1 px-1.5 py-0">
            <ShieldAlert className="h-2.5 w-2.5" />
            Luồng Vàng (Soi hồ sơ)
          </Badge>
        );
      case "RED":
        return (
          <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/30 text-[9px] gap-1 px-1.5 py-0">
            <ShieldAlert className="h-2.5 w-2.5" />
            Luồng Đỏ (Kiểm hóa bãi)
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground text-[9px] px-1.5 py-0">
            Chưa mở tờ khai
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SAILING":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">Đang trên biển / Bay</Badge>;
      case "CUSTOMS_CLEARED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Đã thông quan</Badge>;
      case "CUSTOMS_PROCESSING":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Đang làm thủ tục HQ</Badge>;
      case "ARRIVED_PORT":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px]">Đã cập cảng đích</Badge>;
      case "DELIVERED":
        return <Badge className="bg-teal-500/10 text-teal-600 border-teal-500/20 text-[10px]">Đã giao tận kho</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Đã xác nhận Booking</Badge>;
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
              <th className="py-3 px-4 w-[160px]">Lô hàng & Hướng</th>
              <th className="py-3 px-4 min-w-[240px]">Hành trình (POL ➔ POD)</th>
              <th className="py-3 px-4 min-w-[180px]">Hãng tàu & Tàu / Chuyến</th>
              <th className="py-3 px-4 min-w-[160px]">Số B/L & Container</th>
              <th className="py-3 px-4 w-[90px] text-center">Incoterm</th>
              <th className="py-3 px-4 w-[110px] text-right">Tải / Thể tích</th>
              <th className="py-3 px-4 min-w-[150px] text-center">Hải quan</th>
              <th className="py-3 px-4 w-[130px] text-center">Trạng thái</th>
              <th className="py-3 px-4 w-[70px] text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shipments.map((s) => {
              return (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  {/* Mã lô & Hướng */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-foreground text-xs">{s.shipmentCode}</span>
                        {getDirectionBadge(s.direction)}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        {getTransportIcon(s.transportMode)}
                        <span>{s.transportMode}</span>
                      </div>
                    </div>
                  </td>

                  {/* Hành trình POL -> POD */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <span className="truncate max-w-[120px]" title={s.polPort}>{s.polPort.split(" - ")[0]}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[120px] text-primary font-semibold" title={s.podPort}>
                          {s.podPort.split(" - ")[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          ETD: {new Date(s.etdDate).toLocaleDateString("vi-VN")}
                        </span>
                        <span className="flex items-center gap-0.5 text-primary">
                          ETA: {new Date(s.etaDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Hãng tàu & Số hiệu Tàu / Chuyến bay */}
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground truncate">{s.carrierName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{s.vesselFlightNo}</p>
                    </div>
                  </td>

                  {/* Số B/L & Container */}
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-blue-500" />
                        <span className="font-mono font-semibold text-foreground text-[11px]">{s.blAwbNumber}</span>
                      </div>
                      {s.containerNumber && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                          <Box className="h-3 w-3 text-muted-foreground" />
                          <span>{s.containerNumber}</span>
                          {s.containerType && <span>({s.containerType})</span>}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Incoterm */}
                  <td className="py-3 px-4 text-center">
                    <Badge variant="outline" className="font-mono font-bold text-[10px] border-primary/30 text-primary">
                      {s.incoterm}
                    </Badge>
                  </td>

                  {/* Trọng lượng & Thể tích */}
                  <td className="py-3 px-4 text-right">
                    <div className="font-mono text-xs font-semibold text-foreground">
                      {s.grossWeightKg.toLocaleString()} kg
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {s.cbmVolume} CBM / {s.packageCount} kiện
                    </div>
                  </td>

                  {/* Luồng Hải quan */}
                  <td className="py-3 px-4 text-center">
                    {getCustomsBadge(s.customsStatus)}
                  </td>

                  {/* Trạng thái vận hành */}
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(s.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuItem onClick={() => onEdit(s)} className="gap-2">
                          <Edit2 className="h-3.5 w-3.5 text-blue-500" />
                          <span>Chỉnh sửa lô hàng</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(s)}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Xóa lô hàng</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
