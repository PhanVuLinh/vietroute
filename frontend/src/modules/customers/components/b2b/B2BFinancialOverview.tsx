import React from 'react';
import {
  CreditCard,
  QrCode,
  TrendingUp,
  Truck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { formatCurrency } from '@/shared/utils/formatters';
import type { B2BPortalDashboardData } from '../../types/b2bPortal';

interface B2BFinancialOverviewProps {
  data: B2BPortalDashboardData;
  onOpenPayDebtModal: () => void;
}

export const B2BFinancialOverview: React.FC<B2BFinancialOverviewProps> = ({
  data,
  onOpenPayDebtModal,
}) => {
  const { finance, kpi } = data;

  const usagePercent = Math.min(100, Math.max(0, finance.creditUsagePercent));
  const isHighUsage = usagePercent > 75;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Hạn Mức Tín Dụng & Dư Nợ B2B */}
      <Card className="relative overflow-hidden border-blue-500/20 shadow-sm hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-blue-600" />
              Công nợ cước B2B
            </span>
            <Badge
              variant={isHighUsage ? 'destructive' : 'secondary'}
              className="text-[10px] font-bold"
            >
              {usagePercent}% Hạn mức
            </Badge>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Dư nợ cước hiện tại</div>
            <div className="text-2xl font-black tracking-tight text-foreground text-blue-600 dark:text-blue-400">
              {formatCurrency(finance.currentDebt)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Hạn mức cấp:{' '}
              <strong className="text-foreground">{formatCurrency(finance.creditLimit)}</strong>
            </div>
          </div>

          <div className="space-y-1.5">
            <Progress value={usagePercent} className="h-2" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Còn khả dụng: {formatCurrency(finance.availableCredit)}</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Hạn còn {finance.dueInDays} ngày
              </span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={onOpenPayDebtModal}
            className="w-full h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 cursor-pointer shadow-xs"
          >
            <QrCode className="h-3.5 w-3.5" />
            Thanh toán VietQR 24/7
          </Button>
        </CardContent>
      </Card>

      {/* 2. Lô Hàng Đang Vận Chuyển Realtime */}
      <Card className="relative overflow-hidden border-emerald-500/20 shadow-sm hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-emerald-600" />
              Lô hàng đang trên đường
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Đang lăn bánh giao hàng</div>
            <div className="text-2xl font-black tracking-tight text-foreground text-emerald-600 dark:text-emerald-400">
              {kpi.inTransitOrders}{' '}
              <span className="text-sm font-medium text-muted-foreground">lô hàng</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Chờ xếp chuyến kho:{' '}
              <strong className="text-amber-600">{kpi.pendingOrders} kiện</strong>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-[11px] text-emerald-700 dark:text-emerald-300">
            <strong>100% Chuyến xe</strong> gắn cảm biến GPS và giám sát nhiệt độ buồng lạnh liên tục.
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            <span>Tự động cập nhật GPS:</span>
            <span className="font-semibold text-foreground">30 giây/lần</span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Cam Kết SLA & Giao Đúng Hạn */}
      <Card className="relative overflow-hidden border-purple-500/20 shadow-sm hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-bl-full pointer-events-none" />
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Chỉ số đúng hẹn SLA
            </span>
            <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] font-bold">
              Xuất sắc
            </Badge>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Tỉ lệ giao đúng giờ</div>
            <div className="text-2xl font-black tracking-tight text-foreground text-purple-600 dark:text-purple-400">
              {kpi.onTimeRate}%
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Đã hoàn tất thành công:{' '}
              <strong className="text-foreground">{kpi.deliveredOrders} đơn</strong>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Tuân thủ cam kết:</span>
              <span className="font-bold text-foreground">{kpi.slaCompliance}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Ký nhận e-POD:</span>
              <span className="font-bold text-emerald-600">100% Chữ ký số</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            <span>Sự cố cước / bể vỡ:</span>
            <span className="font-semibold text-emerald-600">0.00%</span>
          </div>
        </CardContent>
      </Card>

      {/* 4. Tổng Khối Lượng Vận Tải & Tiết Kiệm */}
      <Card className="relative overflow-hidden border-amber-500/20 shadow-sm hover:shadow-md transition-shadow">
        <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Sản lượng & Tiết kiệm
            </span>
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold">
              Chiết khấu VIP
            </Badge>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Tổng khối lượng vận tải</div>
            <div className="text-2xl font-black tracking-tight text-foreground text-amber-600 dark:text-amber-400">
              {kpi.totalTonnage}{' '}
              <span className="text-sm font-medium text-muted-foreground">Tấn hàng</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Tổng số chuyến tích lũy:{' '}
              <strong className="text-foreground">{kpi.totalOrders} chuyến</strong>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-[11px] text-amber-800 dark:text-amber-300">
            Tiết kiệm <strong>15.0%</strong> chi phí vận chuyển đường bộ theo phụ lục Hợp đồng khung.
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            <span>Kỳ thanh toán:</span>
            <span className="font-semibold text-foreground">30 ngày gối đầu</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
