import type { StaffMember, RolePermissionItem, StaffFilterParams } from "@/modules/staff/types/staff";
import { DEFAULT_ROLE_PERMISSIONS } from "./mockRolePermissions";

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "usr-admin-01",
    email: "admin@vietroute.com",
    fullName: "Phan Vũ Linh",
    phone: "0901.234.567",
    roleId: "role-admin",
    roleName: "ADMIN",
    roleDescription: "Quản trị viên toàn quyền hệ thống VietRoute",
    status: "ACTIVE",
    department: "Ban Giám Đốc & Công Nghệ",
    employeeCode: "NV-VR-001",
    createdAt: "2026-01-01T08:00:00Z",
    updatedAt: "2026-09-27T08:00:00Z",
  },
  {
    id: "usr-mgr-01",
    email: "nam.th@vietroute.vn",
    fullName: "Trần Hữu Nam",
    phone: "0912.834.192",
    roleId: "role-manager",
    roleName: "MANAGER",
    roleDescription: "Giám đốc Kho Vận Tổng Hub Miền Bắc",
    status: "ACTIVE",
    department: "Khối Quản Lý Kho Bãi",
    employeeCode: "NV-VR-010",
    assignedWarehouse: "Tổng kho Long Biên (Hà Nội)",
    createdAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-09-27T08:00:00Z",
  },
  {
    id: "usr-mgr-02",
    email: "khiem.vd@vietroute.vn",
    fullName: "Vũ Đình Khiêm",
    phone: "0913.834.193",
    roleId: "role-manager",
    roleName: "MANAGER",
    roleDescription: "Quản lý Trung chuyển Miền Trung",
    status: "ACTIVE",
    department: "Khối Quản Lý Kho Bãi",
    employeeCode: "NV-VR-011",
    assignedWarehouse: "Kho Trung chuyển Đà Nẵng",
    createdAt: "2026-02-01T08:00:00Z",
    updatedAt: "2026-09-27T08:00:00Z",
  },
  {
    id: "usr-mgr-03",
    email: "trong.pd@vietroute.vn",
    fullName: "Phan Đình Trọng",
    phone: "0914.834.194",
    roleId: "role-manager",
    roleName: "MANAGER",
    roleDescription: "Tổng kho Phân phối Phía Nam",
    status: "ACTIVE",
    department: "Khối Quản Lý Kho Bãi",
    employeeCode: "NV-VR-012",
    assignedWarehouse: "Tổng kho Tân Bình (TP.HCM)",
    createdAt: "2026-02-10T08:00:00Z",
    updatedAt: "2026-09-27T08:00:00Z",
  },
  {
    id: "usr-dispatch-01",
    email: "dieuphoi@vietroute.vn",
    fullName: "Nguyễn Văn Hùng",
    phone: "0987.654.321",
    roleId: "role-dispatcher",
    roleName: "DISPATCHER",
    roleDescription: "Trưởng nhóm Điều phối Đội xe & Tuyến đường",
    status: "ACTIVE",
    department: "Trung Tâm Điều Hành Vận Tải",
    employeeCode: "NV-VR-020",
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-09-27T08:00:00Z",
  },
  {
    id: "usr-dispatch-02",
    email: "maianh.le@vietroute.vn",
    fullName: "Lê Thị Mai Anh",
    phone: "0988.112.233",
    roleId: "role-dispatcher",
    roleName: "DISPATCHER",
    roleDescription: "Điều phối viên Chuyến hàng Liên tỉnh",
    status: "ACTIVE",
    department: "Trung Tâm Điều Hành Vận Tải",
    employeeCode: "NV-VR-021",
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: "2026-09-27T08:00:00Z",
  },
  {
    id: "usr-wh-01",
    email: "thukho.linh@vietroute.vn",
    fullName: "Nguyễn Diệu Linh",
    phone: "0922.834.101",
    roleId: "role-wh-staff",
    roleName: "WAREHOUSE_STAFF",
    roleDescription: "Thủ kho kiểm đếm xuất nhập & Barcode Kiosk",
    status: "ACTIVE",
    department: "Đội Vận Hành Kho Bến",
    employeeCode: "NV-VR-030",
    assignedWarehouse: "Tổng kho Long Biên (Hà Nội)",
    createdAt: "2026-02-15T08:00:00Z",
    updatedAt: "2026-09-27T08:00:00Z",
  },
  {
    id: "usr-wh-02",
    email: "thukho.kien@vietroute.vn",
    fullName: "Hoàng Trung Kiên",
    phone: "0922.834.102",
    roleId: "role-wh-staff",
    roleName: "WAREHOUSE_STAFF",
    roleDescription: "Thủ kho phụ trách cầu bốc dỡ Dock Door",
    status: "ACTIVE",
    department: "Đội Vận Hành Kho Bến",
    employeeCode: "NV-VR-031",
    assignedWarehouse: "Tổng kho Tân Bình (TP.HCM)",
    createdAt: "2026-02-20T08:00:00Z",
    updatedAt: "2026-09-27T08:00:00Z",
  },
  {
    id: "usr-acc-01",
    email: "ketoan.mai@vietroute.vn",
    fullName: "Phạm Phương Mai",
    phone: "0933.834.201",
    roleId: "role-accountant",
    roleName: "ACCOUNTANT",
    roleDescription: "Chuyên viên Kế toán & Đối soát COD",
    status: "ACTIVE",
    department: "Phòng Tài Chính - Kế Toán",
    employeeCode: "NV-VR-040",
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-09-27T08:00:00Z",
  },
  {
    id: "usr-drv-01",
    email: "taixe.an@vietroute.vn",
    fullName: "Nguyễn Văn An",
    phone: "0971.001.001",
    roleId: "role-driver",
    roleName: "DRIVER",
    roleDescription: "Tài xế phụ trách xe 29C-741.82 (GPLX Hạng C)",
    status: "ACTIVE",
    department: "Đội Ngũ Tài Xế Vận Chuyển",
    employeeCode: "TX-HAN-01",
    driverId: "drv-01",
    driverCode: "TX-HAN-01",
    createdAt: "2026-01-05T08:00:00Z",
    updatedAt: "2026-09-27T08:00:00Z",
  },
  {
    id: "usr-drv-02",
    email: "taixe.hoang@vietroute.vn",
    fullName: "Trần Minh Hoàng",
    phone: "0971.001.002",
    roleId: "role-driver",
    roleName: "DRIVER",
    roleDescription: "Tài xế phụ trách xe 29H-123.45 (GPLX Hạng C)",
    status: "ACTIVE",
    department: "Đội Ngũ Tài Xế Vận Chuyển",
    employeeCode: "TX-HAN-02",
    driverId: "drv-02",
    driverCode: "TX-HAN-02",
    createdAt: "2026-01-08T08:00:00Z",
    updatedAt: "2026-09-27T08:00:00Z",
  },
  {
    id: "usr-drv-03",
    email: "taixe.binh@vietroute.vn",
    fullName: "Lê Văn Bình",
    phone: "0971.001.003",
    roleId: "role-driver",
    roleName: "DRIVER",
    roleDescription: "Tài xế phụ trách xe 29C-884.21 (GPLX Hạng C)",
    status: "ACTIVE",
    department: "Đội Ngũ Tài Xế Vận Chuyển",
    employeeCode: "TX-HAN-03",
    driverId: "drv-03",
    driverCode: "TX-HAN-03",
    createdAt: "2026-01-12T08:00:00Z",
    updatedAt: "2026-09-27T08:00:00Z",
  },
];

