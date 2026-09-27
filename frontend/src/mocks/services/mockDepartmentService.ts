import type {
  DepartmentItem,
  DepartmentFilterParams,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '@/modules/staff/types/department';

let mockDepartments: DepartmentItem[] = [
  {
    id: 'dept-001',
    code: 'DEP-DISPATCH',
    name: 'Phòng Điều Phối Vận Tải',
    description: 'Chịu trách nhiệm lập kế hoạch tuyến, phân bổ xe, tài xế và tối ưu chi phí vận chuyển chặng đường.',
    headId: 'usr-dispatcher-01',
    headName: 'Trần Minh Tuấn',
    headPhone: '0901.888.777',
    headEmail: 'tuan.tm@vietroute.vn',
    location: 'Trụ sở chính Hà Nội - Tầng 4',
    memberCount: 6,
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
  {
    id: 'dept-002',
    code: 'DEP-WH',
    name: 'Phòng Quản Trị Kho Bãi & WMS',
    description: 'Quản trị mạng lưới kho tổng HUB, cross-docking, định vị barcode và kiểm soát tồn kho toàn quốc.',
    headId: 'usr-wh-longbien',
    headName: 'Nguyễn Văn Hùng',
    headPhone: '0912.834.192',
    headEmail: 'hung.nv@vietroute.vn',
    location: 'Kho Tổng Long Biên (Hà Nội)',
    memberCount: 14,
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
  {
    id: 'dept-003',
    code: 'DEP-FLEET',
    name: 'Đội Vận Chuyển & Tài Xế',
    description: 'Vận hành trực tiếp đội xe container, tải van, quản lý tài xế, an toàn đường bộ và chấm điểm OTD.',
    headId: 'usr-driver-leader',
    headName: 'Lê Văn Đạt',
    headPhone: '0988.123.456',
    headEmail: 'dat.lv@vietroute.vn',
    location: 'Trung tâm Vận hành Bãi Xe Long Biên',
    memberCount: 38,
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
  {
    id: 'dept-004',
    code: 'DEP-FIN',
    name: 'Phòng Tài Chính & Kế Toán COD',
    description: 'Đối soát tiền thu hộ COD từ tài xế, thanh quyết toán với khách hàng doanh nghiệp và xuất hóa đơn VAT.',
    headId: 'usr-fin-mai',
    headName: 'Vũ Thị Mai',
    headPhone: '0977.555.222',
    headEmail: 'mai.vt@vietroute.vn',
    location: 'Trụ sở chính Hà Nội - Tầng 3',
    memberCount: 5,
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
  {
    id: 'dept-005',
    code: 'DEP-CS',
    name: 'Phòng Dịch Vụ Khách Hàng & CSKH',
    description: 'Tiếp nhận khiếu nại, xử lý sự cố hàng hóa thất lạc/hư hỏng, hỗ trợ tra cứu lộ trình vận đơn 24/7.',
    headId: 'usr-cs-trang',
    headName: 'Hoàng Thu Trang',
    headPhone: '0934.111.999',
    headEmail: 'trang.ht@vietroute.vn',
    location: 'Trung tâm Chăm Sóc Khách Hàng - Tầng 2',
    memberCount: 8,
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
  {
    id: 'dept-006',
    code: 'DEP-IT',
    name: 'Ban Công Nghệ & Quản Trị Hệ Thống',
    description: 'Quản trị hạ tầng đám mây, an ninh mạng, thuật toán routing AI, phân quyền người dùng và nhật ký audit.',
    headId: 'usr-admin-01',
    headName: 'Phan Vũ Linh',
    headPhone: '0966.999.888',
    headEmail: 'admin@vietroute.vn',
    location: 'Phòng Lab R&D - Tầng 5',
    memberCount: 4,
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
];

export const mockDepartmentService = {
  getDepartments: async (params?: DepartmentFilterParams): Promise<DepartmentItem[]> => {
    let result = [...mockDepartments];

    if (params?.status && params.status !== 'ALL') {
      result = result.filter((d) => d.status === params.status);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          (d.headName && d.headName.toLowerCase().includes(q)) ||
          (d.location && d.location.toLowerCase().includes(q))
      );
    }

    return result;
  },

  getDepartmentById: async (id: string): Promise<DepartmentItem | null> => {
    return mockDepartments.find((d) => d.id === id) || null;
  },

  createDepartment: async (data: CreateDepartmentInput): Promise<DepartmentItem> => {
    const newDept: DepartmentItem = {
      id: `dept-${Date.now()}`,
      code: data.code.toUpperCase().trim(),
      name: data.name.trim(),
      description: data.description || '',
      headId: data.headId,
      headName: data.headName,
      headPhone: data.headPhone,
      headEmail: data.headEmail,
      location: data.location || 'Trụ sở chính',
      memberCount: 0,
      status: data.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockDepartments.unshift(newDept);
    return newDept;
  },

  updateDepartment: async (id: string, data: UpdateDepartmentInput): Promise<DepartmentItem> => {
    const index = mockDepartments.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Không tìm thấy phòng ban');

    const updated: DepartmentItem = {
      ...mockDepartments[index],
      ...(data.code && { code: data.code.toUpperCase().trim() }),
      ...(data.name && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.headId !== undefined && { headId: data.headId }),
      ...(data.headName !== undefined && { headName: data.headName }),
      ...(data.headPhone !== undefined && { headPhone: data.headPhone }),
      ...(data.headEmail !== undefined && { headEmail: data.headEmail }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.status && { status: data.status }),
      updatedAt: new Date().toISOString(),
    };
    mockDepartments[index] = updated;
    return updated;
  },

  deleteDepartment: async (id: string): Promise<boolean> => {
    const prevLen = mockDepartments.length;
    mockDepartments = mockDepartments.filter((d) => d.id !== id);
    return mockDepartments.length < prevLen;
  },
};
