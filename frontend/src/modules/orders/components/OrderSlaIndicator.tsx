import React from "react";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import type { Order } from "@/core/types/logistics";
import { calculateOrderSla } from "../utils/slaCalculator";
import { cn } from "@/shared/utils/cn";

interface OrderSlaIndicatorProps {
  order: Order;
  showIcon?: boolean;
  className?: string;
}

export const OrderSlaIndicator: React.FC<OrderSlaIndicatorProps> = ({
  order,
  showIcon = true,
  className,
}) => {
  const sla = calculateOrderSla(order);

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <Badge
        variant={sla.badgeVariant}
        className={cn(
          "text-[10px] px-1.5 py-0 font-medium gap-1",
          sla.isUrgent && "animate-pulse"
        )}
      >
        {showIcon && (
          <>
            {sla.status === "COMPLETED" ? (
              <CheckCircle2 className="h-2.5 w-2.5" />
            ) : sla.status === "BREACHED" || sla.status === "WARNING" ? (
              <AlertTriangle className="h-2.5 w-2.5" />
            ) : (
              <Clock className="h-2.5 w-2.5" />
            )}
          </>
        )}
        <span>{sla.remainingText}</span>
      </Badge>
    </div>
  );
};
