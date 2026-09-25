import React from 'react';
import {
  Receipt,
  Download,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/shared/utils/formatters';
import { toast } from '@/shared/components/feedback/Toast';
import type { B2BInvoiceSummary } from '../../types/b2bPortal';

interface B2BInvoiceLedgerProps {
  invoices: B2BInvoiceSummary[];
  onOpenPayInvoice: (invoice: B2BInvoiceSummary) => void;
}

export const B2BInvoiceLedger: React.FC<B2BInvoiceLedgerProps> = ({
  invoices,
  onOpenPayInvoice,
}) => {
  const handleDownloadInvoice = (inv: B2BInvoiceSummary) => {
    toast.success('Đang tạo hóa đơn điện tử', `Hóa đơn điện tử VAT [${inv.invoiceCode}] đang được tải xuống...`);
  };

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="py-4 px-5 border-b border-border/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Sổ Hóa Đơn Cước Vận Tải & Đối Soát Định Kỳ
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Tra cứu hóa đơn điện tử VAT, tình trạng thanh toán và thanh toán trực tiếp qua cổng VietQR Napas 24/7.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Tổng số:</span>
          <strong className="text-foreground">{invoices.length} kỳ hóa đơn</strong>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border/60">
              <tr>
                <th className="py-3 px-4">Mã hóa đơn</th>
                <th className="py-3 px-4">Kỳ đối soát cước</th>
                <th className="py-3 px-4 text-right">Tổng tiền (VNĐ)</th>
                <th className="py-3 px-4 text-right">Đã thanh toán</th>
                <th className="py-3 px-4 text-right">Dư nợ còn lại</th>
                <th className="py-3 px-4">Hạn thanh toán</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {invoices.map((inv) => {
                const isPaid = inv.status === 'PAID';
                const isPending = inv.status === 'PENDING';
                const isOverdue = inv.status === 'OVERDUE';

                return (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {inv.invoiceCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      {inv.periodName}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-foreground">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                      {formatCurrency(inv.paidAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(inv.balance)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(inv.dueDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isPaid && (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3 mr-1 inline" /> Đã thanh toán
                        </Badge>
                      )}
                      {isPending && (
                        <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-[10px] font-bold">
                          <Clock className="h-3 w-3 mr-1 inline" /> Chờ thanh toán
                        </Badge>
                      )}
                      {isOverdue && (
                        <Badge variant="destructive" className="text-[10px] font-bold">
                          <AlertTriangle className="h-3 w-3 mr-1 inline" /> Quá hạn
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isPaid && (
                          <Button
                            size="sm"
                            onClick={() => onOpenPayInvoice(inv)}
                            className="h-7 text-[11px] gap-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer px-2.5 font-semibold shadow-xs"
                          >
                            <QrCode className="h-3 w-3" />
                            VietQR
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(inv)}
                          className="h-7 text-[11px] gap-1 cursor-pointer px-2 text-muted-foreground hover:text-foreground"
                          title="Tải hóa đơn VAT điện tử"
                        >
                          <Download className="h-3 w-3" />
                          VAT PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
