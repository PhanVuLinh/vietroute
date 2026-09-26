import React, { useState } from 'react';
import {
  FileText,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from '@/shared/components/feedback/Toast';
import { formatDateTime } from '@/shared/utils/formatters';
import { useAudit } from '../hooks/useAudit';
import { AuditStatsCard } from '../components/AuditStatsCard';
import { AuditFilters } from '../components/AuditFilters';
import { AuditDetailDrawer } from '../components/AuditDetailDrawer';
import type { AuditLogItem, AuditAction, AuditSeverity } from '../types/audit';

export const AuditTrailPage: React.FC = () => {
  usePageTitle('Nhật Ký Kiểm Toán (Audit Trail) — VietRoute');

  const {
    logs,
    stats,
    isLoading,
    filters,
    setFilters,
    totalPages,
    totalCount,
    refetch,
  } = useAudit();

  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleViewDetail = (log: AuditLogItem) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      action: 'ALL',
      entityType: 'ALL',
      severity: 'ALL',
      search: '',
    });
  };

  const handleExportCsv = () => {
    if (logs.length === 0) {
      toast.error('Không có dữ liệu để xuất file');
      return;
    }

    const headers = [
      'ID',
      'Thời gian',
      'Hành động',
      'Phân hệ',
      'Mã đối tượng',
      'Tên đối tượng',
      'Người thực hiện',
      'Vai trò',
      'IP',
      'Mức độ',
      'Nội dung thao tác',
      'Mã băm Checksum (SHA-256)',
    ];

    const rows = logs.map((l) => [
      l.id,
      `"${formatDateTime(l.createdAt)}"`,
      l.action,
      l.entityType,
      l.entityId || '',
      `"${l.entityName || ''}"`,
      `"${l.userName}"`,
      l.userRole,
      l.ipAddress || '127.0.0.1',
      l.severity,
      `"${(l.summary || '').replace(/"/g, '""')}"`,
      l.checksumHash || '',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VietRoute_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Đã xuất file kiểm toán CSV thành công');
  };

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'CREATE':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-[10px]">CREATE</Badge>;
      case 'DISPATCH':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-mono text-[10px]">DISPATCH</Badge>;
      case 'APPROVE':
        return <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/20 font-mono text-[10px]">APPROVE</Badge>;
      case 'PAYMENT':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 font-mono text-[10px]">PAYMENT</Badge>;
      case 'UPDATE':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-mono text-[10px]">UPDATE</Badge>;
      case 'DELETE':
        return <Badge variant="destructive" className="font-mono text-[10px]">DELETE</Badge>;
      case 'EXPORT':
        return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 font-mono text-[10px]">EXPORT</Badge>;
      case 'LOGIN':
        return <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-500/20 font-mono text-[10px]">LOGIN</Badge>;
      default:
        return <Badge variant="secondary" className="font-mono text-[10px]">{action}</Badge>;
    }
  };

  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
            <ShieldAlert className="h-3.5 w-3.5" /> Critical
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5" /> Warning
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Info
          </span>
        );
    }
  };

  return (
    <PageContainer
      title="Nhật ký hoạt động & Kiểm toán (Audit Trail)"
      subtitle="Theo dõi toàn bộ lịch sử thao tác, xác thực và thay đổi dữ liệu theo tiêu chuẩn ISO 27001 và SOC 2 Type II."
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          className="h-9 px-3 text-xs gap-1.5 cursor-pointer hover:bg-accent"
        >
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          Làm mới dữ liệu
        </Button>
      }
      className="space-y-6 pb-12"
    >
      {/* 1. Thống kê KPI kiểm toán */}
      <AuditStatsCard stats={stats} />

      {/* 2. Bộ lọc & Tìm kiếm */}
      <AuditFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        onExport={handleExportCsv}
      />

      {/* 3. Bảng dữ liệu Audit Trail */}
      <div className="bg-card border border-border/80 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-3">Hành động</th>
                <th className="py-3 px-3">Phân hệ</th>
                <th className="py-3 px-4">Tóm tắt nội dung thao tác</th>
                <th className="py-3 px-3">Người thực hiện</th>
                <th className="py-3 px-3">Mức độ</th>
                <th className="py-3 px-3 text-center">Toàn vẹn</th>
                <th className="py-3 px-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="p-4">
                      <Skeleton className="h-8 w-full rounded" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    Không tìm thấy sự kiện kiểm toán nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => handleViewDetail(log)}
                  >
                    {/* Thời gian */}
                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>

                    {/* Hành động */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Phân hệ */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-foreground">{log.entityType}</span>
                      {log.entityId && (
                        <span className="font-mono text-[10px] text-muted-foreground block truncate max-w-[120px]">
                          {log.entityId}
                        </span>
                      )}
                    </td>

                    {/* Tóm tắt */}
                    <td className="py-3 px-4 max-w-[340px]">
                      <div className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {log.summary}
                      </div>
                      {log.entityName && (
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          Đối tượng: <span className="font-medium">{log.entityName}</span>
                        </div>
                      )}
                    </td>

                    {/* Người thực hiện */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-foreground">{log.userName}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Badge variant="secondary" className="px-1 py-0 text-[9px] font-mono">
                          {log.userRole}
                        </Badge>
                        <span className="font-mono">{log.ipAddress || '127.0.0.1'}</span>
                      </div>
                    </td>

                    {/* Mức độ */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>

                    {/* Trạng thái toàn vẹn Checksum */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        title={`Mã băm: ${log.checksumHash || 'verified'}`}
                        className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      >
                        <Lock className="h-3 w-3" />
                      </span>
                    </td>

                    {/* Chi tiết */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(log);
                        }}
                        className="h-8 px-2 text-xs gap-1 text-primary cursor-pointer hover:bg-primary/10"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Xem
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="p-3 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
          <div>
            Hiển thị <strong>{logs.length}</strong> trên tổng số <strong>{totalCount}</strong> bản ghi
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={Number(filters.page || 1) <= 1}
              onClick={() => setFilters({ ...filters, page: Number(filters.page || 1) - 1 })}
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-mono font-medium text-foreground">
              Trang {filters.page || 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={Number(filters.page || 1) >= totalPages}
              onClick={() => setFilters({ ...filters, page: Number(filters.page || 1) + 1 })}
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Drawer xem chi tiết bản ghi kiểm toán */}
      <AuditDetailDrawer
        log={selectedLog}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </PageContainer>
  );
};
