import React from "react";
import {
  Ship,
  Compass,
  Navigation,
  Anchor,
  Clock,
  Waves,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Wind,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { useVesselTracking } from "../hooks/useInternational";

export const VesselAisTracker: React.FC = () => {
  const { data: vessels = [], isLoading } = useVesselTracking();

  const getWeatherBadge = (risk: string) => {
    switch (risk) {
      case "HIGH_TYPHOON_WARNING":
        return (
          <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[10px] gap-1 px-1.5 py-0.5">
            <AlertTriangle className="h-3 w-3" /> Cảnh Báo Bão Biển
          </Badge>
        );
      case "MODERATE_SWELL":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] gap-1 px-1.5 py-0.5">
            <Waves className="h-3 w-3" /> Sóng Lớn & Gió Mùa
          </Badge>
        );
      default:
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1 px-1.5 py-0.5">
            <CheckCircle2 className="h-3 w-3" /> Hải Trình Thuận Lợi
          </Badge>
        );
    }
  };

  const getNavStatusBadge = (status: string) => {
    switch (status) {
      case "MOORED":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">Đang Cập Cầu Cảng</Badge>;
      case "AT_ANCHOR":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Đang Thả Neo Chờ</Badge>;
      default:
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Đang Hành Hải</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center text-xs text-muted-foreground">
        Đang bắt sóng tín hiệu vệ tinh hàng hải AIS...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-primary/5 to-transparent border border-blue-500/20 rounded-xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
            <Navigation className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">
                Hải Trình Vệ Tinh AIS & Giám Sát Tàu Biển Quốc Tế
              </h3>
              <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-[10px] animate-pulse">
                Live AIS Satellite Feeds
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tọa độ GPS thời gian thực, tốc độ hải lý (Knots), tiến độ hành trình và cảnh báo rủi ro thời tiết bão biển trên hải trình
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Wind className="h-4 w-4 text-primary" />
          Đang theo dõi <span className="font-bold text-foreground">{vessels.length} tàu mẹ quốc tế</span>
        </div>
      </div>

      {/* Vessels Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {vessels.map((vessel) => {
          return (
            <Card key={vessel.mmsi} className="border-border shadow-2xs flex flex-col justify-between overflow-hidden">
              <div>
                {/* Card Header with Vessel Flag */}
                <CardHeader className="pb-3 border-b border-border bg-muted/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Ship className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-bold text-foreground">
                          {vessel.vesselName}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground font-mono">
                        <span>IMO: {vessel.imo}</span>
                        <span>•</span>
                        <span>MMSI: {vessel.mmsi}</span>
                        <span>•</span>
                        <span className="font-sans">{vessel.flag}</span>
                      </div>
                    </div>
                    <div>{getNavStatusBadge(vessel.navStatus)}</div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-4 text-xs">
                  {/* Route: POL -> POD */}
                  <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span>Cảng bốc (POL):</span>
                      </div>
                      <span className="font-semibold text-foreground truncate max-w-[170px]">
                        {vessel.departurePort}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Anchor className="h-3.5 w-3.5 text-blue-500" />
                        <span>Cảng dỡ (POD):</span>
                      </div>
                      <span className="font-semibold text-foreground truncate max-w-[170px]">
                        {vessel.destinationPort}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2 border-t border-border/60">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Đã đi: {vessel.distanceCoveredNm.toLocaleString()} NM</span>
                        <span className="font-bold text-primary">{vessel.progressPercent}%</span>
                        <span>Còn: {vessel.distanceRemainingNm.toLocaleString()} NM</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${vessel.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Satellite Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 bg-card border border-border rounded-lg">
                      <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                        <Navigation className="h-3 w-3 text-primary" /> Tốc Độ Hải Lý
                      </div>
                      <div className="text-base font-bold text-foreground font-mono mt-0.5">
                        {vessel.speedKnots} knots
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Hướng đi: {vessel.headingDegrees}°
                      </div>
                    </div>

                    <div className="p-2.5 bg-card border border-border rounded-lg">
                      <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                        <Compass className="h-3 w-3 text-blue-500" /> Tọa Độ Vệ Tinh
                      </div>
                      <div className="text-xs font-mono font-bold text-foreground mt-1">
                        {vessel.currentLatitude.toFixed(2)}°N
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {vessel.currentLongitude.toFixed(2)}°E
                      </div>
                    </div>
                  </div>

                  {/* Estimated Arrival ETA */}
                  <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-card border border-border">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Dự kiến cập cảng (ETA):</span>
                    </div>
                    <span className="font-bold text-foreground font-mono">
                      {new Date(vessel.etaPredicted).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Weather Risk */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted-foreground">Thời tiết biển:</span>
                    {getWeatherBadge(vessel.weatherRisk)}
                  </div>
                </CardContent>
              </div>

              {/* Card Footer: Lô hàng gắn liền */}
              <div className="p-3 bg-muted/30 border-t border-border flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Lô hàng vận chuyển:</span>
                <div className="flex items-center gap-1">
                  {vessel.shipmentCodes.map((code) => (
                    <Badge key={code} variant="outline" className="font-mono text-[10px] bg-background">
                      {code}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
