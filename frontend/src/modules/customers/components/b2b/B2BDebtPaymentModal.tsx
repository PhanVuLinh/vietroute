import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '@/shared/utils/formatters';
import { toast } from '@/shared/components/feedback/Toast';
import type { B2BShipperProfile } from '../../types/b2bPortal';

interface B2BDebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipper: B2BShipperProfile;
  amount: number;
  invoiceCode?: string;
  onConfirmPayment: (amount: number) => Promise<boolean>;
}

export const B2BDebtPaymentModal: React.FC<B2BDebtPaymentModalProps> = ({
  isOpen,
  onClose,
  shipper,
  amount,
  invoiceCode,
  onConfirmPayment,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankName = 'Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)';
  const accountNumber = '1029384756';
  const accountName = 'CONG TY CP VIETROUTE LOGISTICS';
  const transferContent = invoiceCode
    ? `VIETROUTE B2B ${invoiceCode}`
    : `VIETROUTE B2B ${shipper.logoText} DEBT`;

  // URL tạo mã VietQR chuẩn Napas 24/7 trực quan
  const vietQrUrl = `https://api.vietqr.io/image/970436-${accountNumber}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Đã sao chép', text);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    try {
      await onConfirmPayment(amount);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/80">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-5 text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <Badge className="bg-white/20 text-white border-none text-[10px] font-bold">
                <ShieldCheck className="h-3 w-3 mr-1 inline" /> CỔNG VIETQR NAPAS 24/7
              </Badge>
              <span className="text-xs text-blue-100 font-mono">B2B Gateway</span>
            </div>
            <DialogTitle className="text-lg font-black text-white mt-1">
              Thanh Toán Cước Vận Tải B2B
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-xs">
              Đối tác: <strong className="text-white">{shipper.name}</strong>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-4">
          {/* Số tiền cần thanh toán */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
            <div className="text-xs text-muted-foreground">Số tiền thanh toán:</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(amount)}
            </div>
            {invoiceCode && (
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Cho hóa đơn: <strong className="text-foreground">{invoiceCode}</strong>
              </div>
            )}
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-border/60 shadow-xs">
            <img
              src={vietQrUrl}
              alt="Mã QR Napas 24/7"
              className="w-48 h-48 object-contain rounded-lg"
              onError={(e) => {
                // Fallback nếu api ảnh ngoại tuyến
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <QrCode className="h-3 w-3" /> Quét mã bằng App ngân hàng bất kỳ (VCB, MB, BIDV, Techcombank...)
            </div>
          </div>

          {/* Chi tiết tài khoản ngân hàng */}
          <div className="space-y-2 text-xs bg-muted/40 p-3 rounded-xl border border-border/60">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Ngân hàng thụ hưởng:</span>
              <span className="font-semibold text-foreground">{bankName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Số tài khoản:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-foreground text-sm">
                  {accountNumber}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(accountNumber, 'acc')}
                  className="h-6 w-6 p-0 cursor-pointer"
                >
                  {copiedField === 'acc' ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Chủ tài khoản:</span>
              <span className="font-bold text-foreground text-[11px]">{accountName}</span>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Nội dung CK:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-primary text-[11px]">
                  {transferContent}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(transferContent, 'content')}
                  className="h-6 w-6 p-0 cursor-pointer"
                >
                  {copiedField === 'content' ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Nút Giả lập xác nhận thanh toán */}
          <div className="space-y-2">
            <Button
              size="default"
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 cursor-pointer shadow-md"
            >
              <Zap className="h-4 w-4" />
              {isProcessing ? 'Đang xác thực giao dịch...' : 'Giả Lập Nhận Tiền Thành Công (Auto Webhook)'}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground">
              Trong môi trường sản xuất, Webhook ngân hàng sẽ tự động xác nhận và giải phóng hạn mức trong 3-5 giây.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
