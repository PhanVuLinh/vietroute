import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private primsa: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    //Tìm user kèm quyền
    const user = await this.primsa.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản chưa được kích hoạt');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);

    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions || [],
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role.name,
        permissions: user.role.permissions || [],
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.primsa.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone || undefined,
      role: user.role.name,
      permissions: user.role.permissions || [],
      status: user.status,
    };
  }
}
