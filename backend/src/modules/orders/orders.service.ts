import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { DeliveryStatus, OrderPriority, OrderStatus } from '@prisma/client';
import { mapOrder } from '../../common/utils/mappers.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

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
          deliveries: {
            include: {
              driver: true,
              vehicle: true,
              history: {
                orderBy: { timestamp: 'desc' },
              },
            },
          },
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
            history: {
              orderBy: { timestamp: 'desc' },
            },
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

    // Phát sóng sự kiện Realtime Socket.IO
    this.realtimeGateway.emitOrderStatusChanged({
      orderId: updated.id,
      orderCode: updated.order_code,
      status: updated.status,
      updatedAt: updated.updated_at.toISOString(),
      message: `Đơn hàng ${updated.order_code} đã chuyển sang trạng thái: ${updated.status}`,
    });

    return mapOrder(updated);
  }

  async completePod(id: string, podDto: any) {
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID: ${id}`);
    }

    // 1. Cập nhật Order status -> DELIVERED
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.DELIVERED,
      },
      include: {
        customer: true,
        warehouse: true,
        items: true,
      },
    });

    // 2. Tìm hoặc tạo delivery tương ứng
    let delivery = await this.prisma.delivery.findFirst({
      where: { order_id: id },
    });

    if (!delivery) {
      delivery = await this.prisma.delivery.create({
        data: {
          delivery_code: `DEL-${order.orderCode}`,
          order_id: id,
          status: DeliveryStatus.DELIVERED,
          completed_at: new Date(),
        },
      });
    } else {
      delivery = await this.prisma.delivery.update({
        where: { id: delivery.id },
        data: {
          status: DeliveryStatus.DELIVERED,
          completed_at: new Date(),
        },
      });
    }

    // 3. Tạo bản ghi DeliveryStatusHistory chứa toàn bộ thông tin e-POD
    const noteJson = JSON.stringify({
      signatureUrl: podDto.signatureUrl,
      photoUrl: podDto.photoUrl,
      receiverName: podDto.receiverName || order.receiverName,
      receiverPhone: podDto.receiverPhone || order.receiverPhone,
      receiverRelation: podDto.receiverRelation || 'SELF',
      codCollected: podDto.codCollected ?? (order.codAmount > 0),
      codAmount: podDto.codAmount ?? order.codAmount,
      codPaymentMethod: podDto.codPaymentMethod || 'CASH',
      notes: podDto.notes,
      completedAt: podDto.completedAt || new Date().toISOString(),
      gpsCoords: {
        lat: podDto.gpsCoords?.lat ?? order.receiverLatitude,
        lng: podDto.gpsCoords?.lng ?? order.receiverLongitude,
      },
    });

    await this.prisma.deliveryStatusHistory.create({
      data: {
        delivery_id: delivery.id,
        status: DeliveryStatus.DELIVERED,
        description: `Xác nhận giao hàng thành công (e-POD). Người nhận: ${podDto.receiverName || order.receiverName}`,
        latitude: podDto.gpsCoords?.lat ?? podDto.latitude ?? order.receiverLatitude,
        longitude: podDto.gpsCoords?.lng ?? podDto.longitude ?? order.receiverLongitude,
        note: noteJson,
      },
    });

    // 4. Nếu có thu tiền COD và có driver, tự động tạo / cập nhật CodEntry
    if (order.codAmount > 0 && delivery.driver_id) {
      let reconciliation = await this.prisma.codReconciliation.findFirst({
        where: {
          driver_id: delivery.driver_id,
          status: 'PENDING',
        },
      });

      if (!reconciliation) {
        const recCount = await this.prisma.codReconciliation.count();
        reconciliation = await this.prisma.codReconciliation.create({
          data: {
            reconciliation_code: `COD-${new Date().getFullYear()}-${(recCount + 1).toString().padStart(3, '0')}`,
            driver_id: delivery.driver_id,
            total_orders: 1,
            total_cod_amount: order.codAmount,
            collected_amount: order.codAmount,
            submitted_amount: 0,
            discrepancy: order.codAmount,
            status: 'PENDING',
            notes: 'Phiên đối soát tự động tạo từ e-POD',
          },
        });
      } else {
        await this.prisma.codReconciliation.update({
          where: { id: reconciliation.id },
          data: {
            total_orders: { increment: 1 },
            total_cod_amount: { increment: order.codAmount },
            collected_amount: { increment: order.codAmount },
            discrepancy: { increment: order.codAmount },
          },
        });
      }

      const existingEntry = await this.prisma.codEntry.findFirst({
        where: { order_id: id },
      });
      if (!existingEntry) {
        await this.prisma.codEntry.create({
          data: {
            reconciliation_id: reconciliation.id,
            order_id: id,
            expected_cod: order.codAmount,
            actual_collected: order.codAmount,
            payment_method: podDto.codPaymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'CASH',
          },
        });
      }

      this.realtimeGateway.emitCodSubmitted({
        reconciliationId: reconciliation.id,
        driverId: delivery.driver_id,
        amount: order.codAmount,
        orderCode: order.orderCode,
        message: `Đã thu COD ${order.codAmount.toLocaleString('vi-VN')} đ cho đơn hàng ${order.orderCode} (e-POD)`,
      });
    }

    // 5. Phát WebSocket event
    this.realtimeGateway.emitOrderStatusChanged({
      orderId: updatedOrder.id,
      orderCode: updatedOrder.order_code,
      status: updatedOrder.status,
      updatedAt: updatedOrder.updated_at.toISOString(),
      message: `Đơn hàng ${updatedOrder.order_code} đã giao thành công và hoàn tất ký nhận e-POD!`,
    });

    // 6. Trả về Order đã hoàn tất
    return this.findOne(id);
  }
}
