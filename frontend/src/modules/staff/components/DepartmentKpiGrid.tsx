import React from "react";
import { Building2, CheckCircle2, UserCheck, Users2 } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { DepartmentItem } from "../types/department";

interface DepartmentKpiGridProps {
  departments: DepartmentItem[];
}

export const DepartmentKpiGrid: React.FC<DepartmentKpiGridProps> = ({ departments }) => {
  const total = departments.length;
  const active = departments.filter((d) => d.status === "ACTIVE").length;
  const assignedHeads = departments.filter((d) => Boolean(d.headName && d.headName.trim())).length;
  const totalMembers = departments.reduce((acc, curr) => acc + (curr.memberCount || 0), 0);

  const kpis = [
    {
      title: "Tổng số Phòng ban",
      value: total,
      subtext: "Toàn bộ cơ cấu tổ chức",
      icon: <Building2 className="h-5 w-5 text-primary" />,
      bgClass: "bg-primary/10 border-primary/20",
    },
    {
      title: "Phòng ban Hoạt động",
      value: active,
      subtext: `${total > 0 ? Math.round((active / total) * 100) : 100}% tỷ lệ vận hành`,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      bgClass: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Đã Bổ Nhiệm Trưởng Phòng",
      value: assignedHeads,
      subtext: `${total - assignedHeads} phòng ban khuyết vị trí`,
      icon: <UserCheck className="h-5 w-5 text-blue-500" />,
      bgClass: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Nhân Sự Đã Phân Bổ",
      value: totalMembers,
      subtext: "Cán bộ công nhân viên trực thuộc",
      icon: <Users2 className="h-5 w-5 text-amber-500" />,
      bgClass: "bg-amber-500/10 border-amber-500/20",
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
