import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { VehicleStatus, VehicleType } from '@prisma/client';
import { mapVehicle } from '../../common/utils/mappers.js';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: { status?: string; type?: string; search?: string }) {
    const where: any = {};

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as VehicleStatus;
    }

    if (query?.type && query.type !== 'ALL') {
      where.type = query.type as VehicleType;
    }

    if (query?.search) {
      where.OR = [
        { vehicle_code: { contains: query.search, mode: 'insensitive' } },
        { license_plate: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
        { model: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const list = await this.prisma.vehicle.findMany({
      where,
      include: {
        driver: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return list.map(mapVehicle);
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        driver: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Không tìm thấy phương tiện với ID: ${id}`);
    }

    return mapVehicle(vehicle);
  }

  async create(dto: CreateVehicleDto) {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        vehicle_code: dto.vehicleCode,
        license_plate: dto.licensePlate,
        type: dto.type,
        brand: dto.brand,
        model: dto.model,
        capacity_weight: dto.capacityWeight,
        capacity_volume: dto.capacityVolume,
        current_mileage: dto.currentMileage ?? 0,
        fuel_percent: dto.fuelPercent ?? 100,
        status: dto.status ?? VehicleStatus.AVAILABLE,
        driver_id: dto.driverId,
        next_maintenance_date: dto.nextMaintenanceDate
          ? new Date(dto.nextMaintenanceDate)
          : null,
        inspection_certificate_number: dto.inspectionCertificateNumber,
        last_inspection_date: dto.lastInspectionDate
          ? new Date(dto.lastInspectionDate)
          : null,
        inspection_expiry_date: dto.inspectionExpiryDate
          ? new Date(dto.inspectionExpiryDate)
          : null,
        insurance_expiry_date: dto.insuranceExpiryDate
          ? new Date(dto.insuranceExpiryDate)
          : null,
        inspection_center: dto.inspectionCenter,
        inspection_notes: dto.inspectionNotes,
      },
      include: {
        driver: true,
      },
    });

    return mapVehicle(vehicle);
  }

  async update(id: string, dto: UpdateVehicleDto) {
    await this.findOne(id);

    const data: any = {};
    if (dto.vehicleCode !== undefined) data.vehicle_code = dto.vehicleCode;
    if (dto.licensePlate !== undefined) data.license_plate = dto.licensePlate;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.brand !== undefined) data.brand = dto.brand;
    if (dto.model !== undefined) data.model = dto.model;
    if (dto.capacityWeight !== undefined) data.capacity_weight = dto.capacityWeight;
    if (dto.capacityVolume !== undefined) data.capacity_volume = dto.capacityVolume;
    if (dto.currentMileage !== undefined) data.current_mileage = dto.currentMileage;
    if (dto.fuelPercent !== undefined) data.fuel_percent = dto.fuelPercent;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.driverId !== undefined) data.driver_id = dto.driverId;
    if (dto.nextMaintenanceDate !== undefined)
      data.next_maintenance_date = dto.nextMaintenanceDate
        ? new Date(dto.nextMaintenanceDate)
        : null;
    if (dto.inspectionCertificateNumber !== undefined)
      data.inspection_certificate_number = dto.inspectionCertificateNumber;
    if (dto.lastInspectionDate !== undefined)
      data.last_inspection_date = dto.lastInspectionDate
        ? new Date(dto.lastInspectionDate)
        : null;
    if (dto.inspectionExpiryDate !== undefined)
      data.inspection_expiry_date = dto.inspectionExpiryDate
        ? new Date(dto.inspectionExpiryDate)
        : null;
    if (dto.insuranceExpiryDate !== undefined)
      data.insurance_expiry_date = dto.insuranceExpiryDate
        ? new Date(dto.insuranceExpiryDate)
        : null;
    if (dto.inspectionCenter !== undefined)
      data.inspection_center = dto.inspectionCenter;
    if (dto.inspectionNotes !== undefined)
      data.inspection_notes = dto.inspectionNotes;

    const updated = await this.prisma.vehicle.update({
      where: { id },
      data,
      include: {
        driver: true,
      },
    });

    return mapVehicle(updated);
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);

    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: { status: status as VehicleStatus },
      include: { driver: true },
    });

    return mapVehicle(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.vehicle.delete({ where: { id } });
    return true;
  }
}
