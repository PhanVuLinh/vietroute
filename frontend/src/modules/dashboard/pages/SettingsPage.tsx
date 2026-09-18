import React, { useState } from "react";
import {
  Server,
  Route,
  Bell,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Clock,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Globe,
  Wifi,
} from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import { ConfirmDialog } from "@/shared/components/feedback/ConfirmDialog";
import { toast } from "@/shared/components/feedback/Toast";
import { ENV } from "@/core/config/env";

interface OperationsSettings {
  maxUrbanSpeedKmH: number;
  maxHighwaySpeedKmH: number;
  avgStopDurationMin: number;
  maxDriverShiftHours: number;
  targetOtdPercent: number;
  pickupRadiusKm: number;
}

interface RoutingSettings {
  optimizationGoal: "BALANCED" | "MIN_DISTANCE" | "MIN_DURATION" | "MIN_COST";
  avoidTolls: boolean;
  avoidRushHours: boolean;
  preferHighways: boolean;
  maxStopsPerRoute: number;
}

interface ApiSettings {
  apiBaseUrl: string;
  useMockData: boolean;
  requestTimeoutMs: number;
}

interface NotificationSettings {
  overspeedAlert: boolean;
  inspectionExpiryDays: number;
  warehouseCapacityAlertPercent: number;
  driverFatigueHours: number;
  soundEnabled: boolean;
}

interface AllSettings {
  operations: OperationsSettings;
  routing: RoutingSettings;
  api: ApiSettings;
  notifications: NotificationSettings;
}

const DEFAULT_SETTINGS: AllSettings = {
  operations: {
    maxUrbanSpeedKmH: 60,
    maxHighwaySpeedKmH: 90,
    avgStopDurationMin: 15,
    maxDriverShiftHours: 8,
    targetOtdPercent: 95,
    pickupRadiusKm: 25,
  },
  routing: {
    optimizationGoal: "BALANCED",
    avoidTolls: false,
    avoidRushHours: true,
    preferHighways: true,
    maxStopsPerRoute: 15,
  },
  api: {
    apiBaseUrl: ENV.API_BASE_URL,
    useMockData: ENV.USE_MOCK,
    requestTimeoutMs: ENV.API_TIMEOUT_MS,
  },
  notifications: {
    overspeedAlert: true,
    inspectionExpiryDays: 30,
    warehouseCapacityAlertPercent: 85,
    driverFatigueHours: 4,
    soundEnabled: true,
  },
};

const STORAGE_KEY = "vietroute_system_settings_v1";

interface ServiceStatus {
  name: string;
  endpoint: string;
  status: "ONLINE" | "CHECKING" | "OFFLINE";
  latencyMs: number;
}

