import React from "react";
import { Award, Trophy, Medal, Star, Truck, Navigation, CheckCircle2, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import type { Driver, Vehicle } from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

export interface EnrichedDriverRankItem {
  rank: number;
  driver: Driver;
  vehicle?: Vehicle;
  completedDeliveries: number;
  onTimeRate: number;
  successRate: number;
  rating: number;
  totalDistanceKm: number;
}

interface DriverRankingTableProps {
  rankings: EnrichedDriverRankItem[];
  isLoading?: boolean;
  className?: string;
}

export const DriverRankingTable: React.FC<DriverRankingTableProps> = ({
  rankings = [],
  isLoading = false,
  className,
}) => {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="h-6 w-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-amber-400/30">
            <Trophy className="h-3.5 w-3.5 fill-white text-white" />
          </div>
        );
      case 2:
        return (
          <div className="h-6 w-6 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-slate-300/30">
            <Medal className="h-3.5 w-3.5 fill-white text-white" />
          </div>
        );
      case 3:
        return (
          <div className="h-6 w-6 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-amber-600/30">
            <Medal className="h-3.5 w-3.5 fill-white text-white" />
          </div>
        );
      default:
        return (
          <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs font-mono">
            {rank}
          </div>
        );
    }
  };

  return (
    <Card className={cn("border-border/80 shadow-2xs flex flex-col justify-between", className)}>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/60 shrink-0">
        <div className="space-y-0.5">
          <CardTitle className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>Bảng Xếp Hạng Tài Xế Tiêu Biểu</span>
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Top tài xế có số chuyến hoàn thành cao nhất và tỷ lệ đúng hẹn &gt;98%
          </p>
        </div>

        <Badge variant="outline" className="gap-1 text-[11px] border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/10">
          <Award className="h-3 w-3" />
          <span>Thưởng KPI Tháng</span>
        </Badge>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[580px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none">
              <th className="py-2.5 px-3 text-center w-12">Hạng</th>
              <th className="py-2.5 px-3">Tài xế</th>
              <th className="py-2.5 px-3">Xe phụ trách</th>
              <th className="py-2.5 px-3 text-center">Hoàn thành</th>
              <th className="py-2.5 px-3 text-center">Đúng hẹn (OTD)</th>
              <th className="py-2.5 px-3 text-center">Đánh giá</th>
              <th className="py-2.5 px-3 text-right">Cự ly</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="py-3 px-4">
                    <div className="h-5 bg-muted rounded w-full" />
                  </td>
                </tr>
              ))
            ) : rankings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground text-xs">
                  Chưa có dữ liệu xếp hạng tài xế
                </td>
              </tr>
            ) : (
              rankings.map((item) => (
                <tr
                  key={item.driver.id}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                >
                  {/* Hạng */}
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex justify-center">{getRankBadge(item.rank)}</div>
                  </td>

                  {/* Thông tin tài xế */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                        {item.driver.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors text-xs">
                          {item.driver.fullName}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                          <span>{item.driver.driverCode}</span>
                          <span>•</span>
                          <Phone className="h-2.5 w-2.5" />
                          <span>{item.driver.phone}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Xe phụ trách */}
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {item.vehicle ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground bg-accent px-1.5 py-0.5 rounded border border-border">
                        <Truck className="h-2.5 w-2.5 text-muted-foreground" />
                        {item.vehicle.licensePlate}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">Chưa gán xe</span>
                    )}
                  </td>

                  {/* Số đơn hoàn thành */}
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-bold font-mono text-foreground text-xs">
                      {item.completedDeliveries}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-0.5">đơn</span>
                  </td>

                  {/* Tỷ lệ OTD */}
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      {item.onTimeRate}%
                    </span>
                  </td>

                  {/* Đánh giá sao */}
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 font-mono text-xs bg-amber-500/10 px-1.5 py-0.5 rounded">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {item.rating}
                    </span>
                  </td>

                  {/* Cự ly km */}
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground text-xs">
                    <span className="inline-flex items-center gap-1 justify-end">
                      <Navigation className="h-2.5 w-2.5 text-muted-foreground" />
                      {item.totalDistanceKm} km
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
