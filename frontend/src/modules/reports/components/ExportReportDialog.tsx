import React, { useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { ReportTimeRange } from "../hooks/useReports";
import { cn } from "@/shared/utils/cn";

interface ExportReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  timeRange: ReportTimeRange;
}

type ExportFormat = "EXCEL" | "PDF" | "CSV";
type ExportScope = "ALL" | "OTD" | "COSTS" | "DRIVERS";

export const ExportReportDialog: React.FC<ExportReportDialogProps> = ({
  isOpen,
  onClose,
  timeRange,
}) => {
  const [format, setFormat] = useState<ExportFormat>("EXCEL");
  const [scope, setScope] = useState<ExportScope>("ALL");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      // Tạo tệp CSV mẫu và trigger tải về
      const csvHeader = "Mã Báo Cáo,Kỳ Báo Cáo,Tổng Đơn Hàng,Tỷ Lệ OTD (%),Cự Ly (km),Nhiên Liệu (lít),Phí BOT (VNĐ),Doanh Thu COD (VNĐ)\n";
      const csvRow = `RPT-2026-09,${timeRange},50,97.2,1845,285,1150000,185420000\n`;
      const blob = new Blob(["\uFEFF" + csvHeader + csvRow], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `VietRoute_BaoCao_VanHanh_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <span>Xuất Báo Cáo Vận Hành Doanh Nghiệp</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Tải về bộ số liệu thống kê chi tiết phục vụ kiểm toán, đối soát chi phí và đánh giá KPI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 1. Chọn định dạng xuất */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Định dạng tệp xuất</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("EXCEL")}
                className={cn(
                  "p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer",
                  format === "EXCEL"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30"
                    : "border-border hover:bg-muted text-muted-foreground"
                )}
              >
                <FileSpreadsheet className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">Bảng tính Excel (.csv)</p>
                  <p className="text-[10px] text-muted-foreground">Số liệu chi tiết từng chuyến</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("PDF")}
                className={cn(
                  "p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer",
                  format === "PDF"
                    ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30"
                    : "border-border hover:bg-muted text-muted-foreground"
                )}
              >
                <FileText className="h-6 w-6 text-rose-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">Bản in Báo cáo (.pdf)</p>
                  <p className="text-[10px] text-muted-foreground">Đầy đủ biểu đồ trực quan</p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Phạm vi dữ liệu */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>Phạm vi phân tích</span>
            </label>
            <Select value={scope} onValueChange={(val) => setScope(val as ExportScope)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Chọn phạm vi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Toàn bộ chỉ số vận hành (Khuyến nghị)</SelectItem>
                <SelectItem value="OTD">Chuyên sâu Tỷ lệ đúng hẹn SLA / OTD</SelectItem>
                <SelectItem value="COSTS">Chi phí Nhiên liệu & Trạm thu phí BOT</SelectItem>
                <SelectItem value="DRIVERS">Năng suất & Bảng xếp hạng Tài xế</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 3. Kỳ báo cáo */}
          <div className="p-3 bg-muted/40 border border-border rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Kỳ thống kê:</span>
            </div>
            <span className="font-bold text-foreground font-mono">
              {timeRange === "TODAY"
                ? "Hôm nay"
                : timeRange === "LAST_7_DAYS"
                ? "7 ngày gần nhất"
                : timeRange === "LAST_30_DAYS"
                ? "30 ngày qua"
                : timeRange === "THIS_MONTH"
                ? "Tháng 09/2026"
                : "Quý III/2026"}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isExporting} className="h-9 text-xs">
            Hủy
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={isExporting || isSuccess}
            className="h-9 text-xs gap-1.5 min-w-[120px]"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>Đã tải về!</span>
              </>
            ) : isExporting ? (
              <span>Đang kết xuất...</span>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Tải tệp xuống</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
