import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  AlertTriangle,
  Fuel,
  Navigation,
  Clock,
  Building2,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  aiService,
  type AiAnomalyItem,
} from "@/mocks/adapters/serviceFactory";

export const AiAnomalyMonitor: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AiAnomalyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  const fetchAnomalies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiService.getAnomalies();
      if (res.data) {
        setAnomalies(res.data.anomalies || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu bất thường AI:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  const filtered = anomalies.filter((a) => {
    if (filterSeverity === "ALL") return true;
    return a.severity === filterSeverity;
  });

  const getCategoryConfig = (type: AiAnomalyItem["type"]) => {
    switch (type) {
      case "FUEL_LEAK":
        return {
          icon: Fuel,
          color: "text-rose-500",
          bg: "bg-rose-500/10 border-rose-500/30",
          label: "Bất thường nhiên liệu",
        };
      case "ROUTE_DEVIATION":
        return {
          icon: Navigation,
          color: "text-amber-500",
          bg: "bg-amber-500/10 border-amber-500/30",
          label: "Lệch tuyến GPS",
        };
      case "SLA_RISK":
        return {
          icon: Clock,
          color: "text-orange-500",
          bg: "bg-orange-500/10 border-orange-500/30",
          label: "Rủi ro trễ SLA",
        };
      case "WAREHOUSE_OVERLOAD":
        return {
          icon: Building2,
          color: "text-blue-500",
          bg: "bg-blue-500/10 border-blue-500/30",
          label: "Quá tải kho bãi",
        };
      default:
        return {
          icon: AlertTriangle,
          color: "text-muted-foreground",
          bg: "bg-muted border-border",
          label: "Cảnh báo chung",
        };
    }
  };

  const getSeverityBadge = (severity: AiAnomalyItem["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <Badge variant="destructive" className="text-[10px] font-bold px-1.5 py-0 gap-1 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            Nghiêm trọng
          </Badge>
        );
      case "HIGH":
        return (
          <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0 border-amber-500/40 text-amber-600 bg-amber-500/10">
            Cảnh báo cao
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0">
            Trung bình
          </Badge>
        );
    }
  };

  const criticalCount = anomalies.filter((a) => a.severity === "CRITICAL").length;

  return (
    <div className="space-y-4">
      {/* 1. Thanh trạng thái & Bộ lọc */}
      <Card className="border border-border/80 shadow-xs bg-card/90">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>Hệ Thống Giám Sát Bất Thường & Chống Gian Lận Vận Tải</span>
                  {criticalCount > 0 && (
                    <Badge variant="destructive" className="text-[10px] py-0 px-2">
                      {criticalCount} rủi ro khẩn cấp
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Phát hiện sớm hao hụt bình nhiên liệu, xe chạy lệch hành lang tuyến GPS và đơn quá hạn điều phối
                </CardDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnomalies}
              disabled={loading}
              className="h-8 text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              <span>Quét lại toàn mạng lưới</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-3.5 flex items-center justify-between flex-wrap gap-2 bg-muted/20">
          <div className="flex items-center gap-1.5">
            {[
              { id: "ALL", label: `Tất cả (${anomalies.length})` },
              { id: "CRITICAL", label: `Nghiêm trọng (${criticalCount})` },
              { id: "HIGH", label: "Cảnh báo cao" },
              { id: "MEDIUM", label: "Trung bình" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={filterSeverity === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterSeverity(tab.id)}
                className="h-7 text-xs px-2.5 cursor-pointer"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <span className="text-[11px] text-muted-foreground font-mono">
            Thời điểm quét: {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </CardContent>
      </Card>

      {/* 2. Danh sách bất thường */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">
              Không phát hiện bất thường nào trong phạm vi đã chọn
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Toàn bộ đội xe và kho bãi đang hoạt động trong ngưỡng an toàn
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const cat = getCategoryConfig(item.type);
            const Icon = cat.icon;

            return (
              <Card
                key={item.id}
                className={`border transition-all hover:shadow-xs p-4 flex flex-col justify-between gap-3 ${
                  item.severity === "CRITICAL"
                    ? "border-rose-500/40 bg-rose-500/5 shadow-2xs"
                    : "border-border/80 bg-card"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${cat.bg}`}>
                      <Icon className={`h-4 w-4 ${cat.color}`} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getSeverityBadge(item.severity)}
                        <span className="text-[10px] font-bold uppercase text-muted-foreground font-mono">
                          {cat.label}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {new Date(item.detectedAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-foreground">
                        {item.title}
                      </h4>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className="self-start sm:self-center text-xs font-mono px-2 py-0.5 shrink-0">
                    Đối tượng: {item.entityRef}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-xs text-foreground font-medium flex items-center gap-1.5">
                    <span className="text-primary font-bold">Hành động AI đề xuất:</span>
                    <span>{item.recommendedAction}</span>
                  </span>

                  <Button
                    asChild
                    size="sm"
                    className="h-7 text-xs font-semibold gap-1 px-3 cursor-pointer shrink-0"
                  >
                    <Link to={item.actionUrl}>
                      <span>Xử lý ngay</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
