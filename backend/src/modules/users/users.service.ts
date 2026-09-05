import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import * as bcrypt from 'bcrypt';

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
}
