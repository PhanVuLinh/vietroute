import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    const isDevFallback =
      process.env.NODE_ENV !== 'production' &&
      process.env.NODE_ENV !== 'test' &&
      process.env.ENFORCE_AUTH !== 'true';

    if (!token) {
      if (isDevFallback) {
        // Ở chế độ phát triển nội bộ: Tự động gán người dùng Quản trị viên mặc định
        request['user'] = {
          sub: 'usr-admin-01',
          email: 'admin@vietroute.com',
          role: 'ADMIN',
        };
        return true;
      }
      throw new UnauthorizedException('Thiếu mã xác thực (Authorization header)');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'vietroute-secret-key-2026',
      });

      request['user'] = payload;
    } catch {
      if (isDevFallback) {
        // Nếu token hết hạn: Fallback người dùng hợp lệ trong dev
        request['user'] = {
          sub: 'usr-admin-01',
          email: 'admin@vietroute.com',
          role: 'ADMIN',
        };
        return true;
      }
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
