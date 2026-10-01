import React, { useState } from "react";
import {
  Users,
  Truck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  RotateCw,
  Phone,
  ShieldCheck,
  Star,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  aiService,
  type DriverMatchCandidate,
} from "@/mocks/adapters/serviceFactory";
import { toast } from "@/shared/components/feedback/Toast";

const PRESET_HUBS = [
  { name: "Tổng kho Tân Bình (TP.HCM)", lat: 10.8142, lng: 106.6578, defaultWeight: 1200 },
  { name: "Tổng kho Miền Nam (Cát Lái)", lat: 10.7769, lng: 106.7009, defaultWeight: 2400 },
  { name: "Hub Sóng Thần (Bình Dương)", lat: 10.9025, lng: 106.7582, defaultWeight: 1800 },
  { name: "Tổng kho Long Biên (Hà Nội)", lat: 21.0345, lng: 105.8921, defaultWeight: 1500 },
];

export const AiDriverMatcher: React.FC = () => {
  const [pickupLat, setPickupLat] = useState<number>(10.8142);
  const [pickupLng, setPickupLng] = useState<number>(106.6578);
  const [totalWeightKg, setTotalWeightKg] = useState<number>(1200);
  const [vehicleType, setVehicleType] = useState<string>("TRUCK");
  const [priority, setPriority] = useState<string>("HIGH");
  const [loading, setLoading] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<DriverMatchCandidate[]>([]);
  const [assignedDriverId, setAssignedDriverId] = useState<string | null>(null);

  const handleMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setAssignedDriverId(null);

    try {
      const res = await aiService.matchDriver({
        pickupLat,
        pickupLng,
        totalWeightKg,
        requiredVehicleType: vehicleType,
        priority,
      });
      if (res.data) {
        setCandidates(res.data.topMatches || []);
      }
    } catch (err) {
      console.error("Lỗi khi tìm tài xế AI:", err);
      toast.error("Không thể kết nối dịch vụ AI matching");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = (candidate: DriverMatchCandidate) => {
    setAssignedDriverId(candidate.driverId);
    toast.success(
      `Đã điều phối thành công: ${candidate.driverName} (${candidate.recommendedVehicle?.plateNumber || "Xe tải"})`
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Form tiêu chí tìm kiếm */}
      <Card className="border border-border/80 shadow-xs bg-card/90">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  Động Cơ Ghép Nối Tài Xế & Phương Tiện Thông Minh (AI Matching Score)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Chấm điểm đa tiêu chí: Cự ly GPS, tỷ lệ đúng giờ OTD, lấp đầy tải trọng và hạng bằng lái
                </CardDescription>
              </div>
            </div>

            <Badge variant="outline" className="gap-1 text-[11px] bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3" />
              <span>Multi-Factor Engine</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          <form onSubmit={handleMatch} className="space-y-4">
            {/* Chọn nhanh kho xuất phát */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Kho bãi xuất phát đơn hàng (Điểm bốc hàng)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_HUBS.map((hub, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant={pickupLat === hub.lat ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setPickupLat(hub.lat);
                      setPickupLng(hub.lng);
                      setTotalWeightKg(hub.defaultWeight);
                    }}
                    className="h-7 text-xs cursor-pointer"
                  >
                    {hub.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Thông số kiện hàng */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Trọng lượng hàng (kg)
                </label>
                <Input
                  type="number"
                  value={totalWeightKg}
                  onChange={(e) => setTotalWeightKg(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Yêu cầu loại xe
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
                >
                  <option value="TRUCK">Xe Tải (Truck)</option>
                  <option value="VAN">Xe Van (Đô thị)</option>
                  <option value="MOTORBIKE">Xe Máy (Giao hỏa tốc)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Mức độ ưu tiên
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
                >
                  <option value="URGENT">Khẩn cấp (SLA &lt;2h)</option>
                  <option value="HIGH">Ưu tiên cao</option>
                  <option value="NORMAL">Bình thường</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                disabled={loading}
                className="h-8 text-xs font-semibold gap-1.5 px-4 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang phân tích dữ liệu đội xe...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Tìm Tài Xế Phù Hợp Bằng AI</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2. Danh sách ứng viên xếp hạng theo Match Score */}
      {candidates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Kết Quả Đề Xuất Phân Bổ (Top {candidates.length} Tài Xế Tối Ưu Nhất)
            </span>
            <span className="text-[11px] text-muted-foreground">
              Sắp xếp theo độ tương thích giảm dần
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {candidates.map((cand, idx) => {
              const isAssigned = assignedDriverId === cand.driverId;

              return (
                <Card
                  key={cand.driverId}
                  className={`border transition-all hover:shadow-xs p-3.5 ${
                    idx === 0
                      ? "border-primary/50 bg-primary/5 shadow-2xs"
                      : "border-border/80 bg-card"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Cột trái: Thông tin tài xế & điểm Match Score */}
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-card border border-border/80 min-w-[70px]">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                          Phù hợp
                        </span>
                        <span
                          className={`text-lg font-black font-mono mt-0.5 ${
                            cand.matchScore >= 95
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {cand.matchScore}%
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-foreground">
                            {cand.driverName}
                          </h4>
                          {idx === 0 && (
                            <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white text-[9px] px-1.5 py-0">
                              Lựa chọn tối ưu #1
                            </Badge>
                          )}
                          <Badge
                            variant={cand.status === "AVAILABLE" ? "outline" : "secondary"}
                            className="text-[10px] py-0"
                          >
                            {cand.status === "AVAILABLE" ? "Sẵn sàng" : "Đang bận"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="h-3 w-3 text-primary" /> {cand.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-500" /> Đúng giờ: <strong>{cand.onTimeRate}%</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> {cand.rating}/5
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-blue-500" /> Cách điểm bốc: <strong>{cand.distanceToPickupKm} km</strong>
                          </span>
                        </div>

                        {/* Thông tin phương tiện đề xuất */}
                        {cand.recommendedVehicle && (
                          <div className="text-[11px] text-foreground bg-muted/30 px-2 py-1 rounded border border-border/40 flex items-center gap-2 mt-1">
                            <Truck className="h-3 w-3 text-primary" />
                            <span>Xe: <strong>{cand.recommendedVehicle.plateNumber}</strong> ({cand.recommendedVehicle.model})</span>
                            <span className="text-muted-foreground">•</span>
                            <span>Tải trọng: <strong>{cand.recommendedVehicle.maxPayloadKg} kg</strong> (Lấp đầy {cand.recommendedVehicle.utilizationPercent}%)</span>
                          </div>
                        )}

                        {/* Lý do AI chấm điểm */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {cand.reasoningTags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40 font-medium"
                            >
                              ✓ {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Cột phải: Nút hành động */}
                    <div className="flex items-center justify-end shrink-0 sm:self-center">
                      <Button
                        size="sm"
                        variant={isAssigned ? "outline" : "default"}
                        disabled={isAssigned}
                        onClick={() => handleAssign(cand)}
                        className={`h-8 text-xs font-semibold gap-1.5 px-4 cursor-pointer ${
                          isAssigned ? "border-emerald-500/40 text-emerald-600 bg-emerald-500/10" : ""
                        }`}
                      >
                        {isAssigned ? (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Đã gán chuyến</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-3 w-3" />
                            <span>Gán Chuyến Ngay</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
