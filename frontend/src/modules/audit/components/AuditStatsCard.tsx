import React from 'react';
import { ShieldCheck, Activity, AlertTriangle, ShieldAlert, Lock } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import type { AuditStats } from '../types/audit';

interface AuditStatsCardProps {
  stats: AuditStats;
}

export const AuditStatsCard: React.FC<AuditStatsCardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng sự kiện */}
      <Card className="border border-border/80 shadow-xs hover:border-primary/40 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Tổng bản ghi kiểm toán</span>
            <div className="text-2xl font-black text-foreground font-mono">{stats.total}</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Bất biến & không thể can thiệp
            </div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Activity className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Hôm nay */}
      <Card className="border border-border/80 shadow-xs hover:border-primary/40 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Hoạt động trong ngày</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {stats.todayCount}
            </div>
            <div className="text-[11px] text-muted-foreground">Theo múi giờ GMT+7</div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Cảnh báo & Nghiêm trọng */}
      <Card className="border border-border/80 shadow-xs hover:border-primary/40 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Sự kiện cảnh báo / trọng yếu</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {stats.warningCount + stats.criticalCount}
            </div>
            <div className="text-[11px] text-rose-500 font-medium">
              {stats.criticalCount} sự kiện cấp độ Critical
            </div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Tiêu chuẩn tuân thủ */}
      <Card className="border border-border/80 shadow-xs bg-gradient-to-br from-indigo-500/5 to-purple-500/5 hover:border-indigo-500/40 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">Tiêu chuẩn an toàn</span>
              <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-1 py-0">
                ACTIVE
              </Badge>
            </div>
            <div className="text-sm font-bold text-foreground">ISO/IEC 27001 & SOC 2</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3 text-indigo-500" />
              SHA-256 Hash Chained Chống Gian Lận
            </div>
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
