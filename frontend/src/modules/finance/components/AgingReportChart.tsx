import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  ShieldAlert,
} from "lucide-react";
import type { AgingReport } from "../types/finance";

interface AgingReportChartProps {
  report?: AgingReport;
  isLoading?: boolean;
}

export const AgingReportChart: React.FC<AgingReportChartProps> = ({
  report,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-muted rounded-xl" />
        ))}
      </div>
    );
  }

  const current = report?.current || 0;
  const days1To30 = report?.days1To30 || 0;
  const days31To60 = report?.days31To60 || 0;
  const daysOver60 = report?.daysOver60 || 0;
  const total = report?.totalUnpaid || current + days1To30 + days31To60 + daysOver60 || 1;

  const currentPct = Math.round((current / total) * 100);
  const days1To30Pct = Math.round((days1To30 / total) * 100);
  const days31To60Pct = Math.round((days31To60 / total) * 100);
  const daysOver60Pct = Math.round((daysOver60 / total) * 100);

  const buckets = [
    {
      label: "Trong hạn (Chưa đến hạn)",
      days: "Kỳ hạn hiện tại",
      amount: current,
      pct: currentPct,
      color: "bg-emerald-500",
      textColor: "text-emerald-700 dark:text-emerald-300",
      borderColor: "border-emerald-500/20",
      bgColor: "bg-emerald-500/10",
      icon: CheckCircle2,
      desc: "Công nợ khách hàng trong chu kỳ tín dụng bình thường.",
    },
    {
      label: "Quá hạn 1 - 30 ngày",
      days: "1 - 30 ngày",
      amount: days1To30,
      pct: days1To30Pct,
      color: "bg-amber-500",
      textColor: "text-amber-700 dark:text-amber-300",
      borderColor: "border-amber-500/20",
      bgColor: "bg-amber-500/10",
      icon: Clock,
      desc: "Cần nhắc nợ qua email hoặc nhân viên chăm sóc khách hàng.",
    },
    {
      label: "Quá hạn 31 - 60 ngày",
      days: "31 - 60 ngày",
      amount: days31To60,
      pct: days31To60Pct,
      color: "bg-orange-500",
      textColor: "text-orange-700 dark:text-orange-300",
      borderColor: "border-orange-500/20",
      bgColor: "bg-orange-500/10",
      icon: AlertTriangle,
      desc: "Nguy cơ trễ hạn cao, cân nhắc tạm ngừng xuất đơn mới.",
    },
    {
      label: "Quá hạn > 60 ngày",
      days: "Trên 60 ngày",
      amount: daysOver60,
      pct: daysOver60Pct,
      color: "bg-rose-500",
      textColor: "text-rose-700 dark:text-rose-300",
      borderColor: "border-rose-500/20",
      bgColor: "bg-rose-500/10",
      icon: ShieldAlert,
      desc: "Nợ xấu khó đòi, chuyển bộ phận pháp chế / thu hồi nợ chuyên biệt.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Visual Stacked Progress Bar */}
      <div className="p-4 rounded-xl border bg-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Phân bổ cấu trúc tuổi nợ (Aging Distribution)</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Tổng nợ chưa thanh toán: <strong className="text-foreground font-mono">{total.toLocaleString("vi-VN")} đ</strong>
          </span>
        </div>

        {/* Thanh phân bổ */}
        <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex gap-0.5">
          {current > 0 && (
            <div
              style={{ width: `${currentPct}%` }}
              className="h-full bg-emerald-500 transition-all"
              title={`Trong hạn: ${current.toLocaleString("vi-VN")} đ (${currentPct}%)`}
            />
          )}
          {days1To30 > 0 && (
            <div
              style={{ width: `${days1To30Pct}%` }}
              className="h-full bg-amber-500 transition-all"
              title={`1-30 ngày: ${days1To30.toLocaleString("vi-VN")} đ (${days1To30Pct}%)`}
            />
          )}
          {days31To60 > 0 && (
            <div
              style={{ width: `${days31To60Pct}%` }}
              className="h-full bg-orange-500 transition-all"
              title={`31-60 ngày: ${days31To60.toLocaleString("vi-VN")} đ (${days31To60Pct}%)`}
            />
          )}
          {daysOver60 > 0 && (
            <div
              style={{ width: `${daysOver60Pct}%` }}
              className="h-full bg-rose-500 transition-all"
              title={`>60 ngày: ${daysOver60.toLocaleString("vi-VN")} đ (${daysOver60Pct}%)`}
            />
          )}
        </div>

        {/* Chú thích màu sắc */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Trong hạn ({currentPct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            1 - 30 ngày ({days1To30Pct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            31 - 60 ngày ({days31To60Pct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            Trên 60 ngày ({daysOver60Pct}%)
          </span>
        </div>
      </div>

      {/* Grid 4 thẻ thời hạn */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {buckets.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.label}
              className={`p-4 rounded-xl border ${b.borderColor} ${b.bgColor} flex flex-col justify-between space-y-3 transition-shadow hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground block">{b.days}</span>
                  <h4 className="text-sm font-bold text-foreground mt-0.5">{b.label}</h4>
                </div>
                <div className={`p-2 rounded-lg bg-background/80 ${b.textColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div>
                <div className="font-mono text-xl font-extrabold text-foreground">
                  {b.amount.toLocaleString("vi-VN")} <span className="text-xs font-normal">đ</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>Chiếm tỷ lệ</span>
                  <span className="font-bold text-foreground">{b.pct}%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-background/40 text-[11px] text-muted-foreground leading-snug">
                {b.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
