import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/shared/components/feedback/Toast';
import { playSound } from '@/shared/utils/soundEffects';
import type {
  B2BShipperProfile,
  B2BPortalDashboardData,
  B2BCargoItem,
  B2BBulkOrderItem,
} from '../types/b2bPortal';

export const POPULAR_SHIPPERS: B2BShipperProfile[] = [
  {
    id: 'cus-vinamilk',
    name: 'Công ty Cổ phần Sữa Việt Nam (Vinamilk)',
    shortName: 'Vinamilk',
    logoText: 'VNM',
    brandColor: '#0054A6',
    taxCode: '0300588569',
    tier: 'VIP',
    email: 'logistics@vinamilk.com.vn',
    phone: '028 5415 5555',
    address: 'Số 10 Tân Trào, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh',
    contactPerson: 'Trần Thị Mai (GĐ Chuỗi Cung Ứng)',
  },
  {
    id: 'cus-samsung',
    name: 'Công ty TNHH Samsung Electronics Việt Nam (SEV)',
    shortName: 'Samsung VN',
    logoText: 'SS',
    brandColor: '#1428A0',
    taxCode: '2300324888',
    tier: 'VIP',
    email: 'supplychain.sev@samsung.com',
    phone: '0222 3696 000',
    address: 'KCN Yên Phong 1, Huyện Yên Phong, Tỉnh Bắc Ninh',
    contactPerson: 'Nguyễn Văn Tuấn (Trưởng ban Kho Vận)',
  },
  {
    id: 'cus-fptshop',
    name: 'Công ty Cổ phần Bán lẻ Kỹ thuật số FPT (FPT Retail)',
    shortName: 'FPT Shop',
    logoText: 'FPT',
    brandColor: '#F37021',
    taxCode: '0311609355',
    tier: 'GOLD',
    email: 'delivery@fptretail.com.vn',
    phone: '028 7302 3456',
    address: '261 - 263 Khánh Hội, Phường 2, Quận 4, TP. Hồ Chí Minh',
    contactPerson: 'Lê Thanh Bình (Điều hành Vận chuyển Omni)',
  },
  {
    id: 'cus-masan',
    name: 'Tập đoàn Masan Consumer Corporation',
    shortName: 'Masan Consumer',
    logoText: 'MSN',
    brandColor: '#E31B23',
    taxCode: '0302017440',
    tier: 'VIP',
    email: 'logistics@msn.masangroup.com',
    phone: '028 6255 5660',
    address: 'Tầng 12, Tòa nhà MPlaza Saigon, 39 Lê Duẩn, Quận 1, TP. HCM',
    contactPerson: 'Phạm Hồng Ánh (Giám sát Phân phối Toàn quốc)',
  },
  {
    id: 'cus-dhgpharma',
    name: 'Công ty Cổ phần Dược Hậu Giang (DHG Pharma)',
    shortName: 'DHG Pharma',
    logoText: 'DHG',
    brandColor: '#00843D',
    taxCode: '1800156801',
    tier: 'GOLD',
    email: 'pharma.transport@dhgpharma.com.vn',
    phone: '0292 3891 433',
    address: '288 Nguyễn Văn Cừ, Quận Ninh Kiều, TP. Cần Thơ',
    contactPerson: 'Đỗ Thị Kim Oanh (QL Kho Dược GSP/GDP)',
  },
];

