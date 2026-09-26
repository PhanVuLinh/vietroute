import React, { useState } from 'react';
import {
  Navigation,
  FileSpreadsheet,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useB2BPortal } from '../hooks/useB2BPortal';
import { B2BShipperHeader } from '../components/b2b/B2BShipperHeader';
import { B2BFinancialOverview } from '../components/b2b/B2BFinancialOverview';
import { B2BLiveCargoRadar } from '../components/b2b/B2BLiveCargoRadar';
import { B2BBulkOrderBatch } from '../components/b2b/B2BBulkOrderBatch';
import { B2BInvoiceLedger } from '../components/b2b/B2BInvoiceLedger';
import { B2BDebtPaymentModal } from '../components/b2b/B2BDebtPaymentModal';
import { B2BCargoDetailDrawer } from '../components/b2b/B2BCargoDetailDrawer';
import type { B2BInvoiceSummary } from '../types/b2bPortal';

export const B2BShipperPortalPage: React.FC = () => {
  usePageTitle('Cổng Khách Hàng Doanh Nghiệp B2B — VietRoute');

  const {
    setSelectedShipperId,
    currentShipper,
    dashboardData,
    activeCargo,
    isLoading,
    refetch,
    selectedCargo,
    setSelectedCargo,
    isDebtModalOpen,
    setIsDebtModalOpen,
    isSubmittingOrders,
    handleBulkOrderSubmit,
    handlePayDebt,
  } = useB2BPortal();

  const [activeTab, setActiveTab] = useState<'cargo' | 'bulk' | 'invoices'>('cargo');
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState<B2BInvoiceSummary | null>(null);

  const handleOpenPaySpecificInvoice = (inv: B2BInvoiceSummary) => {
    setSelectedInvoiceForPay(inv);
    setIsDebtModalOpen(true);
  };

  const handleOpenPayGeneralDebt = () => {
    setSelectedInvoiceForPay(null);
    setIsDebtModalOpen(true);
  };

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* 1. Header Doanh Nghiệp & Quick Switcher */}
      <B2BShipperHeader
        currentShipper={currentShipper}
        onSelectShipper={setSelectedShipperId}
        isLoading={isLoading}
        onRefresh={refetch}
      />

      {/* 2. Financial & Cargo Performance Metrics */}
      {isLoading || !dashboardData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <B2BFinancialOverview
          data={dashboardData}
          onOpenPayDebtModal={handleOpenPayGeneralDebt}
        />
      )}

      {/* 3. Main Business Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as any)}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-2">
          <TabsList className="bg-muted/70 p-1">
            <TabsTrigger
              value="cargo"
              className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:font-bold data-[state=active]:text-primary"
            >
              <Navigation className="h-3.5 w-3.5" />
              Radar Giám Sát Lô Hàng ({activeCargo.length})
            </TabsTrigger>
            <TabsTrigger
              value="bulk"
              className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:font-bold data-[state=active]:text-primary"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Ký Gửi Hàng Loạt (Bulk Batch)
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:font-bold data-[state=active]:text-primary"
            >
              <Receipt className="h-3.5 w-3.5" />
              Sổ Hóa Đơn & Đối Soát Cước ({dashboardData?.invoices.length || 0})
            </TabsTrigger>
          </TabsList>

          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Cổng kết nối dành riêng cho Đối tác B2B cấp cao</span>
          </div>
        </div>

        {/* Tab 1: Live Cargo Radar */}
        <TabsContent value="cargo" className="m-0 focus-visible:outline-none">
          <B2BLiveCargoRadar
            cargoList={activeCargo}
            onSelectCargo={(cargo) => setSelectedCargo(cargo)}
          />
        </TabsContent>

        {/* Tab 2: Ký Gửi Hàng Loạt */}
        <TabsContent value="bulk" className="m-0 focus-visible:outline-none">
          <B2BBulkOrderBatch
            onSubmitBatch={handleBulkOrderSubmit}
            isSubmitting={isSubmittingOrders}
          />
        </TabsContent>

        {/* Tab 3: Hóa Đơn & Sổ Nợ */}
        <TabsContent value="invoices" className="m-0 focus-visible:outline-none">
          {dashboardData && (
            <B2BInvoiceLedger
              invoices={dashboardData.invoices}
              onOpenPayInvoice={handleOpenPaySpecificInvoice}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* 4. Modal Thanh Toán VietQR 24/7 */}
      {dashboardData && (
        <B2BDebtPaymentModal
          isOpen={isDebtModalOpen}
          onClose={() => {
            setIsDebtModalOpen(false);
            setSelectedInvoiceForPay(null);
          }}
          shipper={currentShipper}
          amount={selectedInvoiceForPay ? selectedInvoiceForPay.balance : dashboardData.finance.currentDebt}
          invoiceCode={selectedInvoiceForPay ? selectedInvoiceForPay.invoiceCode : undefined}
          onConfirmPayment={handlePayDebt}
        />
      )}

      {/* 5. Drawer Chi Tiết Lô Hàng */}
      <B2BCargoDetailDrawer
        cargo={selectedCargo}
        isOpen={Boolean(selectedCargo)}
        onClose={() => setSelectedCargo(null)}
      />
    </PageContainer>
  );
};
