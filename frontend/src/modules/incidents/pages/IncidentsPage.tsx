import React, { useState } from "react";
import {
  AlertTriangle,
  Plus,
  Search,
  Table as TableIcon,
  Kanban,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useIncidents } from "../hooks/useIncidents";
import { IncidentStatsCards } from "../components/IncidentStatsCards";
import { IncidentTable } from "../components/IncidentTable";
import { IncidentWorkflowBoard } from "../components/IncidentWorkflowBoard";
import { IncidentDetailDrawer } from "../components/IncidentDetailDrawer";
import { CreateIncidentDialog } from "../components/CreateIncidentDialog";
import {
  type Incident,
  INCIDENT_TYPE_LABELS,
  SEVERITY_META,
} from "../types/incident";

export const IncidentsPage: React.FC = () => {
  const {
    incidents,
    kanbanColumns,
    stats,
    filters,
    updateFilters,
    currentPage,
    setPage,
    totalPages,
    totalCount,
    isLoading,
    refetch,
    updateStatus,
    addComment,
  } = useIncidents();

  const [viewMode, setViewMode] = useState<"table" | "board">("table");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = (id: string, status: any) => {
    updateStatus({ id, status });
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleAddComment = (id: string, user: string, message: string) => {
    addComment({ id, user, message });
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident((prev) =>
        prev
          ? {
              ...prev,
              comments: [
                ...prev.comments,
                { id: `c-${Date.now()}`, incidentId: id, user, message, createdAt: new Date().toISOString() },
              ],
            }
          : null
      );
    }
  };

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-[1600px] mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Quản Lý Sự Cố & Khiếu Nại
              </h1>
              <p className="text-xs text-muted-foreground">
                Theo dõi, phân luồng điều tra và xử lý sự cố hàng hóa, phương tiện & khiếu nại khách hàng
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 text-xs gap-1.5 cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-9 text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Khai báo sự cố</span>
          </Button>
        </div>
      </div>

      {/* 2. Stats Cards */}
      <IncidentStatsCards stats={stats} isLoading={isLoading} />

      {/* 3. Filter & View Mode Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/60 backdrop-blur-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
          <Input
            placeholder="Tìm theo mã sự cố, tiêu đề, tài xế, xe, mã đơn..."
            value={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity */}
          <Select
            value={filters.severity}
            onValueChange={(val) => updateFilters({ severity: val as any })}
          >
            <SelectTrigger className="h-9 text-xs w-[130px]">
              <SelectValue placeholder="Mức độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">Tất cả mức độ</SelectItem>
              {Object.entries(SEVERITY_META).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-xs">
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type */}
          <Select
            value={filters.type}
            onValueChange={(val) => updateFilters({ type: val as any })}
          >
            <SelectTrigger className="h-9 text-xs w-[150px]">
              <SelectValue placeholder="Phân loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">Tất cả phân loại</SelectItem>
              {Object.entries(INCIDENT_TYPE_LABELS).map(([k, label]) => (
                <SelectItem key={k} value={k} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg border border-border bg-muted/40">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-7 text-xs px-2.5 gap-1.5 cursor-pointer"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Bảng</span>
            </Button>
            <Button
              variant={viewMode === "board" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("board")}
              className="h-7 text-xs px-2.5 gap-1.5 cursor-pointer"
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Quy trình</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Content */}
      {viewMode === "table" ? (
        <div className="space-y-3">
          <IncidentTable
            incidents={incidents}
            isLoading={isLoading}
            onSelectIncident={handleSelectIncident}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
              <span>
                Hiển thị trang {currentPage} / {totalPages} ({totalCount} sự cố)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <IncidentWorkflowBoard
          columns={kanbanColumns}
          onSelectIncident={handleSelectIncident}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* 5. Drawers & Dialogs */}
      <IncidentDetailDrawer
        incident={selectedIncident}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedIncident(null);
        }}
        onUpdateStatus={handleUpdateStatus}
        onAddComment={handleAddComment}
      />

      <CreateIncidentDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
