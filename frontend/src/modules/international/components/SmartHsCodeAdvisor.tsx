import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Search,
  Scale,
  ShieldAlert,
  Calculator,
  TrendingDown,
  Building,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { useHsCodes } from "../hooks/useInternational";
import type { HsCodeItem, FtaTaxCalculationResult } from "../types/international";

export const SmartHsCodeAdvisor: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: hsCodes = [], isLoading } = useHsCodes(searchTerm);

  // Selected HS Code for calculator
  const [selectedHs, setSelectedHs] = useState<HsCodeItem | null>(null);
  const [calcInvoiceValue, setCalcInvoiceValue] = useState<number>(35000);
  const [selectedFta, setSelectedFta] = useState<string>("EVFTA");

  // Keep selected item valid
  const currentHs = selectedHs || hsCodes[0] || null;

  // Real calculation based on current exchange rate (25,450 VND)
  const calculationResult: FtaTaxCalculationResult | null = useMemo(() => {
    if (!currentHs) return null;
    const rateUsd = 25450;
    const valueVnd = calcInvoiceValue * rateUsd;

    let applicableDutyRate = currentHs.mfnRate;
    let ftaName = "MFN (Biểu thuế tối huệ quốc)";

    switch (selectedFta) {
      case "EVFTA":
        applicableDutyRate = currentHs.evftaRate;
        ftaName = "EVFTA (Hiệp định VN - Liên minh Châu Âu EU)";
        break;
      case "CPTPP":
        applicableDutyRate = currentHs.cptppRate;
        ftaName = "CPTPP (Hiệp định Đối tác Toàn diện & Tiến bộ)";
        break;
      case "ACFTA":
        applicableDutyRate = currentHs.acftaRate;
        ftaName = "ACFTA Form E (ASEAN - Trung Quốc)";
        break;
      case "ATIGA":
        applicableDutyRate = currentHs.atigaRate;
        ftaName = "ATIGA Form D (Nội khối ASEAN)";
        break;
      case "VKFTA":
        applicableDutyRate = currentHs.vkftaRate;
        ftaName = "VKFTA Form AK (Việt Nam - Hàn Quốc)";
        break;
      default:
        applicableDutyRate = currentHs.mfnRate;
    }

    const standardDutyVnd = (valueVnd * currentHs.standardDutyRate) / 100;
    const applicableDutyVnd = (valueVnd * applicableDutyRate) / 100;
    const vatVnd = ((valueVnd + applicableDutyVnd) * currentHs.vatRate) / 100;
    const totalTaxVnd = applicableDutyVnd + vatVnd;
    const dutySavingsVnd = standardDutyVnd - applicableDutyVnd;

    return {
      hsCode: currentHs.hsCode,
      descriptionVi: currentHs.descriptionVi,
      ftaName,
      applicableDutyRate,
      mfnRate: currentHs.mfnRate,
      standardDutyRate: currentHs.standardDutyRate,
      vatRate: currentHs.vatRate,
      cifValueVnd: Math.round(valueVnd),
      applicableDutyVnd: Math.round(applicableDutyVnd),
      vatVnd: Math.round(vatVnd),
      totalTaxVnd: Math.round(totalTaxVnd),
      dutySavingsVnd: Math.round(dutySavingsVnd),
      specializedInspection: currentHs.specializedInspection,
      inspectionAgency: currentHs.inspectionAgency,
      importConditions: currentHs.importConditions,
    };
  }, [currentHs, calcInvoiceValue, selectedFta]);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">
                Trợ Lý Phân Loại Mã HS & Dự Toán Thuế FTA 2026
              </h3>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                Biểu Thuế XNK Mới Nhất
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tự động gợi ý mã HS 8 số, so sánh thuế suất ưu đãi đặc biệt các Hiệp định FTA (EVFTA, CPTPP, ACFTA, ATIGA) và cảnh báo thủ tục kiểm tra chuyên ngành.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Gõ tên hàng: tôm, cà phê, vải, lốp xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-8.5 bg-background"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: HS Database vs FTA Tax Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* HS Code Catalog (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-primary" />
              Danh Mục Mặt Hàng & Biểu Thuế Chi Tiết ({hsCodes.length})
            </span>
            <span className="text-muted-foreground">Click chọn mặt hàng để tính toán thuế</span>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-xs text-muted-foreground">
                Đang tra cứu cơ sở dữ liệu biểu thuế...
              </div>
            ) : hsCodes.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-xs text-muted-foreground">
                Không tìm thấy mã HS phù hợp với từ khóa "{searchTerm}"
              </div>
            ) : (
              hsCodes.map((item) => {
                const isSelected = currentHs?.hsCode === item.hsCode;
                return (
                  <div
                    key={item.hsCode}
                    onClick={() => setSelectedHs(item)}
                    className={`bg-card rounded-xl border p-4 transition-all cursor-pointer hover:border-primary/50 shadow-2xs ${
                      isSelected
                        ? "border-primary ring-1 ring-primary/30 bg-primary/[0.02]"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/10 text-primary border-primary/20 font-mono font-bold text-xs">
                            HS {item.hsCode}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            ĐVT: {item.unit}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-bold text-foreground mt-1.5 leading-snug">
                          {item.descriptionVi}
                        </h4>
                        <p className="text-[11px] text-muted-foreground italic mt-0.5">
                          {item.descriptionEn}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="shrink-0 text-primary">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    {/* Tariffs comparison strip */}
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mt-3 pt-3 border-t border-border/60 text-center">
                      <div className="p-1.5 bg-muted/40 rounded">
                        <div className="text-[9px] text-muted-foreground uppercase">Thông thường</div>
                        <div className="text-xs font-bold text-foreground font-mono">{item.standardDutyRate}%</div>
                      </div>
                      <div className="p-1.5 bg-muted/40 rounded">
                        <div className="text-[9px] text-muted-foreground uppercase">MFN</div>
                        <div className="text-xs font-bold text-foreground font-mono">{item.mfnRate}%</div>
                      </div>
                      <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                        <div className="text-[9px] text-emerald-600 font-semibold uppercase">EVFTA</div>
                        <div className="text-xs font-bold text-emerald-600 font-mono">{item.evftaRate}%</div>
                      </div>
                      <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                        <div className="text-[9px] text-emerald-600 font-semibold uppercase">CPTPP</div>
                        <div className="text-xs font-bold text-emerald-600 font-mono">{item.cptppRate}%</div>
                      </div>
                      <div className="p-1.5 bg-blue-500/10 rounded border border-blue-500/20">
                        <div className="text-[9px] text-blue-600 font-semibold uppercase">Form E</div>
                        <div className="text-xs font-bold text-blue-600 font-mono">{item.acftaRate}%</div>
                      </div>
                      <div className="p-1.5 bg-blue-500/10 rounded border border-blue-500/20">
                        <div className="text-[9px] text-blue-600 font-semibold uppercase">Form D</div>
                        <div className="text-xs font-bold text-blue-600 font-mono">{item.atigaRate}%</div>
                      </div>
                      <div className="p-1.5 bg-amber-500/10 rounded border border-amber-500/20">
                        <div className="text-[9px] text-amber-600 font-semibold uppercase">VAT</div>
                        <div className="text-xs font-bold text-amber-600 font-mono">{item.vatRate}%</div>
                      </div>
                    </div>

                    {/* Specialized Inspection Warning */}
                    {item.specializedInspection && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-semibold">Kiểm tra chuyên ngành:</span> {item.specializedInspection} ({item.inspectionAgency})
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* FTA Tax Calculation Simulator (1 Col) */}
        {calculationResult && (
          <div className="space-y-4">
            <Card className="border-border shadow-2xs">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  Mô Phỏng Thuế & Tối Ưu C/O
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">
                  Đang áp dụng cho mã HS <span className="font-mono font-bold text-primary">{calculationResult.hsCode}</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Invoice input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Trị giá hóa đơn tính thuế (CIF USD)
                  </label>
                  <Input
                    type="number"
                    value={calcInvoiceValue}
                    onChange={(e) => setCalcInvoiceValue(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="text-xs font-mono"
                  />
                  <div className="text-[10px] text-muted-foreground flex justify-between">
                    <span>Quy đổi tỷ giá hải quan:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {calculationResult.cifValueVnd.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                </div>

                {/* FTA select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Hiệp định FTA áp dụng (Có C/O hợp lệ)
                  </label>
                  <select
                    value={selectedFta}
                    onChange={(e) => setSelectedFta(e.target.value)}
                    className="w-full bg-background border border-input rounded-md px-3 py-1.5 text-xs font-medium text-foreground focus:ring-1 focus:ring-primary"
                  >
                    <option value="EVFTA">EVFTA (Việt Nam - EU)</option>
                    <option value="CPTPP">CPTPP (Khối Thái Bình Dương)</option>
                    <option value="ACFTA">ACFTA - Form E (Trung Quốc)</option>
                    <option value="ATIGA">ATIGA - Form D (ASEAN)</option>
                    <option value="VKFTA">VKFTA - Form AK (Hàn Quốc)</option>
                    <option value="MFN">MFN (Không có C/O ưu đãi)</option>
                  </select>
                </div>

                {/* Calculation breakdown */}
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border space-y-2 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Thuế suất ưu đãi ({selectedFta}):</span>
                    <span className="font-mono font-bold text-foreground">
                      {calculationResult.applicableDutyRate}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Tiền thuế nhập khẩu:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {calculationResult.applicableDutyVnd.toLocaleString("vi-VN")} đ
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Thuế GTGT ({calculationResult.vatRate}%):</span>
                    <span className="font-mono font-semibold text-foreground">
                      {calculationResult.vatVnd.toLocaleString("vi-VN")} đ
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-between items-center font-bold">
                    <span className="text-foreground">Tổng thuế phải nộp:</span>
                    <span className="text-sm font-mono text-primary">
                      {calculationResult.totalTaxVnd.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>

                {/* Duty Savings Alert */}
                {calculationResult.dutySavingsVnd > 0 && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
                      <TrendingDown className="h-4 w-4" />
                      Tiết kiệm nhờ Giấy chứng nhận C/O:
                    </div>
                    <div className="text-base font-bold text-emerald-600 font-mono mt-1">
                      {calculationResult.dutySavingsVnd.toLocaleString("vi-VN")} VNĐ
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      So với biểu thuế thông thường ({calculationResult.standardDutyRate}%), doanh nghiệp đã tiết kiệm được khoản tiền thuế này nhờ nộp C/O hợp lệ.
                    </p>
                  </div>
                )}

                {/* Import Condition info */}
                {calculationResult.importConditions && (
                  <div className="text-[11px] text-muted-foreground p-2.5 rounded-lg bg-card border border-border flex items-start gap-2">
                    <Building className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground">Điều kiện nhập khẩu:</span>{" "}
                      {calculationResult.importConditions}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
