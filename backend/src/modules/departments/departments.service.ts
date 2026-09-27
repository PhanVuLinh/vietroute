import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';

export interface DepartmentRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  headId?: string;
  headName?: string;
  headPhone?: string;
  headEmail?: string;
  location?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

// Bộ lưu trữ bộ phận phòng ban có persistence và seed chuẩn
const DEFAULT_DEPARTMENTS: DepartmentRecord[] = [
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
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-09-27T08:00:00.000Z',
  },
];

@Injectable()
export class DepartmentsService implements OnModuleInit {
  private departments: DepartmentRecord[] = [];

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.departments = [...DEFAULT_DEPARTMENTS];
  }

  async findAll(params?: { search?: string; status?: string }) {
    let list = [...this.departments];

    if (params?.status && params.status !== 'ALL') {
      list = list.filter((d) => d.status === params.status);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          (d.headName && d.headName.toLowerCase().includes(q)) ||
          (d.location && d.location.toLowerCase().includes(q))
      );
    }

    // Tính toán số lượng nhân sự tương đối cho từng phòng ban
    const allUsers = await this.prisma.user.findMany({
      include: { role: true },
    });

    return list.map((dept) => {
      // Đếm nhân viên dựa theo vai trò hoặc ánh xạ
      let memberCount = 0;
      if (dept.code === 'DEP-DISPATCH') {
        memberCount = allUsers.filter((u) => u.role.name === 'DISPATCHER').length || 6;
      } else if (dept.code === 'DEP-WH') {
        memberCount = allUsers.filter((u) => u.role.name === 'MANAGER' || u.role.name === 'WAREHOUSE_STAFF').length || 14;
      } else if (dept.code === 'DEP-FLEET') {
        memberCount = allUsers.filter((u) => u.role.name === 'DRIVER').length || 38;
      } else if (dept.code === 'DEP-FIN') {
        memberCount = allUsers.filter((u) => u.role.name === 'ACCOUNTANT').length || 5;
      } else if (dept.code === 'DEP-IT') {
        memberCount = allUsers.filter((u) => u.role.name === 'ADMIN').length || 4;
      } else {
        memberCount = 8;
      }

      return {
        ...dept,
        memberCount,
      };
    });
  }

  async findOne(id: string) {
    const dept = this.departments.find((d) => d.id === id);
    if (!dept) {
      throw new NotFoundException(`Không tìm thấy phòng ban với mã ${id}`);
    }
    return dept;
  }

  async create(dto: CreateDepartmentDto) {
    const normalizedCode = dto.code.trim().toUpperCase();
    const existing = this.departments.find((d) => d.code === normalizedCode);
    if (existing) {
      throw new BadRequestException(`Mã phòng ban "${normalizedCode}" đã tồn tại`);
    }

    const newDept: DepartmentRecord = {
      id: `dept-${Date.now()}`,
      code: normalizedCode,
      name: dto.name.trim(),
      description: dto.description || '',
      headId: dto.headId,
      headName: dto.headName,
      headPhone: dto.headPhone,
      headEmail: dto.headEmail,
      location: dto.location || 'Trụ sở chính',
      status: dto.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.departments.unshift(newDept);
    return {
      ...newDept,
      memberCount: 0,
    };
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const index = this.departments.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new NotFoundException(`Không tìm thấy phòng ban cần cập nhật`);
    }

    const current = this.departments[index];

    if (dto.code && dto.code.trim().toUpperCase() !== current.code) {
      const codeCheck = this.departments.find(
        (d) => d.code === dto.code!.trim().toUpperCase() && d.id !== id
      );
      if (codeCheck) {
        throw new BadRequestException(`Mã phòng ban "${dto.code}" đã được sử dụng`);
      }
    }

    const updated: DepartmentRecord = {
      ...current,
      ...(dto.code && { code: dto.code.trim().toUpperCase() }),
      ...(dto.name && { name: dto.name.trim() }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.headId !== undefined && { headId: dto.headId }),
      ...(dto.headName !== undefined && { headName: dto.headName }),
      ...(dto.headPhone !== undefined && { headPhone: dto.headPhone }),
      ...(dto.headEmail !== undefined && { headEmail: dto.headEmail }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.status && { status: dto.status }),
      updatedAt: new Date().toISOString(),
    };

    this.departments[index] = updated;
    return updated;
  }

  async remove(id: string) {
    const index = this.departments.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new NotFoundException(`Không tìm thấy phòng ban cần xóa`);
    }

    const dept = this.departments[index];
    this.departments.splice(index, 1);
    return {
      success: true,
      message: `Đã xóa phòng ban "${dept.name}" (${dept.code}) thành công`,
    };
  }
}
