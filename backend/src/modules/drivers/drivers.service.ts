import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDriverDto } from './dto/create-driver.dto.js';
import { UpdateDriverDto } from './dto/update-driver.dto.js';
import { DriverStatus, LicenseType, UserStatus } from '@prisma/client';
import { mapDriver } from '../../common/utils/mappers.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: { status?: string; search?: string; licenseType?: string }) {
    const where: any = {};

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as DriverStatus;
    }

    if (query?.licenseType && query.licenseType !== 'ALL') {
      where.license_type = query.licenseType as LicenseType;
    }

    if (query?.search) {
      where.OR = [
        { driver_code: { contains: query.search, mode: 'insensitive' } },
        { full_name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { license_number: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const list = await this.prisma.driver.findMany({
      where,
      include: {
        current_vehicle: true,
        user: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return list.map(mapDriver);
  }

  async findOne(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        current_vehicle: true,
        user: true,
      },
    });

    if (!driver) {
      throw new NotFoundException(`Không tìm thấy tài xế với ID: ${id}`);
    }

    return mapDriver(driver);
  }

  async create(dto: CreateDriverDto) {
    // 1. Tìm hoặc tạo Role DRIVER
    let driverRole = await this.prisma.role.findUnique({
      where: { name: 'DRIVER' },
    });

    if (!driverRole) {
      driverRole = await this.prisma.role.create({
        data: { name: 'DRIVER', description: 'Tài xế vận chuyển' },
      });
    }

    // 2. Tự tạo tài khoản User liên kết
    const defaultEmail = `${dto.driverCode.toLowerCase().replace(/[^a-z0-9]/g, '')}@vietroute.vn`;
    const hashedPassword = await bcrypt.hash('123456', 10);

    const user = await this.prisma.user.create({
      data: {
        email: defaultEmail,
        password_hash: hashedPassword,
        full_name: dto.fullName,
        phone: dto.phone,
        role_id: driverRole.id,
        status: UserStatus.ACTIVE,
      },
    });

    // 3. Tạo Driver
    const driver = await this.prisma.driver.create({
      data: {
        user_id: user.id,
        driver_code: dto.driverCode,
        full_name: dto.fullName,
        phone: dto.phone,
        license_number: dto.licenseNumber,
        license_type: dto.licenseType,
        license_expired_at: new Date(dto.licenseExpiredAt),
        status: dto.status ?? DriverStatus.AVAILABLE,
        current_location_lat: dto.currentLocationLat ?? 21.0285,
        current_location_lng: dto.currentLocationLng ?? 105.8544,
      },
      include: {
        current_vehicle: true,
        user: true,
      },
    });

    if (dto.currentVehicleId) {
      await this.prisma.vehicle.update({
        where: { id: dto.currentVehicleId },
        data: { driver_id: driver.id },
      });
    }

    return mapDriver(driver);
  }

  async update(id: string, dto: UpdateDriverDto) {
    await this.findOne(id);

    const data: any = {};
    if (dto.driverCode !== undefined) data.driver_code = dto.driverCode;
    if (dto.fullName !== undefined) data.full_name = dto.fullName;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.licenseNumber !== undefined) data.license_number = dto.licenseNumber;
    if (dto.licenseType !== undefined) data.license_type = dto.licenseType;
    if (dto.licenseExpiredAt !== undefined)
      data.license_expired_at = new Date(dto.licenseExpiredAt);
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.currentLocationLat !== undefined)
      data.current_location_lat = dto.currentLocationLat;
    if (dto.currentLocationLng !== undefined)
      data.current_location_lng = dto.currentLocationLng;
    if (dto.onTimeRate !== undefined) data.on_time_rate = dto.onTimeRate;
    if (dto.successRate !== undefined) data.success_rate = dto.successRate;

    const updated = await this.prisma.driver.update({
      where: { id },
      data,
      include: {
        current_vehicle: true,
        user: true,
      },
    });

    if (dto.currentVehicleId !== undefined) {
      // Bỏ liên kết xe cũ nếu có
      await this.prisma.vehicle.updateMany({
        where: { driver_id: id },
        data: { driver_id: null },
      });

      if (dto.currentVehicleId) {
        await this.prisma.vehicle.update({
          where: { id: dto.currentVehicleId },
          data: { driver_id: id },
        });
      }
    }

    return mapDriver(updated);
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);

    const updated = await this.prisma.driver.update({
      where: { id },
      data: { status: status as DriverStatus },
      include: {
        current_vehicle: true,
        user: true,
      },
    });

    return mapDriver(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.driver.delete({ where: { id } });
    return true;
  }
}
