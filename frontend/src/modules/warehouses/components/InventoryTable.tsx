import React, { useEffect, useState } from "react";
import { Package, AlertTriangle, Search } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils/cn";
import { formatWeight } from "@/shared/utils/formatters";
import { inventoryService } from "@/mocks/adapters/serviceFactory";
import type { InventoryItem } from "../types/wms";

interface InventoryTableProps {
  warehouseId?: string;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ warehouseId }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    inventoryService
      .getInventory({ warehouseId })
      .then((res) => {
        if (res.success) setItems(res.data);
        setIsLoading(false);
      });
  }, [warehouseId]);

  const filtered = search
    ? items.filter(
        (i) =>
          i.sku.toLowerCase().includes(search.toLowerCase()) ||
          i.productName.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-muted/50 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
        <Input
          placeholder="Tìm SKU, tên hàng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-8 text-xs"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="px-3 py-2.5 font-semibold text-muted-foreground">SKU</th>
              <th className="px-3 py-2.5 font-semibold text-muted-foreground">Sản phẩm</th>
              <th className="px-3 py-2.5 font-semibold text-muted-foreground">Zone</th>
              <th className="px-3 py-2.5 font-semibold text-muted-foreground text-right">Tồn kho</th>
              <th className="px-3 py-2.5 font-semibold text-muted-foreground text-right">Đã giữ</th>
              <th className="px-3 py-2.5 font-semibold text-muted-foreground text-right">Khả dụng</th>
              <th className="px-3 py-2.5 font-semibold text-muted-foreground text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filtered.map((item) => {
              const available = item.quantity - item.reservedQuantity;
              const isLow = available <= item.minStockLevel;
              return (
                <tr
                  key={item.id}
                  className={cn(
                    "hover:bg-accent/30 transition-colors",
                    isLow && "bg-amber-500/[0.03]"
                  )}
                >
                  <td className="px-3 py-2.5 font-mono font-bold text-primary">{item.sku}</td>
                  <td className="px-3 py-2.5">
                    <div>
                      <span className="font-semibold text-foreground">{item.productName}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">
                        ({formatWeight(item.weightPerUnit)}/{item.unit})
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono font-bold">
                      {item.zoneCode}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums">{item.quantity} {item.unit}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{item.reservedQuantity}</td>
                  <td className={cn("px-3 py-2.5 text-right font-bold tabular-nums", isLow ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
                    {available}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {isLow ? (
                      <Badge variant="destructive" className="text-[9px] h-5 px-1.5 font-bold gap-1">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Sắp hết
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[9px] h-5 px-1.5 font-medium">
                        Đủ hàng
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="py-8 text-center">
          <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Không có dữ liệu tồn kho</p>
        </div>
      )}
    </div>
  );
};
