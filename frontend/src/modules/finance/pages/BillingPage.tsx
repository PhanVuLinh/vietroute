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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  SlidersHorizontal,
  TrendingDown,
  Download,
  Sparkles,
  BellRing,
  QrCode,
  ExternalLink,
} from "lucide-react";
import {
  useInvoices,
  useBillingSummary,
  useAgingReport,
  useSeedFinanceMutation,
  useScanAndSendDebtRemindersMutation,
} from "../hooks/useFinance";
import { CreateInvoiceDialog } from "../components/CreateInvoiceDialog";
import { InvoiceDetailDrawer } from "../components/InvoiceDetailDrawer";
import { DebtCollectionModal } from "../components/DebtCollectionModal";
import { AgingReportChart } from "../components/AgingReportChart";
import { formatDateTime } from "@/shared/utils/formatters";
import { exportToCsv } from "@/shared/utils/exportUtils";
import { toast } from "@/shared/components/feedback/Toast";

const getInvoiceStatusBadge = (status: string) => {
  switch (status) {
    case "PAID":
      return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Đã thanh toán</Badge>;
    case "OVERDUE":
      return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">Quá hạn</Badge>;
    case "CANCELLED":
      return <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30">Đã hủy</Badge>;
    case "DRAFT":
      return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">Bản nháp</Badge>;
    case "PENDING_PAYMENT":
    default:
      return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30">Chờ thanh toán</Badge>;
  }
};

