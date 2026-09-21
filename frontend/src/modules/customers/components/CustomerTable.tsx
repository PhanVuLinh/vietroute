import React from "react";
import {
  Building2,
  User,
  Phone,
  Mail,
  Package,
  TrendingUp,
  Crown,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { formatCurrency } from "@/shared/utils/formatters";
import { cn } from "@/shared/utils/cn";
import type { EnrichedCustomer, CustomerTier } from "../types/customer";

const TIER_COLORS: Record<CustomerTier, string> = {
  VIP: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  GOLD: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  SILVER: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
  REGULAR: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
};

interface CustomerTableProps {
  customers: EnrichedCustomer[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetail: (customer: EnrichedCustomer) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetail,
}) => {
  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 bg-card border border-border/50 rounded-xl">
        <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Building2 className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground">
          Không tìm thấy khách hàng nào
        </p>
        <p className="text-xs text-muted-foreground/60">
          Thử điều chỉnh bộ lọc hoặc tìm kiếm khác
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Phân loại
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Liên hệ
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Tổng đơn
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Doanh thu
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Hoàn thành
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-accent/30 transition-colors cursor-pointer"
                onClick={() => onViewDetail(customer)}
              >
                {/* Tên KH */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border",
                        customer.type === "ENTERPRISE"
                          ? "bg-blue-500/10 border-blue-500/20"
                          : "bg-teal-500/10 border-teal-500/20"
                      )}
                    >
                      {customer.type === "ENTERPRISE" ? (
                        <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                        {customer.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                        {customer.address}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Phân loại + Tier */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] h-5 px-1.5 font-bold w-fit border", TIER_COLORS[customer.tier])}
                    >
                      {customer.tier === "VIP" && <Crown className="h-2.5 w-2.5 mr-0.5" />}
                      {customer.tier}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {customer.type === "ENTERPRISE" ? "Doanh nghiệp" : "Cá nhân"}
                    </span>
                  </div>
                </td>

                {/* Liên hệ */}
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span className="font-mono">{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[150px]">{customer.email}</span>
                    </div>
                  </div>
                </td>

                {/* Tổng đơn */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Package className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {customer.stats.totalOrders}
                    </span>
                  </div>
                </td>

                {/* Doanh thu */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(customer.stats.totalRevenue)}
                    </span>
                  </div>
                </td>

                {/* Tỷ lệ hoàn thành */}
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      customer.stats.completionRate >= 95
                        ? "text-emerald-600 dark:text-emerald-400"
                        : customer.stats.completionRate >= 85
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {customer.stats.completionRate}%
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetail(customer);
                    }}
                    className="h-7 px-2 text-[11px] gap-1 cursor-pointer"
                  >
                    <Eye className="h-3 w-3" />
                    Chi tiết
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
          <span className="text-[11px] text-muted-foreground tabular-nums">
            Trang {currentPage}/{totalPages} • {totalCount} khách hàng
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-7 w-7 p-0 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-mono tabular-nums px-2">
              {currentPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-7 w-7 p-0 cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
