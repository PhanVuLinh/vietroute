import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  QrCode,
  ShieldAlert,
} from "lucide-react";
import { formatCurrency } from "@/shared/utils/formatters";

interface DebtCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    scannedCount: number;
    remindedCount: number;
    totalOverdueAmount: number;
    categories: {
      upcoming?: { count: number; title: string; items: any[] };
      overdueLevel1?: { count: number; title: string; items: any[] };
      overdueLevel2?: { count: number; title: string; items: any[] };
    };
  } | null;
}

export const DebtCollectionModal: React.FC<DebtCollectionModalProps> = ({
  open,
  onOpenChange,
  data,
}) => {
  if (!data) return null;

  const { scannedCount, remindedCount, totalOverdueAmount, categories } = data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-5">
        <DialogHeader className="space-y-1.5 text-left border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Kết Quả Tự Động Thu Hồi & Nhắc Nợ B2B
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Hệ thống tự động phát hiện, phân cấp rủi ro và gửi thông báo đa kênh kèm mã VietQR
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* 1. Thống kê tóm tắt */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 text-center space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Tổng Hóa Đơn Quét
            </span>
            <span className="text-xl font-extrabold text-foreground">{scannedCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-1">
            <span className="text-[10px] text-primary uppercase font-bold tracking-wider block">
              Đã Kích Hoạt Nhắc Nợ
            </span>
            <span className="text-xl font-extrabold text-primary">{remindedCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-1">
            <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-bold tracking-wider block">
              Nợ Quá Hạn Cần Thu
            </span>
            <span className="text-base sm:text-lg font-extrabold text-rose-600 dark:text-rose-400">
              {formatCurrency(totalOverdueAmount)}
            </span>
          </div>
        </div>

        {/* 2. Chi tiết theo từng phân cấp */}
        <div className="space-y-4">
          {/* Cấp 2: Quá hạn khẩn cấp (> 7 ngày) */}
          {categories.overdueLevel2 && categories.overdueLevel2.items.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{categories.overdueLevel2.title}</span>
                </div>
                <Badge className="bg-rose-600 text-white text-[10px]">
                  {categories.overdueLevel2.count} hóa đơn
                </Badge>
              </div>

              <div className="space-y-2">
                {categories.overdueLevel2.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{item.customerName}</span>
                        <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                          ({item.invoiceCode})
                        </span>
                        <Badge variant="outline" className="text-[9px] border-rose-500 text-rose-600 bg-rose-500/10">
                          Quá hạn {item.diffDays} ngày
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Số tiền cần thu: <b className="text-rose-600 font-mono">{formatCurrency(item.remainingAmount)}</b> • Hạn chót:{" "}
                        {new Date(item.dueDate).toLocaleDateString("vi-VN")}
                      </div>
                    </div>

                    <a
                      href={`/portal/pay/${item.invoiceCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline bg-card px-2.5 py-1.5 rounded-lg border shadow-xs"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Cổng VietQR</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cấp 1: Quá hạn 1 - 7 ngày */}
          {categories.overdueLevel1 && categories.overdueLevel1.items.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{categories.overdueLevel1.title}</span>
                </div>
                <Badge className="bg-amber-600 text-white text-[10px]">
                  {categories.overdueLevel1.count} hóa đơn
                </Badge>
              </div>

              <div className="space-y-2">
                {categories.overdueLevel1.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{item.customerName}</span>
                        <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                          ({item.invoiceCode})
                        </span>
                        <Badge variant="outline" className="text-[9px] border-amber-500 text-amber-600 bg-amber-500/10">
                          Trễ {item.diffDays} ngày
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Số tiền: <b className="text-amber-600 font-mono">{formatCurrency(item.remainingAmount)}</b>
                      </div>
                    </div>

                    <a
                      href={`/portal/pay/${item.invoiceCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline bg-card px-2.5 py-1.5 rounded-lg border shadow-xs"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Cổng VietQR</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sắp đến hạn */}
          {categories.upcoming && categories.upcoming.items.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                  <Clock className="h-4 w-4" />
                  <span>{categories.upcoming.title}</span>
                </div>
                <Badge className="bg-blue-600 text-white text-[10px]">
                  {categories.upcoming.count} hóa đơn
                </Badge>
              </div>

              <div className="space-y-2">
                {categories.upcoming.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{item.customerName}</span>
                        <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                          ({item.invoiceCode})
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Số tiền: <b className="text-blue-600 font-mono">{formatCurrency(item.remainingAmount)}</b> • Hạn:{" "}
                        {new Date(item.dueDate).toLocaleDateString("vi-VN")}
                      </div>
                    </div>

                    <a
                      href={`/portal/pay/${item.invoiceCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline bg-card px-2.5 py-1.5 rounded-lg border shadow-xs"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Cổng VietQR</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 flex justify-between sm:justify-between items-center">
          <span className="text-[11px] text-muted-foreground italic flex items-center gap-1">
            <Mail className="h-3.5 w-3.5 text-primary" />
            Đã đồng bộ thông báo tới hệ thống quản trị và đối tác
          </span>
          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs px-5 cursor-pointer font-semibold"
          >
            Đóng báo cáo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
