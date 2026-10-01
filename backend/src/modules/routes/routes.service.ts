import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRouteDto } from './dto/create-route.dto.js';
import { RouteStatus, RouteStopStatus } from '@prisma/client';
import { mapRoute } from '../../common/utils/mappers.js';

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: { status?: string; driverId?: string; search?: string }) {
    const where: any = {};

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as RouteStatus;
    }

    if (query?.driverId && query.driverId !== 'ALL') {
      where.driver_id = query.driverId;
    }

    if (query?.search) {
      where.OR = [
        { route_code: { contains: query.search, mode: 'insensitive' } },
        { route_name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const list = await this.prisma.route.findMany({
      where,
      include: {
        driver: true,
        vehicle: true,
        warehouse: true,
        stops: {
          orderBy: { sequence: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return list.map(mapRoute);
  }

  async findOne(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        driver: true,
        vehicle: true,
        warehouse: true,
        stops: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!route) {
      throw new NotFoundException(`Không tìm thấy tuyến đường với ID: ${id}`);
    }

    return mapRoute(route);
  }

  async create(dto: CreateRouteDto) {
    const route = await this.prisma.route.create({
      data: {
        route_code: dto.routeCode,
        route_name: dto.routeName,
        driver_id: dto.driverId,
        vehicle_id: dto.vehicleId,
        warehouse_id: dto.warehouseId,
        total_distance: dto.totalDistance,
        estimated_duration: dto.estimatedDuration,
        status: dto.status ?? RouteStatus.PLANNED,
        toll_fee_est_vnd: dto.tollFeeEstVND ?? 0,
        fuel_est_liters: dto.fuelEstLiters ?? 0,
        total_weight_kg: dto.totalWeightKg ?? 0,
        total_volume_m3: dto.totalVolumeM3 ?? 0,
        polyline: dto.polyline ?? null,
        traffic_alerts: dto.trafficAlerts ?? null,
        stops: dto.stops
          ? {
              create: dto.stops.map((s) => ({
                delivery_id: s.deliveryId,
                sequence: s.sequence,
                latitude: s.latitude,
                longitude: s.longitude,
                customer_name: s.customerName,
                customer_phone: s.customerPhone,
                address: s.address,
                order_code: s.orderCode,
                weight_kg: s.weightKg,
                package_count: s.packageCount,
                time_window_start: s.timeWindowStart,
                time_window_end: s.timeWindowEnd,
                notes: s.notes,
              })),
            }
          : undefined,
      },
      include: {
        driver: true,
        vehicle: true,
        warehouse: true,
        stops: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    return mapRoute(route);
  }

  async update(id: string, data: any) {
    await this.findOne(id);

    const updated = await this.prisma.route.update({
      where: { id },
      data: {
        route_name: data.routeName,
        status: data.status,
        total_distance: data.totalDistance,
        estimated_duration: data.estimatedDuration,
      },
      include: {
        driver: true,
        vehicle: true,
        warehouse: true,
        stops: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    return mapRoute(updated);
  }

  async updateStatus(id: string, status: RouteStatus) {
    await this.findOne(id);

    const data: any = { status };
    if (status === RouteStatus.ACTIVE) {
      data.started_at = new Date();
    }
    if (status === RouteStatus.COMPLETED) {
      data.completed_at = new Date();
    }

    const updated = await this.prisma.route.update({
      where: { id },
      data,
      include: {
        driver: true,
        vehicle: true,
        warehouse: true,
        stops: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    return mapRoute(updated);
  }

  async updateStopStatus(
    routeId: string,
    stopId: string,
    status: RouteStopStatus,
  ) {
    await this.findOne(routeId);

    const data: any = { status };
    if (status === RouteStopStatus.ARRIVED) {
      data.actual_arrival = new Date();
    }

    await this.prisma.routeStop.update({
      where: { id: stopId },
      data,
    });

    return this.findOne(routeId);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.route.delete({ where: { id } });
    return true;
  }

  /**
   * Thuật toán Nearest Neighbor Tối ưu hóa thứ tự các điểm dừng (Stop Optimization)
   */
  optimizeStops(originCoords: [number, number], stops: any[]) {
    if (!stops || stops.length <= 1) return stops;

    const remaining = [...stops];
    const optimized: any[] = [];
    let currentPos = { lng: originCoords[0], lat: originCoords[1] };

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let minDistance = Number.MAX_VALUE;

      for (let i = 0; i < remaining.length; i++) {
        const s = remaining[i];
        const dist = Math.hypot(s.longitude - currentPos.lng, s.latitude - currentPos.lat);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = i;
        }
      }

      const [selected] = remaining.splice(nearestIdx, 1);
      selected.sequence = optimized.length + 1;
      optimized.push(selected);
      currentPos = { lng: selected.longitude, lat: selected.latitude };
    }

    return optimized;
  }

  // ================= ROUTE TEMPLATES =================
  private mapRouteTemplate(r: any) {
    return {
      id: r.id,
      name: r.name,
      category: r.category,
      description: r.description,
      warehouseId: r.warehouse_id,
      totalDistance: r.total_distance,
      estimatedDuration: r.estimated_duration,
      fuelEstLiters: r.fuel_est_liters,
      tollFeeEstVND: r.toll_fee_est_vnd,
      totalWeightKg: r.total_weight_kg,
      totalVolumeM3: r.total_volume_m3,
      trafficAlerts: r.traffic_alerts || [],
      stops: r.stops || [],
    };
  }

  async getTemplates() {
    const count = await this.prisma.routeTemplateRecord.count();
    if (count === 0) {
      await this.seedDefaultRouteTemplates();
    }
    const list = await this.prisma.routeTemplateRecord.findMany({
      orderBy: { created_at: 'asc' },
    });
    return list.map((r) => this.mapRouteTemplate(r));
  }

  async createTemplate(data: any) {
    const created = await this.prisma.routeTemplateRecord.create({
      data: {
        name: data.name,
        category: data.category || 'RETAIL',
        description: data.description || '',
        warehouse_id: data.warehouseId || '',
        total_distance: data.totalDistance || 0,
        estimated_duration: data.estimatedDuration || 0,
        fuel_est_liters: data.fuelEstLiters || 0,
        toll_fee_est_vnd: data.tollFeeEstVND || 0,
        total_weight_kg: data.totalWeightKg || 0,
        total_volume_m3: data.totalVolumeM3 || 0,
        traffic_alerts: data.trafficAlerts || [],
        stops: data.stops || [],
      },
    });
    return this.mapRouteTemplate(created);
  }

  async deleteTemplate(id: string) {
    await this.prisma.routeTemplateRecord.delete({ where: { id } });
    return true;
  }

  private async seedDefaultRouteTemplates() {
    const defaultTemplates = [
      {
        id: 'tpl-hn-retail',
        name: 'Tuyến Phân phối Siêu thị & Đại lý Nội thành Hà Nội',
        category: 'RETAIL',
        description: 'Cung ứng định kỳ hàng ngày cho chuỗi siêu thị BigC, Aeon Mall, Vincom nội thành',
        warehouse_id: 'wh-hn-lb',
        total_distance: 38.5,
        estimated_duration: 110,
        fuel_est_liters: 9.6,
        toll_fee_est_vnd: 35000,
        total_weight_kg: 1850,
        total_volume_m3: 8.5,
        traffic_alerts: ['Mật độ cao giờ cao điểm tại nút giao Khuất Duy Tiến'],
        stops: [
          {
            sequence: 1,
            latitude: 21.0365,
            longitude: 105.789,
            customerName: 'Công ty Công nghệ FPT Cầu Giấy',
            customerPhone: '0912.345.678',
            address: 'Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội',
            orderCode: 'ORD-TPL-01',
            weightKg: 650,
            packageCount: 12,
            timeWindowStart: '08:15',
            timeWindowEnd: '09:00',
            estimatedArrival: '08:30',
            status: 'PENDING',
            notes: 'Giao sảnh lễ tân tầng 1',
          },
          {
            sequence: 2,
            latitude: 21.025,
            longitude: 105.772,
            customerName: 'Đại siêu thị Big C Thăng Long',
            customerPhone: '0934.567.890',
            address: '222 Trần Duy Hưng, Trung Hòa, Cầu Giấy, Hà Nội',
            orderCode: 'ORD-TPL-02',
            weightKg: 800,
            packageCount: 25,
            timeWindowStart: '09:15',
            timeWindowEnd: '10:30',
            estimatedArrival: '09:45',
            status: 'PENDING',
            notes: 'Cửa nhập hàng B2, liên hệ thủ kho A. Tuấn',
          },
          {
            sequence: 3,
            latitude: 20.978,
            longitude: 105.778,
            customerName: 'Trung tâm TM Aeon Mall Hà Đông',
            customerPhone: '0988.776.655',
            address: 'Khu đô thị Dương Nội, Hà Đông, Hà Nội',
            orderCode: 'ORD-TPL-03',
            weightKg: 400,
            packageCount: 8,
            timeWindowStart: '10:45',
            timeWindowEnd: '11:45',
            estimatedArrival: '11:00',
            status: 'PENDING',
            notes: 'Giao cổng sau khu bốc dỡ hàng',
          },
        ],
      },
      {
        id: 'tpl-hcm-south',
        name: 'Tuyến Tiếp tế Chuỗi Bách Hóa Xanh Nam Sài Gòn',
        category: 'RETAIL',
        description: 'Cung ứng thực phẩm và hàng tiêu dùng Cát Lái -> Q7 -> Phú Mỹ Hưng -> Nhà Bè',
        warehouse_id: 'wh-hcm-cl',
        total_distance: 46.8,
        estimated_duration: 130,
        fuel_est_liters: 12.4,
        toll_fee_est_vnd: 40000,
        total_weight_kg: 2400,
        total_volume_m3: 11.2,
        traffic_alerts: ['Cầu Kênh Tẻ ùn tắc hướng vào trung tâm'],
        stops: [
          {
            sequence: 1,
            latitude: 10.7325,
            longitude: 106.7188,
            customerName: 'Bách Hóa Xanh Huỳnh Tấn Phát',
            customerPhone: '0901.223.344',
            address: '789 Huỳnh Tấn Phát, P. Tân Phú, Quận 7, TP.HCM',
            orderCode: 'ORD-TPL-04',
            weightKg: 1100,
            packageCount: 30,
            timeWindowStart: '07:30',
            timeWindowEnd: '08:30',
            estimatedArrival: '08:00',
            status: 'PENDING',
            notes: 'Hàng đông lạnh cần dỡ trước',
          },
          {
            sequence: 2,
            latitude: 10.7289,
            longitude: 106.7082,
            customerName: 'Cửa hàng Tiện lợi Circle K Phú Mỹ Hưng',
            customerPhone: '0908.112.233',
            address: 'Số 15 Nguyễn Đức Cảnh, Tân Phong, Quận 7, TP.HCM',
            orderCode: 'ORD-TPL-05',
            weightKg: 500,
            packageCount: 15,
            timeWindowStart: '08:45',
            timeWindowEnd: '09:45',
            estimatedArrival: '09:15',
            status: 'PENDING',
            notes: 'Giao trước 10:00 sáng',
          },
        ],
      },
      {
        id: 'tpl-dn-industrial',
        name: 'Tuyến Hàng Dự án & Vật tư KCN Hòa Khánh Đà Nẵng',
        category: 'INDUSTRIAL',
        description: 'Vận chuyển linh kiện cơ khí, máy móc từ Cảng Tiên Sa đến các nhà xưởng Hòa Khánh',
        warehouse_id: 'wh-dn-ts',
        total_distance: 28.2,
        estimated_duration: 65,
        fuel_est_liters: 8.5,
        toll_fee_est_vnd: 25000,
        total_weight_kg: 4200,
        total_volume_m3: 14.0,
        traffic_alerts: [],
        stops: [
          {
            sequence: 1,
            latitude: 16.0754,
            longitude: 108.1456,
            customerName: 'Nhà máy Cơ khí Chính xác Hòa Khánh',
            customerPhone: '0935.123.456',
            address: 'Đường số 3, KCN Hòa Khánh, Liên Chiểu, Đà Nẵng',
            orderCode: 'ORD-TPL-07',
            weightKg: 2500,
            packageCount: 5,
            timeWindowStart: '08:30',
            timeWindowEnd: '10:00',
            estimatedArrival: '09:15',
            status: 'PENDING',
            notes: 'Cần xe nâng hỗ trợ hạ hàng pallet thép',
          },
        ],
      },
    ];

    for (const tpl of defaultTemplates) {
      await this.prisma.routeTemplateRecord.upsert({
        where: { id: tpl.id },
        update: {},
        create: tpl,
      });
    }
  }
}
