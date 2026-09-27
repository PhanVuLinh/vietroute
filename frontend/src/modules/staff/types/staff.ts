import type { UserStatus } from "@/core/types/auth";

export type OperationalRole =
  | "ADMIN"
  | "MANAGER"
  | "DISPATCHER"
  | "WAREHOUSE_STAFF"
  | "DRIVER"
  | "ACCOUNTANT";

export interface StaffMember {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  roleId: string;
  roleName: OperationalRole | string;
  roleDescription?: string;
  status: UserStatus | "ACTIVE" | "INACTIVE" | "SUSPENDED";
  department?: string;
  employeeCode?: string;
  driverId?: string | null;
  driverCode?: string | null;
  assignedWarehouse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffFilterParams {
  search?: string;
  role?: string;
  status?: string;
}

export interface RolePermissionItem {
  id: string;
  name: string;
  displayName: string;
  description: string;
  userCount: number;
  permissions: string[];
}

export interface PermissionDefinition {
  key: string;
  label: string;
  description: string;
}

export interface PermissionGroup {
  categoryKey: string;
  categoryLabel: string;
  categoryIcon: string;
  permissions: PermissionDefinition[];
}

export const SYSTEM_PERMISSIONS: PermissionGroup[] = [
  {
    categoryKey: "orders",
    categoryLabel: "Quản lý Đơn hàng & Vận đơn",
    categoryIcon: "Package",
    permissions: [
      { key: "orders:view", label: "Xem danh sách đơn hàng", description: "Truy cập tra cứu, lọc và xem thông tin chi tiết đơn hàng" },
      { key: "orders:create", label: "Tạo mới đơn hàng", description: "Nhập liệu đơn hàng mới từ khách hàng hoặc tải tệp Excel" },
      { key: "orders:edit", label: "Chỉnh sửa đơn hàng", description: "Cập nhật địa chỉ nhận, khối lượng, COD và thời gian giao" },
      { key: "orders:delete", label: "Hủy & Xóa đơn", description: "Thao tác hủy hoặc xóa đơn hàng khỏi hệ thống" },
      { key: "orders:pod", label: "Xác thực e-POD", description: "Ký nhận và xem bằng chứng giao hàng điện tử" },
    ],
  },
  {
    categoryKey: "dispatch",
    categoryLabel: "Điều phối & Quy hoạch 3D",
    categoryIcon: "Waypoints",
    permissions: [
      { key: "dispatch:view", label: "Xem bảng điều phối", description: "Xem danh sách đơn chờ phân bổ và ca chạy phương tiện" },
      { key: "dispatch:auto", label: "Điều phối tự động AI", description: "Kích hoạt thuật toán gom đơn và gán xe tự động" },
      { key: "dispatch:manual", label: "Điều phối thủ công", description: "Chỉ định tài xế và phương tiện cụ thể cho đơn hàng" },
      { key: "dispatch:3d_load", label: "Xếp tải 3D xe tải", description: "Mô phỏng 3D thể tích thùng xe và tối ưu thứ tự dỡ LIFO" },
    ],
  },
  {
    categoryKey: "tracking",
    categoryLabel: "Giám sát Vận tải GPS",
    categoryIcon: "Map",
    permissions: [
      { key: "tracking:view", label: "Xem bản đồ giám sát", description: "Theo dõi vị trí phương tiện và lộ trình giao hàng trực quan" },
      { key: "tracking:telemetry", label: "Telemetry GPS thời gian thực", description: "Nhận luồng dữ liệu tốc độ, góc lái và nhiên liệu" },
      { key: "tracking:geofence", label: "Cảnh báo Geofence", description: "Nhận cảnh báo khi xe lệch tuyến hoặc vi phạm ranh giới bến bãi" },
    ],
  },
  {
    categoryKey: "warehouses",
    categoryLabel: "Kho bãi & Quản lý Tồn kho (WMS)",
    categoryIcon: "Warehouse",
    permissions: [
      { key: "warehouses:view", label: "Xem danh mục kho & Hub", description: "Xem thông tin sức chứa, vị trí và công suất bến bãi" },
      { key: "warehouses:manage", label: "Thêm/sửa kho bãi", description: "Cập nhật hồ sơ pháp lý, PCCC, sức chứa và phân khu kho" },
      { key: "warehouses:kiosk", label: "Kiosk quét mã vạch", description: "Sử dụng màn hình cảm ứng quét mã bốc hàng lên xe" },
      { key: "warehouses:inventory", label: "Quản lý xuất nhập tồn", description: "Tạo phiếu nhập kho, xuất kho và chuyển kho nội bộ" },
    ],
  },
  {
    categoryKey: "fleet",
    categoryLabel: "Đội xe & Đội ngũ Tài xế",
    categoryIcon: "Truck",
    permissions: [
      { key: "fleet:view", label: "Xem danh sách xe", description: "Tra cứu biển số, tải trọng, loại thùng và hạn đăng kiểm" },
      { key: "fleet:manage", label: "Quản lý hồ sơ xe", description: "Thêm mới xe, cập nhật bảo dưỡng và phân quyền sử dụng" },
      { key: "drivers:view", label: "Xem danh sách tài xế", description: "Tra cứu GPLX, số điện thoại và trạng thái làm việc" },
      { key: "drivers:manage", label: "Quản trị tài xế", description: "Phê duyệt hồ sơ, gán xe cố định và khóa tài xế vi phạm" },
      { key: "drivers:ranking", label: "Bảng vinh danh tài xế", description: "Theo dõi KPI, OTD và bảng xếp hạng thi đua nội bộ" },
    ],
  },
  {
    categoryKey: "finance",
    categoryLabel: "Tài chính, COD & Công nợ",
    categoryIcon: "Wallet",
    permissions: [
      { key: "finance:cod_view", label: "Xem danh sách nộp COD", description: "Kiểm tra số tiền thu hộ của từng tài xế theo ca" },
      { key: "finance:cod_reconcile", label: "Duyệt đối soát COD", description: "Xác nhận khớp lệnh tiền về tài khoản ngân hàng" },
      { key: "finance:billing_view", label: "Xem hóa đơn B2B", description: "Tra cứu công nợ khách hàng doanh nghiệp" },
      { key: "finance:debt_remind", label: "Quét nhắc nợ đa kênh", description: "Kích hoạt gửi SMS/Email và tạo mã VietQR nhắc nợ tự động" },
    ],
  },
  {
    categoryKey: "admin",
    categoryLabel: "Quản trị Nhân sự & Phân quyền",
    categoryIcon: "ShieldCheck",
    permissions: [
      { key: "staff:view", label: "Xem danh sách nhân sự", description: "Tra cứu nhân sự các phòng ban vận hành" },
      { key: "staff:manage", label: "Thêm/sửa nhân sự", description: "Tạo tài khoản nhân viên, đổi vai trò và khóa tài khoản" },
      { key: "roles:manage", label: "Cấu hình ma trận phân quyền", description: "Điều chỉnh quyền hạn chi tiết cho từng vai trò" },
      { key: "audit:view", label: "Xem nhật ký kiểm toán", description: "Tra cứu lịch sử thao tác dữ liệu và an ninh hệ thống" },
    ],
  },
];
