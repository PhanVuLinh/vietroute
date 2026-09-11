import React, { useState } from "react";
import {
  BarChart3,
  Download,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Fuel,
  Trophy,
} from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useReports, TIME_RANGE_OPTIONS, type ReportTimeRange } from "../hooks/useReports";
import { ReportsKpiGrid } from "../components/ReportsKpiGrid";
import { OtdTrendChart } from "../components/OtdTrendChart";
import { CostAndFuelChart } from "../components/CostAndFuelChart";
import { DriverRankingTable } from "../components/DriverRankingTable";
import { FleetUtilizationCard } from "../components/FleetUtilizationCard";
import { RegionalVolumeChart } from "../components/RegionalVolumeChart";
import { ExportReportDialog } from "../components/ExportReportDialog";

type ReportTab = "OVERVIEW" | "OTD" | "COSTS" | "FLEET";

export const ReportsPage: React.FC = () => {
  usePageTitle("Báo cáo & Phân tích Logistics");

  const {
    timeRange,
    setTimeRange,
    selectedWarehouseId,
    setSelectedWarehouseId,
    analytics,
    warehouses,
    stats,
    costAndFuelTrends,
    regionalDistribution,
    enrichedDriverRanking,
    isLoading,
    refetchAll,
  } = useReports();

  const [activeTab, setActiveTab] = useState<ReportTab>("OVERVIEW");
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  return (
    <PageContainer
      title="Báo cáo & Phân tích Vận hành"
      subtitle="Thống kê chỉ số KPI vận tải, chi phí nhiên liệu, tỷ lệ giao đúng hạn (OTD) và hiệu suất đội xe toàn mạng lưới."
      action={
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Lọc Kho bãi */}
          <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
            <SelectTrigger className="h-9 text-xs w-[160px] bg-card">
              <SelectValue placeholder="Kho xuất phát" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toàn bộ mạng lưới</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name.replace("Tổng kho ", "").replace("Kho Trung chuyển ", "")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 2. Lọc Khoảng thời gian */}
          <Select value={timeRange} onValueChange={(val) => setTimeRange(val as ReportTimeRange)}>
            <SelectTrigger className="h-9 text-xs w-[150px] bg-card font-medium">
              <Calendar className="h-3.5 w-3.5 text-primary mr-1 shrink-0" />
              <SelectValue placeholder="Chọn kỳ báo cáo" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 3. Nút Làm mới */}
          <Button
            variant="outline"
            size="sm"
            onClick={refetchAll}
            disabled={isLoading}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            title="Làm mới số liệu"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
          </Button>

          {/* 4. Nút Xuất Báo Cáo */}
          <Button
            size="sm"
            onClick={() => setIsExportOpen(true)}
            className="h-9 text-xs font-semibold gap-1.5 shadow-xs shadow-primary/20"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Xuất báo cáo</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 1. Grid 5 Thẻ KPI Vĩ mô */}
        <ReportsKpiGrid stats={stats} isLoading={isLoading} />

        {/* 2. Tabs Điều hướng Phân hệ Chuyên đề */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as ReportTab)} className="space-y-5">
          <TabsList className="bg-muted p-1 rounded-xl inline-flex gap-1 h-10 border border-border">
            <TabsTrigger value="OVERVIEW" className="text-xs font-semibold px-3 py-1.5 gap-1.5 rounded-lg">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Tổng quan toàn diện</span>
            </TabsTrigger>
            <TabsTrigger value="OTD" className="text-xs font-semibold px-3 py-1.5 gap-1.5 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Đúng hẹn SLA (OTD)</span>
            </TabsTrigger>
            <TabsTrigger value="COSTS" className="text-xs font-semibold px-3 py-1.5 gap-1.5 rounded-lg">
              <Fuel className="h-3.5 w-3.5 text-amber-500" />
              <span>Chi phí & Nhiên liệu</span>
            </TabsTrigger>
            <TabsTrigger value="FLEET" className="text-xs font-semibold px-3 py-1.5 gap-1.5 rounded-lg">
              <Trophy className="h-3.5 w-3.5 text-indigo-500" />
              <span>Đội xe & Tài xế</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: TỔNG QUAN */}
          <TabsContent value="OVERVIEW" className="space-y-5 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7">
                <OtdTrendChart trends={analytics?.onTimeRateTrends} isLoading={isLoading} />
              </div>
              <div className="lg:col-span-5">
                <RegionalVolumeChart regions={regionalDistribution} isLoading={isLoading} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7">
                <CostAndFuelChart data={costAndFuelTrends} isLoading={isLoading} />
              </div>
              <div className="lg:col-span-5">
                <FleetUtilizationCard
                  data={analytics?.vehiclePerformance}
                  overallRate={stats.fleetUtil}
                  isLoading={isLoading}
                />
              </div>
            </div>

            <div>
              <DriverRankingTable rankings={enrichedDriverRanking} isLoading={isLoading} />
            </div>
          </TabsContent>

          {/* TAB 2: ĐÚNG HẸN SLA (OTD) */}
          <TabsContent value="OTD" className="space-y-5 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-8">
                <OtdTrendChart trends={analytics?.onTimeRateTrends} isLoading={isLoading} />
              </div>
              <div className="lg:col-span-4">
                <RegionalVolumeChart regions={regionalDistribution} isLoading={isLoading} />
              </div>
            </div>
            <div>
              <DriverRankingTable rankings={enrichedDriverRanking} isLoading={isLoading} />
            </div>
          </TabsContent>

          {/* TAB 3: CHI PHÍ & NHIÊN LIỆU */}
          <TabsContent value="COSTS" className="space-y-5 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-8">
                <CostAndFuelChart data={costAndFuelTrends} isLoading={isLoading} />
              </div>
              <div className="lg:col-span-4">
                <FleetUtilizationCard
                  data={analytics?.vehiclePerformance}
                  overallRate={stats.fleetUtil}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: ĐỘI XE & TÀI XẾ */}
          <TabsContent value="FLEET" className="space-y-5 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7">
                <DriverRankingTable rankings={enrichedDriverRanking} isLoading={isLoading} />
              </div>
              <div className="lg:col-span-5">
                <FleetUtilizationCard
                  data={analytics?.vehiclePerformance}
                  overallRate={stats.fleetUtil}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Xuất Báo Cáo */}
      <ExportReportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        timeRange={timeRange}
      />
    </PageContainer>
  );
};
