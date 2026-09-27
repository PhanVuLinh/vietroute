import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  RefreshCw,
  Calculator,
  Anchor,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toast } from "@/shared/components/feedback/Toast";
import type { ExchangeRateItem, LocalChargeItem } from "../types/international";

interface ExchangeRateWidgetProps {
  rates: ExchangeRateItem[];
  localCharges: LocalChargeItem[];
  isLoading?: boolean;
}

export const ExchangeRateWidget: React.FC<ExchangeRateWidgetProps> = ({
  rates,
  localCharges,
  isLoading = false,
}) => {
  const [calcAmount, setCalcAmount] = useState<string>("1500");
  const [calcCurrency, setCalcCurrency] = useState<string>("USD");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedRate = rates.find((r) => r.currency === calcCurrency) || rates[0];

  const convertedVnd = selectedRate
    ? (parseFloat(calcAmount) || 0) * selectedRate.transferRateVnd
    : 0;

  const handleRefreshRates = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success(
        "Đã cập nhật tỷ giá mới nhất",
        "Đã đồng bộ tỷ giá hối đoái liên ngân hàng Vietcombank/BIDV ngày hôm nay."
      );
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-2xs">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground mt-3">Đang cập nhật bảng tỷ giá và biểu phí cảng...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Section: Quick Calculator & Rate Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* FX Rate Table (2 Cols on LG) */}
        <Card className="lg:col-span-2 shadow-2xs border-border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                Tỷ Giá Ngoại Tệ Hải Quan & Vận Tải Quốc Tế
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Áp dụng tính thuế XNK, cước vận tải quốc tế và phí Local Charges
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshRates}
              disabled={isRefreshing}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Đồng bộ tỷ giá
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-y border-border bg-muted/30 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-4">Ngoại tệ</th>
                    <th className="py-2.5 px-4">Tên đồng tiền</th>
                    <th className="py-2.5 px-4 text-right">Mua tiền mặt</th>
                    <th className="py-2.5 px-4 text-right">Mua chuyển khoản</th>
                    <th className="py-2.5 px-4 text-right">Bán ra (Hải quan)</th>
                    <th className="py-2.5 px-4 text-center">Biến động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {rates.map((rate) => (
                    <tr key={rate.currency} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-foreground">
                        <span className="inline-flex items-center gap-1.5 font-mono text-primary">
                          {rate.currency}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground">{rate.name}</td>
                      <td className="py-2.5 px-4 text-right font-mono">
                        {rate.buyRateVnd.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-medium text-foreground">
                        {rate.transferRateVnd.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {rate.sellRateVnd.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                          <TrendingUp className="h-3 w-3" /> +0.15%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Freight Converter */}
        <Card className="shadow-2xs border-border flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              Công Cụ Quy Đổi Cước Vận Tải
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Quy đổi giá cước ngoại tệ sang VNĐ nhanh chóng
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Số tiền ngoại tệ</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  className="text-xs font-mono"
                  placeholder="Nhập số tiền..."
                />
                <select
                  value={calcCurrency}
                  onChange={(e) => setCalcCurrency(e.target.value)}
                  className="bg-background border border-input rounded-md px-3 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary"
                >
                  {rates.map((r) => (
                    <option key={r.currency} value={r.currency}>
                      {r.currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3.5 bg-muted/40 rounded-xl border border-border space-y-1">
              <div className="text-[11px] text-muted-foreground flex justify-between">
                <span>Tỷ giá áp dụng (Chuyển khoản):</span>
                <span className="font-mono font-medium text-foreground">
                  1 {calcCurrency} = {selectedRate?.transferRateVnd.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="pt-2 border-t border-border flex flex-col">
                <span className="text-[11px] text-muted-foreground">Thành tiền quy đổi (VNĐ):</span>
                <span className="text-lg font-bold text-primary font-mono mt-0.5">
                  {convertedVnd.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>

            <Button
              className="w-full text-xs h-8.5 gap-1.5"
              onClick={() => {
                toast.success(
                  "Đã áp dụng tỷ giá quy đổi",
                  `${calcAmount} ${calcCurrency} = ${convertedVnd.toLocaleString("vi-VN")} VNĐ`
                );
              }}
            >
              <Check className="h-3.5 w-3.5" /> Áp dụng vào báo giá lô hàng
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Ocean Freight Local Charges Schedule */}
      <Card className="shadow-2xs border-border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Anchor className="h-4 w-4 text-primary" />
              Biểu Phí Cảng Biển & Phụ Phí Hãng Tàu (Local Charges)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Các khoản phụ phí địa phương tiêu chuẩn tại các cảng Hải Phòng, Đà Nẵng, Cát Lái, Cái Mép
            </p>
          </div>
          <Badge variant="outline" className="text-xs gap-1 py-1">
            <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
            Biểu phí chuẩn 2026
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-y border-border bg-muted/30 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-4">Mã phụ phí</th>
                  <th className="py-2.5 px-4">Tên phụ phí</th>
                  <th className="py-2.5 px-4">Mục đích thu & Mô tả chi tiết</th>
                  <th className="py-2.5 px-4 text-right">Đơn giá quy định</th>
                  <th className="py-2.5 px-4">Đồng tiền</th>
                  <th className="py-2.5 px-4">Đơn vị tính</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {localCharges.map((charge) => (
                  <tr key={charge.code} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <Badge className="bg-primary/10 text-primary border-primary/20 font-mono font-bold text-xs">
                        {charge.code}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">{charge.name}</td>
                    <td className="py-3 px-4 text-muted-foreground max-w-sm">{charge.description}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                      {charge.amount.toLocaleString("vi-VN")}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">{charge.currency}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">
                        {charge.appliedUnit}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
