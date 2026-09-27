import React, { useState } from "react";
import {
  Globe2,
  Ship,
  FileCheck2,
  Container,
  DollarSign,
  Plus,
  RefreshCw,
  Download,
  TrendingUp,
  Navigation,
  FileText,
  Sparkles,
  Wallet,
  Truck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

import {
  useInternationalShipments,
  useCustomsDeclarations,
  useInternationalContainers,
  useExchangeRates,
  useLocalCharges,
  useDrayageDispatches,
  useInternationalMutations,
} from "../hooks/useInternational";
import type {
  InternationalShipment,
  InternationalFilterParams,
  CreateShipmentInput,
  CreateCustomsInput,
} from "../types/international";

import { InternationalKpiGrid } from "../components/InternationalKpiGrid";
import { InternationalFilterBar } from "../components/InternationalFilterBar";
import { ShipmentTable } from "../components/ShipmentTable";
import { CustomsDeclarationTable } from "../components/CustomsDeclarationTable";
import { ContainerDemDetTable } from "../components/ContainerDemDetTable";
import { ExchangeRateWidget } from "../components/ExchangeRateWidget";
import { CreateShipmentDialog } from "../components/CreateShipmentDialog";
import { CustomsDeclarationDialog } from "../components/CustomsDeclarationDialog";
import { SmartHsCodeAdvisor } from "../components/SmartHsCodeAdvisor";
import { ShipmentPnlWidget } from "../components/ShipmentPnlWidget";
import { ContainerDepositManager } from "../components/ContainerDepositManager";
import { VesselAisTracker } from "../components/VesselAisTracker";
import { ShippingDocumentsVault } from "../components/ShippingDocumentsVault";
import { ContainerDrayageDispatch } from "../components/ContainerDrayageDispatch";
import { AiImportAnalysisModal } from "../components/AiImportAnalysisModal";
import { toast } from "@/shared/components/feedback/Toast";

type ActiveTabType =
  | "SHIPMENTS"
  | "CUSTOMS"
  | "CONTAINERS"
  | "DRAYAGE"
  | "VESSELS"
  | "PNL"
  | "DOCUMENTS"
  | "RATES";

export const InternationalFreightPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTabType>("SHIPMENTS");
  const [customsSubTab, setCustomsSubTab] = useState<"DECLARATIONS" | "HS_ADVISOR">("DECLARATIONS");
  const [containerSubTab, setContainerSubTab] = useState<"TRACKING" | "DEPOSITS">("TRACKING");
  const [filters, setFilters] = useState<InternationalFilterParams>({});

  // Dialog states
  const [isShipmentDialogOpen, setIsShipmentDialogOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<InternationalShipment | null>(null);
  const [isCustomsDialogOpen, setIsCustomsDialogOpen] = useState(false);
  const [deletingShipment, setDeletingShipment] = useState<InternationalShipment | null>(null);

  // Queries
  const {
    data: shipments = [],
    isLoading: isShipmentsLoading,
    refetch: refetchShipments,
  } = useInternationalShipments(filters);

  const {
    data: customs = [],
    isLoading: isCustomsLoading,
  } = useCustomsDeclarations();

  const {
    data: containers = [],
    isLoading: isContainersLoading,
  } = useInternationalContainers();

  const {
    data: rates = [],
    isLoading: isRatesLoading,
  } = useExchangeRates();

  const {
    data: localCharges = [],
    isLoading: isChargesLoading,
  } = useLocalCharges();

  const {
    data: drayages = [],
  } = useDrayageDispatches();

  // AI Modal states
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [analyzingShipmentCode, setAnalyzingShipmentCode] = useState<string | null>(null);

  // Mutations
  const {
    createShipment,
    updateShipment,
    deleteShipment,
    createCustoms,
    updateCustomsStatus,
  } = useInternationalMutations();

  // Handlers
  const handleOpenCreateShipment = () => {
    setEditingShipment(null);
    setIsShipmentDialogOpen(true);
  };

  const handleEditShipment = (shipment: InternationalShipment) => {
    setEditingShipment(shipment);
    setIsShipmentDialogOpen(true);
  };

  const handleDeleteShipment = (shipment: InternationalShipment) => {
    setDeletingShipment(shipment);
  };

  const handleConfirmDelete = async () => {
    if (!deletingShipment) return;
    await deleteShipment.mutateAsync(deletingShipment.id);
    setDeletingShipment(null);
  };

  const handleSubmitShipment = async (data: CreateShipmentInput) => {
    if (editingShipment) {
      await updateShipment.mutateAsync({ id: editingShipment.id, data });
    } else {
      await createShipment.mutateAsync(data);
    }
    setIsShipmentDialogOpen(false);
    setEditingShipment(null);
  };

  const handleSubmitCustoms = async (data: CreateCustomsInput) => {
    await createCustoms.mutateAsync(data);
    setIsCustomsDialogOpen(false);
  };

  const handleExportReport = () => {
    toast.success(
      "Đã xuất báo cáo giao nhận quốc tế",
      "Hệ thống đã kết xuất dữ liệu manifest vận tải quốc tế định dạng chuẩn Excel/PDF."
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Globe2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Vận Tải & Giao Nhận Quốc Tế
                </h1>
                <Badge variant="outline" className="border-primary/30 text-primary text-[11px] font-semibold">
                  Enterprise Freight & Supply Chain
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Trung tâm điều hành Bookings, Hải quan VNACCS, Tối ưu thuế FTA, Vệ tinh AIS, Quản lý Vỏ Cont & Tài chính P&L
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchShipments()}
            className="text-xs h-9 gap-1.5"
            title="Đồng bộ lại dữ liệu"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Đồng bộ
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReport}
            className="text-xs h-9 gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Xuất Báo Cáo
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAnalyzingShipmentCode("IMP-2026-005");
              setIsAiModalOpen(true);
            }}
            className="text-xs h-9 gap-1.5 border-primary/40 text-primary hover:bg-primary/10 font-semibold"
            title="Trí tuệ nhân tạo phân tích luồng hàng nhập khẩu, dự báo rủi ro & điều độ container"
          >
            <Sparkles className="h-4 w-4 text-amber-500" /> AI Phân Tích Nhập Hàng
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreateShipment}
            className="text-xs h-9 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" /> Tạo Lô Hàng Quốc Tế
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <InternationalKpiGrid
        shipments={shipments}
        customs={customs}
        containers={containers}
      />

      {/* Main Tabs Navigation (7 Core Enterprise Pillars) */}
      <div className="flex items-center gap-1 border-b border-border pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab("SHIPMENTS")}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === "SHIPMENTS"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Ship className="h-4 w-4" />
          Lô Hàng Xuất Nhập Khẩu ({shipments.length})
        </button>

        <button
          onClick={() => setActiveTab("CUSTOMS")}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === "CUSTOMS"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          Hải Quan & Mã HS FTA ({customs.length})
        </button>

        <button
          onClick={() => setActiveTab("CONTAINERS")}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === "CONTAINERS"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Container className="h-4 w-4" />
          Vỏ Container & Dem/Det ({containers.length})
        </button>

        <button
          onClick={() => setActiveTab("DRAYAGE")}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === "DRAYAGE"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Truck className="h-4 w-4" />
          Điều Độ Xe Container ({drayages.length})
        </button>

        <button
          onClick={() => setActiveTab("VESSELS")}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === "VESSELS"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Navigation className="h-4 w-4" />
          Hải Trình Vệ Tinh AIS
        </button>

        <button
          onClick={() => setActiveTab("PNL")}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === "PNL"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Tài Chính Lợi Nhuận Gộp (P&L)
        </button>

        <button
          onClick={() => setActiveTab("DOCUMENTS")}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === "DOCUMENTS"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          Hồ Sơ Chứng Từ Số
        </button>

        <button
          onClick={() => setActiveTab("RATES")}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === "RATES"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Tỷ Giá & Phụ Phí Cảng
        </button>
      </div>

      {/* Tab 1: Shipments */}
      {activeTab === "SHIPMENTS" && (
        <div className="space-y-4">
          <InternationalFilterBar
            filters={filters}
            onFilterChange={setFilters}
            onOpenCreateShipment={handleOpenCreateShipment}
            onOpenCustomsDialog={() => setIsCustomsDialogOpen(true)}
          />

          <ShipmentTable
            shipments={shipments}
            onEdit={handleEditShipment}
            onDelete={handleDeleteShipment}
            onAnalyze={(s) => {
              setAnalyzingShipmentCode(s.shipmentCode);
              setIsAiModalOpen(true);
            }}
            isLoading={isShipmentsLoading}
          />
        </div>
      )}

      {/* Tab 2: Customs & Smart HS Code Advisor */}
      {activeTab === "CUSTOMS" && (
        <div className="space-y-4">
          {/* Sub-tab toggle */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={customsSubTab === "DECLARATIONS" ? "default" : "outline"}
              onClick={() => setCustomsSubTab("DECLARATIONS")}
              className="text-xs h-8 gap-1.5"
            >
              <FileCheck2 className="h-3.5 w-3.5" /> Tờ Khai Hải Quan VNACCS
            </Button>
            <Button
              size="sm"
              variant={customsSubTab === "HS_ADVISOR" ? "default" : "outline"}
              onClick={() => setCustomsSubTab("HS_ADVISOR")}
              className="text-xs h-8 gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Trợ Lý Phân Loại Mã HS & Biểu Thuế FTA 2026
            </Button>
          </div>

          {customsSubTab === "DECLARATIONS" ? (
            <CustomsDeclarationTable
              declarations={customs}
              onUpdateStatus={(id, status) => updateCustomsStatus.mutateAsync({ id, status })}
              onOpenCreate={() => setIsCustomsDialogOpen(true)}
              isLoading={isCustomsLoading}
            />
          ) : (
            <SmartHsCodeAdvisor />
          )}
        </div>
      )}

      {/* Tab 3: Container Dem/Det & EIR Deposit Tracking */}
      {activeTab === "CONTAINERS" && (
        <div className="space-y-4">
          {/* Sub-tab toggle */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={containerSubTab === "TRACKING" ? "default" : "outline"}
              onClick={() => setContainerSubTab("TRACKING")}
              className="text-xs h-8 gap-1.5"
            >
              <Container className="h-3.5 w-3.5" /> Theo Dõi Vị Trí Vỏ & Cảnh Báo Free Time
            </Button>
            <Button
              size="sm"
              variant={containerSubTab === "DEPOSITS" ? "default" : "outline"}
              onClick={() => setContainerSubTab("DEPOSITS")}
              className="text-xs h-8 gap-1.5"
            >
              <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Quản Lý Tiền Ký Cược Vỏ Hãng Tàu (EIR)
            </Button>
          </div>

          {containerSubTab === "TRACKING" ? (
            <ContainerDemDetTable
              containers={containers}
              isLoading={isContainersLoading}
            />
          ) : (
            <ContainerDepositManager />
          )}
        </div>
      )}

      {/* Tab: Container Drayage Dispatching */}
      {activeTab === "DRAYAGE" && (
        <ContainerDrayageDispatch
          onOpenAiAnalysis={(code) => {
            setAnalyzingShipmentCode(code);
            setIsAiModalOpen(true);
          }}
        />
      )}

      {/* Tab 4: Live Satellite AIS Vessel Tracking */}
      {activeTab === "VESSELS" && <VesselAisTracker />}

      {/* Tab 5: Shipment Financial Profitability (P&L) */}
      {activeTab === "PNL" && <ShipmentPnlWidget />}

      {/* Tab 6: Shipping Documents Vault & Readiness */}
      {activeTab === "DOCUMENTS" && <ShippingDocumentsVault />}

      {/* Tab 7: FX Rates & Local Charges */}
      {activeTab === "RATES" && (
        <ExchangeRateWidget
          rates={rates}
          localCharges={localCharges}
          isLoading={isRatesLoading || isChargesLoading}
        />
      )}

      {/* Dialog: Create / Edit Shipment */}
      <CreateShipmentDialog
        isOpen={isShipmentDialogOpen}
        onClose={() => {
          setIsShipmentDialogOpen(false);
          setEditingShipment(null);
        }}
        onSubmit={handleSubmitShipment}
        editingShipment={editingShipment}
        isSubmitting={createShipment.isPending || updateShipment.isPending}
      />

      {/* Dialog: Customs Declaration */}
      <CustomsDeclarationDialog
        isOpen={isCustomsDialogOpen}
        onClose={() => setIsCustomsDialogOpen(false)}
        onSubmit={handleSubmitCustoms}
        shipments={shipments}
        isSubmitting={createCustoms.isPending}
      />

      {/* Dialog: Delete Confirmation */}
      <Dialog
        open={Boolean(deletingShipment)}
        onOpenChange={(open) => !open && setDeletingShipment(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-red-600">
              Xác nhận xóa lô hàng quốc tế
            </DialogTitle>
          </DialogHeader>
          <div className="text-xs text-muted-foreground space-y-2 py-2">
            <p>
              Bạn có chắc chắn muốn xóa lô hàng{" "}
              <span className="font-bold text-foreground font-mono">
                {deletingShipment?.shipmentCode}
              </span>{" "}
              khỏi hệ thống vận hành quốc tế không?
            </p>
            <p className="text-[11px] text-red-500">
              * Hành động này sẽ hủy theo dõi vận đơn và thông quan của lô hàng tương ứng.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingShipment(null)}
              className="text-xs h-8"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deleteShipment.isPending}
              className="text-xs h-8"
            >
              {deleteShipment.isPending ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: AI Import Analysis & Auto-Dispatch */}
      <AiImportAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        shipmentCode={analyzingShipmentCode}
        onGoToDrayage={() => setActiveTab("DRAYAGE")}
      />
    </div>
  );
};

export default InternationalFreightPage;
