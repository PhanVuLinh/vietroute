import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  MapPin,
  Radio,
  Truck,
  AlertTriangle,
  Navigation,
  Clock,
  Activity,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { REGIONS, type RegionKey } from "../hooks/useTracking";

interface TrackingTopBarProps {
  stats: {
    total: number;
    moving: number;
    idle: number;
    alert: number;
    avgSpeed: number;
  };
  isStreaming: boolean;
  onToggleStreaming: () => void;
  speedMultiplier: number;
  onChangeSpeed: (multiplier: number) => void;
  selectedRegion: RegionKey;
  onSelectRegion: (region: RegionKey) => void;
}

export const TrackingTopBar: React.FC<TrackingTopBarProps> = ({
  stats,
  isStreaming,
  onToggleStreaming,
  speedMultiplier,
  onChangeSpeed,
  selectedRegion,
  onSelectRegion,
}) => {
  const [currentTime, setCurrentTime] = useState<string>(() =>
    new Date().toLocaleTimeString("vi-VN")
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("vi-VN"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const movingPercent = stats.total > 0 ? Math.round((stats.moving / stats.total) * 100) : 0;

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
      {/* 1. Chỉ số giám sát tức thời */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Live GPS Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/80">
          <span className="relative flex h-2.5 w-2.5">
            {isStreaming && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isStreaming ? "bg-emerald-500" : "bg-muted-foreground"
              }`}
            />
          </span>
          <span className="text-xs font-semibold text-foreground flex items-center gap-1">
            <Radio className="h-3.5 w-3.5 text-primary" />
            {isStreaming ? "GPS Trực tuyến" : "Tạm dừng luồng"}
          </span>
        </div>

        {/* Live Clock Đồng hồ vệ tinh */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/80 text-xs font-mono font-semibold text-foreground">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{currentTime}</span>
        </div>

        {/* Thẻ thống kê: Đang di chuyển */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Navigation className="h-3.5 w-3.5" />
          <span>{stats.moving}/{stats.total} xe đang chạy ({movingPercent}%)</span>
          <span className="text-[10px] font-mono text-primary/80">~{stats.avgSpeed} km/h</span>
        </div>

        {/* Thẻ thống kê: Dừng đỗ */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border text-xs font-semibold text-muted-foreground">
          <Truck className="h-3.5 w-3.5" />
          <span>{stats.idle} xe dừng đỗ</span>
        </div>

        {/* Thẻ thống kê: Cảnh báo */}
        {stats.alert > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{stats.alert} cảnh báo</span>
          </div>
        )}
      </div>

      {/* 2. Điều khiển Mô phỏng & Chọn vùng miền */}
      <div className="flex flex-wrap items-center gap-2 self-end lg:self-auto">
        {/* Nút Play/Pause GPS */}
        <Button
          variant={isStreaming ? "outline" : "default"}
          size="sm"
          onClick={onToggleStreaming}
          className="h-8 text-xs gap-1.5 cursor-pointer font-semibold"
          title={isStreaming ? "Tạm dừng phát tọa độ" : "Tiếp tục phát tọa độ"}
        >
          {isStreaming ? (
            <>
              <Pause className="h-3.5 w-3.5 text-amber-500" />
              Tạm dừng
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
              Tiếp tục
            </>
          )}
        </Button>

        {/* Tốc độ tua mô phỏng */}
        <div className="flex items-center bg-muted/50 p-0.5 rounded-lg border border-border">
          {([1, 2, 5] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              className={`px-2 py-1 text-[11px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                speedMultiplier === spd
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Chọn vùng xem bản đồ */}
        <div className="flex items-center bg-muted/50 p-0.5 rounded-lg border border-border">
          {(Object.keys(REGIONS) as RegionKey[]).map((key) => (
            <button
              key={key}
              onClick={() => onSelectRegion(key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                selectedRegion === key
                  ? "bg-card text-foreground font-semibold shadow-2xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin className="h-3 w-3" />
              {REGIONS[key].name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