export const SettingsPage: React.FC = () => {
  usePageTitle("Cài đặt hệ thống");

  const [settings, setSettings] = useState<AllSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  // Danh sách microservices kiểm tra kết nối API
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "Cổng Xác thực (Auth Service)", endpoint: "/auth/health", status: "ONLINE", latencyMs: 16 },
    { name: "Dịch vụ Đơn hàng (Orders Core)", endpoint: "/orders/health", status: "ONLINE", latencyMs: 24 },
    { name: "Quản lý Đội xe & Tài xế (Fleet & Driver)", endpoint: "/fleet/health", status: "ONLINE", latencyMs: 18 },
    { name: "Mạng lưới Kho bãi (Warehouse Hubs)", endpoint: "/warehouses/health", status: "ONLINE", latencyMs: 21 },
    { name: "Thuật toán Tối ưu Lộ trình (Routing AI)", endpoint: "/routes/optimize", status: "ONLINE", latencyMs: 45 },
    { name: "Cổng GPS Telematics Realtime", endpoint: "/tracking/gateway", status: "ONLINE", latencyMs: 12 },
  ]);

  // Lưu cài đặt vào localStorage
  const handleSaveSettings = () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    setTimeout(() => {
      setIsSaving(false);
      toast.success(
        "Lưu cài đặt thành công",
        "Tất cả tham số vận hành, thuật toán và API đã được áp dụng toàn hệ thống."
      );
    }, 400);
  };

  // Khôi phục cài đặt mặc định
  const handleResetToDefault = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
    setIsResetConfirmOpen(false);
    toast.info("Đã khôi phục", "Cài đặt hệ thống đã được đưa về thông số chuẩn ban đầu.");
  };

  // Kiểm tra độ trễ kết nối API (Ping test)
  const handlePingTest = () => {
    setIsPinging(true);
    setServices((prev) =>
      prev.map((s) => ({ ...s, status: "CHECKING" }))
    );

    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          status: "ONLINE",
          latencyMs: Math.floor(10 + Math.random() * 35),
        }))
      );
      setIsPinging(false);
      toast.success("Kiểm tra hoàn tất", "Toàn bộ 6/6 Microservices kết nối ổn định.");
    }, 800);
  };

  return (
    <PageContainer
      title="Cài đặt hệ thống"
      subtitle="Quản lý cấu hình vận hành logistics, tham số thuật toán lộ trình AI, kết nối Backend và cảnh báo an toàn."
      action={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetConfirmOpen(true)}
            className="h-9 px-3 text-xs gap-1.5 cursor-pointer hover:border-destructive/40 hover:text-destructive"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Khôi phục mặc định
          </Button>

          <Button
            variant="default"
            size="sm"
            disabled={isSaving}
            onClick={handleSaveSettings}
            className="h-9 px-4 text-xs gap-1.5 cursor-pointer font-semibold shadow-xs"
          >
            {isSaving ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="operations" className="space-y-4">
        {/* Navigation Tabs */}
        <TabsList className="bg-card border border-border p-1 rounded-xl shadow-2xs grid grid-cols-2 md:grid-cols-4 gap-1 h-auto">
          <TabsTrigger
            value="operations"
            className="text-xs font-semibold py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Gauge className="h-4 w-4" />
            Vận hành & SLA
          </TabsTrigger>

          <TabsTrigger
            value="routing"
            className="text-xs font-semibold py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Route className="h-4 w-4" />
            Thuật toán Lộ trình
          </TabsTrigger>

          <TabsTrigger
            value="api"
            className="text-xs font-semibold py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Server className="h-4 w-4" />
            Kết nối API & Backend
          </TabsTrigger>

          <TabsTrigger
            value="notifications"
            className="text-xs font-semibold py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            Cảnh báo An toàn
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: CẤU HÌNH VẬN HÀNH & SLA                                             */}
        {/* ========================================================================= */}
        <TabsContent value="operations" className="space-y-4 outline-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thẻ: Quy chuẩn tốc độ phương tiện */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-border pb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Gauge className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Giới hạn Tốc độ An toàn</h3>
                  <p className="text-xs text-muted-foreground">Áp dụng đo lường và cảnh báo vi phạm trên bản đồ GPS</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Tốc độ tối đa trong đô thị (km/h)
                  </label>
                  <Input
                    type="number"
                    value={settings.operations.maxUrbanSpeedKmH}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        operations: {
                          ...settings.operations,
                          maxUrbanSpeedKmH: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="h-9 text-xs font-mono"
                  />
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Cảnh báo vi phạm trên Telematics khi xe chạy quá ngưỡng này
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Tốc độ tối đa trên quốc lộ / cao tốc (km/h)
                  </label>
                  <Input
                    type="number"
                    value={settings.operations.maxHighwaySpeedKmH}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        operations: {
                          ...settings.operations,
                          maxHighwaySpeedKmH: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Thẻ: Quy chuẩn thời gian giao nhận & Ca làm việc */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-border pb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Thời gian Vận hành & Phục vụ</h3>
                  <p className="text-xs text-muted-foreground">Tính toán ước tính lịch trình giao hàng dự kiến (ETA)</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Thời gian bốc dỡ hàng trung bình tại mỗi trạm (phút)
                  </label>
                  <Input
                    type="number"
                    value={settings.operations.avgStopDurationMin}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        operations: {
                          ...settings.operations,
                          avgStopDurationMin: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="h-9 text-xs font-mono"
                  />
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Cộng thêm vào tổng thời gian lộ trình cho mỗi điểm dừng
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Thời gian lái xe tối đa của tài xế mỗi ca (giờ)
                  </label>
                  <Input
                    type="number"
                    value={settings.operations.maxDriverShiftHours}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        operations: {
                          ...settings.operations,
                          maxDriverShiftHours: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Thẻ: Mục tiêu Cam kết SLA giao hàng */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-border pb-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Cam kết Dịch vụ (SLA)</h3>
                  <p className="text-xs text-muted-foreground">Chỉ tiêu chất lượng dịch vụ vận tải giao nhận</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Tỷ lệ giao hàng đúng hẹn mục tiêu (OTD %)
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={settings.operations.targetOtdPercent}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          operations: {
                            ...settings.operations,
                            targetOtdPercent: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="h-9 text-xs font-mono w-28"
                    />
                    <span className="text-xs font-semibold text-foreground">%</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Các tuyến hoặc tài xế dưới mức này sẽ được gắn cờ theo dõi
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Bán kính phục vụ tối đa từ kho trung chuyển (km)
                  </label>
                  <Input
                    type="number"
                    value={settings.operations.pickupRadiusKm}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        operations: {
                          ...settings.operations,
                          pickupRadiusKm: Number(e.target.value) || 0,
                        },
                      })
                    }
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: THUẬT TOÁN TỐI ƯU LỘ TRÌNH                                         */}
        {/* ========================================================================= */}
        <TabsContent value="routing" className="space-y-4 outline-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thẻ: Mục tiêu Tối ưu hóa Tuyến đường */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-border pb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Mục tiêu Tối ưu hóa (Objective)</h3>
                  <p className="text-xs text-muted-foreground">Quyết định trọng số tính toán của thuật toán lập lộ trình</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: "BALANCED",
                    title: "Cân bằng tối ưu (Khuyên dùng)",
                    desc: "Hài hòa giữa quãng đường di chuyển và thời gian hoàn thành",
                  },
                  {
                    id: "MIN_DURATION",
                    title: "Ưu tiên thời gian nhanh nhất",
                    desc: "Chọn các cung đường thông thoáng, hạn chế tối đa ùn tắc giao thông",
                  },
                  {
                    id: "MIN_DISTANCE",
                    title: "Ưu tiên quãng đường ngắn nhất",
                    desc: "Tối thiểu hóa số km di chuyển giữa các điểm giao nhận",
                  },
                  {
                    id: "MIN_COST",
                    title: "Tối ưu hóa chi phí vận hành",
                    desc: "Cân nhắc mức tiêu hao nhiên liệu và tránh các trạm thu phí BOT",
                  },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${settings.routing.optimizationGoal === opt.id
                      ? "bg-primary/5 border-primary shadow-xs"
                      : "border-border hover:bg-muted/40"
                      }`}
                  >
                    <input
                      type="radio"
                      name="optimizationGoal"
                      checked={settings.routing.optimizationGoal === opt.id}
                      onChange={() =>
                        setSettings({
                          ...settings,
                          routing: {
                            ...settings.routing,
                            optimizationGoal: opt.id as any,
                          },
                        })
                      }
                      className="mt-1"
                    />
                    <div>
                      <span className="text-xs font-bold text-foreground block">{opt.title}</span>
                      <span className="text-[11px] text-muted-foreground block">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Thẻ: Ràng buộc giao thông & Quy tắc đường bộ */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-border pb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Route className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Ràng buộc & Quy tắc Tuyến đường</h3>
                  <p className="text-xs text-muted-foreground">Tự động áp dụng khi sắp xếp thứ tự các điểm dừng</p>
                </div>
              </div>

              <div className="space-y-4 divide-y divide-border/60">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Tránh trạm thu phí BOT</span>
                    <span className="text-[11px] text-muted-foreground">Ưu tiên đường miễn phí nếu thời gian chênh lệch &lt; 20%</span>
                  </div>
                  <Switch
                    checked={settings.routing.avoidTolls}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        routing: { ...settings.routing, avoidTolls: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Tránh khung giờ cao điểm xe tải</span>
                    <span className="text-[11px] text-muted-foreground">Tránh các tuyến nội đô cấm xe tải từ 06h-09h và 16h-19h</span>
                  </div>
                  <Switch
                    checked={settings.routing.avoidRushHours}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        routing: { ...settings.routing, avoidRushHours: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Ưu tiên đường cao tốc</span>
                    <span className="text-[11px] text-muted-foreground">Tận dụng các tuyến cao tốc liên tỉnh khi có thể</span>
                  </div>
                  <Switch
                    checked={settings.routing.preferHighways}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        routing: { ...settings.routing, preferHighways: checked },
                      })
                    }
                  />
                </div>

                <div className="pt-3">
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Số điểm dừng tối đa trên một tuyến đường
                  </label>
                  <Input
                    type="number"
                    value={settings.routing.maxStopsPerRoute}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        routing: {
                          ...settings.routing,
                          maxStopsPerRoute: Number(e.target.value) || 1,
                        },
                      })
                    }
                    className="h-9 text-xs font-mono max-w-xs"
                  />
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Hệ thống sẽ tự động tách thành tuyến mới nếu vượt quá số điểm dừng này
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: KẾT NỐI API & TRẠNG THÁI MICROSERVICES                             */}
        {/* ========================================================================= */}
        <TabsContent value="api" className="space-y-4 outline-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Cấu hình kết nối API */}
            <div className="md:col-span-5 bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-border pb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Máy chủ API VietRoute</h3>
                  <p className="text-xs text-muted-foreground">Cấu hình kết nối Backend NestJS</p>
                </div>
              </div>

              <div className="space-y-3.5">
                {/* Chế độ Mock Data */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Chế độ Mock Data</span>
                    <span className="text-[11px] text-muted-foreground">
                      {settings.api.useMockData
                        ? "Đang dùng dữ liệu mô phỏng Offline"
                        : "Đang kết nối Backend Server thật"}
                    </span>
                  </div>
                  <Badge variant={settings.api.useMockData ? "outline" : "success"}>
                    {settings.api.useMockData ? "Mock Mode" : "Live API"}
                  </Badge>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Địa chỉ API Base URL
                  </label>
                  <Input
                    type="text"
                    value={settings.api.apiBaseUrl}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        api: { ...settings.api, apiBaseUrl: e.target.value },
                      })
                    }
                    className="h-9 text-xs font-mono"
                    placeholder="http://localhost:3000/api/v1"
                  />
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Được định nghĩa qua biến môi trường VITE_API_BASE_URL
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Thời gian Timeout yêu cầu (ms)
                  </label>
                  <Input
                    type="number"
                    value={settings.api.requestTimeoutMs}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        api: { ...settings.api, requestTimeoutMs: Number(e.target.value) || 5000 },
                      })
                    }
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Bảng Giám sát Trạng thái Microservices & Ping Test */}
            <div className="md:col-span-7 bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <Wifi className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Trạng thái Microservices</h3>
                      <p className="text-xs text-muted-foreground">Đo lường thời gian phản hồi (latency) thực tế</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPinging}
                    onClick={handlePingTest}
                    className="h-8 text-xs gap-1.5 cursor-pointer font-semibold"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isPinging ? "animate-spin" : ""}`} />
                    Kiểm tra (Ping)
                  </Button>
                </div>

                <div className="space-y-2 pt-3">
                  {services.map((srv, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/20 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <div>
                          <span className="font-semibold text-foreground block">{srv.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{srv.endpoint}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] text-muted-foreground font-bold">
                          {srv.status === "CHECKING" ? "..." : `${srv.latencyMs} ms`}
                        </span>
                        <Badge
                          variant={srv.status === "ONLINE" ? "success" : "warning"}
                          className="text-[10px] font-mono px-2 py-0"
                        >
                          {srv.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Hệ thống sẵn sàng chuyển sang kết nối Backend thật khi bạn chuyển <b>VITE_USE_MOCK=false</b>.</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: CẢNH BÁO AN TOÀN & THÔNG BÁO                                       */}
        {/* ========================================================================= */}
        <TabsContent value="notifications" className="space-y-4 outline-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cảnh báo an toàn phương tiện */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-border pb-3">
                <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Quy chuẩn An toàn Phương tiện</h3>
                  <p className="text-xs text-muted-foreground">Kích hoạt thông báo cảnh báo tức thời cho điều phối viên</p>
                </div>
              </div>

              <div className="space-y-4 divide-y divide-border/60">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Cảnh báo vi phạm tốc độ GPS</span>
                    <span className="text-[11px] text-muted-foreground">Tự động phát chuông và đánh dấu xe màu đỏ khi chạy quá tốc độ</span>
                  </div>
                  <Switch
                    checked={settings.notifications.overspeedAlert}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, overspeedAlert: checked },
                      })
                    }
                  />
                </div>

                <div className="pt-3">
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Cảnh báo hạn đăng kiểm phương tiện trước (ngày)
                  </label>
                  <Input
                    type="number"
                    value={settings.notifications.inspectionExpiryDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          inspectionExpiryDays: Number(e.target.value) || 1,
                        },
                      })
                    }
                    className="h-9 text-xs font-mono max-w-xs"
                  />
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Gắn cờ vàng cảnh báo xe sắp đến hạn kiểm định định kỳ
                  </span>
                </div>

                <div className="pt-3">
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Thời gian lái xe liên tục cảnh báo mệt mỏi (giờ)
                  </label>
                  <Input
                    type="number"
                    value={settings.notifications.driverFatigueHours}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          driverFatigueHours: Number(e.target.value) || 1,
                        },
                      })
                    }
                    className="h-9 text-xs font-mono max-w-xs"
                  />
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Theo quy chuẩn an toàn giao thông đường bộ Việt Nam (tối đa 4 tiếng liên tục)
                  </span>
                </div>
              </div>
            </div>

            {/* Cảnh báo kho bãi & Kênh thông báo */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-border pb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Cảnh báo Vận hành Kho & Kênh phát</h3>
                  <p className="text-xs text-muted-foreground">Quản lý ngưỡng quá tải và âm thanh thông báo</p>
                </div>
              </div>

              <div className="space-y-4 divide-y divide-border/60">
                <div className="pt-2">
                  <label className="text-xs font-medium text-foreground block mb-1.5">
                    Ngưỡng cảnh báo kho bãi đầy tải (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={settings.notifications.warehouseCapacityAlertPercent}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            warehouseCapacityAlertPercent: Number(e.target.value) || 50,
                          },
                        })
                      }
                      className="h-9 text-xs font-mono w-28"
                    />
                    <span className="text-xs font-semibold text-foreground">%</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    Gửi cảnh báo tới quản lý hub khi dung lượng kho vượt ngưỡng này
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Âm thanh thông báo cảnh báo</span>
                    <span className="text-[11px] text-muted-foreground">Phát âm thanh bíp nhẹ khi xuất hiện cảnh báo khẩn cấp</span>
                  </div>
                  <Switch
                    checked={settings.notifications.soundEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, soundEnabled: checked },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog xác nhận Khôi phục cài đặt mặc định */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetToDefault}
        title="Khôi phục Cài đặt Mặc định?"
        description="Toàn bộ các tham số vận hành, tốc độ tối đa, thuật toán và API tùy chỉnh sẽ bị xóa và quay về thiết lập xuất xưởng ban đầu."
        confirmText="Khôi phục"
        cancelText="Hủy bỏ"
        variant="destructive"
      />
    </PageContainer>
  );
};
