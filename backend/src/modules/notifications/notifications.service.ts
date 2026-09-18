import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

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
