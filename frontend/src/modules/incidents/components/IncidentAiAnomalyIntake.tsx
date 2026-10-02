import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Fuel,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { aiService, type AiAnomaliesResponse, type AnomalyItem } from "@/mocks/adapters/serviceFactory";
import { toast } from "@/shared/components/feedback/Toast";

interface IncidentAiAnomalyIntakeProps {
  onCreateFromAnomaly: (anomaly: AnomalyItem) => void;
}

export const IncidentAiAnomalyIntake: React.FC<IncidentAiAnomalyIntakeProps> = ({
  onCreateFromAnomaly,
}) => {
  const [anomaliesData, setAnomaliesData] = useState<AiAnomaliesResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const fetchAnomalies = async () => {
    setIsLoading(true);
    try {
      const res = await aiService.getAnomalies();
      setAnomaliesData(res);
    } catch {
      // Fallback
      setAnomaliesData({
        totalAnomalies: 2,
        criticalCount: 1,
        anomalies: [
          {
            id: "anom-fuel-01",
            type: "FUEL_LEAK",
            severity: "CRITICAL",
            title: "Cảnh báo tiêu hao nhiên liệu bất thường: Xe 51C-882.14",
            description: "Mức sụt giảm bình dầu vượt 18.5% định mức kỹ thuật trong 90 phút di chuyển trên cung đường bằng phẳng. (ML IsolationForest Conf: 88%)",
            entityRef: "51C-882.14",
            detectedAt: new Date(Date.now() - 15 * 60000).toISOString(),
            recommendedAction: "Kiểm tra hệ thống kim phun và bình chứa nhiên liệu",
            actionUrl: "/vehicles",
          },
          {
            id: "anom-route-02",
            type: "ROUTE_DEVIATION",
            severity: "HIGH",
            title: "Lệch hành lang tuyến vận tải: Xe 50E-391.22",
            description: "Xe đi chệch khỏi cung đường tối ưu Quốc Lộ 1A hơn 4.2 km vào khu vực hạn chế xe tải trọng lớn. (ML IsolationForest Conf: 84%)",
            entityRef: "50E-391.22",
            detectedAt: new Date(Date.now() - 32 * 60000).toISOString(),
            recommendedAction: "Liên hệ bộ phận điều phối gọi điện cảnh báo tài xế",
            actionUrl: "/dispatch",
          },
        ],
        scannedAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  if (isDismissed || !anomaliesData || anomaliesData.anomalies.length === 0) {
    return null;
  }

  const criticalAnomalies = anomaliesData.anomalies.filter(
    (a) => a.severity === "CRITICAL" || a.severity === "HIGH"
  );

  if (criticalAnomalies.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-background space-y-3 shadow-xs animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              AI Phát Hiện Dị Thường Đội Xe Có Thể Chuyển Thành Phiếu Sự Cố
              <Badge variant="destructive" className="text-[10px] py-0 px-1.5 font-bold">
                {criticalAnomalies.length} Dị thường
              </Badge>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary border-primary/30">
                IsolationForest ML
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              Động cơ Machine Learning quét các chỉ số cảm biến nhiên liệu, hành lang GPS và cảnh báo nguy cơ vận hành.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnomalies}
            disabled={isLoading}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            <span>Quét lại</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Ẩn
          </Button>
        </div>
      </div>

      {/* Danh sách thẻ dị thường */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {criticalAnomalies.map((anom) => (
          <div
            key={anom.id}
            className="p-3 rounded-xl border border-border/80 bg-card/80 hover:bg-card transition-all flex flex-col justify-between gap-3 text-xs"
          >
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {anom.type === "FUEL_LEAK" ? (
                    <Fuel className="h-3.5 w-3.5 text-rose-500" />
                  ) : (
                    <Navigation className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  <span className="font-bold text-foreground line-clamp-1">{anom.title}</span>
                </div>
                <Badge
                  variant={anom.severity === "CRITICAL" ? "destructive" : "secondary"}
                  className="text-[9px] uppercase px-1.5 py-0 shrink-0 font-bold"
                >
                  {anom.severity}
                </Badge>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2">
                {anom.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
              <span className="font-mono text-muted-foreground">Đối tượng: <b className="text-foreground">{anom.entityRef}</b></span>
              <Button
                size="sm"
                onClick={() => onCreateFromAnomaly(anom)}
                className="h-7 text-[11px] gap-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer font-semibold shadow-xs"
              >
                <PlusCircle className="h-3 w-3" />
                <span>Tạo phiếu sự cố ngay</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
