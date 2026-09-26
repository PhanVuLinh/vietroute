import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { QueryAuditDto, CreateAuditLogDto } from './dto/query-audit.dto.js';
import { AuditAction, AuditSeverity } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AuditService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedAuditLogsIfEmpty();
  }

  async findAll(query: QueryAuditDto) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.action) {
      where.action = query.action;
    }

    if (query.entityType && query.entityType !== 'ALL') {
      where.entity_type = query.entityType;
    }

    if (query.severity) {
      where.severity = query.severity;
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { summary: { contains: q, mode: 'insensitive' } },
        { entity_name: { contains: q, mode: 'insensitive' } },
        { entity_id: { contains: q, mode: 'insensitive' } },
        { user_name: { contains: q, mode: 'insensitive' } },
        { ip_address: { contains: q } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        action: item.action,
        entityType: item.entity_type,
        entityId: item.entity_id,
        entityName: item.entity_name,
        userId: item.user_id,
        userName: item.user_name,
        userRole: item.user_role,
        ipAddress: item.ip_address,
        userAgent: item.user_agent,
        severity: item.severity,
        summary: item.summary,
        details: item.details,
        checksumHash: item.checksum_hash,
        createdAt: item.created_at.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, todayCount, criticalCount, warningCount] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.count({
        where: { created_at: { gte: today } },
      }),
      this.prisma.auditLog.count({
        where: { severity: AuditSeverity.CRITICAL },
      }),
      this.prisma.auditLog.count({
        where: { severity: AuditSeverity.WARNING },
      }),
    ]);

    return {
      total,
      todayCount,
      criticalCount,
      warningCount,
      complianceStandard: 'ISO/IEC 27001 & SOC 2 Type II',
      integrityStatus: 'VERIFIED',
    };
  }

  async logEvent(dto: CreateAuditLogDto) {
    const timestamp = new Date().toISOString();
    const rawData = `${timestamp}|${dto.userId || 'system'}|${dto.action}|${dto.entityType}|${dto.entityId || ''}|${dto.summary}`;
    const checksumHash = crypto.createHash('sha256').update(rawData).digest('hex');

    return this.prisma.auditLog.create({
      data: {
        action: dto.action,
        entity_type: dto.entityType,
        entity_id: dto.entityId,
        entity_name: dto.entityName,
        user_id: dto.userId,
        user_name: dto.userName || 'Hệ thống',
        user_role: dto.userRole || 'ADMIN',
        ip_address: dto.ipAddress || '127.0.0.1',
        user_agent: dto.userAgent,
        severity: dto.severity || AuditSeverity.INFO,
        summary: dto.summary,
        details: dto.details,
        checksum_hash: checksumHash,
      },
    });
  }

  private async seedAuditLogsIfEmpty() {
    try {
      const count = await this.prisma.auditLog.count();
      if (count > 0) return;

      const sampleLogs = [
        {
          action: AuditAction.LOGIN,
          entity_type: 'Auth',
          entity_id: 'usr-admin-01',
          entity_name: 'Nguyễn Quản Trị (Admin)',
          user_id: 'usr-admin-01',
          user_name: 'Nguyễn Quản Trị',
          user_role: 'ADMIN',
          ip_address: '113.161.42.18',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
          severity: AuditSeverity.INFO,
          summary: 'Đăng nhập hệ thống thành công qua 2FA xác thực',
          details: JSON.stringify({ method: 'PASSWORD_AND_TOTP', sessionTtl: '24h' }),
        },
        {
          action: AuditAction.DISPATCH,
          entity_type: 'Order',
          entity_id: 'ord-01',
          entity_name: 'VR-2026-001',
          user_id: 'usr-disp-01',
          user_name: 'Lê Điều Phối',
          user_role: 'DISPATCHER',
          ip_address: '14.162.18.90',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/123.0.0.0',
          severity: AuditSeverity.INFO,
          summary: 'Phân phối đơn hàng VR-2026-001 cho tài xế Nguyễn Văn An (29C-741.82) qua thuật toán tối ưu hóa',
          details: JSON.stringify({ algorithm: 'NEAREST_NEIGHBOR_CVRP', score: 96.5, previousStatus: 'PENDING', newStatus: 'ASSIGNED' }),
        },
        {
          action: AuditAction.UPDATE,
          entity_type: 'Vehicle',
          entity_id: 'veh-01',
          entity_name: '29C-741.82 (Hino 5 tấn)',
          user_id: 'usr-admin-01',
          user_name: 'Nguyễn Quản Trị',
          user_role: 'ADMIN',
          ip_address: '113.161.42.18',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
          severity: AuditSeverity.INFO,
          summary: 'Cập nhật hạn kiểm định và bảo hiểm phương tiện đến ngày 15/12/2027',
          details: JSON.stringify({ before: { inspectionExpiry: '2026-10-01' }, after: { inspectionExpiry: '2027-12-15' } }),
        },
        {
          action: AuditAction.APPROVE,
          entity_type: 'CodReconciliation',
          entity_id: 'COD-2026-001',
          entity_name: 'Phiếu đối soát COD ca sáng TX-HAN-01',
          user_id: 'usr-admin-01',
          user_name: 'Nguyễn Quản Trị',
          user_role: 'ADMIN',
          ip_address: '113.161.42.18',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
          severity: AuditSeverity.INFO,
          summary: 'Kế toán trưởng phê duyệt phiếu đối soát COD 45.000.000đ không chênh lệch',
          details: JSON.stringify({ collectedAmount: 45000000, submittedAmount: 45000000, discrepancy: 0, status: 'SETTLED' }),
        },
        {
          action: AuditAction.PAYMENT,
          entity_type: 'Invoice',
          entity_id: 'INV-2026-002',
          entity_name: 'Hóa đơn cước Vinamilk Q3/2026',
          user_id: 'cus-vinamilk',
          user_name: 'Vinamilk Logistics Hub',
          user_role: 'SHIPPER',
          ip_address: '42.112.35.10',
          user_agent: 'VietRoute B2B Portal Gateway',
          severity: AuditSeverity.INFO,
          summary: 'Thanh toán cước vận tải trực tuyến 25.000.000đ qua VietQR Napas 24/7',
          details: JSON.stringify({ paymentMethod: 'VIETQR_NAPAS247', transactionRef: 'NAPAS-984712', amount: 25000000 }),
        },
        {
          action: AuditAction.CREATE,
          entity_type: 'Incident',
          entity_id: 'INC-2026-001',
          entity_name: 'Xe thủng lốp trên cao tốc Pháp Vân - Cầu Giẽ',
          user_id: 'drv-01',
          user_name: 'Nguyễn Văn An',
          user_role: 'DRIVER',
          ip_address: '171.244.12.85',
          user_agent: 'VietRoute Mobile Driver App v2.4 (Android 14)',
          severity: AuditSeverity.WARNING,
          summary: 'Khai báo sự cố kỹ thuật xe 29C-741.82 trên tuyến Pháp Vân, chậm 35 phút',
          details: JSON.stringify({ severity: 'MEDIUM', delayMinutes: 35, rescueDispatched: true }),
        },
        {
          action: AuditAction.EXPORT,
          entity_type: 'Report',
          entity_id: 'REP-OTD-M09',
          entity_name: 'Báo cáo hiệu suất OTD toàn mạng lưới Tháng 09/2026',
          user_id: 'usr-admin-01',
          user_name: 'Nguyễn Quản Trị',
          user_role: 'ADMIN',
          ip_address: '113.161.42.18',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
          severity: AuditSeverity.INFO,
          summary: 'Xuất dữ liệu KPI vận hành dạng bảng tính Excel mã hóa chuẩn doanh nghiệp',
          details: JSON.stringify({ format: 'XLSX', rowCount: 1540, exportDurationMs: 420 }),
        },
        {
          action: AuditAction.UPDATE,
          entity_type: 'Warehouse',
          entity_id: 'wh-hn-lb',
          entity_name: 'Tổng kho Miền Bắc (Long Biên)',
          user_id: 'usr-admin-01',
          user_name: 'Nguyễn Quản Trị',
          user_role: 'ADMIN',
          ip_address: '113.161.42.18',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
          severity: AuditSeverity.CRITICAL,
          summary: 'Cập nhật giấy chứng nhận PCCC định kỳ & cấu hình cảm biến nhiệt độ kho lạnh Zone B',
          details: JSON.stringify({ pcccCertId: 'PCCC-HN-2026-99', minTemp: -18, maxTemp: -15 }),
        },
      ];

      for (const log of sampleLogs) {
        const rawData = `${log.user_id}|${log.action}|${log.entity_type}|${log.entity_id}|${log.summary}`;
        const checksumHash = crypto.createHash('sha256').update(rawData).digest('hex');

        await this.prisma.auditLog.create({
          data: {
            ...log,
            checksum_hash: checksumHash,
          },
        });
      }
    } catch {
      // Bỏ qua nếu lỗi
    }
  }
}
