import React, { useState } from "react";
import {
  Clock,
  MapPin,
  Navigation,
  Truck,
  Zap,
  Gauge,
  Calculator,
  RotateCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { aiService, type PredictEtaResponse } from "@/mocks/adapters/serviceFactory";

// Tọa độ các trung tâm Logistics trọng điểm mẫu
const PRESET_LOCATIONS = [
  { name: "Tổng kho Miền Nam (Cát Lái)", lat: 10.7769, lng: 106.7009 },
  { name: "Kho Trung chuyển Tân Bình (TP.HCM)", lat: 10.8142, lng: 106.6578 },
  { name: "Hub Sóng Thần (Bình Dương)", lat: 10.9025, lng: 106.7582 },
  { name: "Tổng kho Miền Bắc (Long Biên)", lat: 21.0345, lng: 105.8921 },
  { name: "Hub Đà Nẵng (Hòa Cầm)", lat: 16.0241, lng: 108.1873 },
];

export const AiEtaCalculator: React.FC = () => {
  const [originLat, setOriginLat] = useState<number>(10.7769);
  const [originLng, setOriginLng] = useState<number>(106.7009);
  const [destLat, setDestLat] = useState<number>(10.8231);
  const [destLng, setDestLng] = useState<number>(106.6297);
  const [vehicleType, setVehicleType] = useState<string>("TRUCK");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictEtaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await aiService.predictEta({
        originLat,
        originLng,
        destLat,
        destLng,
        vehicleType,
      });
      if (res.data) {
        setResult(res.data);
      }
    } catch (err: any) {
      setError(err?.message || "Không thể dự đoán ETA. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const setOriginPreset = (loc: (typeof PRESET_LOCATIONS)[0]) => {
    setOriginLat(loc.lat);
    setOriginLng(loc.lng);
  };

  const setDestPreset = (loc: (typeof PRESET_LOCATIONS)[0]) => {
    setDestLat(loc.lat);
    setDestLng(loc.lng);
  };

  return (
    <Card className="border border-border/80 shadow-xs bg-card/90">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Dự Báo Thời Gian Đến (ETA) Bằng Trí Tuệ Nhân Tạo
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Ứng dụng công thức Haversine & hệ số giao thông giờ cao điểm thực tế Việt Nam
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="gap-1 text-[11px] bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Zap className="h-3 w-3" />
            <span>AI Traffic Predictor</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Điểm xuất phát (Origin) */}
            <div className="space-y-2 p-3 rounded-xl border border-border/70 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-500" />
                  Điểm Xuất Phát (Origin)
                </span>
                <span className="text-[10px] text-muted-foreground">Vĩ độ, Kinh độ</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Vĩ độ (Lat)</label>
                  <Input
                    type="number"
                    step="any"
                    value={originLat}
                    onChange={(e) => setOriginLat(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Kinh độ (Lng)</label>
                  <Input
                    type="number"
                    step="any"
                    value={originLng}
                    onChange={(e) => setOriginLng(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {PRESET_LOCATIONS.slice(0, 3).map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setOriginPreset(loc)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-card border border-border hover:border-primary text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    {loc.name.split(" (")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Điểm đích đến (Destination) */}
            <div className="space-y-2 p-3 rounded-xl border border-border/70 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-emerald-500" />
                  Điểm Giao Hàng (Destination)
                </span>
                <span className="text-[10px] text-muted-foreground">Vĩ độ, Kinh độ</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Vĩ độ (Lat)</label>
                  <Input
                    type="number"
                    step="any"
                    value={destLat}
                    onChange={(e) => setDestLat(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Kinh độ (Lng)</label>
                  <Input
                    type="number"
                    step="any"
                    value={destLng}
                    onChange={(e) => setDestLng(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {PRESET_LOCATIONS.slice(1, 4).map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDestPreset(loc)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-card border border-border hover:border-emerald-500 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    {loc.name.split(" (")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">Loại phương tiện:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: "MOTORBIKE", label: "Xe máy" },
                  { id: "VAN", label: "Xe Van" },
                  { id: "TRUCK", label: "Xe Tải" },
                ].map((type) => (
                  <Button
                    key={type.id}
                    type="button"
                    size="sm"
                    variant={vehicleType === type.id ? "default" : "outline"}
                    onClick={() => setVehicleType(type.id)}
                    className="h-7 text-xs px-2.5 cursor-pointer"
                  >
                    <Truck className="h-3 w-3 mr-1" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-8 text-xs font-semibold gap-1.5 px-4 cursor-pointer"
            >
              {loading ? (
                <>
                  <RotateCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Đang tính toán...</span>
                </>
              ) : (
                <>
                  <Gauge className="h-3.5 w-3.5" />
                  <span>Dự Báo ETA Ngay</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Kết quả dự báo ETA */}
        {result && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 border border-primary/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Kết Quả Dự Báo Hành Trình AI
              </span>
              <Badge variant="secondary" className="text-[11px] font-mono">
                Độ tin cậy: {Math.round(result.confidenceScore * 100)}%
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-card/90 p-2.5 rounded-lg border border-border/70 flex flex-col justify-between">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Navigation className="h-3 w-3 text-blue-500" /> Cự ly đường bộ
                </span>
                <span className="text-base font-bold font-mono text-foreground mt-1">
                  {result.distanceKm} km
                </span>
              </div>

              <div className="bg-card/90 p-2.5 rounded-lg border border-border/70 flex flex-col justify-between">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-500" /> Thời gian ước tính
                </span>
                <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                  {result.durationMinutes} phút
                </span>
              </div>

              <div className="bg-card/90 p-2.5 rounded-lg border border-border/70 flex flex-col justify-between">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Gauge className="h-3 w-3 text-emerald-500" /> Vận tốc trung bình
                </span>
                <span className="text-base font-bold font-mono text-foreground mt-1">
                  {result.averageSpeedKmH} km/h
                </span>
              </div>

              <div className="bg-card/90 p-2.5 rounded-lg border border-border/70 flex flex-col justify-between">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 text-violet-500" /> Dự kiến đến nơi
                </span>
                <span className="text-base font-bold font-mono text-violet-600 dark:text-violet-400 mt-1">
                  {new Date(result.estimatedArrival).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/40 pt-2">
              <span>
                Tình trạng giao thông:{" "}
                <strong className="text-foreground">
                  {result.trafficStatus === "HEAVY_CONGESTION"
                    ? "Giờ cao điểm (Ùn tắc cao x1.45)"
                    : "Lưu thông bình thường (x1.1)"}
                </strong>
              </span>
              <span>Hệ số cung đường: 1.35x</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
