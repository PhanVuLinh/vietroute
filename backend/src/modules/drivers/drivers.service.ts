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

  /**
   * Lấy ca chạy hiện tại của tài xế trực tiếp từ PostgreSQL (Routes, Stops, Orders)
   */
  async getActiveShift(identifier?: string) {
    let driver = null;
    if (identifier && identifier !== 'default' && identifier !== 'me') {
      driver = await this.prisma.driver.findFirst({
        where: {
          OR: [
            { id: identifier },
            { driver_code: identifier },
            { user_id: identifier },
            { phone: identifier },
          ],
        },
        include: {
          current_vehicle: true,
          user: true,
        },
      });
    }

    if (!driver) {
      driver = await this.prisma.driver.findFirst({
        include: {
          current_vehicle: true,
          user: true,
        },
        orderBy: { current_delivery_count: 'desc' },
      });
    }

    if (!driver) {
      throw new NotFoundException('Không tìm thấy tài xế khả dụng trong hệ thống');
    }

    let route = await this.prisma.route.findFirst({
      where: {
        driver_id: driver.id,
        status: { in: ['ACTIVE', 'PLANNED'] },
      },
      include: {
        vehicle: true,
        stops: {
          orderBy: { sequence: 'asc' },
          include: {
            delivery: {
              include: {
                order: {
                  include: {
                    customer: true,
                    items: true,
                  },
                },
                history: {
                  orderBy: { timestamp: 'desc' },
                },
              },
            },
          },
        },
      },
    });

    if (!route) {
      route = await this.prisma.route.findFirst({
        where: { driver_id: driver.id },
        include: {
          vehicle: true,
          stops: {
            orderBy: { sequence: 'asc' },
            include: {
              delivery: {
                include: {
                  order: {
                    include: {
                      customer: true,
                      items: true,
                    },
                  },
                  history: {
                    orderBy: { timestamp: 'desc' },
                  },
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    }

    const vehicle = route?.vehicle || driver.current_vehicle;

    let stops: any[] = [];
    let totalCodExpected = 0;
    let totalCodCollected = 0;

    if (route && route.stops.length > 0) {
      stops = route.stops.map((s, idx) => {
        const order = s.delivery?.order;
        const cod = order?.cod_amount || 0;
        totalCodExpected += cod;

        let pod: any = undefined;
        const isDelivered = s.status === 'COMPLETED' || s.delivery?.status === 'DELIVERED';
        if (isDelivered) {
          totalCodCollected += cod;
          const hist = s.delivery?.history?.find((h) => h.status === 'DELIVERED' && h.note);
          if (hist?.note) {
            try {
              pod = JSON.parse(hist.note);
            } catch {
              pod = { receiverName: order?.receiver_name, completedAt: hist.timestamp };
            }
          }
        }

        const itemsSummary = order?.items && order.items.length > 0
          ? order.items.map((it) => `${it.product_name} (${it.quantity} kiện)`).join(', ')
          : 'Hàng hóa đóng kiện chuẩn';

        let stopStatus: 'PENDING' | 'ARRIVED' | 'DELIVERING' | 'DELIVERED' | 'FAILED' = 'PENDING';
        if (isDelivered) {
          stopStatus = 'DELIVERED';
        } else if (idx === 0 || s.status === 'ARRIVED') {
          stopStatus = 'DELIVERING';
        }

        return {
          id: s.id,
          sequence: s.sequence,
          orderId: order?.id || s.delivery_id || `ord-${idx}`,
          orderCode: order?.order_code || s.order_code || `VR-2026-${(idx + 1).toString().padStart(3, '0')}`,
          customerName: order?.receiver_name || s.customer_name || 'Khách hàng',
          customerPhone: order?.receiver_phone || s.customer_phone || '0988.123.456',
          address: order?.receiver_address || s.address || 'Hà Nội',
          lat: s.latitude,
          lng: s.longitude,
          weightKg: order?.total_weight || s.weight_kg || 15.0,
          packagesCount: s.package_count || (order?.items ? order.items.length : 1),
          codAmount: cod,
          priority: order?.priority || 'NORMAL',
          status: stopStatus,
          estimatedArrival: s.estimated_arrival ? new Date(s.estimated_arrival).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '10:00',
          timeWindow: `${s.time_window_start || '08:30'} - ${s.time_window_end || '11:30'}`,
          itemsSummary,
          pod,
        };
      });
    } else {
      const assignedDeliveries = await this.prisma.delivery.findMany({
        where: { driver_id: driver.id },
        include: {
          order: { include: { customer: true, items: true } },
          history: { orderBy: { timestamp: 'desc' } },
        },
        take: 6,
      });

      stops = assignedDeliveries.map((del, idx) => {
        const order = del.order;
        const cod = order?.cod_amount || 0;
        totalCodExpected += cod;
        const isDelivered = del.status === 'DELIVERED';
        if (isDelivered) totalCodCollected += cod;

        const itemsSummary = order?.items && order.items.length > 0
          ? order.items.map((it) => `${it.product_name} (${it.quantity} kiện)`).join(', ')
          : 'Hàng hóa đóng gói';

        return {
          id: del.id,
          sequence: idx + 1,
          orderId: order.id,
          orderCode: order.order_code,
          customerName: order.receiver_name,
          customerPhone: order.receiver_phone,
          address: order.receiver_address,
          lat: order.receiver_latitude,
          lng: order.receiver_longitude,
          weightKg: order.total_weight,
          packagesCount: order.items?.length || 1,
          codAmount: cod,
          priority: order.priority,
          status: isDelivered ? 'DELIVERED' : (idx === 0 ? 'DELIVERING' : 'PENDING'),
          estimatedArrival: '10:30',
          timeWindow: '09:00 - 12:00',
          itemsSummary,
        };
      });
    }

    const completedCount = stops.filter((s) => s.status === 'DELIVERED').length;

    return {
      driverId: driver.id,
      driverName: driver.full_name,
      driverCode: driver.driver_code,
      phone: driver.phone,
      vehiclePlate: vehicle?.license_plate || '29C-VIETROUTE',
      vehicleName: vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.capacity_weight / 1000} Tấn)` : 'Xe chuyên dụng',
      routeCode: route?.route_code || `ROUTE-${driver.driver_code}`,
      routeName: route?.route_name || `Tuyến giao vận hành ${driver.full_name}`,
      totalStops: stops.length,
      completedStops: completedCount,
      pendingStops: stops.length - completedCount,
      totalDistanceKm: route?.total_distance || 32.5,
      totalCodExpected,
      totalCodCollected,
      stops,
    };
  }
}