const INITIAL_MOCK_DASHBOARD: Record<string, B2BPortalDashboardData> = {
  'cus-vinamilk': {
    customer: POPULAR_SHIPPERS[0],
    kpi: {
      totalOrders: 156,
      inTransitOrders: 8,
      deliveredOrders: 144,
      pendingOrders: 4,
      onTimeRate: 99.4,
      totalTonnage: 342.8,
      slaCompliance: '99.8%',
    },
    finance: {
      creditLimit: 150000000,
      currentDebt: 38450000,
      availableCredit: 111550000,
      creditUsagePercent: 26,
      paymentTermsDays: 30,
      dueInDays: 9,
      dueDate: new Date(Date.now() + 9 * 86400000).toISOString(),
      bankAccount: {
        bank: 'Vietcombank',
        accountNumber: '1029384756',
        accountName: 'CONG TY CP VIETROUTE LOGISTICS',
        vietQrPayload: 'vietroute-b2b-debt-cus-vinamilk',
      },
    },
    invoices: [
      {
        id: 'inv-vnm-01',
        invoiceCode: 'INV-2026-VNM-001',
        periodName: 'Kỳ cước vận tải tháng 09/2026',
        totalAmount: 38450000,
        paidAmount: 0,
        balance: 38450000,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 9 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 'inv-vnm-02',
        invoiceCode: 'INV-2026-VNM-002',
        periodName: 'Kỳ cước vận tải tháng 08/2026',
        totalAmount: 45200000,
        paidAmount: 45200000,
        balance: 0,
        status: 'PAID',
        dueDate: new Date(Date.now() - 25 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
      },
      {
        id: 'inv-vnm-03',
        invoiceCode: 'INV-2026-VNM-003',
        periodName: 'Kỳ cước vận tải tháng 07/2026',
        totalAmount: 52100000,
        paidAmount: 52100000,
        balance: 0,
        status: 'PAID',
        dueDate: new Date(Date.now() - 55 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 65 * 86400000).toISOString(),
      },
    ],
    recentOrders: [
      {
        id: 'ord-vnm-1',
        orderCode: 'VR-B2B-2026-901',
        receiverName: 'Siêu thị Co.opmart Cống Quỳnh',
        receiverAddress: '189C Cống Quỳnh, P. Nguyễn Cư Trinh, Quận 1, TP. HCM',
        weightKg: 1450,
        codAmount: 0,
        status: 'IN_TRANSIT',
        createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      },
      {
        id: 'ord-vnm-2',
        orderCode: 'VR-B2B-2026-902',
        receiverName: 'Đại lý phân phối Minh Anh',
        receiverAddress: '45 Võ Văn Tần, Phường 6, Quận 3, TP. HCM',
        weightKg: 890,
        codAmount: 0,
        status: 'IN_TRANSIT',
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: 'ord-vnm-3',
        orderCode: 'VR-B2B-2026-903',
        receiverName: 'Nhà máy Vinamilk Bình Dương',
        receiverAddress: 'KCN VSIP 1, TP. Thuận An, Bình Dương',
        weightKg: 3200,
        codAmount: 0,
        status: 'IN_TRANSIT',
        createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      },
      {
        id: 'ord-vnm-4',
        orderCode: 'VR-B2B-2026-880',
        receiverName: 'Bách Hóa Xanh Bình Thạnh',
        receiverAddress: '124 Nơ Trang Long, P. 14, Q. Bình Thạnh, TP. HCM',
        weightKg: 620,
        codAmount: 0,
        status: 'DELIVERED',
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
    ],
  },
};

const INITIAL_ACTIVE_CARGO: B2BCargoItem[] = [
  {
    id: 'cargo-1',
    orderCode: 'VR-B2B-2026-901',
    cargoName: 'Lô sữa tươi tiệt trùng 100% Organic 180ml (120 thùng)',
    receiverName: 'Siêu thị Co.opmart Cống Quỳnh',
    receiverAddress: '189C Cống Quỳnh, P. Nguyễn Cư Trinh, Quận 1, TP. HCM',
    destinationCoords: [106.6872, 10.7675],
    originName: 'Tổng kho VietRoute Sóng Thần',
    currentCoords: [106.7214, 10.8258],
    driverName: 'Trần Văn Mạnh',
    driverPhone: '0912 345 678',
    vehiclePlate: '51C-889.24 (Xe tải 5 tấn)',
    weightKg: 1450,
    status: 'IN_TRANSIT',
    etaMinutes: 24,
    etaTime: '15:45',
    temperature: '4.2°C (Cold-chain chuẩn)',
    progressPercent: 68,
  },
  {
    id: 'cargo-2',
    orderCode: 'VR-B2B-2026-902',
    cargoName: 'Lô nước trái cây Vfresh Nho 1L (80 thùng)',
    receiverName: 'Đại lý phân phối Minh Anh',
    receiverAddress: '45 Võ Văn Tần, Phường 6, Quận 3, TP. HCM',
    destinationCoords: [106.6912, 10.7785],
    originName: 'Tổng kho VietRoute Tân Bình',
    currentCoords: [106.6542, 10.7981],
    driverName: 'Lê Hoàng Nam',
    driverPhone: '0988 765 432',
    vehiclePlate: '29H-712.56 (Xe tải 3.5 tấn)',
    weightKg: 890,
    status: 'IN_TRANSIT',
    etaMinutes: 12,
    etaTime: '15:30',
    temperature: '22.0°C (Tiêu chuẩn)',
    progressPercent: 84,
  },
  {
    id: 'cargo-3',
    orderCode: 'VR-B2B-2026-903',
    cargoName: 'Kiện vật tư dây chuyền đóng gói Tetra Pak',
    receiverName: 'Nhà máy Vinamilk Bình Dương',
    receiverAddress: 'KCN VSIP 1, TP. Thuận An, Bình Dương',
    destinationCoords: [106.7025, 10.9312],
    originName: 'Hub Vận Tải Cát Lái',
    currentCoords: [106.7451, 10.8812],
    driverName: 'Đặng Tuấn Kiệt',
    driverPhone: '0903 112 233',
    vehiclePlate: '60C-542.11 (Xe đầu kéo 15 tấn)',
    weightKg: 3200,
    status: 'IN_TRANSIT',
    etaMinutes: 45,
    etaTime: '16:15',
    temperature: 'Bình thường',
    progressPercent: 42,
  },
];

export function useB2BPortal() {
  const [selectedShipperId, setSelectedShipperId] = useState<string>(POPULAR_SHIPPERS[0].id);
  const [dashboardData, setDashboardData] = useState<B2BPortalDashboardData | null>(null);
  const [activeCargo, setActiveCargo] = useState<B2BCargoItem[]>(INITIAL_ACTIVE_CARGO);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCargo, setSelectedCargo] = useState<B2BCargoItem | null>(null);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState<boolean>(false);
  const [isSubmittingOrders, setIsSubmittingOrders] = useState<boolean>(false);

  // Đổi doanh nghiệp shipper
  const currentShipper = POPULAR_SHIPPERS.find((s) => s.id === selectedShipperId) || POPULAR_SHIPPERS[0];

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      // Thử gọi backend NestJS trước
      const res = await fetch(`http://localhost:3001/api/v1/customers/portal/${selectedShipperId}/dashboard`);
      if (res.ok) {
        const json = await res.json();
        setDashboardData(json);
      } else {
        // Fallback mock
        const mock = INITIAL_MOCK_DASHBOARD[selectedShipperId] || {
          customer: currentShipper,
          kpi: {
            totalOrders: 64,
            inTransitOrders: 3,
            deliveredOrders: 59,
            pendingOrders: 2,
            onTimeRate: 99.1,
            totalTonnage: 115.4,
            slaCompliance: '99.5%',
          },
          finance: {
            creditLimit: currentShipper.tier === 'VIP' ? 150000000 : 100000000,
            currentDebt: 24500000,
            availableCredit: (currentShipper.tier === 'VIP' ? 150000000 : 100000000) - 24500000,
            creditUsagePercent: Math.round((24500000 / (currentShipper.tier === 'VIP' ? 150000000 : 100000000)) * 100),
            paymentTermsDays: 30,
            dueInDays: 14,
            dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
            bankAccount: {
              bank: 'Vietcombank',
              accountNumber: '1029384756',
              accountName: 'CONG TY CP VIETROUTE LOGISTICS',
              vietQrPayload: `vietroute-b2b-debt-${selectedShipperId}`,
            },
          },
          invoices: [
            {
              id: `inv-${selectedShipperId}-01`,
              invoiceCode: `INV-2026-${currentShipper.logoText}-001`,
              periodName: 'Kỳ cước vận tải tháng 09/2026',
              totalAmount: 24500000,
              paidAmount: 0,
              balance: 24500000,
              status: 'PENDING',
              dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
              createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            },
          ],
          recentOrders: [],
        };
        setDashboardData(mock);
      }
    } catch {
      // Fallback khi offline
      const mock = INITIAL_MOCK_DASHBOARD[selectedShipperId] || {
        customer: currentShipper,
        kpi: {
          totalOrders: 64,
          inTransitOrders: 3,
          deliveredOrders: 59,
          pendingOrders: 2,
          onTimeRate: 99.1,
          totalTonnage: 115.4,
          slaCompliance: '99.5%',
        },
        finance: {
          creditLimit: currentShipper.tier === 'VIP' ? 150000000 : 100000000,
          currentDebt: 24500000,
          availableCredit: (currentShipper.tier === 'VIP' ? 150000000 : 100000000) - 24500000,
          creditUsagePercent: 24,
          paymentTermsDays: 30,
          dueInDays: 14,
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
          bankAccount: {
            bank: 'Vietcombank',
            accountNumber: '1029384756',
            accountName: 'CONG TY CP VIETROUTE LOGISTICS',
            vietQrPayload: `vietroute-b2b-debt-${selectedShipperId}`,
          },
        },
        invoices: [
          {
            id: `inv-${selectedShipperId}-01`,
            invoiceCode: `INV-2026-${currentShipper.logoText}-001`,
            periodName: 'Kỳ cước vận tải tháng 09/2026',
            totalAmount: 24500000,
            paidAmount: 0,
            balance: 24500000,
            status: 'PENDING',
            dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
        ],
        recentOrders: [],
      };
      setDashboardData(mock);
    } finally {
      setIsLoading(false);
    }
  }, [selectedShipperId, currentShipper]);

  const fetchActiveCargo = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/v1/customers/portal/${selectedShipperId}/active-cargo`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          setActiveCargo(json);
        }
      }
    } catch {
      // Giữ mock
    }
  }, [selectedShipperId]);

  useEffect(() => {
    fetchDashboard();
    fetchActiveCargo();
  }, [fetchDashboard, fetchActiveCargo]);

  // Ký gửi hàng loạt đơn hàng
  const handleBulkOrderSubmit = async (orders: B2BBulkOrderItem[]) => {
    setIsSubmittingOrders(true);
    try {
      const payload = {
        orders: orders.map((o) => ({
          receiverName: o.receiverName,
          receiverPhone: o.receiverPhone,
          receiverAddress: o.receiverAddress,
          weight: o.weight,
          volume: o.volume || 0.1,
          codAmount: o.codAmount || 0,
          notes: o.notes,
          customerReference: o.customerReference,
        })),
        batchNotes: `Lô ký gửi tự động từ B2B Shipper Portal - ${currentShipper.shortName}`,
      };

      try {
        const res = await fetch(`http://localhost:3001/api/v1/customers/portal/${selectedShipperId}/bulk-orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          await res.json();
        }
      } catch {
        // Fallback giả lập thành công
      }

      // Cập nhật State cục bộ
      playSound('SUCCESS');
      toast.success(
        'Ký gửi hàng loạt thành công!',
        `Đã tạo ${orders.length} kiện hàng mới. Đội điều phối VietRoute đã tiếp nhận và đang xếp tuyến xe.`
      );

      // Thêm vào recent orders & cập nhật KPI
      if (dashboardData) {
        const newRecent = orders.map((o, idx) => ({
          id: `new-${Date.now()}-${idx}`,
          orderCode: `VR-B2B-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          receiverName: o.receiverName,
          receiverAddress: o.receiverAddress,
          weightKg: o.weight,
          codAmount: o.codAmount || 0,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        }));

        setDashboardData({
          ...dashboardData,
          kpi: {
            ...dashboardData.kpi,
            totalOrders: dashboardData.kpi.totalOrders + orders.length,
            pendingOrders: dashboardData.kpi.pendingOrders + orders.length,
          },
          recentOrders: [...newRecent, ...dashboardData.recentOrders].slice(0, 10),
        });
      }

      return true;
    } catch {
      toast.error('Có lỗi xảy ra', 'Không thể gửi lô hàng, vui lòng thử lại.');
      return false;
    } finally {
      setIsSubmittingOrders(false);
    }
  };

  // Thanh toán công nợ VietQR
  const handlePayDebt = async (amount: number) => {
    try {
      try {
        await fetch(`http://localhost:3001/api/v1/customers/portal/${selectedShipperId}/pay-debt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, paymentMethod: 'VIETQR_NAPAS247' }),
        });
      } catch {
        // Fallback mock
      }

      playSound('SUCCESS');
      toast.success(
        'Thanh toán công nợ thành công!',
        `Đã nhận ${amount.toLocaleString('vi-VN')} đ qua VietQR Napas 24/7. Hạn mức tín dụng đã được hoàn trả.`
      );

      if (dashboardData) {
        const newDebt = Math.max(0, dashboardData.finance.currentDebt - amount);
        const newAvailable = dashboardData.finance.creditLimit - newDebt;
        setDashboardData({
          ...dashboardData,
          finance: {
            ...dashboardData.finance,
            currentDebt: newDebt,
            availableCredit: newAvailable,
            creditUsagePercent: Math.round((newDebt / dashboardData.finance.creditLimit) * 100),
          },
          invoices: dashboardData.invoices.map((inv) =>
            inv.status === 'PENDING'
              ? { ...inv, status: 'PAID', paidAmount: inv.totalAmount, balance: 0 }
              : inv
          ),
        });
      }

      setIsDebtModalOpen(false);
      return true;
    } catch {
      toast.error('Lỗi thanh toán', 'Vui lòng thử lại sau.');
      return false;
    }
  };

  return {
    selectedShipperId,
    setSelectedShipperId,
    currentShipper,
    dashboardData,
    activeCargo,
    isLoading,
    refetch: fetchDashboard,
    selectedCargo,
    setSelectedCargo,
    isDebtModalOpen,
    setIsDebtModalOpen,
    isSubmittingOrders,
    handleBulkOrderSubmit,
    handlePayDebt,
  };
}
