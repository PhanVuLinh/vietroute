import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  Truck,
  UserCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { Order, Driver, Vehicle, Warehouse } from "@/core/types/logistics";
import { dispatchService } from "@/mocks/adapters/serviceFactory";
import { toast } from "@/shared/components/feedback/Toast";

interface AutoDispatchBatchPanelProps {
  orders: Order[];
  drivers: Driver[];
  vehicles: Vehicle[];
  warehouseMap: Map<string, Warehouse>;
  onSuccess: () => void;
  onSwitchToManual: () => void;
}

export const AutoDispatchBatchPanel: React.FC<AutoDispatchBatchPanelProps> = ({
  orders,
  drivers,
  vehicles,
  warehouseMap: _warehouseMap,
  onSuccess,
  onSwitchToManual,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    assignedCount: number;
    assignments: any[];
    message: string;
  } | null>(null);

  // Lọc các đơn hàng đang chờ phân công
  const pendingOrders = orders.filter(
    (o) => o.status === "PENDING" || o.status === "CONFIRMED"
  );
  const availableDrivers = drivers.filter(
    (d) => d.status === "AVAILABLE" || d.status === "BUSY"
  );

  // Dự báo kế hoạch ghép đơn AI
  const simulatedMatches = pendingOrders.map((order, idx) => {
    const driver = availableDrivers[idx % availableDrivers.length] || drivers[0];
    const vehicle =
      vehicles.find((v) => v.driverId === driver?.id) ||
      vehicles[idx % vehicles.length];

    // Chấm điểm giả lập heuristic
    const score = Math.min(98, Math.max(82, 95 - idx * 3));

    return {
      order,
      driver,
      vehicle,
      score,
      reason: `Khoảng cách tối ưu ~${(1.2 + idx * 0.8).toFixed(1)}km • Tỉ lệ đúng hẹn ${driver?.onTimeRate || 98}% • Xe tải ${vehicle?.type || "1.5T"}`,
    };
  });

  const handleExecuteBatch = async () => {
    if (pendingOrders.length === 0) {
      toast.info("Không có đơn hàng nào cần điều phối tự động");
      return;
    }

    try {
      setIsProcessing(true);
      const res = await dispatchService.autoDispatchBatch();
      const result = res.data;
      setLastResult(result);
      toast.success(
        result.message || `Đã phân công tự động ${result.assignedCount} đơn hàng thành công!`
      );
      onSuccess();
    } catch (err: any) {
      toast.error("Không thể hoàn tất phân bổ tự động: " + (err?.message || "Lỗi máy chủ"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Banner AI Giới thiệu chế độ tự động */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-primary p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white hover:bg-white/25 border-0 text-[11px] gap-1 px-2.5 py-0.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" />
                AI Dispatch Engine v2.0
              </Badge>
              <span className="text-xs text-blue-100 font-mono">Thuật toán Heuristic đa mục tiêu</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Trung tâm Điều phối Tự động Hàng loạt (Batch Auto-Dispatch)
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Tự động phân bổ thông minh toàn bộ đơn hàng đang chờ tới đội tài xế tối ưu nhất dựa trên vị trí GPS thực tế, SLA cam kết, tải trọng phương tiện và độ cân bằng ca chạy.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchToManual}
              className="h-10 px-4 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer backdrop-blur-xs"
            >
              Về phân công thủ công
            </Button>

            <Button
              size="sm"
              onClick={handleExecuteBatch}
              disabled={isProcessing || pendingOrders.length === 0}
              className="h-10 px-6 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className={`h-4 w-4 fill-slate-950 ${isProcessing ? "animate-bounce" : ""}`} />
              <span>
                {isProcessing ? "Đang xử lý phân bổ..." : `Phân bổ tự động (${pendingOrders.length} đơn)`}
              </span>
            </Button>
          </div>
        </div>

        {/* 4 Thống kê nhanh */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-4 border-t border-white/15">
          <div className="p-3 rounded-xl bg-black/20 border border-white/10">
            <span className="text-[11px] text-blue-200 block">Đơn hàng chờ phân công</span>
            <span className="text-xl font-bold font-mono text-white">
              {pendingOrders.length} đơn
            </span>
          </div>
          <div className="p-3 rounded-xl bg-black/20 border border-white/10">
            <span className="text-[11px] text-blue-200 block">Tài xế khả dụng</span>
            <span className="text-xl font-bold font-mono text-emerald-300">
              {availableDrivers.length} tài xế
            </span>
          </div>
          <div className="p-3 rounded-xl bg-black/20 border border-white/10">
            <span className="text-[11px] text-blue-200 block">Thời gian xử lý ước tính</span>
            <span className="text-xl font-bold font-mono text-amber-300">
              &lt; 1 giây
            </span>
          </div>
          <div className="p-3 rounded-xl bg-black/20 border border-white/10">
            <span className="text-[11px] text-blue-200 block">Điểm khớp lệnh trung bình</span>
            <span className="text-xl font-bold font-mono text-cyan-300">
              94.6%
            </span>
          </div>
        </div>
      </div>

      {/* Thông báo kết quả vừa phân công nếu có */}
      {lastResult && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-sm">{lastResult.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Các chuyến giao đã được cập nhật sang trạng thái ASSIGNED và đồng bộ tức thời đến App Tài xế.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setLastResult(null)}
            className="text-xs h-8 border-emerald-500/40 cursor-pointer"
          >
            Đóng
          </Button>
        </div>
      )}

      {/* Danh sách Xem trước kế hoạch phân bổ (Preview Plan) */}
      <Card className="border-border">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span>Kế hoạch phân bổ đề xuất ({simulatedMatches.length} chặng)</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Xem trước các ghép cặp đơn hàng & tài xế trước khi bấm xác nhận thực thi
              </p>
            </div>

            <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
              Tự động cập nhật
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {simulatedMatches.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-foreground">
                Toàn bộ đơn hàng đã được điều phối!
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Không còn đơn hàng nào ở trạng thái chờ phân công. Tất cả các đơn đã có tài xế phụ trách.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={onSwitchToManual}
                className="text-xs h-8 cursor-pointer mt-2"
              >
                Quay lại màn hình giám sát điều phối
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {simulatedMatches.map((item) => (
                <div
                  key={item.order.id}
                  className="p-4 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Cột 1: Thông tin đơn hàng */}
                  <div className="space-y-1 min-w-[260px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs font-mono text-primary">
                        {item.order.orderCode}
                      </span>
                      {item.order.priority === "URGENT" && (
                        <Badge className="bg-red-500 text-white text-[9px] py-0">HỎA TỐC</Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">
                        {item.order.totalWeight} kg
                      </Badge>
                    </div>
                    <p className="font-semibold text-xs text-foreground line-clamp-1">
                      {item.order.receiverName}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary shrink-0 inline" />
                      <span>{item.order.receiverAddress}</span>
                    </p>
                  </div>

                  {/* Icon mũi tên liên kết */}
                  <div className="hidden md:flex items-center justify-center shrink-0 text-muted-foreground/60">
                    <ArrowRight className="h-4 w-4" />
                  </div>

                  {/* Cột 2: Tài xế & Xe ghép cặp */}
                  <div className="space-y-1 min-w-[240px]">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-xs text-foreground">
                        {item.driver?.fullName || "Chưa có tài xế"}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        ({item.driver?.driverCode})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Truck className="h-3.5 w-3.5 text-primary" />
                      <span className="font-mono font-medium text-foreground">
                        {item.vehicle?.licensePlate || "Xe tải phân bổ"}
                      </span>
                      <span>• {item.vehicle?.type || "1.5 Tấn"}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {item.reason}
                    </p>
                  </div>

                  {/* Cột 3: Điểm số AI Match */}
                  <div className="flex items-center md:flex-col md:items-end justify-between gap-1 shrink-0">
                    <span className="text-[10px] text-muted-foreground">Độ phù hợp</span>
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold font-mono text-xs">
                      {item.score}% Match
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
