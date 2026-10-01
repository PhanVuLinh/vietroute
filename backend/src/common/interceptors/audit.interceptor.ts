import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  AUDIT_METADATA_KEY,
  AuditOptions,
} from '../decorators/audit.decorator.js';
import { AuditService } from '../../modules/audit/audit.service.js';
import { AuditSeverity } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.getAllAndOverride<AuditOptions>(
      AUDIT_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ip =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.socket?.remoteAddress ||
      '127.0.0.1';
    const userAgent = request.headers['user-agent'] || 'VietRoute-Web-Client';

    return next.handle().pipe(
      tap({
        next: async (resData: any) => {
          try {
            const entityId =
              resData?.id ||
              resData?.orderCode ||
              resData?.incidentCode ||
              request.params?.id ||
              request.params?.orderCode ||
              undefined;

            const entityName =
              resData?.orderCode ||
              resData?.incidentCode ||
              resData?.name ||
              resData?.title ||
              resData?.fullName ||
              undefined;

            let summary = auditOptions.summary;
            if (!summary) {
              summary = `Thao tác ${auditOptions.action} trên ${auditOptions.entityType}${entityId ? ` [${entityId}]` : ''}`;
            }

            // Ghi nhật ký thẩm kế không đồng bộ, không làm chậm response của client
            await this.auditService.logEvent({
              action: auditOptions.action,
              entityType: auditOptions.entityType,
              entityId: entityId ? String(entityId) : undefined,
              entityName: entityName ? String(entityName) : undefined,
              userId: user?.sub || user?.id || 'system-usr',
              userName: user?.full_name || user?.email || 'Người dùng hệ thống',
              userRole: user?.role || 'ADMIN',
              ipAddress: ip,
              userAgent,
              severity: auditOptions.severity || AuditSeverity.INFO,
              summary,
              details: JSON.stringify({
                method: request.method,
                url: request.originalUrl,
                params: request.params,
                query: request.query,
                body: request.body,
              }),
            });
          } catch (err) {
            console.warn('[AuditInterceptor] Lỗi tự động ghi nhật ký thẩm kế:', err);
          }
        },
      }),
    );
  }
}
