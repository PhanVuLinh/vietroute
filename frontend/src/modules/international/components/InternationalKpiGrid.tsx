import React from "react";
import { Ship, Plane, ShieldAlert, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { InternationalShipment, ContainerTrackingItem, CustomsDeclaration } from "../types/international";

interface InternationalKpiGridProps {
  shipments: InternationalShipment[];
  containers: ContainerTrackingItem[];
  customs: CustomsDeclaration[];
}

export const InternationalKpiGrid: React.FC<InternationalKpiGridProps> = ({
  shipments,
  containers,
  customs,
}) => {
  const total = shipments.length;
  const inTransit = shipments.filter((s) => s.status === "SAILING" || s.status === "BOOKING_CONFIRMED").length;
  const customsPending = customs.filter((c) => c.status === "REGISTERED" || c.status === "DRAFT").length;
  const demDetAlert = containers.filter((c) => c.overdueDays > 0).length;

  const kpis = [
    {
      title: "Tổng Lô Hàng XNK",
      value: total,
      subtext: "Đường biển, hàng không & liên vận",
      icon: <Ship className="h-5 w-5 text-primary" />,
      bgClass: "bg-primary/10 border-primary/20",
    },
    {
      title: "Đang Trên Hải Trình / Bay",
      value: inTransit,
      subtext: "Đang di chuyển trên tuyến quốc tế",
      icon: <Plane className="h-5 w-5 text-blue-500" />,
      bgClass: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Tờ Khai Chờ Thông Quan",
      value: customsPending,
      subtext: "Đang kiểm tra luồng Vàng & Đỏ",
      icon: <ShieldAlert className="h-5 w-5 text-amber-500" />,
      bgClass: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Cảnh Báo Quá Hạn Lưu Bãi",
      value: demDetAlert,
      subtext: `${demDetAlert > 0 ? "Phát sinh phí phạt lưu vỏ Dem/Det" : "Tất cả container trong Free Time"}`,
      icon: <AlertTriangle className="h-5 w-5 text-rose-500" />,
      bgClass: "bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className="border-border shadow-2xs hover:shadow-xs transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{kpi.title}</span>
              <div className={`p-2 rounded-lg border ${kpi.bgClass}`}>{kpi.icon}</div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
                {kpi.value}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{kpi.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
