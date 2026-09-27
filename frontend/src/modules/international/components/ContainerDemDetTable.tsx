import React, { useState, useMemo } from "react";
import {
  Container,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Ship,
  Search,
  Thermometer,
  RotateCcw,
  Check,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toast } from "@/shared/components/feedback/Toast";
import type { ContainerTrackingItem } from "../types/international";

interface ContainerDemDetTableProps {
  containers: ContainerTrackingItem[];
  isLoading?: boolean;
}

export const ContainerDemDetTable: React.FC<ContainerDemDetTableProps> = ({
  containers: initialContainers,
  isLoading = false,
}) => {
  const [containers, setContainers] = useState<ContainerTrackingItem[]>(initialContainers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Sync if prop changes
  React.useEffect(() => {
    setContainers(initialContainers);
  }, [initialContainers]);

  const filteredContainers = useMemo(() => {
    return containers.filter((item) => {
      const matchSearch =
        item.containerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.currentLocation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchOverdue = overdueOnly ? item.overdueDays > 0 : true;

      return matchSearch && matchStatus && matchOverdue;
    });
  }, [containers, searchTerm, statusFilter, overdueOnly]);

  const totalOverduePenalty = useMemo(() => {
    return containers.reduce((sum, item) => sum + (item.estimatedPenaltyAmountVnd || 0), 0);
  }, [containers]);

  const overdueCount = useMemo(() => {
    return containers.filter((item) => item.overdueDays > 0).length;
  }, [containers]);

  const handleReturnEmpty = (id: string, containerNo: string) => {
    setContainers((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "RETURNED_EMPTY",
              currentLocation: "Depot Hãng Tàu (Đã hạ vỏ)",
              overdueDays: 0,
              estimatedPenaltyAmountVnd: 0,
            }
          : c
      )
    );
    toast.success(
      "Đã ghi nhận trả vỏ rỗng",
      `Container ${containerNo} đã được hoàn tất thủ tục hạ bãi và trả vỏ hãng tàu.`
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_DEPOT":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">Tại Depot Cảng</Badge>;
      case "ON_VESSEL":
        return <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-[10px]">Trên tàu / Vận chuyển</Badge>;
      case "AT_FACTORY":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Đóng/Rút tại Kho</Badge>;
      case "RETURNED_EMPTY":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Đã trả vỏ rỗng</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-2xs">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground mt-3">Đang đồng bộ dữ liệu vỏ container & bãi bến...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert banner if overdue containers exist */}
      {overdueCount > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">
                Cảnh báo Phát sinh Demurrage & Detention!
              </h4>
              <p className="text-xs text-muted-foreground">
                Có <span className="font-semibold text-red-600 dark:text-red-400">{overdueCount} vỏ container</span> đã quá hạn Free Time lưu bãi/kho. Tổng phí phạt ước tính:{" "}
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {totalOverduePenalty.toLocaleString("vi-VN")} VNĐ
                </span>
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-red-500/30 text-red-600 hover:bg-red-500/10 shrink-0 text-xs h-8"
            onClick={() => setOverdueOnly(!overdueOnly)}
          >
            {overdueOnly ? "Xem tất cả vỏ container" : "Lọc danh sách quá hạn"}
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-card rounded-xl border border-border p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm số cont, hãng tàu, mã lô, bãi depot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { key: "ALL", label: "Tất cả" },
              { key: "IN_DEPOT", label: "Tại Depot" },
              { key: "AT_FACTORY", label: "Tại Nhà Máy" },
              { key: "ON_VESSEL", label: "Trên Tàu" },
              { key: "RETURNED_EMPTY", label: "Đã Trả Vỏ" },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={statusFilter === tab.key ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(tab.key)}
                className="text-xs h-8 px-2.5"
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Đang hiển thị <span className="font-semibold text-foreground">{filteredContainers.length}</span> container
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <th className="py-3 px-3.5">Số Container & Loại Vỏ</th>
                <th className="py-3 px-3.5">Hãng Tàu & Lô Hàng</th>
                <th className="py-3 px-3.5">Vị Trí Hiện Tại / Bãi Depot</th>
                <th className="py-3 px-3.5">Free Time & Hạn Trả</th>
                <th className="py-3 px-3.5">Tình Trạng Dem/Det</th>
                <th className="py-3 px-3.5">Trạng Thái</th>
                <th className="py-3 px-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredContainers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    <Container className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    Không tìm thấy dữ liệu vỏ container phù hợp
                  </td>
                </tr>
              ) : (
                filteredContainers.map((item) => {
                  const isOverdue = item.overdueDays > 0;
                  const isReturned = item.status === "RETURNED_EMPTY";

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        isOverdue && !isReturned ? "bg-red-500/[0.02]" : ""
                      }`}
                    >
                      {/* Container & Type */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2">
                          <Container className="h-4 w-4 text-primary shrink-0" />
                          <div>
                            <div className="font-bold text-foreground text-xs">{item.containerNo}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="outline" className="text-[9px] px-1 py-0 font-medium">
                                {item.type}
                              </Badge>
                              {item.temperatureRequired && (
                                <Badge className="bg-sky-500/15 text-sky-600 text-[9px] px-1 py-0 gap-0.5">
                                  <Thermometer className="h-2.5 w-2.5" />
                                  {item.temperatureRequired}
                                </Badge>
                              )}
                              <span className="text-[10px] text-muted-foreground">Seal: {item.sealNo}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Carrier & Shipment */}
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-foreground flex items-center gap-1">
                          <Ship className="h-3 w-3 text-muted-foreground" />
                          {item.carrier}
                        </div>
                        <div className="text-[11px] text-primary/80 font-mono mt-0.5">
                          {item.shipmentCode}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5 text-foreground">
                          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[180px]">{item.currentLocation}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Hạ bãi: {item.gateInDate}
                        </div>
                      </td>

                      {/* Free time */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{item.demDetFreeDays} ngày Free Time</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Hạn chót: <span className="font-medium text-foreground">{item.freeTimeExpiryDate}</span>
                        </div>
                      </td>

                      {/* Dem/Det Status */}
                      <td className="py-3 px-3.5">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            Đã tất toán
                          </span>
                        ) : isOverdue ? (
                          <div className="space-y-0.5">
                            <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[9px] gap-1 px-1.5 py-0">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              Quá hạn {item.overdueDays} ngày
                            </Badge>
                            <div className="text-[10px] font-bold text-red-600">
                              +{(item.estimatedPenaltyAmountVnd || 0).toLocaleString("vi-VN")} đ
                            </div>
                          </div>
                        ) : (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] gap-1 px-1.5 py-0">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            Trong hạn Free Time
                          </Badge>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5">{getStatusBadge(item.status)}</td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right">
                        {!isReturned ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReturnEmpty(item.id, item.containerNo)}
                            className="h-7 px-2 text-[11px] gap-1 border-primary/30 text-primary hover:bg-primary/10"
                            title="Xác nhận đã trả vỏ rỗng về depot hãng tàu"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Trả vỏ rỗng
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                            <Check className="h-3 w-3 text-emerald-500" /> Hoàn tất
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
