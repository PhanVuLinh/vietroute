import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Package,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Scale,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { Order } from '@/core/types/logistics';
import type { CargoItemInput } from '../../types/load3d';

interface SelectOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableOrders: Order[];
  onImportOrders: (cargoItems: CargoItemInput[]) => void;
}

export const SelectOrdersModal: React.FC<SelectOrdersModalProps> = ({
  isOpen,
  onClose,
  availableOrders,
  onImportOrders,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(
    new Set(availableOrders.slice(0, 6).map((o) => o.id))
  );

  // Lọc các đơn hàng chưa giao (PENDING, CONFIRMED, ASSIGNED)
  const filterableOrders = useMemo(() => {
    return availableOrders.filter((ord) => {
      const matchSearch =
        ord.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.receiverAddress.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [availableOrders, searchQuery]);

  const handleToggleOrder = (id: string) => {
    const next = new Set(selectedOrderIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedOrderIds(next);
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.size === filterableOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filterableOrders.map((o) => o.id)));
    }
  };

  // Chuyển đổi các đơn hàng đã chọn thành các kiện hàng 3D thực tế
  const handleConfirmImport = () => {
    const selectedOrders = availableOrders.filter((o) => selectedOrderIds.has(o.id));
    const generatedCargo: CargoItemInput[] = [];

    // Bảng màu cho các điểm giao hàng
    const stopColors = ['#059669', '#D97706', '#1E40AF', '#7C3AED', '#DC2626', '#0891B2'];

    selectedOrders.forEach((order, ordIdx) => {
      const stopIndex = (ordIdx % 3) + 1; // Gán 3 điểm giao hàng Stop 1, Stop 2, Stop 3
      const color = stopColors[stopIndex - 1] || '#3B82F6';

      // Nếu đơn có chi tiết items
      if (order.items && order.items.length > 0) {
        order.items.forEach((item, itemIdx) => {
          // Tính kích thước ước lượng từ thể tích
          const sideCm = Math.round(Math.cbrt((item.volume || 0.05) * 1000000));
          const lengthCm = Math.max(30, Math.min(100, Math.round(sideCm * 1.2)));
          const widthCm = Math.max(25, Math.min(80, Math.round(sideCm * 0.9)));
          const heightCm = Math.max(20, Math.min(80, Math.round(sideCm * 0.9)));

          generatedCargo.push({
            id: `cargo-${order.id}-${itemIdx}`,
            orderCode: `${order.orderCode} (#${itemIdx + 1})`,
            customerName: order.receiverName,
            destination: order.receiverAddress,
            stopIndex,
            lengthCm,
            widthCm,
            heightCm,
            weightKg: Math.max(5, Math.round(item.weight || 20)),
            color,
            isFragile: item.productName?.toLowerCase().includes('tivi') ||
                       item.productName?.toLowerCase().includes('dễ vỡ') ||
                       item.productName?.toLowerCase().includes('dược phẩm'),
            allowRotate: true,
          });
        });
      } else {
        // Tách đơn hàng thành 2-4 kiện hàng thực tế theo tổng trọng lượng
        const packageCount = Math.max(1, Math.min(4, Math.ceil(order.totalWeight / 50)));
        const weightPerPkg = Math.round(order.totalWeight / packageCount);

        for (let i = 1; i <= packageCount; i++) {
          generatedCargo.push({
            id: `cargo-${order.id}-${i}`,
            orderCode: `${order.orderCode} [Kiện ${i}/${packageCount}]`,
            customerName: order.receiverName,
            destination: order.receiverAddress,
            stopIndex,
            lengthCm: 60 + (i % 2) * 15,
            widthCm: 45 + (i % 2) * 10,
            heightCm: 40 + (i % 3) * 10,
            weightKg: weightPerPkg || 30,
            color,
            isFragile: order.priority === 'URGENT' || i === packageCount,
            allowRotate: true,
          });
        }
      }
    });

    onImportOrders(generatedCargo);
    onClose();
  };

  const totalSelectedWeight = availableOrders
    .filter((o) => selectedOrderIds.has(o.id))
    .reduce((sum, o) => sum + (o.totalWeight || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden border-border/80">
        <DialogHeader className="p-5 border-b border-border/60 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-foreground">
                  Nạp Đơn Hàng Thực Tế Trong Kho Vào Sơ Đồ Xếp Xe 3D
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Chọn các đơn hàng đang chờ xuất kho để hệ thống tự động bóc tách kiện hàng và tối ưu không gian thùng xe.
                </DialogDescription>
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold px-2.5 py-1">
              Đã chọn: {selectedOrderIds.size} đơn ({totalSelectedWeight.toLocaleString('vi-VN')} kg)
            </Badge>
          </div>
        </DialogHeader>

        {/* Thanh tìm kiếm & Hành động */}
        <div className="p-4 bg-muted/10 border-b border-border/60 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã vận đơn, người nhận, địa chỉ giao hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="h-9 text-xs cursor-pointer font-medium"
          >
            {selectedOrderIds.size === filterableOrders.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </Button>
        </div>

        {/* Bảng Đơn Hàng Trong Kho */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filterableOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              Không tìm thấy đơn hàng phù hợp với từ khóa tìm kiếm.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filterableOrders.map((ord) => {
                const isSelected = selectedOrderIds.has(ord.id);
                return (
                  <div
                    key={ord.id}
                    onClick={() => handleToggleOrder(ord.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 text-xs ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-xs'
                        : 'border-border/70 hover:border-primary/40 hover:bg-muted/30'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleOrder(ord.id)}
                      className="mt-0.5"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-bold text-foreground">
                          {ord.orderCode}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-semibold"
                        >
                          {ord.status}
                        </Badge>
                      </div>

                      <div className="font-semibold text-foreground truncate">
                        {ord.receiverName}
                      </div>

                      <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                        <span className="truncate">{ord.receiverAddress}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground">
                        <span>Trọng lượng: <strong className="text-foreground">{ord.totalWeight} kg</strong></span>
                        <span>Thể tích: <strong className="text-foreground">{ord.totalVolume} m³</strong></span>
                        {ord.codAmount > 0 && (
                          <span className="text-amber-600 font-semibold">COD: {ord.codAmount.toLocaleString('vi-VN')} đ</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Hệ thống tự động áp dụng quy tắc LIFO theo khoảng cách tuyến giao hàng.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs cursor-pointer">
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmImport}
              disabled={selectedOrderIds.size === 0}
              className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Nạp {selectedOrderIds.size} Đơn Hàng Vào Mô Phỏng 3D
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
