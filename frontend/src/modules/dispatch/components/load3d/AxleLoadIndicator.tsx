import React from 'react';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  Layers,
  TrendingUp,
  Truck,
  CheckCircle2,
  Gauge,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import type { AxleLoadAnalysis, VehicleContainerPreset } from '../../types/load3d';

interface AxleLoadIndicatorProps {
  vehicle: VehicleContainerPreset;
  analysis: AxleLoadAnalysis;
}

export const AxleLoadIndicator: React.FC<AxleLoadIndicatorProps> = ({
  vehicle,
  analysis,
}) => {
  const isSafe = analysis.stabilityScore >= 80;
  const isWarning = analysis.stabilityScore < 80 && analysis.stabilityScore >= 50;
  const isDanger = analysis.stabilityScore < 50;

  return (
    <Card className="border-border/80 shadow-sm overflow-hidden">
      <CardHeader className="py-3 px-4 bg-muted/40 border-b border-border/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold text-foreground">
            Phân Tích Tải Trọng & Trọng Tâm Trục Xe (Axle Load Analysis)
          </CardTitle>
        </div>

        {isSafe && (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
            <ShieldCheck className="h-3 w-3 mr-1 inline" /> CÂN BẰNG AN TOÀN ({analysis.stabilityScore}/100)
          </Badge>
        )}
        {isWarning && (
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] font-bold">
            <AlertTriangle className="h-3 w-3 mr-1 inline" /> CẢNH BÁO LỆCH TRỤC ({analysis.stabilityScore}/100)
          </Badge>
        )}
        {isDanger && (
          <Badge variant="destructive" className="text-[10px] font-bold">
            <AlertTriangle className="h-3 w-3 mr-1 inline" /> NGUY HIỂM QUÁ TẢI ({analysis.stabilityScore}/100)
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Hàng 1: Thể Tích & Khối Lượng */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Thể tích thùng xe */}
          <div className="bg-muted/40 p-3 rounded-xl border border-border/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Tỷ lệ lấp đầy thể tích:</span>
              <strong className="text-primary font-bold">{analysis.volumeUtilizationPercent}%</strong>
            </div>
            <Progress value={analysis.volumeUtilizationPercent} className="h-2" />
            <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>Đã xếp: <strong>{analysis.volumeUsedM3} m³</strong></span>
              <span>Tổng khoang: {analysis.totalVolumeM3} m³</span>
            </div>
          </div>

          {/* Tải trọng hàng */}
          <div className="bg-muted/40 p-3 rounded-xl border border-border/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Tỷ lệ tải trọng hàng:</span>
              <strong className={analysis.isWeightOverloaded ? 'text-red-500 font-bold' : 'text-emerald-600 font-bold'}>
                {analysis.weightUtilizationPercent}%
              </strong>
            </div>
            <Progress
              value={analysis.weightUtilizationPercent}
              className={`h-2 ${analysis.isWeightOverloaded ? '[&>div]:bg-red-500' : ''}`}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>Hàng: <strong>{analysis.totalCargoWeightKg.toLocaleString('vi-VN')} kg</strong></span>
              <span>Tối đa: {vehicle.maxWeightKg.toLocaleString('vi-VN')} kg</span>
            </div>
          </div>
        </div>

        {/* Hàng 2: Phân Bổ Lực Cầu Trước (Front Axle) & Cầu Sau (Rear Axle) */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
            <span>Phân Bổ Lực Trục Xe</span>
            <span>Trọng tâm dọc X: {analysis.centerOfGravityX}m</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Cầu Trước */}
            <div className="p-3 bg-background rounded-xl border border-border/70 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-blue-500" /> Trục trước (Front)
                </span>
                <span className="text-[11px] text-muted-foreground">{analysis.frontAxlePercent}% Tổng tải</span>
              </div>
              <div className="text-base font-extrabold text-foreground">
                {analysis.frontAxleLoadKg.toLocaleString('vi-VN')}{' '}
                <span className="text-xs font-normal text-muted-foreground">/ {vehicle.maxFrontAxleKg.toLocaleString('vi-VN')} kg</span>
              </div>
              <Progress
                value={Math.min(100, Math.round((analysis.frontAxleLoadKg / vehicle.maxFrontAxleKg) * 100))}
                className="h-1.5"
              />
            </div>

            {/* Cầu Sau */}
            <div className="p-3 bg-background rounded-xl border border-border/70 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-emerald-500" /> Trục sau (Rear)
                </span>
                <span className="text-[11px] text-muted-foreground">{analysis.rearAxlePercent}% Tổng tải</span>
              </div>
              <div className="text-base font-extrabold text-foreground">
                {analysis.rearAxleLoadKg.toLocaleString('vi-VN')}{' '}
                <span className="text-xs font-normal text-muted-foreground">/ {vehicle.maxRearAxleKg.toLocaleString('vi-VN')} kg</span>
              </div>
              <Progress
                value={Math.min(100, Math.round((analysis.rearAxleLoadKg / vehicle.maxRearAxleKg) * 100))}
                className="h-1.5"
              />
            </div>
          </div>
        </div>

        {/* Thông tin Cân bằng ngang */}
        <div className="flex items-center justify-between text-[11px] bg-muted/30 p-2.5 rounded-lg border border-border/50">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            <span>Độ lệch tâm ngang (Trái / Phải):</span>
          </div>
          <span className="font-mono font-bold text-foreground">
            {Math.abs(analysis.centerOfGravityY) <= 0.05
              ? '0.00m (Cân đối hoàn hảo)'
              : analysis.centerOfGravityY > 0
              ? `+${analysis.centerOfGravityY}m (Lệch phải nhẹ)`
              : `${analysis.centerOfGravityY}m (Lệch trái nhẹ)`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
