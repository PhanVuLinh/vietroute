import React from "react";
import { Users, UserCheck, Warehouse, Waypoints } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { StaffMember } from "../types/staff";

interface StaffKpiGridProps {
  staffList: StaffMember[];
  isLoading?: boolean;
}

export const StaffKpiGrid: React.FC<StaffKpiGridProps> = ({ staffList, isLoading }) => {
  const totalStaff = staffList.length;
  const activeStaff = staffList.filter((s) => s.status === "ACTIVE").length;
  const warehouseStaffCount = staffList.filter(
    (s) => s.roleName === "MANAGER" || s.roleName === "WAREHOUSE_STAFF"
  ).length;
  const dispatchStaffCount = staffList.filter(
    (s) => s.roleName === "DISPATCHER" || s.roleName === "DRIVER"
  ).length;

  const kpis = [
    {
      title: "Tổng nhân sự vận hành",
      value: totalStaff,
      subtext: "Toàn bộ nhân sự các phân hệ",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Đang hoạt động (Active)",
      value: activeStaff,
      subtext: `${totalStaff ? Math.round((activeStaff / totalStaff) * 100) : 0}% tỷ lệ khả dụng`,
      icon: UserCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Quản lý & Thủ kho",
      value: warehouseStaffCount,
      subtext: "Phụ trách bến bãi & xuất nhập WMS",
      icon: Warehouse,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Điều phối & Vận tải",
      value: dispatchStaffCount,
      subtext: "Điều phối viên & Đội ngũ tài xế",
      icon: Waypoints,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={idx}
            className={`border transition-all hover:shadow-xs ${kpi.borderColor} bg-card/60 backdrop-blur-xs`}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground block">
                  {kpi.title}
                </span>
                <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                  {isLoading ? "..." : kpi.value}
                </div>
                <span className="text-[10px] text-muted-foreground block">
                  {kpi.subtext}
                </span>
              </div>
              <div className={`h-11 w-11 rounded-xl ${kpi.bgColor} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
