export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'DISPATCH'
  | 'RECONCILE'
  | 'APPROVE'
  | 'EXPORT'
  | 'PAYMENT';

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditLogItem {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  entityName?: string;
  userId?: string;
  userName: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
  severity: AuditSeverity;
  summary: string;
  details?: string;
  checksumHash?: string;
  createdAt: string;
}

export interface AuditStats {
  total: number;
  todayCount: number;
  criticalCount: number;
  warningCount: number;
  complianceStandard: string;
  integrityStatus: string;
}

export interface AuditFilterParams {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  severity?: string;
  search?: string;
}
