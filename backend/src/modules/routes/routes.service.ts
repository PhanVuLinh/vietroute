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
}
