import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  AlertCircle,
  Layers,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import type { Order, Driver, Vehicle, Warehouse } from "@/core/types/logistics";
import { scoreDriversForOrder, type DriverCandidate } from "../utils/driverScoring";
import { DriverRecommendationCard } from "./DriverRecommendationCard";
import { DriverLoadIndicator } from "./DriverLoadIndicator";

interface DriverRecommendationPanelProps {
  selectedOrder: Order | null;
  drivers: Driver[];
  vehicles: Vehicle[];
  warehouses: Warehouse[];
  onAssignDriver: (order: Order, candidate: DriverCandidate) => void;
  isLoading?: boolean;
  className?: string;
}

export const DriverRecommendationPanel: React.FC<DriverRecommendationPanelProps> = ({
  selectedOrder,
  drivers,
  vehicles,
  warehouses,
  onAssignDriver,
  className,
}) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"RECOMMENDED" | "ALL">("RECOMMENDED");

  const vehicleMap = new Map<string, Vehicle>();
  for (const v of vehicles) {
    vehicleMap.set(v.id, v);
  }

  // Chấm điểm đề xuất cho đơn đang chọn
  const candidates: DriverCandidate[] = selectedOrder
    ? scoreDriversForOrder(selectedOrder, drivers, vehicles, warehouses)
    : [];

  const eligibleCandidates = candidates.filter((c) => c.isEligible);
  const bestCandidate = candidates.find((c) => c.isBestMatch);

  return (
    <Card className={`flex flex-col h-[680px] lg:h-[720px] overflow-hidden border-border/80 shadow-xs ${className || ""}`}>
      {/* Header */}
      <CardHeader className="py-2.5 px-4 border-b border-border/60 shrink-0 bg-card/70 backdrop-blur-xs flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Đề xuất tài xế</span>
          </CardTitle>
          {selectedOrder && (
            <Badge variant="outline" className="font-mono text-xs font-bold text-primary border-primary/30">
              {selectedOrder.orderCode}
            </Badge>
          )}
        </div>

        {/* Tab switch giữa Đề xuất & Toàn bộ tài xế */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as "RECOMMENDED" | "ALL")}>
          <TabsList className="h-7 p-0.5 bg-muted">
            <TabsTrigger value="RECOMMENDED" className="h-6 text-[10px] px-2 font-semibold">
              Đề xuất
            </TabsTrigger>
            <TabsTrigger value="ALL" className="h-6 text-[10px] px-2 font-semibold">
              Đội xe ({drivers.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      {/* Body Content */}
      <CardContent className="p-3 flex-1 overflow-y-auto space-y-3">
        {/* Trường hợp 1: Xem tab Toàn bộ đội xe */}
        {tab === "ALL" ? (
          <div className="space-y-2.5">
            <div className="text-[11px] text-muted-foreground flex justify-between items-center pb-1 border-b border-border/40">
              <span>Danh sách tài xế trực tuyến ({drivers.length})</span>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate("/drivers")}
                className="h-auto p-0 text-[11px] text-primary"
              >
                Quản lý đội xe →
              </Button>
            </div>

            {drivers.map((driver) => {
              const vehicle = driver.currentVehicleId
                ? vehicleMap.get(driver.currentVehicleId)
                : undefined;

              return (
                <div
                  key={driver.id}
                  className="p-2.5 rounded-lg border border-border/70 bg-card space-y-1.5 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-foreground">{driver.fullName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {driver.driverCode} • {vehicle?.licensePlate || "Chưa có xe"}
                      </div>
                    </div>
                    <Badge
                      variant={
                        driver.status === "AVAILABLE"
                          ? "success"
                          : driver.status === "BUSY"
                          ? "info"
                          : "secondary"
                      }
                      className="text-[10px] px-1.5 py-0"
                    >
                      {driver.status === "AVAILABLE"
                        ? "Sẵn sàng"
                        : driver.status === "BUSY"
                        ? "Đang giao"
                        : "Nghỉ ca"}
                    </Badge>
                  </div>
                  <DriverLoadIndicator currentDeliveries={driver.currentDeliveryCount} maxCapacity={5} />
                </div>
              );
            })}
          </div>
        ) : !selectedOrder ? (
          /* Trường hợp 2: Chưa chọn đơn hàng */
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 mb-3">
              <Layers className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-foreground">Chọn một đơn hàng để nhận đề xuất</span>
            <span className="text-[11px] text-muted-foreground leading-relaxed mt-1 max-w-[220px]">
              Hệ thống sẽ tự động tính toán khoảng cách, ETA và tải trọng để tìm tài xế tối ưu nhất.
            </span>
          </div>
        ) : eligibleCandidates.length === 0 ? (
          /* Trường hợp 3: Không có tài xế phù hợp (No Candidate State) */
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Chưa tìm thấy tài xế phù hợp</h4>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px] leading-relaxed">
                Tất cả tài xế hiện đang quá tải hoặc phương tiện không đủ tải trọng ({selectedOrder.totalWeight} kg).
              </p>
            </div>
            <div className="flex flex-col gap-1.5 w-full pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTab("ALL")}
                className="text-xs h-8 cursor-pointer"
              >
                <span>Xem tất cả tài xế</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/drivers")}
                className="text-xs h-7 text-primary cursor-pointer"
              >
                <span>Tìm phương án khác →</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Trường hợp 4: Hiển thị các ứng viên đề xuất */
          <div className="space-y-3">
            {/* Tóm tắt đơn đang chọn */}
            <div className="p-2.5 rounded-lg bg-primary/[0.04] border border-primary/20 flex items-center justify-between text-xs">
              <div className="truncate">
                <span className="text-[10px] text-muted-foreground block">Đang phân công cho đơn:</span>
                <span className="font-bold text-foreground truncate">
                  {selectedOrder.receiverName} ({selectedOrder.totalWeight} kg)
                </span>
              </div>
              <span className="text-[11px] font-bold text-primary font-mono shrink-0">
                {eligibleCandidates.length} ứng viên
              </span>
            </div>

            {/* Danh sách các ứng viên xếp theo điểm */}
            {candidates.map((candidate) => (
              <DriverRecommendationCard
                key={candidate.driver.id}
                candidate={candidate}
                isSelected={bestCandidate?.driver.id === candidate.driver.id}
                onAssign={(cand) => onAssignDriver(selectedOrder, cand)}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Footer CTA nếu có ứng viên tốt nhất */}
      {selectedOrder && bestCandidate && bestCandidate.isEligible && tab === "RECOMMENDED" && (
        <div className="p-3 border-t border-border/70 bg-card/80 shrink-0">
          <Button
            className="w-full h-9 gap-2 text-xs font-semibold shadow-xs cursor-pointer"
            onClick={() => onAssignDriver(selectedOrder, bestCandidate)}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Phân công cho {bestCandidate.driver.fullName} ({bestCandidate.matchScore}%)</span>
          </Button>
        </div>
      )}
    </Card>
  );
};
