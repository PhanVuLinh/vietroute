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

    // 6. Trả về Order đã hoàn tất
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

    // Nếu không có trong DB, kiểm tra xem có phải mã mẫu giả lập không
    if (!order) {
      const sampleFallback = this.getSampleShipmentFallback(cleanCode.toUpperCase());
      if (sampleFallback) {
        return sampleFallback;
      }
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

  /**
   * Dữ liệu dự phòng cho 3 mã mẫu chuẩn trong hệ thống nếu chưa có trong DB
   */
  private getSampleShipmentFallback(code: string) {
    const SAMPLE_SHIPMENTS: Record<string, any> = {
      'VR-2026-001': {
        orderCode: 'VR-2026-001',
        senderName: 'Tổng kho Phân phối VietRoute Miền Bắc',
        senderAddress: 'KCN Đài Tư, 386 Nguyễn Văn Linh, Phúc Lợi, Long Biên, Hà Nội',
        receiverName: 'Nguyễn Tiến Dũng (Thăng Long Logistics)',
        receiverPhone: '0988.***.456',
        receiverAddress: 'Số 18 Tam Trinh, Hoàng Mai, Hà Nội',
        warehouseName: 'Tổng kho Long Biên',
        warehouseAddress: 'Long Biên, Hà Nội',
        status: 'IN_TRANSIT',
        statusText: 'Đang trên đường giao hàng',
        priority: 'URGENT',
        codAmount: 14500000,
        weightKg: 350.5,
        itemsSummary: 'Tivi Bravia 55 Inch (4 kiện), Dầu ăn Neptune 5L (12 can), Bo mạch chủ (5 kiện)',
        createdAt: '18/09/2026 07:30',
        estimatedDelivery: 'Hôm nay, trước 12:00 (Khoảng 25 phút nữa)',
        driver: {
          name: 'Nguyễn Văn An',
          phone: '0971.001.001',
          vehiclePlate: '29C-741.82',
          vehicleModel: 'Hino FC9J 5 Tấn',
          rating: 4.95,
          currentLocation: [105.8642, 21.015],
        },
        originCoords: [105.9082, 21.0368],
        destinationCoords: [105.8642, 20.9984],
        steps: [
          {
            title: 'Đơn hàng đã tiếp nhận',
            time: '18/09/2026 07:30',
            location: 'Hệ thống VietRoute',
            description: 'Khách hàng tạo đơn vận chuyển liên tỉnh thành công.',
            completed: true,
          },
          {
            title: 'Xuất kho & Xếp lên xe tải',
            time: '18/09/2026 08:45',
            location: 'Tổng kho Long Biên (Hà Nội)',
            description: 'Hàng hóa đã kiểm đếm, niêm phong và bốc lên xe 29C-741.82.',
            completed: true,
          },
          {
            title: 'Tài xế đang giao hàng',
            time: '18/09/2026 10:15',
            location: 'Quận Hoàng Mai, Hà Nội',
            description: 'Tài xế Nguyễn Văn An đang di chuyển đến địa chỉ của bạn.',
            completed: true,
            current: true,
          },
          {
            title: 'Giao hàng thành công',
            time: 'Dự kiến 11:30',
            location: 'Số 18 Tam Trinh, Hoàng Mai',
            description: 'Ký nhận biên bản e-POD và hoàn tất bàn giao.',
            completed: false,
          },
        ],
      },
      'VR-2026-004': {
        orderCode: 'VR-2026-004',
        senderName: 'Công ty Sữa & Bánh kẹo Tiêu dùng',
        senderAddress: 'Số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội',
        receiverName: 'Trần Thị Bích Ngọc',
        receiverPhone: '0912.***.566',
        receiverAddress: 'Số 88 Cầu Giấy, Cầu Giấy, Hà Nội',
        warehouseName: 'Kho Vệ Tinh Cầu Giấy',
        warehouseAddress: 'Cầu Giấy, Hà Nội',
        status: 'DELIVERED',
        statusText: 'Giao hàng thành công',
        priority: 'NORMAL',
        codAmount: 3200000,
        weightKg: 18.5,
        itemsSummary: 'Sữa tươi tiệt trùng TH True Milk (1 thùng), Bánh kẹo Tết Kinh Đô (1 thùng)',
        createdAt: '18/09/2026 08:15',
        estimatedDelivery: 'Đã giao lúc 09:42 ngày 18/09/2026',
        driver: {
          name: 'Trần Minh Hoàng',
          phone: '0971.001.002',
          vehiclePlate: '29H-123.45',
          vehicleModel: 'Ford Transit Van 1.25T',
          rating: 4.88,
          currentLocation: [105.7981, 21.0345],
        },
        originCoords: [105.7925, 21.0285],
        destinationCoords: [105.7981, 21.0345],
        steps: [
          {
            title: 'Đơn hàng đã tiếp nhận',
            time: '18/09/2026 08:15',
            location: 'Hệ thống VietRoute',
            description: 'Tiếp nhận đơn hàng thành công.',
            completed: true,
          },
          {
            title: 'Xuất kho trung chuyển Cầu Giấy',
            time: '18/09/2026 09:00',
            location: 'Kho Cầu Giấy',
            description: 'Bàn giao đơn hàng cho xe giao chặng cuối.',
            completed: true,
          },
          {
            title: 'Đang phát hàng',
            time: '18/09/2026 09:20',
            location: 'Tuyến Cầu Giấy',
            description: 'Tài xế liên hệ người nhận và di chuyển tới điểm giao.',
            completed: true,
          },
          {
            title: 'Giao hàng thành công',
            time: '18/09/2026 09:42',
            location: 'Số 88 Cầu Giấy, Hà Nội',
            description: 'Khách hàng đã kiểm tra hàng, thanh toán COD và ký nhận e-POD.',
            completed: true,
            current: true,
          },
        ],
        pod: {
          signedBy: 'Trần Thị Bích Ngọc (Người nhận)',
          signedAt: '18/09/2026 09:42',
          signatureUrl:
            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='90'><path d='M20,60 Q70,20 110,60 T190,45' stroke='%231d4ed8' stroke-width='3.5' fill='none'/><path d='M40,75 L180,70' stroke='%231d4ed8' stroke-width='2' fill='none'/></svg>",
          photoUrl:
            'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60',
        },
      },
      'VR-2026-005': {
        orderCode: 'VR-2026-005',
        senderName: 'Tập đoàn Bán lẻ WinCommerce Miền Nam',
        senderAddress: 'Tòa nhà Bitexco, Số 2 Hải Triều, Bến Nghé, Quận 1, TP.HCM',
        receiverName: 'Quản lý Kho WinMart Cát Lái',
        receiverPhone: '0933.***.882',
        receiverAddress: 'KCN Cát Lái 2, TP. Thủ Đức, TP. Hồ Chí Minh',
        warehouseName: 'Tổng kho Cát Lái',
        warehouseAddress: 'Cát Lái, Thủ Đức, TP.HCM',
        status: 'IN_TRANSIT',
        statusText: 'Đang vận chuyển liên quận',
        priority: 'URGENT',
        codAmount: 45000000,
        weightKg: 1850.0,
        itemsSummary: 'Bao Gạo Nàng Thơm Chợ Đào (50 bao - 1.25T), Bia Sài Gòn Special (50 thùng)',
        createdAt: '18/09/2026 09:00',
        estimatedDelivery: 'Hôm nay, trước 15:30',
        driver: {
          name: 'Hoàng Đức Thắng',
          phone: '0971.001.005',
          vehiclePlate: '51D-928.34',
          vehicleModel: 'Hino 5 Tấn XZU730L',
          rating: 4.92,
          currentLocation: [106.74, 10.768],
        },
        originCoords: [106.7042, 10.7715],
        destinationCoords: [106.7934, 10.7612],
        steps: [
          {
            title: 'Đơn hàng đã tiếp nhận',
            time: '18/09/2026 09:00',
            location: 'Hệ thống VietRoute',
            description: 'Tiếp nhận lô hàng nặng từ đối tác B2B.',
            completed: true,
          },
          {
            title: 'Bốc xếp tại Dock Cát Lái',
            time: '18/09/2026 10:30',
            location: 'Tổng kho Cát Lái',
            description: 'Hàng hóa pallet đã kiểm tra tải trọng an toàn.',
            completed: true,
          },
          {
            title: 'Đang vận chuyển',
            time: '18/09/2026 11:45',
            location: 'Đại lộ Mai Chí Thọ, TP. Thủ Đức',
            description: 'Xe container chuyên dụng đang di chuyển trên tuyến.',
            completed: true,
            current: true,
          },
          {
            title: 'Bàn giao tại điểm đến',
            time: 'Dự kiến 15:30',
            location: 'Kho WinMart Cát Lái',
            description: 'Giao hàng, kiểm đếm pallet và thu COD.',
            completed: false,
          },
        ],
      },
    };

    return SAMPLE_SHIPMENTS[code] || null;
  }
}

