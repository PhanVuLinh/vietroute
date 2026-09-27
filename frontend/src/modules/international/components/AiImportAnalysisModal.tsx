import React, { useState } from "react";
import {
  Brain,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Truck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  useAiImportAnalysis,
  useInternationalMutations,
  useInternationalShipments,
} from "../hooks/useInternational";

interface AiImportAnalysisModalProps {
  shipmentCode: string | null;
  isOpen: boolean;
  onClose: () => void;
  onGoToDrayage?: () => void;
}

export const AiImportAnalysisModal: React.FC<AiImportAnalysisModalProps> = ({
  shipmentCode: initialShipmentCode,
  isOpen,
  onClose,
  onGoToDrayage,
}) => {
  const { data: shipments = [] } = useInternationalShipments();
  const [selectedCode, setSelectedCode] = useState<string>(
    initialShipmentCode || "IMP-2026-005"
  );

  // Sync if prop changes
  React.useEffect(() => {
    if (initialShipmentCode) {
      setSelectedCode(initialShipmentCode);
    }
  }, [initialShipmentCode]);

  const { data: analysis, isLoading, refetch } = useAiImportAnalysis(
    selectedCode,
    isOpen
  );

  const { runAiAutoDispatch } = useInternationalMutations();

  const handleRunAutoDispatch = async () => {
    if (!selectedCode) return;
    await runAiAutoDispatch.mutateAsync(selectedCode);
    if (onGoToDrayage) {
      onGoToDrayage();
      onClose();
    }
  };

  const getRiskBadge = (level?: string) => {
    switch (level) {
      case "LOW_SAFE":
        return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs px-2.5 py-0.5">AN TOÀN CAO (SAFE)</Badge>;
      case "MEDIUM_CAUTION":
        return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs px-2.5 py-0.5">CẦN CHÚ Ý (CAUTION)</Badge>;
      case "HIGH_CRITICAL":
        return <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/30 text-xs px-2.5 py-0.5">RỦI RO CAO (CRITICAL)</Badge>;
      default:
        return <Badge variant="outline">Đang phân tích...</Badge>;
    }
  };

  const getChannelBadge = (ch?: string) => {
    switch (ch) {
      case "GREEN":
        return (
          <Badge className="bg-emerald-500 text-white font-bold px-2 py-0.5 text-xs shadow-xs">
            LUỒNG XANH (98% Thông quan ngay)
          </Badge>
        );
      case "YELLOW":
        return (
          <Badge className="bg-amber-500 text-white font-bold px-2 py-0.5 text-xs shadow-xs">
            LUỒNG VÀNG (Kiểm tra hồ sơ giấy tờ)
          </Badge>
        );
      case "RED":
        return (
          <Badge className="bg-rose-600 text-white font-bold px-2 py-0.5 text-xs shadow-xs">
            LUỒNG ĐỎ (Kiểm hóa thực tế bãi)
          </Badge>
        );
      default:
        return <Badge variant="outline">Chưa xác định</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto text-foreground p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-2xs">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <span>Trí Tuệ Nhân Tạo Phân Tích & Điều Phối Lô Hàng Nhập Khẩu</span>
                  <Badge variant="outline" className="border-primary/40 text-primary font-mono text-[10px]">
                    VietRoute AI 2026
                  </Badge>
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tối ưu hóa luồng hải quan VNACCS, dự báo cầu bãi cảng biển, cảnh báo phí Dem/Det và tự động điều độ xe container
                </p>
              </div>
            </div>

            {/* Shipment Selector */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="h-8.5 text-xs px-2.5 rounded-lg border border-border bg-background text-foreground font-mono font-semibold"
              >
                {shipments.map((s) => (
                  <option key={s.id} value={s.shipmentCode}>
                    {s.shipmentCode} ({s.direction === "IMPORT" ? "Nhập" : "Xuất"} - {s.carrierName})
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="h-8.5 w-8.5 p-0"
                title="Phân tích lại"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
            <p className="text-sm font-semibold text-foreground">AI đang tổng hợp dữ liệu luồng hàng & cầu cảng...</p>
            <p className="text-xs text-muted-foreground">
              Đang đối chiếu dữ liệu VNACCS, lịch tàu AIS, bãi container Cát Lái và định mức vận tải container.
            </p>
          </div>
        ) : !analysis ? (
          <div className="py-16 text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <p className="text-sm font-semibold">Chưa có dữ liệu phân tích cho lô hàng {selectedCode}</p>
          </div>
        ) : (
          <div className="space-y-5 text-xs pt-2">
            {/* Top Score Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-muted/40 p-4 rounded-xl border border-border">
              <div className="flex items-center gap-3 md:col-span-2">
                <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 border-2 border-primary">
                  <span className="font-mono text-xl font-extrabold text-primary">
                    {analysis.overallRiskScore}
                  </span>
                  <span className="text-[9px] text-muted-foreground absolute -bottom-2 bg-background px-1 border rounded">
                    /100
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">Chỉ Số Rủi Ro Tổng Hợp</span>
                    {getRiskBadge(analysis.riskLevel)}
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-1">
                    Đánh giá toàn diện từ lịch trình tàu, mức độ kiểm hóa hải quan đến rủi ro phát sinh phụ phí lưu bãi.
                  </p>
                </div>
              </div>

              <div className="border-l border-border pl-3 flex flex-col justify-center">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Khung giờ cấm tải container</span>
                <span className="font-semibold text-primary text-[11px] mt-0.5">
                  {analysis.portCongestionPrediction.recommendedDrayageWindow.split(" ")[0]} - {analysis.portCongestionPrediction.recommendedDrayageWindow.split(" ")[2]}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Tránh cao điểm TP.HCM</span>
              </div>

              <div className="border-l border-border pl-3 flex flex-col justify-center">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Hạn Free Time Vỏ Cont</span>
                <span className="font-mono font-bold text-emerald-600 text-sm mt-0.5">
                  Còn {analysis.demurrageAvoidancePlan.freeTimeRemainingDays} ngày miễn phí
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  Phạt trễ: {analysis.demurrageAvoidancePlan.dailyPenaltyVnd.toLocaleString("vi-VN")} đ/ngày
                </span>
              </div>
            </div>

            {/* 2-Column Core Intelligence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Dự Báo Hải Quan VNACCS */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-foreground text-xs uppercase tracking-wide">
                      Dự Báo Luồng Hải Quan VNACCS
                    </span>
                  </div>
                  {getChannelBadge(analysis.customsRiskAssessment.channelPrediction)}
                </div>

                <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-lg text-center font-mono">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Độ tin cậy mô hình</span>
                    <span className="text-sm font-bold text-foreground">
                      {100 - analysis.customsRiskAssessment.auditProbabilityPercent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Xác suất bị kiểm hóa</span>
                    <span className="text-sm font-bold text-amber-600">
                      {analysis.customsRiskAssessment.auditProbabilityPercent}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-semibold text-foreground text-[11px] block">Tiêu chí tuân thủ & dấu hiệu:</span>
                  <ul className="space-y-1 text-muted-foreground text-[11px]">
                    {analysis.customsRiskAssessment.complianceFlags.map((flag: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {analysis.customsRiskAssessment.potentialPenaltyWarning && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                    <span>{analysis.customsRiskAssessment.potentialPenaltyWarning}</span>
                  </div>
                )}
              </div>

              {/* Box 2: Tình Trạng Cầu Bãi & Cảnh Báo Dem/Det */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-bold text-foreground text-xs uppercase tracking-wide">
                      Cảng Đích & Quản Trị Vỏ Cont (Dem/Det)
                    </span>
                  </div>
                  <Badge variant="outline" className="text-primary font-mono text-[10px]">
                    {analysis.portCongestionPrediction.portName}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-lg text-center font-mono">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Mức độ bận rộn bãi cảng</span>
                    <span className="text-sm font-bold text-amber-600">
                      {analysis.portCongestionPrediction.congestionLevelPercent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Thời gian chờ cầu tàu</span>
                    <span className="text-sm font-bold text-foreground">
                      {analysis.portCongestionPrediction.averageVesselWaitingTimeHours} giờ
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-primary font-semibold text-[11px]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Khung Giờ Rút Cont Khuyến Nghị Tránh Cấm Tải:</span>
                  </div>
                  <p className="text-[11px] text-foreground font-medium">
                    {analysis.portCongestionPrediction.recommendedDrayageWindow}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="font-semibold text-foreground text-[11px] block">Kế hoạch giải phóng vỏ cont:</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {analysis.demurrageAvoidancePlan.recommendedAction} (Hạn chót an toàn: {analysis.demurrageAvoidancePlan.maxSafeStorageDate})
                  </p>
                </div>
              </div>
            </div>

            {/* Landed Cost Breakdown */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-xs uppercase tracking-wide">
                    Dự Toán Chi Phí Nhập Khẩu Đơn Vị (Total Landed Cost)
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-muted-foreground text-[11px]">Quy cách tính:</span>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                    {analysis.landedCostBreakdown.unitName}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/40 border border-border">
                  <span className="text-[9px] text-muted-foreground block">Giá Hàng FOB</span>
                  <span className="font-mono font-bold text-foreground text-[11px]">
                    {(analysis.landedCostBreakdown.fobValueVnd / 1e6).toFixed(1)} Tr đ
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-muted/40 border border-border">
                  <span className="text-[9px] text-muted-foreground block">Cước Biển & BH</span>
                  <span className="font-mono font-bold text-foreground text-[11px]">
                    {(analysis.landedCostBreakdown.freightAndInsuranceVnd / 1e6).toFixed(1)} Tr đ
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-muted/40 border border-border">
                  <span className="text-[9px] text-muted-foreground block">Thuế NK & VAT</span>
                  <span className="font-mono font-bold text-foreground text-[11px]">
                    {(analysis.landedCostBreakdown.importTaxAndVatVnd / 1e6).toFixed(1)} Tr đ
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-muted/40 border border-border">
                  <span className="text-[9px] text-muted-foreground block">Local Charges Cảng</span>
                  <span className="font-mono font-bold text-foreground text-[11px]">
                    {(analysis.landedCostBreakdown.portAndLocalChargesVnd / 1e6).toFixed(2)} Tr đ
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-muted/40 border border-border">
                  <span className="text-[9px] text-muted-foreground block">Kéo Cont (Drayage)</span>
                  <span className="font-mono font-bold text-foreground text-[11px]">
                    {(analysis.landedCostBreakdown.inlandDrayageTruckingVnd / 1e6).toFixed(2)} Tr đ
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-[9px] text-primary font-semibold block">Đơn Giá / SP</span>
                  <span className="font-mono font-bold text-primary text-xs">
                    {analysis.landedCostBreakdown.costPerUnitVnd.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>

            {/* AI Action Recommendations & Auto-Dispatch Button */}
            <div className="p-4 rounded-xl border border-primary/30 bg-linear-to-r from-primary/10 via-primary/5 to-transparent space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wide">
                <Zap className="h-4 w-4" />
                <span>Đề Xuất Hành Động Thông Minh Từ AI Engine</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {analysis.aiRecommendations.map((rec: string, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg bg-background/80 border border-border flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-[11px] text-foreground leading-snug">{rec}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-primary/20">
                <div className="text-[11px] text-muted-foreground">
                  Bấm kích hoạt để tự động gán xe đầu kéo, moóc và tài xế bằng FC trong khung giờ tránh cấm tải.
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="h-9 text-xs flex-1 sm:flex-none"
                  >
                    Đóng
                  </Button>
                  <Button
                    onClick={handleRunAutoDispatch}
                    disabled={runAiAutoDispatch.isPending}
                    className="h-9 px-4 text-xs font-bold gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90 flex-1 sm:flex-none"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>
                      {runAiAutoDispatch.isPending
                        ? "Đang tự động điều độ..."
                        : "Kích Hoạt AI Điều Xe Tự Động (Auto-Dispatch)"}
                    </span>
                    <Truck className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