export const BillingPage: React.FC = () => {
  usePageTitle("Hóa đơn & Công nợ B2B");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("invoices");

  // State cho Modal thu hồi công nợ tự động
  const [isDebtCollectionOpen, setIsDebtCollectionOpen] = useState(false);
  const [debtCollectionResult, setDebtCollectionResult] = useState<any>(null);

  const { data: summary, isLoading: isSummaryLoading } = useBillingSummary();
  const { data: agingReport, isLoading: isAgingLoading } = useAgingReport();
  const seedMutation = useSeedFinanceMutation();
  const scanDebtMutation = useScanAndSendDebtRemindersMutation();

  const {
    data: invoices = [],
    isLoading,
    refetch,
    isRefetching,
  } = useInvoices({
    search: search || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const handleOpenDetail = (id: string) => {
    setSelectedInvoiceId(id);
    setIsDetailOpen(true);
  };

  const handleScanDebtReminders = async () => {
    try {
      const res = await scanDebtMutation.mutateAsync();
      setDebtCollectionResult(res);
      setIsDebtCollectionOpen(true);
    } catch {
      // Toast xử lý trong hook
    }
  };

  const handleExportInvoices = () => {
    if (invoices.length === 0) {
      toast.warning("Không có dữ liệu", "Không có hóa đơn nào để xuất file");
      return;
    }
    exportToCsv(
      "Danh_sach_hoa_don_B2B",
      [
        { key: "invoiceCode", label: "Mã hóa đơn" },
        { key: "customerName", label: "Khách hàng" },
        { key: "customerTaxCode", label: "Mã số thuế" },
        { key: "issueDate", label: "Ngày phát hành", formatter: (v) => formatDateTime(v) },
        { key: "dueDate", label: "Hạn thanh toán", formatter: (v) => formatDateTime(v) },
        { key: "subtotal", label: "Tiền hàng (VNĐ)", formatter: (v) => (v || 0).toLocaleString("vi-VN") },
        { key: "vatAmount", label: "Thuế VAT 8% (VNĐ)", formatter: (v) => (v || 0).toLocaleString("vi-VN") },
        { key: "discountAmount", label: "Chiết khấu (VNĐ)", formatter: (v) => (v || 0).toLocaleString("vi-VN") },
        { key: "totalAmount", label: "Tổng tiền thanh toán (VNĐ)", formatter: (v) => (v || 0).toLocaleString("vi-VN") },
        { key: "paidAmount", label: "Đã thanh toán (VNĐ)", formatter: (v) => (v || 0).toLocaleString("vi-VN") },
        { key: "remainingAmount", label: "Còn nợ (VNĐ)", formatter: (v) => (v || 0).toLocaleString("vi-VN") },
        { key: "status", label: "Trạng thái" },
      ],
      invoices
    );
    toast.success("Xuất file thành công", `Đã tải về danh sách ${invoices.length} hóa đơn B2B`);
  };

  return (
    <PageContainer
      title="Hóa đơn & Quản lý Công nợ B2B"
      subtitle="Theo dõi hóa đơn doanh nghiệp, đối soát công nợ phải thu và kiểm soát tuổi nợ theo thời gian thực."
      action={
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleScanDebtReminders}
            disabled={scanDebtMutation.isPending}
            className="text-xs gap-1.5 cursor-pointer border-rose-500/50 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 font-semibold shadow-xs"
            title="Tự động phát hiện công nợ quá hạn và kích hoạt nhắc nợ đa kênh kèm link VietQR"
          >
            <BellRing className={`h-3.5 w-3.5 ${scanDebtMutation.isPending ? "animate-bounce" : ""}`} />
            <span>{scanDebtMutation.isPending ? "Đang quét công nợ..." : "⚡ Quét & Thu hồi công nợ"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="text-xs gap-1.5 cursor-pointer border-blue-500/40 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400 font-semibold"
            title="Nạp ngay 4 hóa đơn B2B mẫu vào PostgreSQL thật để trải nghiệm"
          >
            <Sparkles className={`h-3.5 w-3.5 ${seedMutation.isPending ? "animate-spin" : ""}`} />
            <span>{seedMutation.isPending ? "Đang nạp mẫu..." : "Nạp dữ liệu mẫu B2B"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportInvoices}
            className="text-xs gap-1.5 cursor-pointer border-border hover:bg-accent"
            title="Xuất bảng tính Excel danh sách hóa đơn"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Xuất Excel</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Tạo hóa đơn mới
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 bg-gradient-to-br from-card to-card/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tổng doanh thu xuất HĐ
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold font-mono tracking-tight">
                {isSummaryLoading
                  ? "---"
                  : `${(summary?.totalRevenue || 0).toLocaleString("vi-VN")} đ`}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                <Receipt className="h-3 w-3" />
                Tổng cộng {summary?.totalInvoices || 0} hóa đơn phát hành
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-gradient-to-br from-card to-card/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Đã thu thực tế
              </CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                {isSummaryLoading
                  ? "---"
                  : `${(summary?.totalCollected || 0).toLocaleString("vi-VN")} đ`}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                Tiền mặt & chuyển khoản đã vào tài khoản
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-gradient-to-br from-card to-card/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Công nợ còn tồn đọng
              </CardTitle>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold font-mono tracking-tight text-amber-600 dark:text-amber-400">
                {isSummaryLoading
                  ? "---"
                  : `${(summary?.totalPending || 0).toLocaleString("vi-VN")} đ`}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                <span>Chờ thanh toán từ khách hàng B2B</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-gradient-to-br from-card to-card/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Hóa đơn quá hạn
              </CardTitle>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold font-mono tracking-tight text-rose-600 dark:text-rose-400">
                {isSummaryLoading ? "---" : summary?.overdueCount || 0}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                <span>Cần gửi thông báo nhắc hạn thanh toán</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tab switcher: Danh sách Hóa đơn vs Báo cáo Tuổi nợ */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="invoices" className="text-xs font-semibold gap-1.5">
              <Receipt className="h-4 w-4" />
              Danh sách Hóa đơn ({invoices.length})
            </TabsTrigger>
            <TabsTrigger value="aging" className="text-xs font-semibold gap-1.5">
              <TrendingDown className="h-4 w-4" />
              Báo cáo Tuổi nợ (Aging Report)
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: DANH SÁCH HÓA ĐƠN */}
          <TabsContent value="invoices" className="space-y-4">
            {/* Thanh tìm kiếm và bộ lọc */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo mã HĐ, tên công ty hoặc MST..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Trạng thái:</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[170px] h-9 text-xs">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                    <SelectItem value="PENDING_PAYMENT">Chờ thanh toán</SelectItem>
                    <SelectItem value="PAID">Đã thanh toán</SelectItem>
                    <SelectItem value="OVERDUE">Quá hạn</SelectItem>
                    <SelectItem value="DRAFT">Bản nháp</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bảng danh sách Hóa đơn */}
            <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                      <th className="py-3 px-4">Mã hóa đơn</th>
                      <th className="py-3 px-4">Khách hàng Doanh nghiệp</th>
                      <th className="py-3 px-4">Ngày HĐ & Hạn TT</th>
                      <th className="py-3 px-4 text-right">Tổng thanh toán</th>
                      <th className="py-3 px-4 text-right">Đã thu</th>
                      <th className="py-3 px-4 text-right">Còn nợ</th>
                      <th className="py-3 px-4 text-center">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td colSpan={8} className="py-4 px-4">
                            <div className="h-5 bg-muted rounded w-full" />
                          </td>
                        </tr>
                      ))
                    ) : invoices.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center space-y-3 max-w-md mx-auto">
                            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-sm">
                              <Receipt className="h-7 w-7" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-foreground">Chưa có hóa đơn nào trong cơ sở dữ liệu</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Bạn có thể tạo hóa đơn B2B mới hoặc nạp nhanh bộ 4 hóa đơn mẫu thực tế (Vinamilk, Samsung, VinFast, Shopee) kèm mã VietQR và tuổi nợ.
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => seedMutation.mutate()}
                              disabled={seedMutation.isPending}
                              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md cursor-pointer mt-1"
                            >
                              <Sparkles className={`h-4 w-4 ${seedMutation.isPending ? "animate-spin" : ""}`} />
                              <span>{seedMutation.isPending ? "Đang nạp dữ liệu mẫu..." : "Nạp ngay 4 hóa đơn mẫu B2B & COD"}</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr
                          key={inv.id}
                          className="hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => handleOpenDetail(inv.id)}
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-primary hover:underline">
                              {inv.invoiceCode}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-foreground">{inv.customerName}</div>
                            {inv.customerTaxCode && (
                              <div className="text-[11px] text-muted-foreground font-mono">
                                MST: {inv.customerTaxCode}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-foreground">{formatDateTime(inv.issueDate)}</div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" /> Hạn: {formatDateTime(inv.dueDate)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                            {inv.totalAmount.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600">
                            {inv.paidAmount.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                            {inv.remainingAmount.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getInvoiceStatusBadge(inv.status)}
                          </td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`/portal/pay/${inv.invoiceCode}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Mở cổng thanh toán VietQR cho khách hàng"
                                className="inline-flex items-center justify-center h-7 px-2 text-[11px] rounded-md border border-primary/40 text-primary hover:bg-primary/10 transition-colors font-medium shadow-2xs"
                              >
                                <QrCode className="h-3 w-3 mr-1" />
                                <span>VietQR</span>
                              </a>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1 cursor-pointer"
                                onClick={() => handleOpenDetail(inv.id)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Chi tiết
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))

                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: BÁO CÁO TUỔI NỢ (AGING REPORT) */}
          <TabsContent value="aging" className="space-y-6">
            <AgingReportChart report={agingReport} isLoading={isAgingLoading} />

            {/* Bảng tóm tắt các hóa đơn đang có nợ cần theo dõi */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Danh sách các khoản nợ cần đốc thúc thu hồi</span>
              </h3>

              <div className="border rounded-xl bg-card overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                      <th className="py-2.5 px-4">Mã hóa đơn</th>
                      <th className="py-2.5 px-4">Khách hàng</th>
                      <th className="py-2.5 px-4">Hạn thanh toán</th>
                      <th className="py-2.5 px-4 text-right">Tổng nợ</th>
                      <th className="py-2.5 px-4 text-center">Trạng thái</th>
                      <th className="py-2.5 px-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoices
                      .filter((i) => i.remainingAmount > 0 && i.status !== "CANCELLED")
                      .map((inv) => (
                        <tr key={inv.id} className="hover:bg-muted/30">
                          <td className="py-2.5 px-4 font-mono font-bold text-primary">{inv.invoiceCode}</td>
                          <td className="py-2.5 px-4 font-medium">{inv.customerName}</td>
                          <td className="py-2.5 px-4 text-muted-foreground">{formatDateTime(inv.dueDate)}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-600">
                            {inv.remainingAmount.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="py-2.5 px-4 text-center">{getInvoiceStatusBadge(inv.status)}</td>
                          <td className="py-2.5 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleOpenDetail(inv.id)}
                            >
                              Ghi nhận thu
                            </Button>
                          </td>
                        </tr>
                      ))}
                    {invoices.filter((i) => i.remainingAmount > 0 && i.status !== "CANCELLED").length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-muted-foreground">
                          Tuyệt vời! Không có hóa đơn nào còn nợ tồn đọng.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog tạo hóa đơn */}
      <CreateInvoiceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {/* Drawer chi tiết hóa đơn & ghi nhận thanh toán */}
      <InvoiceDetailDrawer
        invoiceId={selectedInvoiceId}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      {/* Modal báo cáo thu hồi công nợ tự động */}
      <DebtCollectionModal
        open={isDebtCollectionOpen}
        onOpenChange={setIsDebtCollectionOpen}
        data={debtCollectionResult}
      />
    </PageContainer>
  );
};

