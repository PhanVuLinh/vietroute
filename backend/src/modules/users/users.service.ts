import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto.js';

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    'orders:view', 'orders:create', 'orders:edit', 'orders:delete', 'orders:pod',
    'dispatch:view', 'dispatch:auto', 'dispatch:manual', 'dispatch:3d_load',
    'tracking:view', 'tracking:telemetry', 'tracking:geofence',
    'fleet:view', 'fleet:manage', 'drivers:view', 'drivers:manage', 'drivers:ranking',
    'warehouses:view', 'warehouses:manage', 'warehouses:kiosk', 'warehouses:inventory',
    'routes:view', 'routes:create', 'routes:optimize',
    'finance:cod_view', 'finance:cod_reconcile', 'finance:billing_view', 'finance:debt_remind',
    'reports:view', 'reports:export', 'ai:assistant', 'audit:view',
    'staff:view', 'staff:manage', 'roles:manage'
  ],
  MANAGER: [
    'orders:view', 'orders:create', 'orders:edit', 'orders:pod',
    'dispatch:view', 'dispatch:auto', 'dispatch:manual', 'dispatch:3d_load',
    'tracking:view', 'tracking:telemetry',
    'fleet:view', 'drivers:view', 'drivers:manage', 'drivers:ranking',
    'warehouses:view', 'warehouses:manage', 'warehouses:kiosk', 'warehouses:inventory',
    'routes:view', 'routes:create', 'routes:optimize',
    'finance:cod_view', 'finance:billing_view',
    'reports:view', 'ai:assistant', 'audit:view',
    'staff:view'
  ],
  DISPATCHER: [
    'orders:view', 'orders:create', 'orders:edit',
    'dispatch:view', 'dispatch:auto', 'dispatch:manual', 'dispatch:3d_load',
    'tracking:view', 'tracking:telemetry',
    'fleet:view', 'drivers:view', 'drivers:ranking',
    'warehouses:view',
    'routes:view', 'routes:create', 'routes:optimize',
    'ai:assistant'
  ],
  WAREHOUSE_STAFF: [
    'orders:view', 'orders:pod',
    'dispatch:view', 'dispatch:3d_load',
    'warehouses:view', 'warehouses:kiosk', 'warehouses:inventory'
  ],
  DRIVER: [
    'orders:view', 'orders:pod',
    'tracking:view',
    'routes:view'
  ],
  ACCOUNTANT: [
    'orders:view',
    'finance:cod_view', 'finance:cod_reconcile', 'finance:billing_view', 'finance:debt_remind',
    'reports:view', 'reports:export'
  ]
};

