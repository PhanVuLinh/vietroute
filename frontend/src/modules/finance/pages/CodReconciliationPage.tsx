import React, { useState } from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Eye,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Wallet,
  Download,
  Sparkles,
} from "lucide-react";
import { useCodReconciliations, useCodSummary, useSeedFinanceMutation } from "../hooks/useFinance";
import { CodSubmissionDialog } from "../components/CodSubmissionDialog";
import { CodDetailDrawer } from "../components/CodDetailDrawer";
import type { CodReconciliationItem } from "../types/finance";
import { formatDateTime } from "@/shared/utils/formatters";
import { exportToCsv } from "@/shared/utils/exportUtils";
import { toast } from "@/shared/components/feedback/Toast";

export const CodReconciliationPage: React.FC = () => {
  usePageTitle("Đối soát COD");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [recToSubmit, setRecToSubmit] = useState<CodReconciliationItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const { data: summary, isLoading: isSummaryLoading } = useCodSummary();
  const seedMutation = useSeedFinanceMutation();
  const {
    data: reconciliations = [],
    isLoading,
    refetch,
    isRefetching,
  } = useCodReconciliations({
    search: search || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const handleOpenDetail = (id: string) => {
    setSelectedRecId(id);
    setIsDetailOpen(true);
  };

  const handleOpenSubmit = (item: CodReconciliationItem) => {
    setRecToSubmit(item);
    setIsSubmitOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SETTLED":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Đã tất toán</Badge>;
      case "DISCREPANCY":
        return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">Có chênh lệch</Badge>;
      case "PARTIAL":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">Nộp một phần</Badge>;
      case "PENDING":
      default:
        return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30">Chờ đối soát</Badge>;
    }
  };

  const handleExportCod = () => {
    if (reconciliations.length === 0) {
      toast.warning("Không có dữ liệu", "Không có biên bản đối soát nào để xuất file");
      return;
    }
    exportToCsv(
      "Doi_soat_tien_thu_ho_COD",
      [
        { key: "reconciliationCode", label: "Mã đối soát" },
        { key: "driverName", label: "Tài xế" },
        { key: "driverPhone", label: "Số điện thoại" },
        { key: "driverCode", label: "Mã tài xế" },
        { key: "shiftDate", label: "Ngày ca", formatter: (v) => formatDateTime(v) },
        { key: "totalCollected", label: "Tổng COD thu hộ (VNĐ)", formatter: (v) => (v || 0).toLocaleString("vi-VN") },
        { key: "submittedAmount", label: "Đã nộp quỹ (VNĐ)", formatter: (v) => (v || 0).toLocaleString("vi-VN") },
        { key: "discrepancy", label: "Chênh lệch (VNĐ)", formatter: (v) => (v || 0).toLocaleString("vi-VN") },
        { key: "status", label: "Trạng thái" },
        { key: "cashierName", label: "Thủ quỹ tiếp nhận" },
      ],
      reconciliations
    );
    toast.success("Xuất file thành công", `Đã tải về danh sách ${reconciliations.length} phiên đối soát COD`);
  };

  return (
    <PageContainer className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-600" />
            <span>Đối soát Tiền thu hộ (COD)</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý dòng tiền mặt COD, xác nhận bàn giao ca và tự động phát hiện chênh lệch tài xế.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="h-9 gap-1.5 text-xs font-semibold cursor-pointer border-blue-500/40 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400"
            title="Nạp phiên đối soát COD mẫu vào cơ sở dữ liệu thật"
          >
            <Sparkles className={`h-3.5 w-3.5 ${seedMutation.isPending ? "animate-spin" : ""}`} />
            <span>{seedMutation.isPending ? "Đang nạp..." : "Dữ liệu mẫu COD"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCod}
            className="h-9 gap-1.5 text-xs font-semibold cursor-pointer border-border hover:bg-accent"
            title="Xuất bảng tính Excel danh sách đối soát COD"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Xuất Excel</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="shadow-2xs">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Tổng COD dự kiến</span>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {isSummaryLoading ? "..." : `${(summary?.totalCodExpected || 0).toLocaleString("vi-VN")} đ`}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {summary?.totalSessions || 0} phiên giao dịch
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Tài xế đã thu</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {isSummaryLoading ? "..." : `${(summary?.totalCollected || 0).toLocaleString("vi-VN")} đ`}
            </div>
            <p className="text-[11px] text-emerald-600/80 font-medium mt-0.5">
              Khách hàng đã thanh toán
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Đã nộp vào quỹ</span>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {isSummaryLoading ? "..." : `${(summary?.totalSubmitted || 0).toLocaleString("vi-VN")} đ`}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {summary?.settledCount || 0} ca đã tất toán
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Chênh lệch cảnh báo</span>
              <AlertCircle className="h-4 w-4 text-rose-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className={`text-xl sm:text-2xl font-bold font-mono ${
              (summary?.totalDiscrepancy || 0) > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
            }`}>
              {isSummaryLoading ? "..." : `${(summary?.totalDiscrepancy || 0).toLocaleString("vi-VN")} đ`}
            </div>
            <p className="text-[11px] text-rose-600/80 font-medium mt-0.5">
              {summary?.discrepancyCount || 0} ca cần giải trình
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar bộ lọc */}
      <Card className="shadow-2xs">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã phiên, tên tài xế..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[170px] h-9 text-xs font-medium">
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="PENDING">Chờ đối soát</SelectItem>
                  <SelectItem value="SETTLED">Đã tất toán</SelectItem>
                  <SelectItem value="DISCREPANCY">Có chênh lệch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table danh sách phiên đối soát */}
      <Card className="shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b">
              <tr>
                <th className="py-3 px-4">Mã phiên</th>
                <th className="py-3 px-4">Tài xế</th>
                <th className="py-3 px-4">Ngày ca</th>
                <th className="py-3 px-4 text-center">Số đơn</th>
                <th className="py-3 px-4 text-right">COD cần thu</th>
                <th className="py-3 px-4 text-right">Thực thu</th>
                <th className="py-3 px-4 text-right">Đã nộp quỹ</th>
                <th className="py-3 px-4 text-right">Chênh lệch</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={10} className="py-4 px-4">
                      <div className="h-5 bg-muted rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : reconciliations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-muted-foreground">
                    Không tìm thấy phiên đối soát nào phù hợp.
                  </td>
                </tr>
              ) : (
                reconciliations.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {item.reconciliationCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{item.driverName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{item.driverPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDateTime(item.date)}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      {item.totalOrders}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      {item.totalCodAmount.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.collectedAmount.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                      {item.submittedAmount.toLocaleString("vi-VN")} đ
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${
                      item.discrepancy === 0
                        ? "text-muted-foreground"
                        : "text-rose-600 dark:text-rose-400"
                    }`}>
                      {item.discrepancy.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Xem chi tiết"
                          onClick={() => handleOpenDetail(item.id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {item.status !== "SETTLED" && (
                          <Button
                            size="sm"
                            className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            onClick={() => handleOpenSubmit(item)}
                          >
                            Nộp tiền
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialogs & Drawers */}
      <CodSubmissionDialog
        reconciliation={recToSubmit}
        open={isSubmitOpen}
        onOpenChange={setIsSubmitOpen}
      />

      <CodDetailDrawer
        reconciliationId={selectedRecId}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onOpenSubmission={() => {
          const found = reconciliations.find((r) => r.id === selectedRecId);
          if (found) handleOpenSubmit(found);
        }}
      />
    </PageContainer>
  );
};
