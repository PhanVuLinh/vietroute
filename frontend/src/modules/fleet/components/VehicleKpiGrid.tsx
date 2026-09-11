import React from "react";
import { Truck, CheckCircle2, Navigation, Wrench, ShieldAlert, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { VehicleInspectionStatus } from "@/core/types/logistics";

interface VehicleKpiGridProps {
  stats: {
    total: number;
    available: number;
    enRoute: number;
    loading: number;
    maintenance: number;
    offline: number;
    inspectionExpiredCount?: number;
    inspectionExpiringSoonCount?: number;
    avgFuel: number;
    totalCapacityTons: number;
  };
  selectedInspectionStatus?: VehicleInspectionStatus | "ALL";
  onSelectInspectionStatus?: (status: VehicleInspectionStatus | "ALL") => void;
}

export const VehicleKpiGrid: React.FC<VehicleKpiGridProps> = ({
  stats,
  selectedInspectionStatus = "ALL",
  onSelectInspectionStatus,
}) => {
  const expiredCount = stats.inspectionExpiredCount || 0;
  const expiringCount = stats.inspectionExpiringSoonCount || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Tổng phương tiện */}
      <Card className="border border-border/80 shadow-2xs hover:border-primary/40 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Tổng hạm đội</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums">
                {stats.total}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">xe ({stats.totalCapacityTons}T)</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Truck className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Đang chạy tuyến */}
      <Card className="border border-border/80 shadow-2xs hover:border-blue-500/40 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Đang chạy tuyến</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-primary tabular-nums">
                {stats.enRoute}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">trên đường</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Navigation className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Sẵn sàng điều động */}
      <Card className="border border-border/80 shadow-2xs hover:border-emerald-500/40 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Sẵn sàng điều động</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                {stats.available}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">tại bãi/kho</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Cảnh báo Đăng kiểm & Pháp lý */}
      <Card
        onClick={() => {
          if (onSelectInspectionStatus) {
            if (expiredCount > 0 && selectedInspectionStatus !== "EXPIRED") {
              onSelectInspectionStatus("EXPIRED");
            } else if (expiringCount > 0 && selectedInspectionStatus !== "EXPIRING_SOON") {
              onSelectInspectionStatus("EXPIRING_SOON");
            } else {
              onSelectInspectionStatus("ALL");
            }
          }
        }}
        className={`border shadow-2xs transition-all cursor-pointer ${
          expiredCount > 0
            ? "border-rose-500/40 bg-rose-500/5 hover:border-rose-500/70"
            : expiringCount > 0
            ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/70"
            : "border-border/80 hover:border-emerald-500/40"
        }`}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <span>Hạn Đăng kiểm</span>
              {expiredCount > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </p>
            <div className="flex items-baseline gap-1.5">
              {expiredCount > 0 ? (
                <>
                  <span className="text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
                    {expiredCount}
                  </span>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                    quá hạn ({expiringCount} sắp hết)
                  </span>
                </>
              ) : expiringCount > 0 ? (
                <>
                  <span className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
                    {expiringCount}
                  </span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">sắp hết hạn</span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                    100%
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">đầy đủ pháp lý</span>
                </>
              )}
            </div>
          </div>
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
              expiredCount > 0
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                : expiringCount > 0
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {expiredCount > 0 ? (
              <ShieldAlert className="h-5 w-5 animate-bounce" />
            ) : expiringCount > 0 ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* 5. Bảo dưỡng / Xưởng */}
      <Card className="border border-border/80 shadow-2xs hover:border-amber-500/40 transition-colors col-span-2 md:col-span-1">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Bảo dưỡng / Xưởng</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
                {stats.maintenance}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">xe bảo dưỡng</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Wrench className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

