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

    // Tự động lưu thông báo và phát sóng WebSocket
    try {
      const notif = await this.prisma.notification.create({
        data: {
          title: 'Đơn hàng mới',
          message: `Đơn hàng ${order.order_code} đã được tạo thành công cho khách hàng ${order.customer?.name || order.receiver_name}.`,
          type: 'ORDER_CREATED',
          priority: order.priority === 'URGENT' ? 'URGENT' : 'NORMAL',
          reference_id: order.order_code,
        },
      });
      this.realtimeGateway.emitBroadcastNotification({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        read: false,
        priority: notif.priority,
        referenceId: notif.reference_id,
        createdAt: notif.created_at.toISOString(),
      });
    } catch (e) {
      console.warn('Lỗi tạo thông báo đơn hàng mới:', e);
    }

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

    // Tự động lưu thông báo và phát sóng notification:new
    try {
      if (status === OrderStatus.IN_TRANSIT) {
        const notif = await this.prisma.notification.create({
          data: {
            title: 'Đơn hàng đang giao',
            message: `Đơn hàng ${updated.order_code} đã bắt đầu rời kho và đang trên đường giao tới ${updated.receiver_address}.`,
            type: 'ORDER_ASSIGNED',
            priority: 'NORMAL',
            reference_id: updated.order_code,
          },
        });
        this.realtimeGateway.emitBroadcastNotification({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          read: false,
          priority: notif.priority,
          referenceId: notif.reference_id,
          createdAt: notif.created_at.toISOString(),
        });
      } else if (status === OrderStatus.DELIVERED) {
        const notif = await this.prisma.notification.create({
          data: {
            title: 'Giao hàng thành công',
            message: `Đơn hàng ${updated.order_code} đã hoàn tất giao hàng thành công tới ${updated.receiver_name}.`,
            type: 'DELIVERY_SUCCESS',
            priority: 'NORMAL',
            reference_id: updated.order_code,
          },
        });
        this.realtimeGateway.emitBroadcastNotification({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          read: false,
          priority: notif.priority,
          referenceId: notif.reference_id,
          createdAt: notif.created_at.toISOString(),
        });
      }
    } catch (e) {
      console.warn('Lỗi tạo thông báo trạng thái đơn hàng:', e);
    }

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
        id: reconciliation.id,
        reconciliationId: reconciliation.id,
        reconciliationCode: reconciliation.reconciliation_code || '',
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

    // 6. Tự động lưu thông báo hoàn tất e-POD
    try {
      const notif = await this.prisma.notification.create({
        data: {
          title: 'Đã hoàn tất e-POD',
          message: `Biên bản giao hàng điện tử đơn ${updatedOrder.order_code} đã được tài xế xác nhận thành công kèm chữ ký.`,
          type: 'DELIVERY_SUCCESS',
          priority: 'NORMAL',
          reference_id: updatedOrder.order_code,
        },
      });
      this.realtimeGateway.emitBroadcastNotification({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        read: false,
        priority: notif.priority,
        referenceId: notif.reference_id,
        createdAt: notif.created_at.toISOString(),
      });
    } catch (e) {
      console.warn('Lỗi tạo thông báo hoàn tất e-POD:', e);
    }

    // 7. Trả về Order đã hoàn tất
    return this.findOne(id);
  }

  /**
   * Tra cứu công khai hành trình vận đơn (không yêu cầu token đăng nhập)
   */
  async getPublicTracking(orderCode: string) {
    const cleanCode = (orderCode || '').trim();
    if (!cleanCode) {
      throw new NotFoundException('Vui lòng cung cấp mã vận đơn hợp lệ.');
    }

    // 1. Tìm Order theo order_code trong CSDL PostgreSQL
    const order = await this.prisma.order.findFirst({
      where: {
        order_code: {
          equals: cleanCode,
          mode: 'insensitive',
        },
      },
      include: {
        customer: true,
        warehouse: true,
        items: true,
        deliveries: {
          orderBy: { created_at: 'desc' },
          include: {
            driver: {
              include: {
                current_vehicle: true,
              },
            },
            vehicle: true,
            history: {
              orderBy: { timestamp: 'asc' },
            },
          },
        },
      },
    });

    // Nếu không có trong DB, ném lỗi NotFoundException
    if (!order) {
      throw new NotFoundException(`Không tìm thấy thông tin đơn hàng với mã: ${orderCode}`);
    }

    // 2. Trích xuất thông tin giao hàng & tài xế
    const activeDelivery = order.deliveries?.[0];
    const driver = activeDelivery?.driver;
    const vehicle = activeDelivery?.vehicle || driver?.current_vehicle;

    // 3. Phân tích e-POD nếu có
    let podData: any = null;
    if (order.status === OrderStatus.DELIVERED && activeDelivery?.history) {
      const deliveredHistory = [...activeDelivery.history]
        .reverse()
        .find((h) => h.status === DeliveryStatus.DELIVERED && h.note);

      if (deliveredHistory && deliveredHistory.note) {
        try {
          const parsed = JSON.parse(deliveredHistory.note);
          if (parsed.signatureUrl) {
            podData = {
              signedBy: parsed.receiverName || order.receiver_name,
              signedAt: new Date(deliveredHistory.timestamp).toLocaleString('vi-VN'),
              signatureUrl: parsed.signatureUrl,
              photoUrl: parsed.photoUrl || undefined,
              codCollected: parsed.codCollected,
              codPaymentMethod: parsed.codPaymentMethod,
              notes: parsed.notes,
            };
          }
        } catch {
          podData = {
            signedBy: order.receiver_name,
            signedAt: new Date(deliveredHistory.timestamp).toLocaleString('vi-VN'),
            signatureUrl: '',
            notes: deliveredHistory.note,
          };
        }
      }
    }

    // 4. Xây dựng các mốc thời gian (Timeline steps)
    const steps: Array<{
      title: string;
      time: string;
      location: string;
      description: string;
      completed: boolean;
      current?: boolean;
    }> = [];

    const createdTimeStr = new Date(order.created_at).toLocaleString('vi-VN');

    // Bước 1: Đơn hàng tiếp nhận
    steps.push({
      title: 'Đơn hàng đã tiếp nhận',
      time: createdTimeStr,
      location: 'Hệ thống VietRoute',
      description: `Đơn hàng vận chuyển được tạo thành công bởi ${order.customer?.name || 'Khách hàng'}.`,
      completed: true,
      current: order.status === OrderStatus.PENDING,
    });

    // Bước 2: Xuất kho / Phân bổ xe
    const isAssignedOrLater = ([
      OrderStatus.ASSIGNED,
      OrderStatus.PICKING_UP,
      OrderStatus.IN_TRANSIT,
      OrderStatus.DELIVERED,
    ] as OrderStatus[]).includes(order.status);

    steps.push({
      title: order.status === OrderStatus.PENDING ? 'Đang chuẩn bị hàng tại kho' : 'Đã phân bổ & Xuất kho',
      time: activeDelivery?.started_at
        ? new Date(activeDelivery.started_at).toLocaleString('vi-VN')
        : createdTimeStr,
      location: order.warehouse?.name || 'Tổng kho VietRoute',
      description: driver
        ? `Đã phân bổ cho tài xế ${driver.full_name} (${vehicle?.license_plate || 'Xe tải chuyên dụng'}).`
        : `Hàng hóa đang được lưu trữ và kiểm đếm tại ${order.warehouse?.name || 'kho'}.`,
      completed: isAssignedOrLater,
      current: order.status === OrderStatus.ASSIGNED || order.status === OrderStatus.PICKING_UP,
    });

    // Bước 3: Đang giao hàng
    const isInTransitOrDelivered = ([OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED] as OrderStatus[]).includes(order.status);
    steps.push({
      title: 'Tài xế đang giao hàng',
      time: activeDelivery?.started_at
        ? new Date(activeDelivery.started_at).toLocaleString('vi-VN')
        : 'Đang cập nhật',
      location: driver ? `Tuyến đường hướng tới ${order.receiver_address}` : 'Tuyến vận chuyển',
      description: driver
        ? `Tài xế ${driver.full_name} đang di chuyển giao hàng đến bạn.`
        : 'Kiện hàng đang được trung chuyển chặng cuối.',
      completed: isInTransitOrDelivered,
      current: order.status === OrderStatus.IN_TRANSIT,
    });

    // Bước 4: Giao hàng thành công / e-POD
    const isDelivered = order.status === OrderStatus.DELIVERED;
    steps.push({
      title: isDelivered ? 'Giao hàng thành công' : 'Chờ giao hàng & Ký nhận e-POD',
      time: activeDelivery?.completed_at
        ? new Date(activeDelivery.completed_at).toLocaleString('vi-VN')
        : order.delivery_window_end
        ? `Dự kiến trước ${new Date(order.delivery_window_end).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
        : 'Trong ngày hôm nay',
      location: order.receiver_address,
      description: isDelivered
        ? `Khách hàng đã nhận hàng và xác nhận biên bản điện tử e-POD.`
        : 'Tài xế sẽ liên hệ trước khi đến địa chỉ của bạn.',
      completed: isDelivered,
      current: isDelivered,
    });

    // Bản đồ trạng thái tiếng Việt
    const statusTextMap: Record<string, string> = {
      PENDING: 'Đã tiếp nhận - Đang xử lý',
      CONFIRMED: 'Đã xác nhận đơn hàng',
      ASSIGNED: 'Đã điều phối xe & tài xế',
      PICKING_UP: 'Đang lấy hàng tại kho',
      IN_TRANSIT: 'Đang trên đường giao hàng',
      DELIVERED: 'Giao hàng thành công',
      FAILED: 'Giao hàng không thành công',
      CANCELLED: 'Đơn hàng đã hủy',
    };

    // Tóm tắt danh mục hàng
    const itemsSummary =
      order.items && order.items.length > 0
        ? order.items.map((i) => `${i.product_name} (${i.quantity} kiện)`).join(', ')
        : `${order.total_weight} kg hàng hóa`;

    // Thời gian giao dự kiến
    let estimatedDelivery = 'Hôm nay';
    if (order.status === OrderStatus.DELIVERED) {
      estimatedDelivery = activeDelivery?.completed_at
        ? `Đã giao lúc ${new Date(activeDelivery.completed_at).toLocaleString('vi-VN')}`
        : 'Đã hoàn tất giao hàng';
    } else if (order.delivery_window_end) {
      estimatedDelivery = `Dự kiến trước ${new Date(order.delivery_window_end).toLocaleString('vi-VN')}`;
    } else {
      estimatedDelivery = 'Hôm nay, trong ca làm việc';
    }

    return {
      orderCode: order.order_code,
      id: order.id,
      senderName: order.customer?.name || order.warehouse?.name || 'Tổng kho VietRoute',
      senderAddress: order.warehouse?.address || 'Hà Nội, Việt Nam',
      receiverName: order.receiver_name,
      receiverPhone: order.receiver_phone,
      receiverAddress: order.receiver_address,
      warehouseName: order.warehouse?.name || 'Tổng kho VietRoute',
      warehouseAddress: order.warehouse?.address || '',
      status: order.status,
      statusText: statusTextMap[order.status] || order.status,
      priority: order.priority,
      codAmount: order.cod_amount,
      weightKg: order.total_weight,
      itemsSummary,
      createdAt: createdTimeStr,
      estimatedDelivery,
      driver: driver
        ? {
            name: driver.full_name,
            phone: driver.phone,
            vehiclePlate: vehicle?.license_plate || '29C-VIETROUTE',
            vehicleModel: `${vehicle?.brand || 'Xe tải'} ${vehicle?.model || ''}`.trim(),
            rating: driver.on_time_rate ? +(driver.on_time_rate / 20).toFixed(1) : 4.9,
            currentLocation: [
              driver.current_location_lng || 105.8544,
              driver.current_location_lat || 21.0285,
            ] as [number, number],
          }
        : undefined,
      steps,
      originCoords: [
        order.warehouse?.longitude || 105.8544,
        order.warehouse?.latitude || 21.0285,
      ] as [number, number],
      destinationCoords: [
        order.receiver_longitude || 105.8544,
        order.receiver_latitude || 21.0285,
      ] as [number, number],
      pod: podData,
    };
  }

  /**
   * Lưu đánh giá khách hàng công khai
   */
  async submitPublicFeedback(
    orderCode: string,
    dto: { rating: number; feedbackText?: string; reviewerName?: string },
  ) {
    const order = await this.prisma.order.findFirst({
      where: {
        order_code: {
          equals: orderCode.trim(),
          mode: 'insensitive',
        },
      },
      include: {
        deliveries: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (order && order.deliveries?.[0]) {
      const delivery = order.deliveries[0];
      await this.prisma.deliveryStatusHistory.create({
        data: {
          delivery_id: delivery.id,
          status: delivery.status,
          description: `Khách hàng gửi đánh giá: ${dto.rating} ⭐ - "${dto.feedbackText || 'Hài lòng'}"`,
          note: JSON.stringify({
            type: 'CUSTOMER_FEEDBACK',
            rating: dto.rating,
            feedbackText: dto.feedbackText || '',
            reviewerName: dto.reviewerName || order.receiver_name,
            submittedAt: new Date().toISOString(),
          }),
        },
      });
    }

    return {
      success: true,
      message: 'Cảm ơn bạn đã gửi đánh giá chất lượng dịch vụ VietRoute!',
    };
  }
}


