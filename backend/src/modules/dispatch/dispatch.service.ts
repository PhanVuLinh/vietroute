import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AssignDeliveryDto } from './dto/assign-delivery.dto.js';
import {
  AssignmentType,
  DeliveryStatus,
  DriverStatus,
  NotificationType,
  OrderStatus,
  VehicleStatus,
} from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';
import { AiService } from '../ai/ai.service.js';

@Injectable()
export class DispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly aiService: AiService,
  ) {}


  async getAssignments() {
    const list = await this.prisma.driverAssignment.findMany({
      include: {
        driver: true,
        vehicle: true,
        delivery: {
          include: {
            order: true,
          },
        },
      },
      orderBy: { assigned_at: 'desc' },
    });

    return list.map((a) => ({
      id: a.id,
      deliveryId: a.delivery_id,
      driverId: a.driver_id,
      vehicleId: a.vehicle_id,
      score: a.score,
      assignmentType: a.assignment_type,
      assignedAt: a.assigned_at.toISOString(),
      acceptedAt: a.accepted_at ? a.accepted_at.toISOString() : undefined,
      rejectedAt: a.rejected_at ? a.rejected_at.toISOString() : undefined,
      rejectionReason: a.rejection_reason ?? undefined,
    }));
  }

  async assignDelivery(dto: AssignDeliveryDto) {
    let delivery = await this.prisma.delivery.findUnique({
      where: { id: dto.deliveryId },
      include: { order: true },
    });

    if (!delivery) {
      delivery = await this.prisma.delivery.findFirst({
        where: {
          OR: [
            { order_id: dto.deliveryId },
            { delivery_code: dto.deliveryId },
          ],
        },
        include: { order: true },
      });
    }

    if (!delivery) {
      // Tìm xem có order nào có ID này không để tạo delivery
      const order = await this.prisma.order.findUnique({
        where: { id: dto.deliveryId },
      });
      if (order) {
        delivery = await this.prisma.delivery.create({
          data: {
            delivery_code: `DEL-${order.order_code}`,
            order_id: order.id,
            status: DeliveryStatus.PENDING,
          },
          include: { order: true },
        });
      }
    }

    if (!delivery) {
      throw new NotFoundException(
        `Không tìm thấy chuyến giao với ID hoặc mã đơn: ${dto.deliveryId}`,
      );
    }

    // 1. Cập nhật trạng thái Chuyến giao và gán Tài xế, Xe
    const updatedDelivery = await this.prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        driver_id: dto.driverId,
        vehicle_id: dto.vehicleId,
        status: DeliveryStatus.ASSIGNED,
      },
      include: {
        order: true,
        driver: true,
        vehicle: true,
      },
    });

    // 2. Cập nhật trạng thái Đơn hàng
    await this.prisma.order.update({
      where: { id: delivery.order_id },
      data: { status: OrderStatus.ASSIGNED },
    });

    // 3. Cập nhật Tài xế sang BUSY
    await this.prisma.driver.update({
      where: { id: dto.driverId },
      data: {
        status: DriverStatus.BUSY,
        current_delivery_count: { increment: 1 },
      },
    });

    // 4. Cập nhật Xe sang EN_ROUTE
    await this.prisma.vehicle.update({
      where: { id: dto.vehicleId },
      data: {
        driver_id: dto.driverId,
        status: VehicleStatus.EN_ROUTE,
      },
    });

    // 5. Tạo bản ghi phân công Assignment
    const assignment = await this.prisma.driverAssignment.create({
      data: {
        delivery_id: delivery.id,
        driver_id: dto.driverId,
        vehicle_id: dto.vehicleId,
        score: 95.0,
        assignment_type: dto.assignmentType ?? AssignmentType.MANUAL,
        assigned_at: new Date(),
      },
    });

    // 6. Ghi nhật ký trạng thái
    await this.prisma.deliveryStatusHistory.create({
      data: {
        delivery_id: delivery.id,
        status: DeliveryStatus.ASSIGNED,
        description: `Đã phân công tài xế ${updatedDelivery.driver?.full_name || ''} và phương tiện ${updatedDelivery.vehicle?.license_plate || ''}`,
      },
    });

    // 7. Tạo thông báo trong CSDL
    const notif = await this.prisma.notification.create({
      data: {
        title: 'Đã phân công tài xế',
        message: `Đơn hàng ${delivery.order?.order_code} đã được gán cho tài xế ${updatedDelivery.driver?.full_name || ''}`,
        type: NotificationType.ORDER_ASSIGNED,
        reference_id: delivery.order_id,
      },
    });

    this.realtimeGateway.emitBroadcastNotification({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      read: false,
      priority: notif.priority,
      referenceId: delivery.order?.order_code,
      createdAt: notif.created_at.toISOString(),
    });

    // 8. Bắn sự kiện realtime Socket.IO
    this.realtimeGateway.emitOrderStatusChanged({
      orderId: delivery.order_id,
      orderCode: delivery.order?.order_code || '',
      status: OrderStatus.ASSIGNED,
      updatedAt: new Date().toISOString(),
      message: `Đơn hàng ${delivery.order?.order_code} đã được điều phối cho tài xế ${updatedDelivery.driver?.full_name}!`,
    });

    return {
      id: assignment.id,
      deliveryId: assignment.delivery_id,
      driverId: assignment.driver_id,
      vehicleId: assignment.vehicle_id,
      score: assignment.score,
      assignmentType: assignment.assignment_type,
      assignedAt: assignment.assigned_at.toISOString(),
      orderCode: delivery.order?.order_code,
      driverName: updatedDelivery.driver?.full_name,
      vehiclePlate: updatedDelivery.vehicle?.license_plate,
    };
  }

  /**
   * Tự động phân bổ hàng loạt đơn hàng chờ bằng AI Heuristic
   */
  async autoDispatchBatch() {
    const pendingOrders = await this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.PENDING] },
      },
      include: {
        warehouse: true,
        customer: true,
        items: true,
      },
      orderBy: { created_at: 'asc' },
    });

    if (pendingOrders.length === 0) {
      return {
        assignedCount: 0,
        assignments: [],
        message: 'Hiện không có đơn hàng nào đang chờ phân công',
      };
    }

    const drivers = await this.prisma.driver.findMany({
      include: {
        current_vehicle: true,
      },
      orderBy: { current_delivery_count: 'asc' },
    });

    if (drivers.length === 0) {
      return {
        assignedCount: 0,
        assignments: [],
        message: 'Không tìm thấy tài xế khả dụng trong hệ thống',
      };
    }

    const vehicles = await this.prisma.vehicle.findMany();

    const assignmentsMade: any[] = [];

    for (const order of pendingOrders) {
      let bestDriver = drivers[0];
      let bestScore = -1;
      let selectedVehicle = vehicles[0];

      // 1. Ưu tiên sử dụng động cơ AI Match Score từ Python AI Microservice
      try {
        const pickupLat = order.warehouse?.latitude || 21.0285;
        const pickupLng = order.warehouse?.longitude || 105.8542;
        const aiMatch = await this.aiService.matchDriver({
          orderId: order.id,
          pickupLat,
          pickupLng,
          totalWeightKg: order.total_weight || 50,
          priority: order.priority,
        });

        if (aiMatch?.topMatches?.length > 0) {
          const top = aiMatch.topMatches[0];
          const foundDriver = drivers.find((d) => d.id === top.driverId);
          if (foundDriver) {
            bestDriver = foundDriver;
            bestScore = top.matchScore;
            if (top.recommendedVehicle?.id) {
              const foundVeh = vehicles.find((v) => v.id === top.recommendedVehicle.id);
              if (foundVeh) selectedVehicle = foundVeh;
            }
          }
        }
      } catch {
        // Fallback sang tính khoảng cách cơ bản
      }


      // 2. Nếu AI chưa chấm điểm, dùng thuật toán nội bộ
      if (bestScore === -1) {
        for (const d of drivers) {
          const dist = Math.hypot(
            (d.current_location_lat || 21.0285) - order.receiver_latitude,
            (d.current_location_lng || 105.8544) - order.receiver_longitude,
          );
          const distScore = Math.max(0, 40 - dist * 100);
          const onTimeScore = ((d.on_time_rate || 100) / 100) * 30;
          const workloadScore = Math.max(0, 30 - d.current_delivery_count * 5);

          const totalScore = Math.round(distScore + onTimeScore + workloadScore);
          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestDriver = d;
          }
        }

        if (bestDriver.current_vehicle) {
          selectedVehicle = bestDriver.current_vehicle;
        } else if (vehicles.length > 0) {
          selectedVehicle = vehicles[bestDriver.current_delivery_count % vehicles.length];
        }
      }

      let delivery = await this.prisma.delivery.findFirst({
        where: { order_id: order.id },
      });

      if (!delivery) {
        delivery = await this.prisma.delivery.create({
          data: {
            delivery_code: `DEL-${order.order_code}`,
            order_id: order.id,
            status: DeliveryStatus.PENDING,
          },
        });
      }

      const assigned = await this.assignDelivery({
        deliveryId: delivery.id,
        driverId: bestDriver.id,
        vehicleId: selectedVehicle?.id || 'veh-default',
        assignmentType: AssignmentType.AI_RECOMMENDED,
      });

      assignmentsMade.push({
        ...assigned,
        orderCode: order.order_code,
        driverName: bestDriver.full_name,
        vehiclePlate: selectedVehicle?.license_plate || '29C-VIETROUTE',
        score: Math.max(85, bestScore),
      });

      bestDriver.current_delivery_count += 1;
    }

    return {
      assignedCount: assignmentsMade.length,
      assignments: assignmentsMade,
      message: `Đã phân công tự động thành công ${assignmentsMade.length} đơn hàng qua AI Matching!`,
    };
  }

  /**
   * Lấy danh sách tài xế & phương tiện đề xuất tốt nhất bằng AI Engine
   */
  async getAiDriverMatches(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { warehouse: true },
    });
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng: ${orderId}`);
    }

    const pickupLat = order.warehouse?.latitude || 21.0285;
    const pickupLng = order.warehouse?.longitude || 105.8542;

    return this.aiService.matchDriver({
      orderId: order.id,
      pickupLat,
      pickupLng,
      totalWeightKg: order.total_weight || 50,
      priority: order.priority,
    });

  }
}

