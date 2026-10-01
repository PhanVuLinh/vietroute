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
import type { ReportTimeRange, FuelAndCostData } from "../hooks/useReports";
import type { AnalyticsDashboardData } from "@/core/types/logistics";
import { cn } from "@/shared/utils/cn";

interface ExportReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  timeRange: ReportTimeRange;
  analytics?: AnalyticsDashboardData;
  enrichedDriverRanking?: any[];
  costAndFuelTrends?: FuelAndCostData[];
}

type ExportFormat = "EXCEL" | "PDF";
type ExportScope = "ALL" | "OTD" | "COSTS" | "DRIVERS";

export const ExportReportDialog: React.FC<ExportReportDialogProps> = ({
  isOpen,
  onClose,
  timeRange,
  analytics,
  enrichedDriverRanking = [],
  costAndFuelTrends = [],
}) => {
  const [format, setFormat] = useState<ExportFormat>("EXCEL");
  const [scope, setScope] = useState<ExportScope>("ALL");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "TODAY":
        return "Hôm nay";
      case "LAST_7_DAYS":
        return "7 ngày gần nhất";
      case "LAST_30_DAYS":
        return "30 ngày qua";
      case "THIS_MONTH":
        return "Tháng hiện tại";
      case "THIS_QUARTER":
        return "Quý hiện tại";
      default:
        return "Toàn bộ thời gian";
    }
  };

  const handleExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      const nowStr = new Date().toLocaleDateString("vi-VN");
      const kpis = (analytics as any)?.kpis || (analytics as any)?.summary;

      if (format === "EXCEL") {

        let csvContent = "";

        if (scope === "ALL") {
          csvContent += "BÁO CÁO TỔNG HỢP VẬN HÀNH LOGISTICS VIETROUTE\n";
          csvContent += `Kỳ báo cáo: ${getTimeRangeLabel()} | Ngày xuất: ${nowStr}\n\n`;
          csvContent += "CHỈ SỐ KPI VẬN HÀNH CHỦ CHỐT\n";
          csvContent += "Chỉ số,Giá trị thực tế,Đơn vị,Đánh giá mục tiêu\n";
          csvContent += `Tổng số đơn hàng,${kpis?.totalOrders || 0},Đơn,Toàn mạng lưới\n`;
          csvContent += `Giao thành công,${kpis?.deliveredOrders || 0},Đơn,Tỷ lệ hoàn thành cao\n`;
          csvContent += `Đang vận chuyển,${kpis?.inTransitOrders || 0},Đơn,Đang lưu thông trên tuyến\n`;
          csvContent += `Tỷ lệ giao đúng hẹn (OTD),${kpis?.onTimeDeliveryRate || 95}%,%,Mục tiêu >= 95%\n`;
          csvContent += `Đơn chậm tiến độ,${kpis?.delayedOrders || 0},Đơn,Đã cảnh báo điều phối\n`;
          csvContent += `Đội xe đang hoạt động,${kpis?.activeVehicles || 0}/${kpis?.totalVehicles || 0},Xe,Hiệu suất khai thác tốt\n`;
          csvContent += `Tài xế đang trực,${kpis?.activeDrivers || 0},Tài xế,Sẵn sàng điều phối\n`;
          csvContent += `Tổng tiền thu hộ COD,${(kpis?.totalCodRevenue || 0).toLocaleString("vi-VN")},VNĐ,Đã ghi nhận\n\n`;

          if (enrichedDriverRanking.length > 0) {
            csvContent += "BẢNG XẾP HẠNG TÀI XẾ XUẤT SẮC\n";
            csvContent += "Hạng,Họ và tên,Mã số,Điện thoại,Số đơn hoàn thành,Đánh giá sao\n";
            enrichedDriverRanking.forEach((d, idx) => {
              csvContent += `${idx + 1},"${d.name}","${d.code || d.id}","${d.phone || ""}","${d.completedDeliveriesToday || d.rating || 0}","${d.rating || 5.0}"\n`;
            });
            csvContent += "\n";
          }

          if (costAndFuelTrends.length > 0) {
            csvContent += "THỐNG KÊ CHI PHÍ VẬN CHUYỂN & NHIÊN LIỆU\n";
            csvContent += "Kỳ / Khung giờ,Cự ly (km),Nhiên liệu (lít),Phí BOT (VNĐ),Chi phí TB / km (VNĐ)\n";
            costAndFuelTrends.forEach((c) => {
              csvContent += `"${c.period}",${c.distanceKm},${c.fuelLiters},${c.tollFeeVND},${c.avgCostPerKm}\n`;
            });
          }
        } else if (scope === "DRIVERS") {
          csvContent += "BÁO CÁO NĂNG SUẤT VÀ XẾP HẠNG ĐỘI NGŨ TÀI XẾ\n";
          csvContent += `Kỳ thống kê: ${getTimeRangeLabel()} | Ngày xuất: ${nowStr}\n\n`;
          csvContent += "Hạng,Họ và tên,Mã tài xế,Số điện thoại,Chuyến hoàn thành,Điểm đánh giá\n";
          enrichedDriverRanking.forEach((d, idx) => {
            csvContent += `${idx + 1},"${d.name}","${d.code || d.id}","${d.phone || ""}","${d.completedDeliveriesToday || 0}","${d.rating || 5.0}"\n`;
          });
        } else if (scope === "COSTS") {
          csvContent += "BÁO CÁO CHI TIẾT CHI PHÍ VẬN TẢI & NHIÊN LIỆU\n";
          csvContent += `Kỳ thống kê: ${getTimeRangeLabel()} | Ngày xuất: ${nowStr}\n\n`;
          csvContent += "Kỳ / Khung giờ,Cự ly (km),Nhiên liệu tiêu thụ (lít),Phí trạm BOT (VNĐ),Chi phí TB / km (VNĐ)\n";
          costAndFuelTrends.forEach((c) => {
            csvContent += `"${c.period}",${c.distanceKm},${c.fuelLiters},${c.tollFeeVND},${c.avgCostPerKm}\n`;
          });
        } else {
          csvContent += "BÁO CÁO TỶ LỆ GIAO HÀNG ĐÚNG HẸN (SLA & OTD)\n";
          csvContent += `Kỳ thống kê: ${getTimeRangeLabel()} | Ngày xuất: ${nowStr}\n\n`;
          csvContent += "Chỉ tiêu,Số lượng,Tỷ lệ,Ghi chú\n";
          csvContent += `Tổng đơn giao,${kpis?.totalOrders || 0},100%,Toàn hệ thống\n`;
          csvContent += `Đúng hẹn (On-Time),${kpis?.deliveredOrders || 0},${kpis?.onTimeDeliveryRate || 95}%,Đạt chuẩn SLA\n`;
          csvContent += `Chậm trễ / Sự cố,${kpis?.delayedOrders || 0},${100 - (kpis?.onTimeDeliveryRate || 95)}%,Cần cải thiện\n`;
        }

        // Tải xuống file CSV có BOM UTF-8 để Excel hiển thị tiếng Việt không bị lỗi font
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `VietRoute_${scope}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Mở cửa sổ in ấn báo cáo PDF chuyên nghiệp
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Báo Cáo Vận Hành VietRoute - ${nowStr}</title>
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; }
                .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }
                .title { font-size: 24px; font-weight: bold; color: #1e3a8a; margin: 0; }
                .subtitle { font-size: 13px; color: #64748b; margin-top: 5px; }
                .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
                .kpi-card { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; background: #f8fafc; }
                .kpi-val { font-size: 22px; font-weight: bold; color: #2563eb; }
                .kpi-lbl { font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 4px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
                th { background: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1; text-align: left; }
                td { padding: 10px; border: 1px solid #e2e8f0; }
                .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
                @media print { button { display: none; } }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="title">VIETROUTE LOGISTICS - BÁO CÁO VẬN HÀNH</div>
                <div class="subtitle">Kỳ báo cáo: ${getTimeRangeLabel()} | Xuất ngày: ${nowStr} | Hệ thống CSDL: PostgreSQL</div>
              </div>

              <div class="kpi-grid">
                <div class="kpi-card">
                  <div class="kpi-val">${kpis?.totalOrders || 0}</div>
                  <div class="kpi-lbl">Tổng đơn hàng</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-val">${kpis?.onTimeDeliveryRate || 95}%</div>
                  <div class="kpi-lbl">Tỷ lệ đúng hẹn OTD</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-val">${kpis?.activeVehicles || 0}/${kpis?.totalVehicles || 0}</div>
                  <div class="kpi-lbl">Đội xe hoạt động</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-val">${((kpis?.totalCodRevenue || 0) / 1000000).toFixed(1)} Tr</div>
                  <div class="kpi-lbl">Doanh thu cước & COD</div>
                </div>
              </div>

              <h3>1. Năng suất Đội ngũ Tài xế tiêu biểu</h3>
              <table>
                <thead>
                  <tr>
                    <th>Hạng</th>
                    <th>Họ và tên</th>
                    <th>Điện thoại</th>
                    <th>Chuyến hoàn thành</th>
                    <th>Đánh giá sao</th>
                  </tr>
                </thead>
                <tbody>
                  ${enrichedDriverRanking.slice(0, 5).map((d, idx) => `
                    <tr>
                      <td>#${idx + 1}</td>
                      <td><b>${d.name}</b></td>
                      <td>${d.phone || "---"}</td>
                      <td>${d.completedDeliveriesToday || 0} đơn</td>
                      <td>⭐ ${d.rating || 5.0}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>

              <div class="footer">
                <div>Người lập: Điều hành viên VietRoute</div>
                <div>Xác nhận: Ban Giám đốc Khối Vận tải</div>
              </div>

              <script>
                window.onload = function() { window.print(); }
              </script>
            </body>
            </html>
          `);
          printWindow.document.close();
        }
      }

      setIsExporting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 800);
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
            Tải về bộ số liệu thực tế từ cơ sở dữ liệu phục vụ đối soát, kiểm toán và báo cáo KPI.
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
                  <p className="text-[10px] text-muted-foreground">UTF-8 chuẩn tiếng Việt</p>
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
                  <p className="text-[10px] text-muted-foreground">Mẫu in quản trị khổ A4</p>
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
                <SelectItem value="ALL">Toàn bộ chỉ số vận hành & Đội xe (Khuyến nghị)</SelectItem>
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
              {getTimeRangeLabel()}
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
                <span>Đã kết xuất!</span>
              </>
            ) : isExporting ? (
              <span>Đang trích xuất dữ liệu...</span>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>{format === "PDF" ? "In / Lưu PDF" : "Tải tệp xuống"}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
