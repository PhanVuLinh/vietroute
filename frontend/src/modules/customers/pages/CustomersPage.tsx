import React, { useState } from "react";
import {
  Users,
  Plus,
  RefreshCw,
  Search,
  X,
  Filter,
} from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
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
import { toast } from "@/shared/components/feedback/Toast";
import { useCustomers } from "../hooks/useCustomers";
import { CustomerStatsCards } from "../components/CustomerStatsCards";
import { CustomerTable } from "../components/CustomerTable";
import { CustomerDetailDrawer } from "../components/CustomerDetailDrawer";
import { CreateCustomerDialog } from "../components/CreateCustomerDialog";
import type { EnrichedCustomer } from "../types/customer";

export const CustomersPage: React.FC = () => {
  usePageTitle("Quản lý khách hàng");

  const {
    customers,
    stats,
    filters,
    updateFilters,
    resetFilters,
    currentPage,
    setPage,
    totalCount,
    totalPages,
    isLoading,
    refetch,
  } = useCustomers();

  const [selectedCustomer, setSelectedCustomer] = useState<EnrichedCustomer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleViewDetail = (customer: EnrichedCustomer) => {
    setSelectedCustomer(customer);
    setIsDrawerOpen(true);
  };

  const handleRefresh = async () => {
    await refetch();
    toast.success("Đồng bộ thành công", "Đã cập nhật danh sách khách hàng");
  };

  const activeFilterCount =
    (filters.type !== "ALL" ? 1 : 0) +
    (filters.tier !== "ALL" ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Quản lý Khách hàng
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Hồ sơ khách hàng B2B/B2C, doanh thu và lịch sử giao dịch
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-9 text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-9 text-xs gap-1.5 font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Thêm khách hàng
          </Button>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <CustomerStatsCards
          total={stats.total}
          enterprise={stats.enterprise}
          individual={stats.individual}
          vip={stats.vip}
          totalRevenue={stats.totalRevenue}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-card border border-border/60 rounded-xl px-4 py-3">
        <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
          <Input
            placeholder="Tìm tên, SĐT, email..."
            value={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            className="pl-9 h-9 text-xs bg-background/50 border-border/50"
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateFilters({ searchQuery: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select
          value={filters.type}
          onValueChange={(val) => updateFilters({ type: val as typeof filters.type })}
        >
          <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs border-border/50">
            <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Phân loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-xs">Tất cả</SelectItem>
            <SelectItem value="ENTERPRISE" className="text-xs">Doanh nghiệp</SelectItem>
            <SelectItem value="INDIVIDUAL" className="text-xs">Cá nhân</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.tier}
          onValueChange={(val) => updateFilters({ tier: val as typeof filters.tier })}
        >
          <SelectTrigger className="w-full sm:w-[130px] h-9 text-xs border-border/50">
            <SelectValue placeholder="Hạng KH" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-xs">Tất cả</SelectItem>
            <SelectItem value="VIP" className="text-xs">VIP</SelectItem>
            <SelectItem value="GOLD" className="text-xs">Gold</SelectItem>
            <SelectItem value="SILVER" className="text-xs">Silver</SelectItem>
            <SelectItem value="REGULAR" className="text-xs">Regular</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
            {totalCount} khách hàng
          </span>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3 w-3" />
              Xóa lọc
              <Badge variant="secondary" className="text-[9px] h-4 px-1 font-bold">
                {activeFilterCount}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4 animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 bg-muted/60 rounded-xl" />
          ))}
        </div>
      ) : (
        <CustomerTable
          customers={customers}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          onViewDetail={handleViewDetail}
        />
      )}

      {/* Detail Drawer */}
      <CustomerDetailDrawer
        customer={selectedCustomer}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedCustomer(null);
        }}
      />

      {/* Create Dialog */}
      <CreateCustomerDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />
    </PageContainer>
  );
};
