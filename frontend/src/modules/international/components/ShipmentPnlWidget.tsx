import React, { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Truck,
  Ship,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { useShipmentFinancials } from "../hooks/useInternational";

export const ShipmentPnlWidget: React.FC = () => {
  const { data: financials = [], isLoading } = useShipmentFinancials();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPnl = useMemo(() => {
    return financials.filter(
      (item) =>
        item.shipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shipperName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.carrierName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [financials, searchTerm]);

  const summary = useMemo(() => {
    const totalRev = financials.reduce((acc, cur) => acc + cur.totalRevenueVnd, 0);
    const totalCost = financials.reduce((acc, cur) => acc + cur.totalCostVnd, 0);
    const totalProfit = financials.reduce((acc, cur) => acc + cur.grossProfitVnd, 0);
    const totalProfitUsd = financials.reduce((acc, cur) => acc + cur.grossProfitUsd, 0);
    const avgMargin = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;
    return { totalRev, totalCost, totalProfit, totalProfitUsd, avgMargin };
  }, [financials]);

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1">
            <CheckCircle className="h-2.5 w-2.5" /> Đã Quyết Toán
          </Badge>
        );
      case "PARTIAL":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] gap-1">
            <Clock className="h-2.5 w-2.5" /> Thu 1 Phần
          </Badge>
        );
      default:
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] gap-1">
            <AlertCircle className="h-2.5 w-2.5" /> Chưa Quyết Toán
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center text-xs text-muted-foreground">
        Đang tổng hợp báo cáo tài chính và lợi nhuận gộp từng lô hàng...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Tổng Doanh Thu (Bán)</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-bold text-foreground font-mono">
              {summary.totalRev.toLocaleString("vi-VN")} đ
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Cước thu khách + Local charges</div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Tổng Giá Vốn (Chi phí)</span>
              <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                <Truck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-bold text-foreground font-mono">
              {summary.totalCost.toLocaleString("vi-VN")} đ
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Hãng tàu + Xe kéo + Hải quan + Bãi</div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs bg-emerald-500/[0.03]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Lợi Nhuận Gộp (Gross Profit)
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              +{summary.totalProfit.toLocaleString("vi-VN")} đ
            </div>
            <div className="text-[11px] text-emerald-600/80 font-mono mt-1">
              ≈ ${(summary.totalProfitUsd).toLocaleString("en-US", { minimumFractionDigits: 1 })} USD
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Tỷ Suất Lợi Nhuận (ROS)</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-bold text-primary font-mono">
              {summary.avgMargin.toFixed(2)}%
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Biên lợi nhuận gộp trung bình</div>
          </CardContent>
        </Card>
      </div>

      {/* P&L Table */}
      <Card className="border-border shadow-2xs">
        <CardHeader className="pb-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Báo Cáo Chi Tiết Doanh Thu - Chi Phí - Lợi Nhuận Từng Lô Hàng (P&L)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Đối chiếu giá cước bán vs giá cước mua hãng tàu, chi phí trucking nội địa, phí hải quan và chênh lệch tỷ giá
            </p>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm mã lô, shipper, hãng tàu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3.5">Mã Lô & Khách Hàng</th>
                  <th className="py-2.5 px-3.5">Hãng Tàu / Hãng Bay</th>
                  <th className="py-2.5 px-3.5 text-right">Doanh Thu Thu Khách</th>
                  <th className="py-2.5 px-3.5 text-right">Giá Vốn Hãng Tàu</th>
                  <th className="py-2.5 px-3.5 text-right">Chi Phí Vận Hành Khác</th>
                  <th className="py-2.5 px-3.5 text-right">Lợi Nhuận Gộp (VND)</th>
                  <th className="py-2.5 px-3.5 text-right">Biên ROS %</th>
                  <th className="py-2.5 px-3.5">Thanh Toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPnl.map((pnl) => {
                  const operationalCosts =
                    pnl.truckingCostVnd + pnl.customsCostVnd + pnl.portHandlingCostVnd;

                  return (
                    <tr key={pnl.shipmentId} className="hover:bg-muted/30 transition-colors">
                      {/* Code & Shipper */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-foreground font-mono text-xs">
                          {pnl.shipmentCode}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[190px] mt-0.5">
                          {pnl.shipperName}
                        </div>
                      </td>

                      {/* Carrier */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1 text-foreground font-medium">
                          <Ship className="h-3 w-3 text-muted-foreground" />
                          <span>{pnl.carrierName}</span>
                        </div>
                      </td>

                      {/* Revenue */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="font-mono font-bold text-foreground">
                          {pnl.totalRevenueVnd.toLocaleString("vi-VN")} đ
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Cước: ${(pnl.sellingFreight).toLocaleString()} + Phụ phí: ${(pnl.sellingLocalCharges).toLocaleString()}
                        </div>
                      </td>

                      {/* Buy Cost */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="font-mono font-medium text-foreground">
                          ${(pnl.buyingFreight + pnl.buyingLocalCharges).toLocaleString()} USD
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Cước mua: ${(pnl.buyingFreight).toLocaleString()}
                        </div>
                      </td>

                      {/* Other operational costs */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="font-mono text-muted-foreground">
                          {operationalCosts.toLocaleString("vi-VN")} đ
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Xe kéo: {(pnl.truckingCostVnd / 1000).toLocaleString()}k • HQ: {(pnl.customsCostVnd / 1000).toLocaleString()}k
                        </div>
                      </td>

                      {/* Gross Profit */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{pnl.grossProfitVnd.toLocaleString("vi-VN")} đ
                        </div>
                        <div className="text-[10px] text-emerald-600 font-mono mt-0.5">
                          ≈ +${pnl.grossProfitUsd.toFixed(1)} USD
                        </div>
                      </td>

                      {/* Profit Margin % */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="inline-flex items-center gap-0.5 font-mono font-bold text-primary">
                          <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                          {pnl.profitMarginPercent.toFixed(1)}%
                        </div>
                        {pnl.fxGainLossVnd !== 0 && (
                          <div
                            className={`text-[9px] font-mono mt-0.5 ${
                              pnl.fxGainLossVnd > 0 ? "text-emerald-600" : "text-red-500"
                            }`}
                          >
                            FX: {pnl.fxGainLossVnd > 0 ? "+" : ""}
                            {(pnl.fxGainLossVnd / 1000).toLocaleString()}k
                          </div>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-3.5">{getPaymentBadge(pnl.paymentStatus)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