const INITIAL_ROLES: RolePermissionItem[] = [
  {
    id: "role-admin",
    name: "ADMIN",
    displayName: "Quản trị viên Hệ thống",
    description: "Toàn quyền quản trị tham số kỹ thuật, bảo mật, người dùng và phân quyền",
    userCount: 2,
    permissions: DEFAULT_ROLE_PERMISSIONS.ADMIN,
  },
  {
    id: "role-manager",
    name: "MANAGER",
    displayName: "Quản lý Kho bãi & Vận hành",
    description: "Quản lý hạ tầng kho, bãi xe, giám sát KPI, phê duyệt đối soát và tài xế",
    userCount: 3,
    permissions: DEFAULT_ROLE_PERMISSIONS.MANAGER,
  },
  {
    id: "role-dispatcher",
    name: "DISPATCHER",
    displayName: "Điều phối viên Vận tải",
    description: "Quy hoạch lộ trình, gom đơn tự động, tối ưu 3D thùng xe và gán tài xế",
    userCount: 2,
    permissions: DEFAULT_ROLE_PERMISSIONS.DISPATCHER,
  },
  {
    id: "role-wh-staff",
    name: "WAREHOUSE_STAFF",
    displayName: "Thủ kho Bến bãi",
    description: "Thao tác kiosk quét mã xuất nhập kho, kiểm kê và kiểm soát cửa dock bốc dỡ",
    userCount: 2,
    permissions: DEFAULT_ROLE_PERMISSIONS.WAREHOUSE_STAFF,
  },
  {
    id: "role-driver",
    name: "DRIVER",
    displayName: "Tài xế Giao nhận",
    description: "Sử dụng ứng dụng lái xe, xác thực e-POD và theo dõi tiến độ chuyến giao",
    userCount: 3,
    permissions: DEFAULT_ROLE_PERMISSIONS.DRIVER,
  },
  {
    id: "role-accountant",
    name: "ACCOUNTANT",
    displayName: "Kế toán Tài chính",
    description: "Xử lý nộp tiền COD, đối soát giao dịch, quản lý hóa đơn và thu hồi nợ B2B",
    userCount: 1,
    permissions: DEFAULT_ROLE_PERMISSIONS.ACCOUNTANT,
  },
];

