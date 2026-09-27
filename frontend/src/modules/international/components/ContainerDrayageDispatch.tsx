import React, { useState } from "react";
import {
  Truck,
  Plus,
  Search,
  Clock,
  MapPin,
  Calendar,
  Fuel,
  CreditCard,
  UserCheck,
  ChevronRight,
  Eye,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  useDrayageDispatches,
  useInternationalMutations,
  useInternationalShipments,
} from "../hooks/useInternational";
import type { ContainerDrayageDispatchItem } from "../types/international";
import { toast } from "@/shared/components/feedback/Toast";

interface ContainerDrayageDispatchProps {
  onOpenAiAnalysis?: (shipmentCode: string) => void;
}

export const ContainerDrayageDispatch: React.FC<ContainerDrayageDispatchProps> = ({
  onOpenAiAnalysis,
}) => {
  const { data: dispatches = [], isLoading, refetch } = useDrayageDispatches();
  const { data: shipments = [] } = useInternationalShipments();
  const { createDrayageDispatch, updateDrayageStatus } = useInternationalMutations();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<ContainerDrayageDispatchItem | null>(null);

  // Form states
  const [formShipmentCode, setFormShipmentCode] = useState("");
  const [formContainerNo, setFormContainerNo] = useState("");
  const [formContainerType, setFormContainerType] = useState("40HC");
  const [formDispatchType, setFormDispatchType] = useState<ContainerDrayageDispatchItem["dispatchType"]>("PORT_TO_DOOR");
  const [formPickup, setFormPickup] = useState("Cảng Tân Cảng Cát Lái - Cầu tàu 3");
  const [formDelivery, setFormDelivery] = useState("Kho ICD Sotrans Thủ Đức, TP. Thủ Đức");
  const [formTractor, setFormTractor] = useState("51C-881.92");
  const [formTrailer, setFormTrailer] = useState("51R-441.20");
  const [formDriverName, setFormDriverName] = useState("Nguyễn Văn Tuấn");
  const [formDriverPhone, setFormDriverPhone] = useState("0908.776.221");
  const [formAppointmentTime, setFormAppointmentTime] = useState("21:30 - 04:30 (Tránh cấm tải đêm)");
  const [formTollFee, setFormTollFee] = useState<number>(280000);
  const [formFuelEst, setFormFuelEst] = useState<number>(45);

  // Filtering
  const filteredDispatches = dispatches.filter((d) => {
    const matchSearch =
      d.dispatchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.shipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.containerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tractorPlate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary Metrics
  const totalActive = dispatches.filter(
    (d) => d.status !== "COMPLETED"
  ).length;
  const inTransitCount = dispatches.filter(
    (d) => d.status === "DISPATCHED" || d.status === "PULLED_FROM_PORT" || d.status === "DELIVERED_FACTORY"
  ).length;
  const totalTollFee = dispatches.reduce((acc, cur) => acc + (cur.tollFeeVnd || 0), 0);
  const totalFuelLiters = dispatches.reduce((acc, cur) => acc + (cur.fuelEstimatedLiters || 0), 0);

  const getStatusBadge = (status: ContainerDrayageDispatchItem["status"]) => {
    switch (status) {
      case "PENDING_DISPATCH":
        return <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-[10px]">Chờ xuất bến</Badge>;
      case "DISPATCHED":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] animate-pulse">Đang tới cảng</Badge>;
      case "PULLED_FROM_PORT":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px]">Đã kéo khỏi cảng</Badge>;
      case "DELIVERED_FACTORY":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Đang hạ hàng tại kho</Badge>;
      case "COMPLETED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Hoàn tất điều độ</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  const getNextStatus = (current: ContainerDrayageDispatchItem["status"]): ContainerDrayageDispatchItem["status"] | null => {
    const flow: ContainerDrayageDispatchItem["status"][] = [
      "PENDING_DISPATCH",
      "DISPATCHED",
      "PULLED_FROM_PORT",
      "DELIVERED_FACTORY",
      "COMPLETED",
    ];
    const idx = flow.indexOf(current);
    if (idx >= 0 && idx < flow.length - 1) {
      return flow[idx + 1];
    }
    return null;
  };

  const getNextStatusLabel = (next: ContainerDrayageDispatchItem["status"]) => {
    switch (next) {
      case "DISPATCHED":
        return "Xuất bến nhận cont";
      case "PULLED_FROM_PORT":
        return "Đã kéo rời cảng";
      case "DELIVERED_FACTORY":
        return "Đang rút ruột kho";
      case "COMPLETED":
        return "Xác nhận Hoàn tất";
      default:
        return "Chuyển bước";
    }
  };

  const handleAdvanceStatus = async (item: ContainerDrayageDispatchItem) => {
    const next = getNextStatus(item.status);
    if (!next) return;
    await updateDrayageStatus.mutateAsync({ id: item.id, status: next });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formShipmentCode || !formContainerNo) {
      toast.error("Vui lòng nhập mã lô hàng và số container");
      return;
    }

    await createDrayageDispatch.mutateAsync({
      shipmentCode: formShipmentCode,
      containerNo: formContainerNo,
      containerType: formContainerType,
      dispatchType: formDispatchType,
      pickupLocation: formPickup,
      deliveryLocation: formDelivery,
      tractorPlate: formTractor,
      trailerPlate: formTrailer,
      driverName: formDriverName,
      driverPhone: formDriverPhone,
      driverLicenseGrade: "FC",
      appointmentTime: formAppointmentTime,
      tollFeeVnd: Number(formTollFee) || 0,
      fuelEstimatedLiters: Number(formFuelEst) || 0,
      status: "PENDING_DISPATCH",
    });

    setIsCreateOpen(false);
  };

  const handleSelectShipmentPreset = (shipmentCode: string) => {
    setFormShipmentCode(shipmentCode);
    const found = shipments.find((s) => s.shipmentCode === shipmentCode);
    if (found) {
      if (found.containerNumber) setFormContainerNo(found.containerNumber);
      if (found.containerType) setFormContainerType(found.containerType);
      if (found.direction === "IMPORT") {
        setFormDispatchType("PORT_TO_DOOR");
        setFormPickup(found.podPort || "Cảng Tân Cảng Cát Lái");
        setFormDelivery("Kho ICD Sotrans Thủ Đức");
      } else {
        setFormDispatchType("DOOR_TO_PORT");
        setFormPickup("Kho ICD Sotrans Thủ Đức");
        setFormDelivery(found.polPort || "Cảng Tân Cảng Cát Lái");
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="shadow-2xs border-border bg-card">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Lệnh Điều Xe Đang Chạy
            </span>
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Truck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold font-mono text-foreground">{totalActive} xe</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Tổng số container đang trong chu trình vận chuyển
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border bg-card">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Đang Di Chuyển / Tại Cảng
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold font-mono text-blue-600">{inTransitCount} xe</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Giám sát theo thời gian thực tránh ùn tắc cầu cảng
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border bg-card">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Dự Toán Cầu Đường (BOT)
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold font-mono text-emerald-600">
              {totalTollFee.toLocaleString("vi-VN")} đ
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Tự động tích hợp ePass/VETC trạm cao tốc
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border bg-card">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Định Mức Nhiên Liệu DO
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
              <Fuel className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold font-mono text-amber-600">
              {totalFuelLiters.toLocaleString()} Lít
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Định mức dầu chuẩn theo rơ-moóc 20ft & 40ft
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Search, Status Filter, Create Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã lệnh, số cont, biển đầu kéo, tài xế FC..."
              className="pl-8.5 h-8.5 text-xs bg-background"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8.5 text-xs px-2.5 rounded-lg border border-border bg-background text-foreground"
          >
            <option value="ALL">Tất cả trạng thái điều độ</option>
            <option value="PENDING_DISPATCH">Chờ xuất bến</option>
            <option value="DISPATCHED">Đang tới cảng</option>
            <option value="PULLED_FROM_PORT">Đã kéo khỏi cảng</option>
            <option value="DELIVERED_FACTORY">Đang dỡ hàng tại kho</option>
            <option value="COMPLETED">Đã hoàn tất</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8.5 text-xs gap-1.5"
            title="Tải lại"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8.5 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" /> Tạo Lệnh Điều Xe Container
          </Button>
        </div>
      </div>

      {/* Drayage Dispatches Table */}
      <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-3 px-4 w-[160px]">Lệnh Điều Độ & Lô</th>
                <th className="py-3 px-4 min-w-[160px]">Container & Kích Cỡ</th>
                <th className="py-3 px-4 min-w-[180px]">Đầu Kéo & Rơ-moóc</th>
                <th className="py-3 px-4 min-w-[170px]">Tài Xế & Bằng FC</th>
                <th className="py-3 px-4 min-w-[240px]">Hành Trình Kéo Cont</th>
                <th className="py-3 px-4 min-w-[180px]">Khung Giờ (Cấm tải)</th>
                <th className="py-3 px-4 w-[130px] text-right">Chi Phí & Dầu</th>
                <th className="py-3 px-4 w-[140px] text-center">Trạng Thái</th>
                <th className="py-3 px-4 w-[130px] text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="mt-2 text-xs">Đang tải danh sách điều xe container...</p>
                  </td>
                </tr>
              ) : filteredDispatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <Truck className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-semibold text-foreground">Chưa có lệnh điều xe container nào</p>
                    <p className="text-[11px] mt-0.5">
                      Bấm nút "Tạo Lệnh Điều Xe Container" hoặc dùng AI Phân Tích Nhập Hàng để tự động gán xe.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDispatches.map((item) => {
                  const nextStatus = getNextStatus(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      {/* Lệnh & Lô */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-primary text-xs block">
                            {item.dispatchCode}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="font-mono text-[10px] bg-muted/40">
                              {item.shipmentCode}
                            </Badge>
                            {onOpenAiAnalysis && (
                              <button
                                onClick={() => onOpenAiAnalysis(item.shipmentCode)}
                                className="text-[10px] text-primary hover:underline flex items-center gap-0.5 font-semibold"
                                title="Xem AI Phân tích rủi ro & chi phí lô hàng này"
                              >
                                <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                                AI
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Container & Kích Cỡ */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-foreground block text-[11px]">
                            {item.containerNo}
                          </span>
                          <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded font-mono">
                            {item.containerType} ({item.dispatchType})
                          </span>
                        </div>
                      </td>

                      {/* Đầu Kéo & Rơ-moóc */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-foreground text-xs">
                              {item.tractorPlate}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            Moóc: {item.trailerPlate}
                          </div>
                        </div>
                      </td>

                      {/* Tài xế & FC */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-semibold text-foreground text-[11px]">
                            <UserCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                            <span>{item.driverName}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                            <span className="text-primary font-semibold">Bằng {item.driverLicenseGrade}</span>
                            <span>•</span>
                            <span>{item.driverPhone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Tuyến Kéo */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[11px]">
                            <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
                            <span className="truncate max-w-[170px]" title={item.pickupLocation}>
                              {item.pickupLocation}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                            <span className="truncate max-w-[170px] font-medium text-foreground" title={item.deliveryLocation}>
                              {item.deliveryLocation}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Khung Giờ Cấm Tải */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[10px] font-medium text-foreground">
                            <Calendar className="h-3 w-3 text-primary shrink-0" />
                            <span>{item.appointmentTime}</span>
                          </div>
                          <div className="text-[9px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded w-fit">
                            Tránh cấm xe cont: 6h-9h & 16h-20h
                          </div>
                        </div>
                      </td>

                      {/* Chi Phí & Dầu */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-semibold text-foreground text-xs">
                          {item.tollFeeVnd.toLocaleString("vi-VN")} đ
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {item.fuelEstimatedLiters} Lít dầu
                        </div>
                      </td>

                      {/* Trạng Thái */}
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Thao Tác */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {nextStatus && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdvanceStatus(item)}
                              className="h-7 px-2 text-[10px] gap-1 font-semibold text-primary border-primary/30 hover:bg-primary/10"
                              title={`Chuyển sang: ${nextStatus}`}
                            >
                              <span>{getNextStatusLabel(nextStatus)}</span>
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedDispatch(item)}
                            className="h-7 w-7 text-muted-foreground"
                            title="Xem chi tiết lệnh điều xe"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Drayage Dispatch Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Truck className="h-5 w-5 text-primary" />
              Tạo Lệnh Điều Xe Kéo Container (Port-to-Door Drayage)
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            {/* Lựa chọn lô hàng có sẵn */}
            <div>
              <label className="font-semibold block mb-1">Chọn Lô Hàng Quốc Tế Liên Quan</label>
              <select
                value={formShipmentCode}
                onChange={(e) => handleSelectShipmentPreset(e.target.value)}
                className="w-full h-8.5 px-3 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="">-- Chọn lô hàng xuất/nhập khẩu --</option>
                {shipments.map((s) => (
                  <option key={s.id} value={s.shipmentCode}>
                    {s.shipmentCode} | {s.direction === "IMPORT" ? "NHẬP KHẨU" : "XUẤT KHẨU"} | Cont: {s.containerNumber || "N/A"} ({s.podPort})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Mã Lô Hàng</label>
                <Input
                  value={formShipmentCode}
                  onChange={(e) => setFormShipmentCode(e.target.value)}
                  placeholder="Ví dụ: IMP-2026-005"
                  className="h-8.5 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Số Container & Loại</label>
                <div className="flex gap-2">
                  <Input
                    value={formContainerNo}
                    onChange={(e) => setFormContainerNo(e.target.value)}
                    placeholder="TGHU-882910-1"
                    className="h-8.5 font-mono flex-1"
                    required
                  />
                  <select
                    value={formContainerType}
                    onChange={(e) => setFormContainerType(e.target.value)}
                    className="h-8.5 px-2 rounded-lg border border-border bg-background font-mono"
                  >
                    <option value="20GP">20' GP</option>
                    <option value="40GP">40' GP</option>
                    <option value="40HC">40' HC</option>
                    <option value="40RF">40' RF (Lạnh)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loại điều độ & Khung giờ */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Loại Hình Điều Độ Container</label>
                <select
                  value={formDispatchType}
                  onChange={(e) => setFormDispatchType(e.target.value as ContainerDrayageDispatchItem["dispatchType"])}
                  className="w-full h-8.5 px-3 rounded-lg border border-border bg-background"
                >
                  <option value="PORT_TO_DOOR">Kéo từ Cảng về Kho (Port-to-Door)</option>
                  <option value="DOOR_TO_PORT">Kéo từ Kho ra Cảng xuất (Door-to-Port)</option>
                  <option value="EMPTY_RETURN_DEPOT">Kéo trả vỏ rỗng về Depot (Empty Return)</option>
                  <option value="EMPTY_PICKUP_DEPOT">Lấy vỏ rỗng tại Depot đi đóng hàng</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Khung Giờ Lấy Hàng (Hạn chế cấm tải)</label>
                <Input
                  value={formAppointmentTime}
                  onChange={(e) => setFormAppointmentTime(e.target.value)}
                  placeholder="21:30 - 04:30"
                  className="h-8.5"
                />
              </div>
            </div>

            {/* Xe đầu kéo & Rơ-mooc */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Biển Số Đầu Kéo</label>
                <Input
                  value={formTractor}
                  onChange={(e) => setFormTractor(e.target.value)}
                  placeholder="51C-881.92"
                  className="h-8.5 font-mono"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Biển Rơ-moóc (Chassis)</label>
                <Input
                  value={formTrailer}
                  onChange={(e) => setFormTrailer(e.target.value)}
                  placeholder="51R-441.20"
                  className="h-8.5 font-mono"
                  required
                />
              </div>
            </div>

            {/* Tài xế & SĐT */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Họ Tên Tài Xế Đầu Kéo (Bằng FC)</label>
                <Input
                  value={formDriverName}
                  onChange={(e) => setFormDriverName(e.target.value)}
                  placeholder="Nguyễn Văn Tuấn"
                  className="h-8.5"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Số Điện Thoại Tài Xế</label>
                <Input
                  value={formDriverPhone}
                  onChange={(e) => setFormDriverPhone(e.target.value)}
                  placeholder="0908.776.221"
                  className="h-8.5 font-mono"
                  required
                />
              </div>
            </div>

            {/* Lộ trình */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Điểm Nhận Container (Cảng/Depot)</label>
                <Input
                  value={formPickup}
                  onChange={(e) => setFormPickup(e.target.value)}
                  placeholder="Cảng Tân Cảng Cát Lái - Cầu 3"
                  className="h-8.5"
                  required
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Điểm Hạ Hàng (Kho/Nhà máy)</label>
                <Input
                  value={formDelivery}
                  onChange={(e) => setFormDelivery(e.target.value)}
                  placeholder="Kho ICD Sotrans Thủ Đức"
                  className="h-8.5"
                  required
                />
              </div>
            </div>

            {/* Chi phí cầu đường & Dầu */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Phí Cầu Đường BOT (VNĐ)</label>
                <Input
                  type="number"
                  value={formTollFee}
                  onChange={(e) => setFormTollFee(Number(e.target.value))}
                  placeholder="280000"
                  className="h-8.5 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Định Mức Dầu DO (Lít)</label>
                <Input
                  type="number"
                  value={formFuelEst}
                  onChange={(e) => setFormFuelEst(Number(e.target.value))}
                  placeholder="45"
                  className="h-8.5 font-mono"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="h-8.5 text-xs"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createDrayageDispatch.isPending}
                className="h-8.5 text-xs bg-primary text-primary-foreground font-semibold"
              >
                {createDrayageDispatch.isPending ? "Đang tạo lệnh..." : "Tạo Lệnh Điều Độ Container"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      {selectedDispatch && (
        <Dialog open={Boolean(selectedDispatch)} onOpenChange={() => setSelectedDispatch(null)}>
          <DialogContent className="max-w-xl text-foreground">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Truck className="h-5 w-5 text-primary" />
                Phiếu Điều Độ Container: {selectedDispatch.dispatchCode}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">MÃ LÔ HÀNG</span>
                  <span className="font-mono font-bold text-foreground text-sm">{selectedDispatch.shipmentCode}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">SỐ CONTAINER</span>
                  <span className="font-mono font-bold text-primary text-sm">
                    {selectedDispatch.containerNo} ({selectedDispatch.containerType})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">ĐẦU KÉO & RƠ-MOÓC</span>
                  <span className="font-mono font-semibold text-foreground">
                    {selectedDispatch.tractorPlate} / Moóc {selectedDispatch.trailerPlate}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">TÀI XẾ & BẰNG LÁI</span>
                  <span className="font-semibold text-foreground">
                    {selectedDispatch.driverName} (Bằng {selectedDispatch.driverLicenseGrade}) - {selectedDispatch.driverPhone}
                  </span>
                </div>
              </div>

              <div className="space-y-2 border border-border p-3 rounded-xl">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-foreground">Điểm nhận cont:</span>
                    <span className="text-muted-foreground">{selectedDispatch.pickupLocation}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-foreground">Điểm hạ hàng / Rút ruột:</span>
                    <span className="text-muted-foreground">{selectedDispatch.deliveryLocation}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-muted/20 p-2.5 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground text-[10px] block">Khung giờ</span>
                  <span className="font-medium text-foreground">{selectedDispatch.appointmentTime}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Cầu đường BOT</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedDispatch.tollFeeVnd.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Nhiên liệu DO</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedDispatch.fuelEstimatedLiters} Lít
                  </span>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDispatch(null)}
                  className="h-8.5 text-xs"
                >
                  Đóng
                </Button>
                {onOpenAiAnalysis && (
                  <Button
                    onClick={() => {
                      const code = selectedDispatch.shipmentCode;
                      setSelectedDispatch(null);
                      onOpenAiAnalysis(code);
                    }}
                    className="h-8.5 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    Mở AI Phân Tích Nhập Hàng
                  </Button>
                )}
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
