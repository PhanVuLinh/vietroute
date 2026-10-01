import React, { useState } from "react";
import {
  Navigation,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Fuel,
  Clock,
  CheckCircle2,
  RotateCw,
  Plus,
  Trash2,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  aiService,
  type RouteOptimizationResponse,
} from "@/mocks/adapters/serviceFactory";
import { formatCurrency } from "@/shared/utils/formatters";

// Cụm điểm dừng mẫu phân bổ lộn xộn để chứng minh hiệu quả thuật toán 2-Opt TSP
const SAMPLE_STOPS = [
  { id: "s-1", name: "Cửa hàng Tiện lợi Bến Vân Đồn (Quận 4)", lat: 10.7612, lng: 106.7023, demandKg: 120 },
  { id: "s-2", name: "Đại lý Phân phối Sóng Thần (Dĩ An, Bình Dương)", lat: 10.9025, lng: 106.7582, demandKg: 450 },
  { id: "s-3", name: "Siêu thị Tân Bình (Đường Cộng Hòa)", lat: 10.8014, lng: 106.6534, demandKg: 280 },
  { id: "s-4", name: "Trung tâm Thương mại Thủ Đức (Võ Văn Ngân)", lat: 10.8505, lng: 106.7718, demandKg: 350 },
  { id: "s-5", name: "Điểm giao nhận Bình Chánh (Quốc lộ 1A)", lat: 10.6872, lng: 106.5891, demandKg: 200 },
];

export const AiRouteOptimizer: React.FC = () => {
  const [originLat, setOriginLat] = useState<number>(10.7769);
  const [originLng, setOriginLng] = useState<number>(106.7009);
  const [stops, setStops] = useState(SAMPLE_STOPS);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<RouteOptimizationResponse | null>(null);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const res = await aiService.optimizeRoute({
        originLat,
        originLng,
        stops,
        returnToOrigin: true,
      });
      if (res.data) {
        setResult(res.data);
      }
    } catch (err) {
      console.error("Lỗi tối ưu hóa lộ trình AI:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStop = (id: string) => {
    setStops(stops.filter((s) => s.id !== id));
  };

  const handleReset = () => {
    setStops(SAMPLE_STOPS);
    setResult(null);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header card */}
      <Card className="border border-border/80 shadow-xs bg-card/90">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Navigation className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Động Cơ Tối Ưu Hóa Tuyến Đường Đa Điểm Dừng (2-Opt TSP & Clustering)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Tái sắp xếp thứ tự giao hàng khoa học, cắt giảm cung đường chéo và tiết kiệm nhiên liệu
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-8 text-xs cursor-pointer"
              >
                Đặt lại mẫu
              </Button>
              <Button
                size="sm"
                onClick={handleOptimize}
                disabled={loading || stops.length === 0}
                className="h-8 text-xs font-semibold gap-1.5 px-4 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang tính toán TSP...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Tối Ưu Tuyến Bằng AI</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Tọa độ xuất phát */}
          <div className="p-3 rounded-xl border border-border/70 bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Điểm Xuất Phát (Depot):
              </span>
              <span className="text-muted-foreground">Tổng kho Miền Nam (Cát Lái - TP.HCM)</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
              <span>Vĩ độ: {originLat}</span>
              <span>•</span>
              <span>Kinh độ: {originLng}</span>
            </div>
          </div>

          {/* Danh sách điểm dừng ban đầu */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
              <span>Danh sách các điểm dừng giao hàng ({stops.length} điểm)</span>
              <span className="text-[11px]">Trọng tải hàng</span>
            </div>

            <div className="space-y-1.5">
              {stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-card hover:border-border transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-mono font-bold text-[10px]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{stop.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Lat: {stop.lat} | Lng: {stop.lng}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {stop.demandKg} kg
                    </Badge>
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(stop.id)}
                      className="text-muted-foreground hover:text-rose-500 cursor-pointer p-1"
                      title="Xóa điểm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Kết quả sau tối ưu */}
      {result && (
        <Card className="border border-emerald-500/30 bg-emerald-500/5 shadow-xs overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-emerald-500/20 bg-emerald-500/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Kết Quả Tối Ưu Hóa Cung Đường AI (2-Opt TSP Solver)
              </span>
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-mono text-[11px]">
                Tiết kiệm {result.savedPercent}% cự ly
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* KPI Cards so sánh */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-card p-3 rounded-xl border border-border/60">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5 text-blue-500" /> Quãng đường cắt giảm
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-lg font-bold font-mono text-foreground">
                    -{result.savedKm} km
                  </span>
                  <span className="text-[10px] text-muted-foreground line-through">
                    {result.originalDistanceKm} km
                  </span>
                </div>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  Còn {result.optimizedDistanceKm} km toàn tuyến
                </p>
              </div>

              <div className="bg-card p-3 rounded-xl border border-border/60">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Fuel className="h-3.5 w-3.5 text-amber-500" /> Nhiên liệu tiết kiệm
                </span>
                <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 block">
                  -{result.fuelSavedLiters} Lít
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Định mức 14.5L/100km
                </p>
              </div>

              <div className="bg-card p-3 rounded-xl border border-border/60">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-500" /> Chi phí ước tính giảm
                </span>
                <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {formatCurrency(result.costSavedVND)}
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Giá dầu DO 23,500đ/L
                </p>
              </div>

              <div className="bg-card p-3 rounded-xl border border-border/60">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-violet-500" /> Thời gian rút ngắn
                </span>
                <span className="text-lg font-bold font-mono text-violet-600 dark:text-violet-400 mt-1 block">
                  -{result.timeSavedMinutes} phút
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Vận tốc TB 36 km/h
                </p>
              </div>
            </div>

            {/* Thứ tự điểm dừng mới đã tối ưu */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground">
                Lộ Trình Khuyến Nghị Sau Tối Ưu (Thứ tự giao hàng chuẩn)
              </span>

              <div className="space-y-1.5">
                {result.optimizedStops.map((stop) => (
                  <div
                    key={stop.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-card text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-[11px]">
                        {stop.sequence}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{stop.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Cách điểm trước: <strong>{stop.distanceFromPreviousKm} km</strong> • Lũy kế: <strong>{stop.cumulativeDistanceKm} km</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        ETA: +{stop.estimatedEtaMinutes} phút
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
