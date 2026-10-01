import { SetMetadata } from '@nestjs/common';
import { AuditAction, AuditSeverity } from '@prisma/client';

export const AUDIT_METADATA_KEY = 'audit_metadata';

export interface AuditOptions {
  action: AuditAction;
  entityType: string;
  summary?: string;
  severity?: AuditSeverity;
}

export const Audit = (options: AuditOptions) =>
  SetMetadata(AUDIT_METADATA_KEY, options);
