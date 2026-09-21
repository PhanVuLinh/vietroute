import React, { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  ClipboardCheck,
  Wrench,
  Clock,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";
import { formatDateTime } from "@/shared/utils/formatters";
import { inventoryService } from "@/mocks/adapters/serviceFactory";
import type { WarehouseActivity, ActivityType } from "../types/wms";

const ACTIVITY_META: Record<
  ActivityType,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }
> = {
  INBOUND: { icon: ArrowDownToLine, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Nhập kho" },
  OUTBOUND: { icon: ArrowUpFromLine, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", label: "Xuất kho" },
  TRANSFER: { icon: ArrowRightLeft, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", label: "Luân chuyển" },
  INSPECTION: { icon: ClipboardCheck, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Kiểm kê" },
  ADJUSTMENT: { icon: Wrench, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", label: "Điều chỉnh" },
};

interface WarehouseActivityLogProps {
  warehouseId?: string;
}

export const WarehouseActivityLog: React.FC<WarehouseActivityLogProps> = ({ warehouseId }) => {
  const [activities, setActivities] = useState<WarehouseActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    inventoryService
      .getActivityLog({ warehouseId })
      .then((res) => {
        if (res.success) setActivities(res.data);
        setIsLoading(false);
      });
  }, [warehouseId]);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted/50 rounded-lg" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center">
        <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">Chưa có hoạt động nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {activities.map((act, index) => {
        const meta = ACTIVITY_META[act.type];
        const ActIcon = meta.icon;
        return (
          <div key={act.id} className="flex items-start gap-3 relative">
            {/* Timeline line */}
            {index < activities.length - 1 && (
              <div className="absolute left-[15px] top-[34px] w-[2px] h-[calc(100%)] bg-border/40" />
            )}

            {/* Icon */}
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border z-10", meta.bg)}>
              <ActIcon className={cn("h-3.5 w-3.5", meta.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-3">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant="outline" className={cn("text-[9px] h-4 px-1 font-bold border", meta.bg)}>
                  {meta.label}
                </Badge>
                <span className="font-mono text-[10px] text-primary font-bold">{act.referenceCode}</span>
              </div>
              <p className="text-xs text-foreground font-medium">{act.description}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                <span>{act.user}</span>
                <span>•</span>
                <span className="font-mono tabular-nums">{formatDateTime(act.createdAt)}</span>
                {act.quantity !== undefined && (
                  <>
                    <span>•</span>
                    <span className={cn("font-bold tabular-nums", act.quantity > 0 ? "text-emerald-600" : "text-rose-600")}>
                      {act.quantity > 0 ? `+${act.quantity}` : act.quantity}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
