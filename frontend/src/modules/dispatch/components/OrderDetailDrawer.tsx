import React from "react";
import {
  Package,
  MapPin,
  Building2,
  Clock,
  Send,
  Phone,
  Layers,
  CheckCircle2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/components/ui/sheet";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import type { Order, Warehouse } from "@/core/types/logistics";

interface OrderDetailDrawerProps {
  order: Order | null;
  warehouse?: Warehouse;
  isOpen: boolean;
  onClose: () => void;
  onAssignDriver: (order: Order) => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  warehouse,
  isOpen,
  onClose,
  onAssignDriver,
}) => {
  if (!order) return null;

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Không có";
    try {
      const d = new Date(isoString);
      return d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const isPending = order.status === "PENDING" || order.status === "CONFIRMED";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-6 overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/70">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="font-mono text-xs font-bold text-primary border-primary/30">
              {order.orderCode}
            </Badge>
            <Badge
              variant={
                order.priority === "URGENT"
                  ? "destructive"
                  : order.priority === "HIGH"
                  ? "warning"
                  : "secondary"
              }
              className="text-[10px] font-semibold"
            >
              {order.priority === "URGENT"
                ? "Khẩn cấp"
                : order.priority === "HIGH"
                ? "Ưu tiên cao"
                : "Tiêu chuẩn"}
            </Badge>
          </div>
          <SheetTitle className="text-lg font-bold text-foreground mt-2">
            {order.receiverName}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground flex items-center gap-2">
            <Phone className="h-3 w-3" />
            <a href={`tel:${order.receiverPhone}`} className="hover:underline font-mono text-primary">
              {order.receiverPhone}
            </a>
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4 text-xs">
          {/* Lộ trình giao nhận */}
          <div>
            <h4 className="font-semibold uppercase tracking-wider text-muted-foreground text-[11px] mb-2 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Lộ trình vận chuyển
            </h4>
            <div className="rounded-lg border border-border bg-card p-3 space-y-3">
              {/* Điểm nhận */}
              <div className="flex items-start gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/15 text-blue-600 mt-0.5">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Điểm lấy hàng (Kho)
                  </span>
                  <div className="font-semibold text-foreground">
                    {warehouse?.name || "Kho hàng VietRoute"}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {warehouse?.address || "Khu công nghiệp Đài Tư, Long Biên, Hà Nội"}
                  </div>
                </div>
              </div>

              <div className="ml-3 border-l-2 border-dashed border-border/80 h-3" />

              {/* Điểm giao */}
              <div className="flex items-start gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-rose-500/15 text-rose-600 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Điểm giao hàng
                  </span>
                  <div className="font-semibold text-foreground">{order.receiverName}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {order.receiverAddress}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Thông số kiện hàng & COD */}
          <div>
            <h4 className="font-semibold uppercase tracking-wider text-muted-foreground text-[11px] mb-2 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-primary" />
              Thông số kiện hàng
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-border/70 bg-card p-2.5 text-center">
                <span className="text-[10px] text-muted-foreground">Khối lượng</span>
                <div className="font-bold text-sm text-foreground mt-0.5">{order.totalWeight} kg</div>
              </div>
              <div className="rounded-lg border border-border/70 bg-card p-2.5 text-center">
                <span className="text-[10px] text-muted-foreground">Thể tích</span>
                <div className="font-bold text-sm text-foreground mt-0.5">{order.totalVolume} m³</div>
              </div>
              <div className="rounded-lg border border-border/70 bg-card p-2.5 text-center">
                <span className="text-[10px] text-muted-foreground">Tiền COD</span>
                <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {order.codAmount > 0 ? `${order.codAmount.toLocaleString("vi-VN")} ₫` : "0 ₫"}
                </div>
              </div>
            </div>

            {/* Danh mục mặt hàng nếu có */}
            {order.items && order.items.length > 0 && (
              <div className="mt-2.5 rounded-lg border border-border/60 bg-muted/30 p-2.5 space-y-1.5">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  Mặt hàng ({order.items.length} kiện)
                </span>
                <div className="divide-y divide-border/40">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-1 flex justify-between items-center text-[11px]">
                      <span className="truncate max-w-[220px] font-medium text-foreground">
                        {item.productName}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        SL: {item.quantity} ({item.weight} kg)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Mốc thời gian */}
          <div>
            <h4 className="font-semibold uppercase tracking-wider text-muted-foreground text-[11px] mb-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Cam kết khung giờ (SLA)
            </h4>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span>Thời gian tiếp nhận:</span>
                <span className="font-mono text-foreground">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span>Hạn chót giao hàng (Deadline):</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {formatDate(order.deliveryWindowEnd)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Trạng thái hiện tại:</span>
                <span className="font-semibold text-primary">
                  {order.status === "PENDING"
                    ? "Chờ phân công"
                    : order.status === "ASSIGNED"
                    ? "Đã phân công"
                    : "Đang giao"}
                </span>
              </div>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="pt-2">
            {isPending ? (
              <Button
                className="w-full gap-2 text-xs font-semibold cursor-pointer shadow-xs"
                onClick={() => {
                  onClose();
                  onAssignDriver(order);
                }}
              >
                <Send className="h-3.5 w-3.5" />
                <span>Phân công tài xế ngay</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled
                className="w-full gap-2 text-xs opacity-70"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Đơn hàng đã được phân công</span>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
