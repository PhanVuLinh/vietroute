import React, { useState } from "react";
import { Radio, Map as MapIcon, List } from "lucide-react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { Button } from "@/shared/components/ui/button";
import { useTracking } from "../hooks/useTracking";
import { TrackingTopBar } from "../components/TrackingTopBar";
import { TrackingVehicleList } from "../components/TrackingVehicleList";
import { LiveTrackingMap } from "../components/LiveTrackingMap";
import { VehicleTelemetryCard } from "../components/VehicleTelemetryCard";

export const TrackingPage: React.FC = () => {
  usePageTitle("Giám sát GPS Realtime");

  const {
    trackedVehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    selectedTrackedVehicle,
    warehouses,
    stats,
    isStreaming,
    toggleStreaming,
    speedMultiplier,
    changeSpeed,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    selectedRegion,
    setSelectedRegion,
  } = useTracking();

  // Mobile toggle tab: "MAP" | "LIST"
  const [mobileTab, setMobileTab] = useState<"MAP" | "LIST">("MAP");

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setMobileTab("MAP");
  };

  const handleFocusVehicle = (coords: [number, number]) => {
    // Map will auto-focus or we can trigger flyTo
  };

  return (
    <PageContainer
      title="Trung tâm Giám sát GPS Realtime"
      subtitle="Theo dõi tọa độ GPS, vận tốc tức thời, góc lái và lộ trình giao hàng trực tiếp trên bản đồ MapLibre."
      action={
        <div className="flex items-center gap-2">
          {/* Mobile view switch */}
          <div className="flex md:hidden bg-muted p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setMobileTab("MAP")}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                mobileTab === "MAP"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              Bản đồ
            </button>
            <button
              onClick={() => setMobileTab("LIST")}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                mobileTab === "LIST"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Danh sách ({trackedVehicles.length})
            </button>
          </div>
        </div>
      }
      fullHeight
    >
      <div className="flex flex-col h-full gap-3.5">
        {/* 1. Thanh điều khiển mô phỏng & Quick KPI */}
        <TrackingTopBar
          stats={stats}
          isStreaming={isStreaming}
          onToggleStreaming={toggleStreaming}
          speedMultiplier={speedMultiplier}
          onChangeSpeed={changeSpeed}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
        />

        {/* 2. Khung giám sát 2 cột: Sidebar danh sách xe + Bản đồ MapLibre */}
        <div className="flex-1 min-h-[500px] grid grid-cols-1 md:grid-cols-12 gap-3.5 relative overflow-hidden">
          {/* Cột trái: Danh sách xe trực tuyến */}
          <div
            className={`md:col-span-4 lg:col-span-3 h-full ${
              mobileTab === "LIST" ? "block" : "hidden md:block"
            }`}
          >
            <TrackingVehicleList
              vehicles={trackedVehicles}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={handleSelectVehicle}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
            />
          </div>

          {/* Cột phải: Bản đồ số MapLibre GL JS */}
          <div
            className={`md:col-span-8 lg:col-span-9 h-full relative ${
              mobileTab === "MAP" ? "block" : "hidden md:block"
            }`}
          >
            <LiveTrackingMap
              vehicles={trackedVehicles}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={handleSelectVehicle}
              warehouses={warehouses}
              selectedRegion={selectedRegion}
            />

            {/* Thẻ Telemetry chi tiết xe được chọn (Overlay góc dưới) */}
            <VehicleTelemetryCard
              trackedVehicle={selectedTrackedVehicle}
              onClose={() => setSelectedVehicleId(null)}
              onFocusVehicle={handleFocusVehicle}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
