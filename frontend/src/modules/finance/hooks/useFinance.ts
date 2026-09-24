import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService } from "@/mocks/adapters/serviceFactory";
import { toast } from "@/shared/components/feedback";
import type {
  CodReconciliationItem,
  CodSummary,
  InvoiceItem,
  BillingSummary,
  AgingReport,
} from "../types/finance";

// ==========================================
// 1. HOOKS ĐỐI SOÁT COD
// ==========================================

export function useCodReconciliations(params?: {
  driverId?: string;
  status?: string;
  search?: string;
}) {
  return useQuery<CodReconciliationItem[]>({
    queryKey: ["finance", "cod", params],
    queryFn: async () => {
      const res = await financeService.getCodReconciliations(params);
      return res.data || [];
    },
    staleTime: 15 * 1000,
  });
}

export function useCodSummary() {
  return useQuery<CodSummary>({
    queryKey: ["finance", "cod", "summary"],
    queryFn: async () => {
      const res = await financeService.getCodSummary();
      return res.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useCodDetail(id?: string | null) {
  return useQuery<CodReconciliationItem>({
    queryKey: ["finance", "cod", id],
    queryFn: async () => {
      if (!id) throw new Error("Missing ID");
      const res = await financeService.getCodReconciliationById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useSubmitCodMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { submitted_amount: number; cashier_name?: string; notes?: string };
    }) => {
      const res = await financeService.submitCod(id, data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["finance", "cod"] });
      if (data.discrepancy !== 0) {
        toast.warning(
          "Ghi nhận chênh lệch COD",
          `Phiên đối soát ${data.reconciliationCode} lệch ${Math.abs(data.discrepancy).toLocaleString("vi-VN")}đ`
        );
      } else {
        toast.success(
          "Đối soát thành công",
          `Phiên ${data.reconciliationCode} đã được tất toán khớp hoàn toàn.`
        );
      }
    },
    onError: (err: any) => {
      toast.error("Lỗi đối soát COD", err?.message || "Không thể cập nhật nộp tiền COD");
    },
  });
}

// ==========================================
// 2. HOOKS HÓA ĐƠN & CÔNG NỢ B2B
// ==========================================

export function useInvoices(params?: {
  customerId?: string;
  status?: string;
  search?: string;
}) {
  return useQuery<InvoiceItem[]>({
    queryKey: ["finance", "invoices", params],
    queryFn: async () => {
      const res = await financeService.getInvoices(params);
      return res.data || [];
    },
    staleTime: 15 * 1000,
  });
}

export function useBillingSummary() {
  return useQuery<BillingSummary>({
    queryKey: ["finance", "billing", "summary"],
    queryFn: async () => {
      const res = await financeService.getBillingSummary();
      return res.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useAgingReport() {
  return useQuery<AgingReport>({
    queryKey: ["finance", "aging-report"],
    queryFn: async () => {
      const res = await financeService.getAgingReport();
      return res.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useInvoiceDetail(id?: string | null) {
  return useQuery<InvoiceItem>({
    queryKey: ["finance", "invoices", id],
    queryFn: async () => {
      if (!id) throw new Error("Missing ID");
      const res = await financeService.getInvoiceById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateInvoiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await financeService.createInvoice(data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["finance", "invoices"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "billing"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "aging-report"] });
      toast.success("Tạo hóa đơn thành công", `Mã hóa đơn: ${data.invoiceCode || ""}`);
    },
    onError: (err: any) => {
      toast.error("Lỗi tạo hóa đơn", err?.message || "Không thể tạo hóa đơn mới");
    },
  });
}

export function useUpdateInvoiceStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      paid_amount,
    }: {
      id: string;
      status: string;
      paid_amount?: number;
    }) => {
      const res = await financeService.updateInvoiceStatus(id, status, paid_amount);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "invoices"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "billing"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "aging-report"] });
      toast.success("Cập nhật hóa đơn thành công");
    },
    onError: (err: any) => {
      toast.error("Lỗi cập nhật", err?.message || "Không thể cập nhật trạng thái hóa đơn");
    },
  });
}

export function useSeedFinanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await financeService.seedDemoData();
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      toast.success("Nạp dữ liệu mẫu thành công", data?.message || "Đã tạo 4 hóa đơn B2B và 2 phiên COD mẫu vào PostgreSQL!");
    },
    onError: (err: any) => {
      toast.error("Lỗi nạp dữ liệu mẫu", err?.message || "Không thể nạp dữ liệu mẫu");
    },
  });
}

// ==========================================
// 3. HOOKS THU HỒI CÔNG NỢ & CỔNG THANH TOÁN B2B
// ==========================================

export function useScanAndSendDebtRemindersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await financeService.scanAndSendDebtReminders();
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["finance", "invoices"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "billing"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "aging-report"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(
        "Đã hoàn tất quét công nợ tự động",
        `Đã gửi cảnh báo nhắc nợ tới ${data.remindedCount} hóa đơn quá hạn / sắp đến hạn!`
      );
    },
    onError: (err: any) => {
      toast.error("Lỗi quét công nợ", err?.message || "Không thể hoàn tất tiến trình nhắc nợ");
    },
  });
}

export function useSendSingleInvoiceReminderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await financeService.sendSingleInvoiceReminder(id);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["finance", "invoices"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Gửi nhắc nợ thành công", data?.message || "Đã gửi thông báo nhắc thanh toán");
    },
    onError: (err: any) => {
      toast.error("Lỗi gửi nhắc nợ", err?.message || "Không thể gửi thông báo nhắc nợ");
    },
  });
}

export function usePublicInvoice(invoiceCode?: string) {
  const cleanCode = (invoiceCode || "").trim().toUpperCase();

  return useQuery({
    queryKey: ["public", "invoice", cleanCode],
    queryFn: async () => {
      if (!cleanCode) throw new Error("Chưa có mã hóa đơn");
      const res = await financeService.getPublicInvoice(cleanCode);
      return res.data;
    },
    enabled: !!cleanCode,
    staleTime: 5000,
  });
}

export function useSimulatePublicInvoicePaymentMutation(invoiceCode: string) {
  const queryClient = useQueryClient();
  const cleanCode = (invoiceCode || "").trim().toUpperCase();

  return useMutation({
    mutationFn: async (data?: { paymentMethod?: string; transactionRef?: string }) => {
      const res = await financeService.simulatePublicInvoicePayment(cleanCode, data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["public", "invoice", cleanCode] });
      queryClient.invalidateQueries({ queryKey: ["finance", "invoices"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "billing"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "aging-report"] });
      toast.success(
        "Thanh toán thành công!",
        data?.message || "Hóa đơn đã được gạch nợ thành công."
      );
    },
    onError: (err: any) => {
      toast.error("Lỗi thanh toán", err?.message || "Không thể thực hiện thanh toán");
    },
  });
}

