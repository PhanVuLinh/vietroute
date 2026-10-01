import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';
import { NotificationType, NotificationPriority } from '@prisma/client';

import { CreateNotificationDto } from './dto/create-notification.dto.js';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async create(dto: CreateNotificationDto) {
    const created = await this.prisma.notification.create({
      data: {
        title: dto.title,
        message: dto.message,
        type: dto.type || NotificationType.ORDER_CREATED,
        priority: dto.priority || NotificationPriority.NORMAL,
        reference_id: dto.referenceId,
      },
    });

    const payload = {
      id: created.id,
      title: created.title,
      message: created.message,
      type: created.type,
      read: created.read,
      priority: created.priority,
      referenceId: created.reference_id ?? undefined,
      createdAt: created.created_at.toISOString(),
    };

    if (dto.userId) {
      this.realtimeGateway.emitUserNotification(dto.userId, payload);
    } else {
      this.realtimeGateway.emitBroadcastNotification(payload);
    }

    return payload;
  }

  async findAll(query?: { unreadOnly?: boolean | string }) {
    const where: any = {};
    if (query?.unreadOnly === true || query?.unreadOnly === 'true') {
      where.read = false;
    }

    const list = await this.prisma.notification.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    return list.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      priority: n.priority,
      referenceId: n.reference_id ?? undefined,
      createdAt: n.created_at.toISOString(),
    }));
  }

  async markAsRead(id: string) {
    await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return true;
  }

  async markAllAsRead() {
    await this.prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
    return true;
  }
}