// In-memory or cached custom permissions map for runtime tuning
const rolePermissionsCache = new Map<string, string[]>();

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: { role?: string; status?: string; search?: string }) {
    await this.ensureSeedStaff();

    const where: any = {};

    if (params?.role && params.role !== 'ALL') {
      where.role = { name: params.role };
    }

    if (params?.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { full_name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        role: { select: { id: true, name: true, description: true } },
        driver: { select: { id: true, driver_code: true, license_type: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      phone: u.phone || '',
      roleId: u.role_id,
      roleName: u.role.name,
      roleDescription: u.role.description || '',
      status: u.status,
      driverId: u.driver?.id || null,
      driverCode: u.driver?.driver_code || null,
      createdAt: u.created_at.toISOString(),
      updatedAt: u.updated_at.toISOString(),
    }));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: { select: { id: true, name: true, description: true } },
        driver: { select: { id: true, driver_code: true, license_type: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng này');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone || '',
      roleId: user.role_id,
      roleName: user.role.name,
      roleDescription: user.role.description || '',
      status: user.status,
      driverId: user.driver?.id || null,
      driverCode: user.driver?.driver_code || null,
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at.toISOString(),
    };
  }

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (userExists) {
      throw new BadRequestException('Email này đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        full_name: createUserDto.full_name,
        phone: createUserDto.phone || null,
        password_hash: hashedPassword,
        role_id: createUserDto.role_id,
        status: 'ACTIVE',
      },
      include: {
        role: { select: { id: true, name: true, description: true } },
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.full_name,
      phone: newUser.phone || '',
      roleId: newUser.role_id,
      roleName: newUser.role.name,
      status: newUser.status,
      createdAt: newUser.created_at.toISOString(),
      updatedAt: newUser.updated_at.toISOString(),
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng này');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new BadRequestException('Email mới đã được sử dụng trong hệ thống');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(updateUserDto.email && { email: updateUserDto.email }),
        ...(updateUserDto.full_name && { full_name: updateUserDto.full_name }),
        ...(updateUserDto.phone !== undefined && { phone: updateUserDto.phone }),
        ...(updateUserDto.role_id && { role_id: updateUserDto.role_id }),
        ...(updateUserDto.status && { status: updateUserDto.status }),
      },
      include: {
        role: { select: { id: true, name: true, description: true } },
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      fullName: updated.full_name,
      phone: updated.phone || '',
      roleId: updated.role_id,
      roleName: updated.role.name,
      status: updated.status,
      createdAt: updated.created_at.toISOString(),
      updatedAt: updated.updated_at.toISOString(),
    };
  }

  async updateStatus(id: string, status: string) {
    if (status !== 'ACTIVE' && status !== 'INACTIVE' && status !== 'SUSPENDED') {
      throw new BadRequestException('Trạng thái không hợp lệ (chỉ nhận ACTIVE, INACTIVE hoặc SUSPENDED)');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng này');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: status as any },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });

    return updated;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng cần xóa');
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: 'Đã xóa người dùng thành công' };
  }

  async getRoles() {
    await this.ensureSeedStaff();

    const roles = await this.prisma.role.findMany({
      include: {
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });

    return roles.map((r) => {
      const perms = rolePermissionsCache.get(r.id) || DEFAULT_ROLE_PERMISSIONS[r.name] || [];
      return {
        id: r.id,
        name: r.name,
        description: r.description || `Vai trò ${r.name}`,
        userCount: r._count.users,
        permissions: perms,
      };
    });
  }

  async updateRolePermissions(roleId: string, permissions: string[], description?: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Không tìm thấy vai trò này');
    }

    rolePermissionsCache.set(roleId, permissions);

    if (description !== undefined) {
      await this.prisma.role.update({
        where: { id: roleId },
        data: { description },
      });
    }

    return {
      id: role.id,
      name: role.name,
      description: description || role.description,
      permissions,
      message: 'Đã cập nhật ma trận phân quyền thành công',
    };
  }

  /**
   * Tự động bổ sung nhân sự vận hành mẫu (Thủ kho, Quản lý kho, Kế toán) vào CSDL nếu chưa có
   */
  private async ensureSeedStaff() {
    try {
      // 1. Đảm bảo vai trò ACCOUNTANT tồn tại
      let accountantRole = await this.prisma.role.findUnique({ where: { name: 'ACCOUNTANT' } });
      if (!accountantRole) {
        accountantRole = await this.prisma.role.create({
          data: {
            name: 'ACCOUNTANT',
            description: 'Kế toán viên đối soát COD & thu hồi công nợ',
          },
        });
      }

      const managerRole = await this.prisma.role.findUnique({ where: { name: 'MANAGER' } });
      const warehouseRole = await this.prisma.role.findUnique({ where: { name: 'WAREHOUSE_STAFF' } });

      const defaultPassword = await bcrypt.hash('123456', 10);

      // 2. Bổ sung Quản lý kho nếu chưa có
      if (managerRole) {
        const sampleManagers = [
          { email: 'nam.th@vietroute.vn', name: 'Trần Hữu Nam', phone: '0912834192' },
          { email: 'khiem.vd@vietroute.vn', name: 'Vũ Đình Khiêm', phone: '0913834193' },
          { email: 'trong.pd@vietroute.vn', name: 'Phan Đình Trọng', phone: '0914834194' },
          { email: 'tuan.lm@vietroute.vn', name: 'Lê Minh Tuấn', phone: '0915834195' },
        ];

        for (const m of sampleManagers) {
          const exists = await this.prisma.user.findUnique({ where: { email: m.email } });
          if (!exists) {
            await this.prisma.user.create({
              data: {
                email: m.email,
                full_name: m.name,
                phone: m.phone,
                password_hash: defaultPassword,
                role_id: managerRole.id,
                status: 'ACTIVE',
              },
            });
          }
        }
      }

      // 3. Bổ sung Thủ kho bến bãi nếu chưa có
      if (warehouseRole) {
        const sampleWarehouseStaff = [
          { email: 'thukho.linh@vietroute.vn', name: 'Nguyễn Diệu Linh', phone: '0922834101' },
          { email: 'thukho.kien@vietroute.vn', name: 'Hoàng Trung Kiên', phone: '0922834102' },
          { email: 'thukho.dat@vietroute.vn', name: 'Đỗ Thành Đạt', phone: '0922834103' },
        ];

        for (const ws of sampleWarehouseStaff) {
          const exists = await this.prisma.user.findUnique({ where: { email: ws.email } });
          if (!exists) {
            await this.prisma.user.create({
              data: {
                email: ws.email,
                full_name: ws.name,
                phone: ws.phone,
                password_hash: defaultPassword,
                role_id: warehouseRole.id,
                status: 'ACTIVE',
              },
            });
          }
        }
      }

      // 4. Bổ sung Kế toán nếu chưa có
      if (accountantRole) {
        const sampleAccountants = [
          { email: 'ketoan.mai@vietroute.vn', name: 'Phạm Phương Mai', phone: '0933834201' },
          { email: 'ketoan.ngoc@vietroute.vn', name: 'Trần Bích Ngọc', phone: '0933834202' },
        ];

        for (const acc of sampleAccountants) {
          const exists = await this.prisma.user.findUnique({ where: { email: acc.email } });
          if (!exists) {
            await this.prisma.user.create({
              data: {
                email: acc.email,
                full_name: acc.name,
                phone: acc.phone,
                password_hash: defaultPassword,
                role_id: accountantRole.id,
                status: 'ACTIVE',
              },
            });
          }
        }
      }
    } catch (e) {
      // Ignore if seeding already handled
    }
  }
}
