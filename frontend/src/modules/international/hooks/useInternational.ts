import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { internationalService } from "@/mocks/adapters/serviceFactory";
import type {
  InternationalShipment,
  CustomsDeclaration,
  ContainerTrackingItem,
  InternationalPort,
  ExchangeRateItem,
  LocalChargeItem,
  InternationalFilterParams,
  CreateShipmentInput,
  CreateCustomsInput,
} from "../types/international";
import { toast } from "@/shared/components/feedback/Toast";

export function useInternationalShipments(filters?: InternationalFilterParams) {
  return useQuery<InternationalShipment[]>({
    queryKey: ["international-shipments", filters],
    queryFn: async () => {
      const res = await internationalService.getShipments(filters);
      return Array.isArray(res) ? res : ((res as any)?.data || []);
    },
    staleTime: 30 * 1000,
  });
}

export function useCustomsDeclarations(filters?: { channel?: string; status?: string; search?: string }) {
  return useQuery<CustomsDeclaration[]>({
    queryKey: ["customs-declarations", filters],
    queryFn: async () => {
      const res = await internationalService.getCustomsDeclarations(filters);
      return Array.isArray(res) ? res : ((res as any)?.data || []);
    },
    staleTime: 30 * 1000,
  });
}

export function useInternationalContainers() {
  return useQuery<ContainerTrackingItem[]>({
    queryKey: ["international-containers"],
    queryFn: async () => {
      const res = await internationalService.getContainers();
      return Array.isArray(res) ? res : ((res as any)?.data || []);
    },
    staleTime: 60 * 1000,
  });
}

export function useInternationalPorts() {
  return useQuery<InternationalPort[]>({
    queryKey: ["international-ports"],
    queryFn: async () => {
      const res = await internationalService.getPorts();
      return Array.isArray(res) ? res : ((res as any)?.data || []);
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useExchangeRates() {
  return useQuery<ExchangeRateItem[]>({
    queryKey: ["exchange-rates"],
    queryFn: async () => {
      const res = await internationalService.getExchangeRates();
      return Array.isArray(res) ? res : ((res as any)?.data || []);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLocalCharges() {
  return useQuery<LocalChargeItem[]>({
    queryKey: ["local-charges"],
    queryFn: async () => {
      const res = await internationalService.getLocalCharges();
      return Array.isArray(res) ? res : ((res as any)?.data || []);
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useInternationalMutations() {
  const queryClient = useQueryClient();

  const createShipment = useMutation({
    mutationFn: async (data: CreateShipmentInput) => {
      return await internationalService.createShipment(data);
    },
    onSuccess: (newShp: any) => {
      queryClient.invalidateQueries({ queryKey: ["international-shipments"] });
      const code = newShp?.shipmentCode || newShp?.data?.shipmentCode || "Lô hàng";
      toast.success("Tạo lô hàng quốc tế thành công", `Đã thêm lô hàng ${code} vào hệ thống`);
    },
    onError: (err: any) => {
      toast.error("Tạo lô hàng thất bại", err?.response?.data?.message || err?.message);
    },
  });

  const updateShipment = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateShipmentInput> }) => {
      return await internationalService.updateShipment(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["international-shipments"] });
      toast.success("Cập nhật lô hàng thành công");
    },
    onError: (err: any) => {
      toast.error("Cập nhật thất bại", err?.response?.data?.message || err?.message);
    },
  });

  const deleteShipment = useMutation({
    mutationFn: async (id: string) => {
      return await internationalService.deleteShipment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["international-shipments"] });
      toast.success("Đã xóa lô hàng quốc tế");
    },
    onError: (err: any) => {
      toast.error("Xóa thất bại", err?.response?.data?.message || err?.message);
    },
  });

  const createCustoms = useMutation({
    mutationFn: async (data: CreateCustomsInput) => {
      return await internationalService.createCustomsDeclaration(data);
    },
    onSuccess: (newDecl: any) => {
      queryClient.invalidateQueries({ queryKey: ["customs-declarations"] });
      queryClient.invalidateQueries({ queryKey: ["international-shipments"] });
      const declNo = newDecl?.declarationNo || newDecl?.data?.declarationNo || "mới";
      toast.success("Khai báo hải quan thành công", `Đã truyền tờ khai số ${declNo} vào hệ thống VNACCS`);
    },
    onError: (err: any) => {
      toast.error("Khai báo thất bại", err?.response?.data?.message || err?.message);
    },
  });

  const updateCustomsStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await internationalService.updateCustomsStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customs-declarations"] });
      queryClient.invalidateQueries({ queryKey: ["international-shipments"] });
      toast.success("Cập nhật thông quan thành công");
    },
    onError: (err: any) => {
      toast.error("Cập nhật thất bại", err?.response?.data?.message || err?.message);
    },
  });

  return {
    createShipment,
    updateShipment,
    deleteShipment,
    createCustoms,
    updateCustomsStatus,
  };
}
