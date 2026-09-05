import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
        password_hash: hashedPassword,
        role_id: createUserDto.role_id,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        status: true,
        role: { select: { name: true } },
      },
    });
    return newUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng này');
    }

    // Nếu muốn đổi email, phải kiểm tra xem email mới đã bị ai dùng chưa
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new BadRequestException(
          'Email mới đã được sử dụng trong hệ thống',
        );
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        full_name: true,
        status: true,
        role: { select: { name: true } },
      },
    });
  }

  // Khóa hoặc mở khóa tài khoản
  async updateStatus(id: string, status: string) {
    // Chỉ cho phép 2 trạng thái này
    if (status !== 'ACTIVE' && status !== 'INACTIVE') {
      throw new BadRequestException(
        'Trạng thái không hợp lệ (chỉ nhận ACTIVE hoặc INACTIVE)',
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng này');
    }

    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });
  }
}
