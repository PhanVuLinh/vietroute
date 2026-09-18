import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { DeliveryStatus, OrderPriority, OrderStatus } from '@prisma/client';
import { mapOrder } from '../../common/utils/mappers.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    search?: string;
    warehouseId?: string;
  }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query?.status && query.status !== 'ALL') {
      where.status = query.status as OrderStatus;
    }

    if (query?.priority && query.priority !== 'ALL') {
      where.priority = query.priority as OrderPriority;
    }

    if (query?.warehouseId && query.warehouseId !== 'ALL') {
      where.warehouse_id = query.warehouseId;
    }

    if (query?.search) {
      where.OR = [
        { order_code: { contains: query.search, mode: 'insensitive' } },
        { receiver_name: { contains: query.search, mode: 'insensitive' } },
        { receiver_phone: { contains: query.search, mode: 'insensitive' } },
        { receiver_address: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          warehouse: true,
          items: true,
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return {
      items: orders.map(mapOrder),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        warehouse: true,
        items: true,
        deliveries: {
          include: {
            driver: true,
            vehicle: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID: ${id}`);
    }

    return mapOrder(order);
  }

  async create(dto: CreateOrderDto) {
    // Tự động tính khối lượng & thể tích nếu chưa có
    let totalWeight = dto.totalWeight ?? 0;
    let totalVolume = dto.totalVolume ?? 0;

    if (dto.items && dto.items.length > 0) {
      if (!dto.totalWeight) {
        totalWeight = dto.items.reduce(
          (acc, item) => acc + item.weight * item.quantity,
          0,
        );
      }
      if (!dto.totalVolume) {
        totalVolume = dto.items.reduce(
          (acc, item) => acc + item.volume * item.quantity,
          0,
        );
      }
    }

    const order = await this.prisma.order.create({
      data: {
        order_code: dto.orderCode,
        customer_id: dto.customerId,
        warehouse_id: dto.warehouseId,
        receiver_name: dto.receiverName,
        receiver_phone: dto.receiverPhone,
        receiver_address: dto.receiverAddress,
        receiver_latitude: dto.receiverLatitude,
        receiver_longitude: dto.receiverLongitude,
        total_weight: totalWeight,
        total_volume: totalVolume,
        cod_amount: dto.codAmount ?? 0,
        priority: dto.priority ?? OrderPriority.NORMAL,
        delivery_window_start: dto.deliveryWindowStart
          ? new Date(dto.deliveryWindowStart)
          : null,
        delivery_window_end: dto.deliveryWindowEnd
          ? new Date(dto.deliveryWindowEnd)
          : null,
        status: dto.status ?? OrderStatus.PENDING,
        items: dto.items
          ? {
              create: dto.items.map((it) => ({
                product_name: it.productName,
                quantity: it.quantity,
                weight: it.weight,
                volume: it.volume,
                is_fragile: it.isFragile ?? false,
                is_liquid: it.isLiquid ?? false,
                requires_special_handling: it.requiresSpecialHandling ?? false,
              })),
            }
          : undefined,
      },
      include: {
        customer: true,
        warehouse: true,
        items: true,
      },
    });

    // Tự động tạo bản ghi Delivery tương ứng ở trạng thái PENDING
    const deliveryCode = `DEL-${order.order_code}`;
    await this.prisma.delivery.create({
      data: {
        delivery_code: deliveryCode,
        order_id: order.id,
        status: DeliveryStatus.PENDING,
      },
    });

    return mapOrder(order);
  }

  async updateStatus(id: string, status: OrderStatus) {
    await this.findOne(id);

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        warehouse: true,
        items: true,
      },
    });

    // Đồng bộ trạng thái chuyến giao nếu có
    if (status === OrderStatus.DELIVERED) {
      await this.prisma.delivery.updateMany({
        where: { order_id: id },
        data: {
          status: DeliveryStatus.DELIVERED,
          completed_at: new Date(),
        },
      });
    } else if (status === OrderStatus.CANCELLED) {
      await this.prisma.delivery.updateMany({
        where: { order_id: id },
        data: { status: DeliveryStatus.CANCELLED },
      });
    }

    return mapOrder(updated);
  }
}
