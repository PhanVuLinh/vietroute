import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateIncidentDto } from './dto/create-incident.dto.js';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto.js';
import { AddIncidentCommentDto } from './dto/add-comment.dto.js';
import { IncidentSeverity, IncidentStatus, IncidentType } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';

export interface IncidentFilterParams {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  type?: IncidentType;
  search?: string;
}

@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async findAll(params?: IncidentFilterParams) {
    const where: any = {};

    if (params?.status) where.status = params.status;
    if (params?.severity) where.severity = params.severity;
    if (params?.type) where.type = params.type;

    if (params?.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { incident_code: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { order_code: { contains: q, mode: 'insensitive' } },
        { driver_name: { contains: q, mode: 'insensitive' } },
        { vehicle_plate: { contains: q, mode: 'insensitive' } },
      ];
    }

    const incidents = await this.prisma.incident.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        comments: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    return incidents.map((i) => ({
      id: i.id,
      incidentCode: i.incident_code,
      type: i.type,
      severity: i.severity,
      status: i.status,
      title: i.title,
      description: i.description,
      orderCode: i.order_code || undefined,
      driverName: i.driver_name || undefined,
      vehiclePlate: i.vehicle_plate || undefined,
      warehouseName: i.warehouse_name || undefined,
      reportedBy: i.reported_by,
      assignedTo: i.assigned_to || undefined,
      resolutionNote: i.resolution_note || undefined,
      resolvedAt: i.resolved_at ? i.resolved_at.toISOString() : undefined,
      comments: i.comments.map((c) => ({
        id: c.id,
        incidentId: c.incident_id,
        user: c.user,
        message: c.message,
        createdAt: c.created_at.toISOString(),
      })),
      createdAt: i.created_at.toISOString(),
      updatedAt: i.updated_at.toISOString(),
    }));
  }

  async findOne(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!incident) {
      throw new NotFoundException(`Không tìm thấy sự cố ID: ${id}`);
    }

    return {
      id: incident.id,
      incidentCode: incident.incident_code,
      type: incident.type,
      severity: incident.severity,
      status: incident.status,
      title: incident.title,
      description: incident.description,
      orderCode: incident.order_code || undefined,
      driverName: incident.driver_name || undefined,
      vehiclePlate: incident.vehicle_plate || undefined,
      warehouseName: incident.warehouse_name || undefined,
      reportedBy: incident.reported_by,
      assignedTo: incident.assigned_to || undefined,
      resolutionNote: incident.resolution_note || undefined,
      resolvedAt: incident.resolved_at ? incident.resolved_at.toISOString() : undefined,
      comments: incident.comments.map((c) => ({
        id: c.id,
        incidentId: c.incident_id,
        user: c.user,
        message: c.message,
        createdAt: c.created_at.toISOString(),
      })),
      createdAt: incident.created_at.toISOString(),
      updatedAt: incident.updated_at.toISOString(),
    };
  }

  async create(dto: CreateIncidentDto) {
    const count = await this.prisma.incident.count();
    const incidentCode = `INC-2026-${String(count + 1).padStart(3, '0')}`;

    const incident = await this.prisma.incident.create({
      data: {
        incident_code: incidentCode,
        title: dto.title,
        description: dto.description,
        type: dto.type || IncidentType.DAMAGED_GOODS,
        severity: dto.severity || IncidentSeverity.MEDIUM,
        status: IncidentStatus.NEW,
        order_code: dto.order_code,
        driver_name: dto.driver_name,
        vehicle_plate: dto.vehicle_plate,
        warehouse_name: dto.warehouse_name,
        reported_by: dto.reported_by,
        assigned_to: dto.assigned_to || 'Đội Xử Lý Sự Cố',
      },
      include: {
        comments: true,
      },
    });

    const result = {
      id: incident.id,
      incidentCode: incident.incident_code,
      type: incident.type,
      severity: incident.severity,
      status: incident.status,
      title: incident.title,
      description: incident.description,
      orderCode: incident.order_code || undefined,
      driverName: incident.driver_name || undefined,
      vehiclePlate: incident.vehicle_plate || undefined,
      warehouseName: incident.warehouse_name || undefined,
      reportedBy: incident.reported_by,
      assignedTo: incident.assigned_to || undefined,
      comments: [],
      createdAt: incident.created_at.toISOString(),
    };

    // Phát sóng sự kiện sự cố khẩn cấp qua Socket.IO
    this.realtimeGateway.emitIncidentCreated({
      id: result.id,
      incidentCode: result.incidentCode,
      title: result.title,
      severity: result.severity,
      type: result.type,
      createdAt: result.createdAt,
      driverName: result.driverName,
    });

    // Tự động lưu thông báo cảnh báo sự cố vào CSDL và phát sóng tới Header
    try {
      const notif = await this.prisma.notification.create({
        data: {
          title: `Cảnh báo sự cố: ${result.title}`,
          message: `Sự cố ${result.incidentCode} (${result.severity}) vừa được báo cáo bởi ${result.reportedBy}.`,
          type: 'VEHICLE_ALERT',
          priority: result.severity === 'CRITICAL' ? 'URGENT' : 'HIGH',
          reference_id: result.incidentCode,
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
      console.warn('Lỗi tạo thông báo sự cố mới:', e);
    }

    return result;
  }

  async updateStatus(id: string, dto: UpdateIncidentStatusDto) {
    await this.findOne(id);

    const updateData: any = {
      status: dto.status,
    };

    if (dto.resolution_note) {
      updateData.resolution_note = dto.resolution_note;
    }

    if (dto.status === IncidentStatus.RESOLVED) {
      updateData.resolved_at = new Date();
    }

    return this.prisma.incident.update({
      where: { id },
      data: updateData,
      include: { comments: true },
    });
  }

  async addComment(incidentId: string, dto: AddIncidentCommentDto) {
    await this.findOne(incidentId);

    const comment = await this.prisma.incidentComment.create({
      data: {
        incident_id: incidentId,
        user: dto.user,
        message: dto.message,
      },
    });

    return {
      id: comment.id,
      incidentId: comment.incident_id,
      user: comment.user,
      message: comment.message,
      createdAt: comment.created_at.toISOString(),
    };
  }
}
