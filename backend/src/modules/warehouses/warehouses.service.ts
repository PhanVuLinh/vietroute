import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateWarehouseDto } from './dto/create-warehouse.dto.js';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto.js';
import {
  WarehouseRegion,
  WarehouseStatus,
  WarehouseType,
} from '@prisma/client';
import { mapWarehouse } from '../../common/utils/mappers.js';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: {
    region?: string;
    type?: string;
    status?: string;
    search?: string;
  }) {
    const where: any = {};

    if (query?.region && query.region !== 'ALL') {
      where.region = query.region as WarehouseRegion;
    }

    if (query?.type && query.type !== 'ALL') {
      where.type = query.type as WarehouseType;
    }

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as WarehouseStatus;
    }

    if (query?.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const list = await this.prisma.warehouse.findMany({
      where,
      include: {
        zones: true,
        dock_doors: true,
      },
      orderBy: { created_at: 'asc' },
    });

    return list.map(mapWarehouse);
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        zones: true,
        dock_doors: true,
      },
    });

    if (!warehouse) {
      throw new NotFoundException(`Không tìm thấy kho bãi với ID: ${id}`);
    }

    return mapWarehouse(warehouse);
  }

  async create(dto: CreateWarehouseDto) {
    const warehouse = await this.prisma.warehouse.create({
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type,
        region: dto.region,
        address: dto.address,
        city: dto.city,
        latitude: dto.latitude,
        longitude: dto.longitude,
        opening_time: dto.openingTime ?? '06:00',
        closing_time: dto.closingTime ?? '22:00',
        capacity: dto.capacity,
        used_capacity: dto.usedCapacity ?? 0,
        area_sqm: dto.areaSqM,
        total_pallets: dto.totalPallets,
        dock_doors_count: dto.dockDoors ?? 4,
        storage_type: dto.storageType,
        manager_name: dto.managerName,
        manager_phone: dto.managerPhone,
        manager_email: dto.managerEmail,
        status: dto.status ?? WarehouseStatus.ACTIVE,
      },
      include: {
        zones: true,
        dock_doors: true,
      },
    });

    return mapWarehouse(warehouse);
  }

  async update(id: string, dto: UpdateWarehouseDto) {
    await this.findOne(id);

    const data: any = {};
    if (dto.code !== undefined) data.code = dto.code;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.region !== undefined) data.region = dto.region;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.latitude !== undefined) data.latitude = dto.latitude;
    if (dto.longitude !== undefined) data.longitude = dto.longitude;
    if (dto.openingTime !== undefined) data.opening_time = dto.openingTime;
    if (dto.closingTime !== undefined) data.closing_time = dto.closingTime;
    if (dto.capacity !== undefined) data.capacity = dto.capacity;
    if (dto.usedCapacity !== undefined) data.used_capacity = dto.usedCapacity;
    if (dto.areaSqM !== undefined) data.area_sqm = dto.areaSqM;
    if (dto.totalPallets !== undefined) data.total_pallets = dto.totalPallets;
    if (dto.dockDoors !== undefined) data.dock_doors_count = dto.dockDoors;
    if (dto.storageType !== undefined) data.storage_type = dto.storageType;
    if (dto.managerName !== undefined) data.manager_name = dto.managerName;
    if (dto.managerPhone !== undefined) data.manager_phone = dto.managerPhone;
    if (dto.managerEmail !== undefined) data.manager_email = dto.managerEmail;
    if (dto.status !== undefined) data.status = dto.status;

    const updated = await this.prisma.warehouse.update({
      where: { id },
      data,
      include: {
        zones: true,
        dock_doors: true,
      },
    });

    return mapWarehouse(updated);
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);

    const updated = await this.prisma.warehouse.update({
      where: { id },
      data: { status: status as WarehouseStatus },
      include: {
        zones: true,
        dock_doors: true,
      },
    });

    return mapWarehouse(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.warehouse.delete({ where: { id } });
    return true;
  }
}
