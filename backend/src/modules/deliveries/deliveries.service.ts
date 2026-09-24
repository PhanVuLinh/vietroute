import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { DeliveryStatus, OrderStatus } from '@prisma/client';
import { mapDelivery } from '../../common/utils/mappers.js';

@Injectable()
export class DeliveriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: {
    page?: number;
    limit?: number;
    status?: string;
    driverId?: string;
    vehicleId?: string;
  }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as DeliveryStatus;
    }

    if (query?.driverId && query.driverId !== 'ALL') {
      where.driver_id = query.driverId;
    }

    if (query?.vehicleId && query.vehicleId !== 'ALL') {
      where.vehicle_id = query.vehicleId;
    }

    const [total, list] = await Promise.all([
      this.prisma.delivery.count({ where }),
      this.prisma.delivery.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: true,
          driver: true,
          vehicle: true,
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return {
      items: list.map(mapDelivery),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: {
        order: true,
        driver: true,
        vehicle: true,
        history: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!delivery) {
      throw new NotFoundException(`Không tìm thấy chuyến giao với ID: ${id}`);
    }

    return mapDelivery(delivery);
  }

  async findHistory(id: string) {
    await this.findOne(id);

    const history = await this.prisma.deliveryStatusHistory.findMany({
      where: { delivery_id: id },
      orderBy: { timestamp: 'asc' },
    });

    return history.map((h) => ({
      id: h.id,
      deliveryId: h.delivery_id,
      status: h.status,
      timestamp: h.timestamp.toISOString(),
      description: h.description,
      location: h.latitude && h.longitude ? [h.longitude, h.latitude] : undefined,
      note: h.note,
    }));
  }

  async updateStatus(id: string, status: DeliveryStatus, note?: string) {
    const delivery = await this.findOne(id);
    if (!delivery) {
      throw new NotFoundException(`Không tìm thấy chuyến giao với ID: ${id}`);
    }

    const data: any = { status };
    if (status === DeliveryStatus.IN_TRANSIT && !delivery.startedAt) {
      data.started_at = new Date();
    }
    if (status === DeliveryStatus.DELIVERED) {
      data.completed_at = new Date();
    }

    const updated = await this.prisma.delivery.update({
      where: { id },
      data,
      include: {
        order: true,
        driver: true,
        vehicle: true,
      },
    });

    // Thêm bản ghi lịch sử
    await this.prisma.deliveryStatusHistory.create({
      data: {
        delivery_id: id,
        status,
        description: `Cập nhật trạng thái chuyến giao thành ${status}`,
        note: note ?? null,
      },
    });

    // Đồng bộ ngược lại Order status
    let mappedOrderStatus: OrderStatus | undefined;
    if (status === DeliveryStatus.DELIVERED) mappedOrderStatus = OrderStatus.DELIVERED;
    if (status === DeliveryStatus.IN_TRANSIT) mappedOrderStatus = OrderStatus.IN_TRANSIT;
    if (status === DeliveryStatus.PICKING_UP) mappedOrderStatus = OrderStatus.PICKING_UP;
    if (status === DeliveryStatus.CANCELLED) mappedOrderStatus = OrderStatus.CANCELLED;

    if (mappedOrderStatus && delivery.orderId) {
      await this.prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: mappedOrderStatus },
      });
    }

    return mapDelivery(updated);
  }

  async completePod(id: string, podDto: any) {
    const delivery = await this.findOne(id);
    if (!delivery) {
      throw new NotFoundException(`Không tìm thấy chuyến giao với ID: ${id}`);
    }

    const updated = await this.prisma.delivery.update({
      where: { id },
      data: {
        status: DeliveryStatus.DELIVERED,
        completed_at: new Date(),
      },
      include: {
        order: true,
        driver: true,
        vehicle: true,
      },
    });

    const noteJson = JSON.stringify({
      signatureUrl: podDto.signatureUrl,
      photoUrl: podDto.photoUrl,
      receiverName: podDto.receiverName || delivery.receiverName,
      receiverPhone: podDto.receiverPhone || delivery.receiverPhone,
      receiverRelation: podDto.receiverRelation || 'SELF',
      codCollected: podDto.codCollected ?? false,
      codAmount: podDto.codAmount ?? 0,
      codPaymentMethod: podDto.codPaymentMethod || 'CASH',
      notes: podDto.notes,
      completedAt: podDto.completedAt || new Date().toISOString(),
      gpsCoords: podDto.gpsCoords,
    });

    await this.prisma.deliveryStatusHistory.create({
      data: {
        delivery_id: id,
        status: DeliveryStatus.DELIVERED,
        description: `Xác nhận giao hàng thành công (e-POD). Người nhận: ${podDto.receiverName || delivery.receiverName}`,
        latitude: podDto.gpsCoords?.lat ?? null,
        longitude: podDto.gpsCoords?.lng ?? null,
        note: noteJson,
      },
    });

    if (delivery.orderId) {
      await this.prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: OrderStatus.DELIVERED },
      });
    }

    return mapDelivery(updated);
  }
}
