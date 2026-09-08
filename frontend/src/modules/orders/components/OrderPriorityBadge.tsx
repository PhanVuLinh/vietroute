import React from "react";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import type { OrderPriority } from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

interface OrderPriorityBadgeProps {
  priority: OrderPriority;
  className?: string;
}

export const OrderPriorityBadge: React.FC<OrderPriorityBadgeProps> = ({ priority, className }) => {
  switch (priority) {
    case "URGENT":
      return (
        <Badge
          variant="destructive"
          className={cn("text-[10px] px-1.5 py-0 font-bold gap-1 animate-pulse", className)}
        >
          <AlertCircle className="h-2.5 w-2.5" />
          <span>Khẩn cấp</span>
        </Badge>
      );
    case "HIGH":
      return (
        <Badge variant="warning" className={cn("text-[10px] px-1.5 py-0 font-semibold", className)}>
          <span>Cao</span>
        </Badge>
      );
    case "NORMAL":
      return (
        <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 font-normal", className)}>
          <span>Bình thường</span>
        </Badge>
      );
    case "LOW":
      return (
        <Badge
          variant="outline"
          className={cn("text-[10px] px-1.5 py-0 font-normal text-muted-foreground", className)}
        >
          <span>Thấp</span>
        </Badge>
      );
  }
};
