import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http/client";

export interface TrackingShipment {
  orderCode: string;
  id?: string;
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  warehouseName: string;
  warehouseAddress: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "ASSIGNED"
    | "PICKING_UP"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "FAILED"
    | "CANCELLED";
  statusText: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  codAmount: number;
  weightKg: number;
  itemsSummary: string;
  createdAt: string;
  estimatedDelivery: string;
  driver?: {
    name: string;
    phone: string;
    vehiclePlate: string;
    vehicleModel: string;
    rating: number;
    currentLocation: [number, number]; // [lng, lat]
  };
  steps: {
    title: string;
    time: string;
    location: string;
    description: string;
    completed: boolean;
    current?: boolean;
  }[];
  originCoords: [number, number];
  destinationCoords: [number, number];
  pod?: {
    signedBy: string;
    signedAt: string;
    signatureUrl: string;
    photoUrl?: string;
    codCollected?: boolean;
    codPaymentMethod?: string;
    notes?: string;
  };
}

export function usePublicTracking(orderCode: string) {
  const queryClient = useQueryClient();
  const cleanCode = (orderCode || "").trim().toUpperCase();

  const query = useQuery<TrackingShipment>({
    queryKey: ["public-tracking", cleanCode],
    queryFn: async () => {
      if (!cleanCode) throw new Error("Chưa nhập mã vận đơn");
      const res = await httpClient.get<TrackingShipment>(
        `/public/tracking/${encodeURIComponent(cleanCode)}`
      );
      return res.data;
    },
    enabled: !!cleanCode,
    retry: 1,
    staleTime: 5000,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Nếu đơn đang vận chuyển hoặc đang điều phối, tự động thăm dò cập nhật mỗi 10 giây
      if (
        data &&
        ["IN_TRANSIT", "ASSIGNED", "PICKING_UP"].includes(data.status)
      ) {
        return 10000;
      }
      return false;
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async (payload: {
      rating: number;
      feedbackText?: string;
      reviewerName?: string;
    }) => {
      const res = await httpClient.post(
        `/public/tracking/${encodeURIComponent(cleanCode)}/feedback`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["public-tracking", cleanCode],
      });
    },
  });

  return {
    shipment: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    submitFeedback: feedbackMutation.mutateAsync,
    isSubmittingFeedback: feedbackMutation.isPending,
  };
}
