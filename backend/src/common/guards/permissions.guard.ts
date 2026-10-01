import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { PrismaService } from '../../modules/prisma/prisma.service.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../../modules/users/users.service.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Bạn chưa được xác thực danh tính');
    }

    // Quản trị viên (ADMIN) luôn có toàn quyền trong hệ thống
    if (user.role === 'ADMIN') {
      return true;
    }

    // Lấy danh sách quyền từ token JWT hoặc truy vấn bảng roles trong PostgreSQL
    let userPermissions: string[] = user.permissions;
    if (!userPermissions || !Array.isArray(userPermissions) || userPermissions.length === 0) {
      const role = await this.prisma.role.findUnique({
        where: { name: user.role },
      });
      userPermissions = (role?.permissions && role.permissions.length > 0)
        ? role.permissions
        : (DEFAULT_ROLE_PERMISSIONS[user.role] || []);
    }

    const hasPermission = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Bạn không có đủ quyền hạn để thực hiện thao tác này (Yêu cầu quyền: ${requiredPermissions.join(', ')})`,
      );
    }

    return true;
  }
}
