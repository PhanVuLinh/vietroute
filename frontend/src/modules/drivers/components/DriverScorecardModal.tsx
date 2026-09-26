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
import { Progress } from '@/shared/components/ui/progress';
import {
  Award,
  ShieldCheck,
  TrendingUp,
  Star,
  Zap,
  Gauge,
  Wallet,
  Clock,
  Printer,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import type { EnrichedDriver } from '../hooks/useDrivers';

interface DriverScorecardModalProps {
  driver: EnrichedDriver | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DriverScorecardModal: React.FC<DriverScorecardModalProps> = ({
  driver,
  isOpen,
  onClose,
}) => {
  const [timeRange, setTimeRange] = useState<'30' | '60' | '90'>('30');

  if (!isOpen || !driver) return null;

  // 5 trục đánh giá (Pillars):
  // 1. Đúng hạn OTD (0-100)
  // 2. Tuân thủ tốc độ & An toàn (0-100)
  // 3. Đối soát COD chuẩn xác (0-100)
  // 4. Đánh giá khách hàng (0-100 -> sao * 20)
  // 5. Hồ sơ không sự cố (0-100)
  const otdScore = Math.min(100, Math.max(70, driver.onTimeRate || 98.5));
  const safetyScore = 96.0;
  const codScore = 99.2;
  const csatScore = Math.min(100, ((driver as any).rating || 4.9) * 20);
  const zeroIncidentScore = driver.successRate >= 95 ? 98.0 : 85.0;

  const compositeScore = Number(
    ((otdScore * 0.3 + safetyScore * 0.2 + codScore * 0.2 + csatScore * 0.15 + zeroIncidentScore * 0.15)).toFixed(1)
  );

  const getRankBadge = (score: number) => {
    if (score >= 95) {
      return {
        label: 'Hạng Kim Cương (Diamond)',
        color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
        icon: Sparkles,
      };
    }
    if (score >= 90) {
      return {
        label: 'Hạng Vàng (Gold Elite)',
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        icon: Award,
      };
    }
    return {
      label: 'Hạng Bạc (Silver)',
      color: 'bg-slate-500/10 text-slate-600 border-slate-500/30',
      icon: ShieldCheck,
    };
  };

  const rank = getRankBadge(compositeScore);
  const RankIcon = rank.icon;

  // Tọa độ tính toán Radar Chart 5 đỉnh (Ngũ giác đều)
  // Tâm: (150, 150), Bán kính R = 100
  const center = { x: 150, y: 150 };
  const radius = 100;
  const angles = [-90, -18, 54, 126, 198]; // 5 góc theo độ

  const getPoint = (angleDeg: number, valPercent: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    const r = (radius * valPercent) / 100;
    return {
      x: center.x + r * Math.cos(rad),
      y: center.y + r * Math.sin(rad),
    };
  };

  const radarPoints = [
    getPoint(angles[0], otdScore),
    getPoint(angles[1], safetyScore),
    getPoint(angles[2], codScore),
    getPoint(angles[3], csatScore),
    getPoint(angles[4], zeroIncidentScore),
  ];

  const radarPolygon = radarPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/80 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/20">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                  <span>Bảng Điểm Đánh Giá Tài Xế (Scorecard)</span>
                  <Badge variant="outline" className={`text-xs ${rank.color}`}>
                    <RankIcon className="h-3 w-3 mr-1" />
                    {rank.label}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Tài xế: <strong className="text-foreground">{driver.fullName}</strong> ({driver.driverCode}) • GPLX Hạng {driver.licenseType}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-muted p-0.5 rounded-lg border border-border text-xs">
                {(['30', '60', '90'] as const).map((days) => (
                  <button
                    key={days}
                    onClick={() => setTimeRange(days)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      timeRange === days
                        ? 'bg-card text-foreground shadow-2xs font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {days} ngày
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-8 px-2.5 text-xs gap-1 cursor-pointer print:hidden"
              >
                <Printer className="h-3.5 w-3.5" />
                In
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 text-xs">
          {/* 1. Điểm tổng hợp & Radar Chart trực quan */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-card p-5 rounded-2xl border border-border/80 shadow-xs">
            {/* Cột Trái: Radar Spider Chart SVG */}
            <div className="md:col-span-6 flex flex-col items-center justify-center">
              <svg width="300" height="280" viewBox="0 0 300 300" className="overflow-visible">
                {/* Lưới đa giác nền (20%, 40%, 60%, 80%, 100%) */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, i) => {
                  const pts = angles
                    .map((a) => {
                      const p = getPoint(a, level * 100);
                      return `${p.x},${p.y}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      key={i}
                      points={pts}
                      fill="none"
                      stroke="currentColor"
                      className="text-border/60"
                      strokeWidth="1"
                      strokeDasharray={i === 4 ? 'none' : '3,3'}
                    />
                  );
                })}

                {/* Các trục nan hoa từ tâm */}
                {angles.map((a, i) => {
                  const p = getPoint(a, 100);
                  return (
                    <line
                      key={i}
                      x1={center.x}
                      y1={center.y}
                      x2={p.x}
                      y2={p.y}
                      stroke="currentColor"
                      className="text-border/60"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Đa giác dữ liệu thực tế */}
                <polygon
                  points={radarPolygon}
                  fill="rgba(59, 130, 246, 0.25)"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                />

                {/* Các điểm neo trên đa giác */}
                {radarPoints.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="4.5"
                    fill="#2563EB"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                ))}

                {/* Nhãn 5 trục */}
                <text x="150" y="32" textAnchor="middle" className="text-[10px] font-bold fill-current text-foreground">
                  Đúng hạn (OTD)
                </text>
                <text x="260" y="118" textAnchor="start" className="text-[10px] font-bold fill-current text-foreground">
                  An toàn tốc độ
                </text>
                <text x="215" y="248" textAnchor="start" className="text-[10px] font-bold fill-current text-foreground">
                  Chuẩn xác COD
                </text>
                <text x="85" y="248" textAnchor="end" className="text-[10px] font-bold fill-current text-foreground">
                  Đánh giá KH (CSAT)
                </text>
                <text x="40" y="118" textAnchor="end" className="text-[10px] font-bold fill-current text-foreground">
                  Không sự cố
                </text>
              </svg>
            </div>

            {/* Cột Phải: Tổng hợp điểm số & Xếp hạng */}
            <div className="md:col-span-6 space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Chỉ số tổng hợp (Composite Score)
                </span>
                <div className="text-4xl font-black text-primary font-mono my-1">
                  {compositeScore} <span className="text-lg font-normal text-muted-foreground">/ 100</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Đứng trong <strong className="text-emerald-600">Top 5%</strong> tài xế xuất sắc nhất toàn quốc
                </p>
              </div>

              {/* 5 thanh điểm chi tiết */}
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-blue-500" /> Tỷ lệ đúng hạn (OTD):
                    </span>
                    <strong className="font-mono text-foreground">{otdScore}%</strong>
                  </div>
                  <Progress value={otdScore} className="h-1.5" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Gauge className="h-3.5 w-3.5 text-emerald-500" /> Tuân thủ tốc độ & GPS:
                    </span>
                    <strong className="font-mono text-foreground">{safetyScore}%</strong>
                  </div>
                  <Progress value={safetyScore} className="h-1.5" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Wallet className="h-3.5 w-3.5 text-purple-500" /> Toàn vẹn nộp tiền COD:
                    </span>
                    <strong className="font-mono text-foreground">{codScore}%</strong>
                  </div>
                  <Progress value={codScore} className="h-1.5" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500" /> Đánh giá người nhận hàng (CSAT):
                    </span>
                    <strong className="font-mono text-foreground">{((driver as any).rating || 4.9)} / 5.0 ({csatScore}%)</strong>
                  </div>
                  <Progress value={csatScore} className="h-1.5" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-teal-500" /> Hồ sơ an toàn / Không sự cố:
                    </span>
                    <strong className="font-mono text-foreground">{zeroIncidentScore}%</strong>
                  </div>
                  <Progress value={zeroIncidentScore} className="h-1.5" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Thưởng / Kỷ luật & Lịch sử Đào tạo Huấn Luyện */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lịch sử Khen thưởng & Tiết kiệm */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Khen thưởng & Ghi nhận thành tích
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
                  <Zap className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-semibold block">
                      Thưởng Tiết kiệm Nhiên liệu Tháng 08/2026
                    </strong>
                    <span className="text-[11px] text-muted-foreground">
                      Tiêu hao thực tế 13.8L/100km (thấp hơn định mức 15.5L) • Thưởng: +1.200.000đ
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5">
                  <Award className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-blue-700 dark:text-blue-400 font-semibold block">
                      Tài xế Tiêu biểu Quý 2/2026 (Hub Long Biên)
                    </strong>
                    <span className="text-[11px] text-muted-foreground">
                      Hoàn thành 380 chuyến giao hàng không một khiếu nại • Thưởng: +2.500.000đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chứng chỉ Đào tạo & Huấn luyện An toàn */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-primary" />
                Chứng chỉ & Huấn luyện nghiệp vụ
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/80 flex items-start justify-between">
                  <div>
                    <strong className="text-foreground font-semibold block">
                      An toàn Vận chuyển Hàng Nguy hiểm & PCCC
                    </strong>
                    <span className="text-[11px] text-muted-foreground">
                      Cấp bởi: Cục Cảnh sát PCCC & CNCH • Hạn: 10/2027
                    </span>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 text-[10px]">
                    Có hiệu lực
                  </Badge>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/80 flex items-start justify-between">
                  <div>
                    <strong className="text-foreground font-semibold block">
                      Khóa Lái xe Sinh thái Tiết kiệm (Eco-driving)
                    </strong>
                    <span className="text-[11px] text-muted-foreground">
                      Đào tạo nội bộ VietRoute Academy • Đạt loại Giỏi
                    </span>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 text-[10px]">
                    Hoàn tất
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
