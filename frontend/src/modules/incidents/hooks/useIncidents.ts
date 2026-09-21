import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incidentService } from "@/mocks/adapters/serviceFactory";
import type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from "../types/incident";
import { toast } from "@/shared/components/feedback/Toast";

const PAGE_SIZE = 10;

export interface IncidentFilterParams {
  searchQuery: string;
  status: "ALL" | IncidentStatus;
  severity: "ALL" | IncidentSeverity;
  type: "ALL" | IncidentType;
}

export function useIncidents() {
  const queryClient = useQueryClient();

  const incidentsQuery = useQuery<Incident[]>({
    queryKey: ["incidents", "list"],
    queryFn: async () => {
      const res = await incidentService.getIncidents();
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  const [filters, setFilters] = useState<IncidentFilterParams>({
    searchQuery: "",
    status: "ALL",
    severity: "ALL",
    type: "ALL",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const updateFilters = useCallback((patch: Partial<IncidentFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ searchQuery: "", status: "ALL", severity: "ALL", type: "ALL" });
    setCurrentPage(1);
  }, []);

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: IncidentStatus }) => {
      return await incidentService.updateIncidentStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast.success("Cập nhật trạng thái", "Đã cập nhật trạng thái sự cố thành công");
    },
    onError: () => {
      toast.error("Lỗi", "Không thể cập nhật trạng thái");
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ id, user, message }: { id: string; user: string; message: string }) => {
      return await incidentService.addComment(id, user, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast.success("Bình luận", "Đã gửi phản hồi thành công");
    },
    onError: () => {
      toast.error("Lỗi", "Không thể gửi bình luận");
    },
  });

  // Filter list
  const filteredIncidents = useMemo(() => {
    let list = incidentsQuery.data || [];

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.incidentCode.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.orderCode && i.orderCode.toLowerCase().includes(q)) ||
          (i.driverName && i.driverName.toLowerCase().includes(q)) ||
          (i.vehiclePlate && i.vehiclePlate.toLowerCase().includes(q))
      );
    }

    if (filters.status !== "ALL") {
      list = list.filter((i) => i.status === filters.status);
    }

    if (filters.severity !== "ALL") {
      list = list.filter((i) => i.severity === filters.severity);
    }

    if (filters.type !== "ALL") {
      list = list.filter((i) => i.type === filters.type);
    }

    return list;
  }, [incidentsQuery.data, filters]);

  // KPI Stats
  const stats = useMemo(() => {
    const all = incidentsQuery.data || [];
    let critical = 0;
    let inProgress = 0;
    let pendingReview = 0;
    let resolved = 0;

    for (const i of all) {
      if (i.severity === "CRITICAL") critical++;
      if (i.status === "IN_PROGRESS") inProgress++;
      if (i.status === "PENDING_REVIEW") pendingReview++;
      if (i.status === "RESOLVED" || i.status === "CLOSED") resolved++;
    }

    return {
      total: all.length,
      critical,
      inProgress,
      pendingReview,
      resolved,
      resolutionRate: all.length > 0 ? Math.round((resolved / all.length) * 100) : 100,
    };
  }, [incidentsQuery.data]);

  // Grouped by status for Kanban Board
  const kanbanColumns = useMemo(() => {
    const all = incidentsQuery.data || [];
    return {
      NEW: all.filter((i) => i.status === "NEW"),
      IN_PROGRESS: all.filter((i) => i.status === "IN_PROGRESS"),
      PENDING_REVIEW: all.filter((i) => i.status === "PENDING_REVIEW"),
      RESOLVED: all.filter((i) => i.status === "RESOLVED" || i.status === "CLOSED"),
    };
  }, [incidentsQuery.data]);

  // Pagination
  const totalCount = filteredIncidents.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedIncidents = useMemo(
    () => filteredIncidents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredIncidents, currentPage]
  );

  return {
    incidents: paginatedIncidents,
    allIncidents: incidentsQuery.data || [],
    kanbanColumns,
    stats,
    filters,
    updateFilters,
    resetFilters,
    currentPage,
    setPage: setCurrentPage,
    totalCount,
    totalPages,
    isLoading: incidentsQuery.isLoading,
    isError: incidentsQuery.isError,
    refetch: incidentsQuery.refetch,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    addComment: addCommentMutation.mutate,
    isAddingComment: addCommentMutation.isPending,
  };
}
