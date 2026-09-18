import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AssignDeliveryDto } from './dto/assign-delivery.dto.js';
import {
  AssignmentType,
  DeliveryStatus,
  DriverStatus,
  OrderStatus,
  VehicleStatus,
} from '@prisma/client';

@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

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
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: dto.deliveryId },
      include: { order: true },
    });

    if (!delivery) {
      throw new NotFoundException(
        `Không tìm thấy chuyến giao với ID: ${dto.deliveryId}`,
      );
    }

    // 1. Cập nhật trạng thái Chuyến giao và gán Tài xế, Xe
    await this.prisma.delivery.update({
      where: { id: dto.deliveryId },
      data: {
        driver_id: dto.driverId,
        vehicle_id: dto.vehicleId,
        status: DeliveryStatus.ASSIGNED,
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
      data: { status: DriverStatus.BUSY },
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
        delivery_id: dto.deliveryId,
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
        delivery_id: dto.deliveryId,
        status: DeliveryStatus.ASSIGNED,
        description: 'Đã phân công tài xế và phương tiện vận chuyển',
      },
    });

    return {
      id: assignment.id,
      deliveryId: assignment.delivery_id,
      driverId: assignment.driver_id,
      vehicleId: assignment.vehicle_id,
      score: assignment.score,
      assignmentType: assignment.assignment_type,
      assignedAt: assignment.assigned_at.toISOString(),
    };
  }
}
