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
  Trophy,
  Medal,
  Star,
  Award,
  Download,
} from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';
import type { EnrichedDriver } from '../hooks/useDrivers';

interface DriverLeaderboardModalProps {
  drivers: EnrichedDriver[];
  isOpen: boolean;
  onClose: () => void;
  onSelectDriverScorecard: (driver: EnrichedDriver) => void;
}

export const DriverLeaderboardModal: React.FC<DriverLeaderboardModalProps> = ({
  drivers,
  isOpen,
  onClose,
  onSelectDriverScorecard,
}) => {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  if (!isOpen) return null;

  // Sắp xếp tài xế theo điểm hiệu suất OTD và Rating
  const rankedDrivers = [...drivers].sort((a, b) => {
    const scoreA = (a.onTimeRate || 0) * 0.6 + ((a as any).rating || 4.9) * 8;
    const scoreB = (b.onTimeRate || 0) * 0.6 + ((b as any).rating || 4.9) * 8;
    return scoreB - scoreA;
  });

  const getRankMedal = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="h-7 w-7 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center font-bold text-xs shadow-md shadow-amber-500/10">
            <Trophy className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          </div>
        );
      case 1:
        return (
          <div className="h-7 w-7 rounded-full bg-slate-400/20 text-slate-400 border border-slate-400/40 flex items-center justify-center font-bold text-xs shadow-md shadow-slate-400/10">
            <Medal className="h-3.5 w-3.5 fill-slate-400 text-slate-400" />
          </div>
        );
      case 2:
        return (
          <div className="h-7 w-7 rounded-full bg-amber-700/20 text-amber-700 border border-amber-700/40 flex items-center justify-center font-bold text-xs shadow-md shadow-amber-700/10">
            <Medal className="h-3.5 w-3.5 fill-amber-700 text-amber-700" />
          </div>
        );
      default:
        return (
          <div className="h-7 w-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-mono font-bold text-xs">
            {index + 1}
          </div>
        );
    }
  };

  const handleExportRanking = () => {
    toast.success('Đã xuất báo cáo vinh danh bảng xếp hạng tài xế (PDF/Excel)');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/80 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/20">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
                  <span>Bảng Xếp Hạng Hiệu Suất Đội Ngũ Tài Xế</span>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                    LEADERBOARD
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Vinh danh các tài xế xuất sắc nhất toàn mạng lưới VietRoute Logistics
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-muted p-0.5 rounded-lg border border-border text-xs">
                {(['month', 'quarter', 'year'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      period === p
                        ? 'bg-card text-foreground shadow-2xs font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {p === 'month' ? 'Tháng này' : p === 'quarter' ? 'Quý này' : 'Năm 2026'}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportRanking}
                className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Xuất file
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 text-xs">
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {rankedDrivers.slice(0, 3).map((d, idx) => (
              <div
                key={d.id}
                onClick={() => onSelectDriverScorecard(d)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] flex flex-col justify-between ${
                  idx === 0
                    ? 'bg-gradient-to-b from-amber-500/10 to-amber-500/5 border-amber-500/30'
                    : idx === 1
                    ? 'bg-gradient-to-b from-slate-400/10 to-slate-400/5 border-slate-400/30'
                    : 'bg-gradient-to-b from-amber-700/10 to-amber-700/5 border-amber-700/30'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    {getRankMedal(idx)}
                    <span className="text-[10px] font-mono text-muted-foreground">{d.driverCode}</span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{d.fullName}</h4>
                  <p className="text-[11px] text-muted-foreground">GPLX Hạng {d.licenseType}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Đúng hạn OTD:</span>
                    <strong className="text-emerald-600 font-mono">{d.onTimeRate}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Đánh giá CSAT:</span>
                    <strong className="text-amber-500 font-mono flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-500" /> {(d as any).rating || 4.9}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thưởng tích lũy:</span>
                    <strong className="text-primary font-mono font-bold">
                      {idx === 0 ? '+3.700.000đ' : idx === 1 ? '+2.200.000đ' : '+1.500.000đ'}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Leaderboard Table */}
          <div className="bg-card rounded-xl border border-border/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3 text-center">Hạng</th>
                  <th className="py-2.5 px-3">Tài xế</th>
                  <th className="py-2.5 px-3">Phương tiện</th>
                  <th className="py-2.5 px-3 text-center">Đúng hạn (OTD)</th>
                  <th className="py-2.5 px-3 text-center">Thành công</th>
                  <th className="py-2.5 px-3 text-center">CSAT</th>
                  <th className="py-2.5 px-3 text-right">Xem Scorecard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rankedDrivers.map((driver, index) => (
                  <tr
                    key={driver.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => onSelectDriverScorecard(driver)}
                  >
                    <td className="py-2.5 px-3 text-center">{getRankMedal(index)}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {driver.fullName}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{driver.driverCode}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                      {driver.vehicle ? driver.vehicle.licensePlate : 'Chưa gán xe'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">
                      {driver.onTimeRate}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-medium text-foreground">
                      {driver.successRate}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-500">
                      <span className="inline-flex items-center gap-1 justify-center">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {(driver as any).rating || 4.9}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDriverScorecard(driver);
                        }}
                        className="h-7 px-2 text-[11px] gap-1 text-primary cursor-pointer hover:bg-primary/10"
                      >
                        <Award className="h-3 w-3" />
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
