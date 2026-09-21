import React from "react";
import {
  Building2,
  User,
  Phone,
  Mail,
  Globe,
  MapPin,
  Package,
  TrendingUp,
  Crown,
  Calendar,
  FileText,
  X,
  Percent,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { formatCurrency, formatDate } from "@/shared/utils/formatters";
import { cn } from "@/shared/utils/cn";
import type { EnrichedCustomer, CustomerTier } from "../types/customer";

const TIER_COLORS: Record<CustomerTier, string> = {
  VIP: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  GOLD: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  SILVER: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
  REGULAR: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
};

interface CustomerDetailDrawerProps {
  customer: EnrichedCustomer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  customer,
  isOpen,
  onClose,
}) => {
  if (!customer) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/60 bg-card shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center border shrink-0",
                  customer.type === "ENTERPRISE"
                    ? "bg-blue-500/10 border-blue-500/20"
                    : "bg-teal-500/10 border-teal-500/20"
                )}
              >
                {customer.type === "ENTERPRISE" ? (
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                ) : (
                  <User className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{customer.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] h-5 px-1.5 font-bold border", TIER_COLORS[customer.tier])}
                  >
                    {customer.tier === "VIP" && <Crown className="h-2.5 w-2.5 mr-0.5" />}
                    {customer.tier}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-medium">
                    {customer.type === "ENTERPRISE" ? "Doanh nghiệp" : "Cá nhân"}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="overview" className="h-full">
            <div className="px-5 pt-3 border-b border-border/40 bg-card sticky top-0 z-10">
              <TabsList className="bg-muted/50 w-full">
                <TabsTrigger value="overview" className="text-xs flex-1 cursor-pointer">Tổng quan</TabsTrigger>
                <TabsTrigger value="addresses" className="text-xs flex-1 cursor-pointer">Địa chỉ</TabsTrigger>
                <TabsTrigger value="pricing" className="text-xs flex-1 cursor-pointer">Bảng giá</TabsTrigger>
              </TabsList>
            </div>

            {/* Tab: Tổng quan */}
            <TabsContent value="overview" className="p-5 space-y-5 mt-0">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Tổng đơn hàng",
                    value: customer.stats.totalOrders.toString(),
                    icon: Package,
                    color: "text-blue-600 dark:text-blue-400",
                    bg: "bg-blue-500/10",
                  },
                  {
                    label: "Tổng doanh thu",
                    value: formatCurrency(customer.stats.totalRevenue),
                    icon: TrendingUp,
                    color: "text-emerald-600 dark:text-emerald-400",
                    bg: "bg-emerald-500/10",
                    small: true,
                  },
                  {
                    label: "Tỷ lệ hoàn thành",
                    value: `${customer.stats.completionRate}%`,
                    icon: Percent,
                    color: "text-amber-600 dark:text-amber-400",
                    bg: "bg-amber-500/10",
                  },
                  {
                    label: "Đơn TB/lần",
                    value: formatCurrency(customer.stats.averageOrderValue),
                    icon: FileText,
                    color: "text-violet-600 dark:text-violet-400",
                    bg: "bg-violet-500/10",
                    small: true,
                  },
                ].map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-1"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={cn("h-6 w-6 rounded-md flex items-center justify-center", stat.bg)}>
                          <StatIcon className={cn("h-3 w-3", stat.color)} />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">{stat.label}</span>
                      </div>
                      <p className={cn("font-bold tabular-nums text-foreground", stat.small ? "text-xs" : "text-lg")}>
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <Separator />

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Thông tin liên hệ
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-mono">{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{customer.email}</span>
                  </div>
                  {customer.website && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-primary">{customer.website}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2.5 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{customer.address}</span>
                  </div>
                  {customer.taxCode && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-mono text-muted-foreground">MST: {customer.taxCode}</span>
                    </div>
                  )}
                  {customer.contactPerson && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>Liên hệ: {customer.contactPerson}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Ngày tạo: {formatDate(customer.createdAt)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Địa chỉ */}
            <TabsContent value="addresses" className="p-5 space-y-3 mt-0">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Sổ địa chỉ ({customer.addresses.length})
              </h4>
              {customer.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{addr.label}</span>
                    {addr.isDefault && (
                      <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-bold">
                        Mặc định
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{addr.address}</p>
                  {addr.contactName && (
                    <p className="text-[11px] text-muted-foreground">
                      {addr.contactName} • {addr.contactPhone}
                    </p>
                  )}
                </div>
              ))}
            </TabsContent>

            {/* Tab: Bảng giá */}
            <TabsContent value="pricing" className="p-5 space-y-3 mt-0">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Bảng giá hợp đồng ({customer.contractPricing.length})
              </h4>
              {customer.contractPricing.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-muted-foreground">Chưa có bảng giá riêng</p>
                </div>
              ) : (
                customer.contractPricing.map((price) => (
                  <div
                    key={price.id}
                    className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{price.routeName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formatDate(price.validFrom)} → {formatDate(price.validTo)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-muted-foreground block">Giá/km</span>
                        <span className="font-bold text-foreground tabular-nums">
                          {formatCurrency(price.pricePerKm)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Giá/kg</span>
                        <span className="font-bold text-foreground tabular-nums">
                          {formatCurrency(price.pricePerKg)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Tối thiểu</span>
                        <span className="font-bold text-foreground tabular-nums">
                          {formatCurrency(price.minimumCharge)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