let staffStore: StaffMember[] = [...INITIAL_STAFF];
let roleStore: RolePermissionItem[] = [...INITIAL_ROLES];

export const mockUserService = {
  async getStaffList(params?: StaffFilterParams): Promise<StaffMember[]> {
    let list = [...staffStore];

    if (params?.role && params.role !== "ALL") {
      list = list.filter((s) => s.roleName === params.role);
    }

    if (params?.status && params.status !== "ALL") {
      list = list.filter((s) => s.status === params.status);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q) ||
          (s.employeeCode && s.employeeCode.toLowerCase().includes(q))
      );
    }

    return list;
  },

  async getStaffById(id: string): Promise<StaffMember | null> {
    return staffStore.find((s) => s.id === id) || null;
  },

  async createStaff(data: any): Promise<StaffMember> {
    const role = roleStore.find((r) => r.id === data.roleId || r.name === data.roleName) || roleStore[1];
    const newStaff: StaffMember = {
      id: `usr-${Date.now()}`,
      email: data.email,
      fullName: data.fullName || data.full_name,
      phone: data.phone || "",
      roleId: role.id,
      roleName: role.name,
      roleDescription: role.description,
      status: data.status || "ACTIVE",
      department: data.department || "Phòng Vận Hành",
      employeeCode: `NV-VR-${String(staffStore.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    staffStore.unshift(newStaff);
    // Update userCount in role
    const rIndex = roleStore.findIndex((r) => r.id === role.id);
    if (rIndex >= 0) {
      roleStore[rIndex].userCount += 1;
    }

    return newStaff;
  },

  async updateStaff(id: string, data: any): Promise<StaffMember> {
    const index = staffStore.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Không tìm thấy nhân viên");

    let roleName = staffStore[index].roleName;
    if (data.roleId) {
      const r = roleStore.find((x) => x.id === data.roleId);
      if (r) roleName = r.name;
    }

    staffStore[index] = {
      ...staffStore[index],
      fullName: data.fullName ?? data.full_name ?? staffStore[index].fullName,
      phone: data.phone ?? staffStore[index].phone,
      email: data.email ?? staffStore[index].email,
      roleId: data.roleId ?? staffStore[index].roleId,
      roleName,
      status: data.status ?? staffStore[index].status,
      department: data.department ?? staffStore[index].department,
      updatedAt: new Date().toISOString(),
    };

    return staffStore[index];
  },

  async updateStaffStatus(id: string, status: string): Promise<StaffMember> {
    const index = staffStore.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Không tìm thấy nhân viên");

    staffStore[index].status = status as any;
    staffStore[index].updatedAt = new Date().toISOString();
    return staffStore[index];
  },

  async deleteStaff(id: string): Promise<{ success: boolean }> {
    const user = staffStore.find((s) => s.id === id);
    if (user) {
      const rIndex = roleStore.findIndex((r) => r.id === user.roleId || r.name === user.roleName);
      if (rIndex >= 0 && roleStore[rIndex].userCount > 0) {
        roleStore[rIndex].userCount -= 1;
      }
    }
    staffStore = staffStore.filter((s) => s.id !== id);
    return { success: true };
  },

  async getRoles(): Promise<RolePermissionItem[]> {
    return roleStore;
  },

  async updateRolePermissions(roleId: string, permissions: string[], description?: string): Promise<RolePermissionItem> {
    const index = roleStore.findIndex((r) => r.id === roleId || r.name === roleId);
    if (index === -1) throw new Error("Không tìm thấy vai trò");

    roleStore[index] = {
      ...roleStore[index],
      permissions,
      description: description ?? roleStore[index].description,
    };

    return roleStore[index];
  },
};
