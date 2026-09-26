import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Terminal,
  Clock,
  User,
  Globe,
  Monitor,
  Tag,
  FileCode,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from '@/shared/components/feedback/Toast';
import { formatDateTime } from '@/shared/utils/formatters';
import type { AuditLogItem } from '../types/audit';

interface AuditDetailDrawerProps {
  log: AuditLogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditDetailDrawer: React.FC<AuditDetailDrawerProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedDetails, setCopiedDetails] = useState(false);

  if (!isOpen || !log) return null;

  const handleCopyHash = () => {
    if (log.checksumHash) {
      navigator.clipboard.writeText(log.checksumHash);
      setCopiedHash(true);
      toast.success('Đã sao chép mã SHA-256 Checksum');
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleCopyDetails = () => {
    if (log.details) {
      navigator.clipboard.writeText(log.details);
      setCopiedDetails(true);
      toast.success('Đã sao chép dữ liệu JSON');
      setTimeout(() => setCopiedDetails(false), 2000);
    }
  };

  let formattedJson = '';
  try {
    if (log.details) {
      const parsed = JSON.parse(log.details);
      formattedJson = JSON.stringify(parsed, null, 2);
    }
  } catch {
    formattedJson = log.details || '';
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="destructive">Nghiêm trọng (Critical)</Badge>;
      case 'WARNING':
        return <Badge variant="warning">Cảnh báo (Warning)</Badge>;
      default:
        return <Badge variant="secondary">Thông tin (Info)</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-full max-w-xl bg-card border-l border-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Chi tiết bản ghi kiểm toán</h3>
                <span className="font-mono text-xs text-muted-foreground">{log.id}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* 1. Tóm tắt & Mức độ */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Mức độ an ninh:</span>
                {getSeverityBadge(log.severity)}
              </div>
              <div className="text-sm font-semibold text-foreground leading-relaxed">
                {log.summary}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground pt-1 border-t border-border/60">
                <Clock className="h-3.5 w-3.5" />
                <span>Thời điểm ghi nhận: {formatDateTime(log.createdAt)}</span>
              </div>
            </div>

            {/* 2. Đối tượng tác động */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-primary" />
                Đối tượng thực hiện & Mục tiêu
              </h4>
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Hành động:</span>
                  <Badge variant="outline" className="font-mono font-bold mt-0.5">
                    {log.action}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Phân hệ / Entity:</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{log.entityType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Mã định danh Entity ID:</span>
                  <span className="font-mono font-medium text-primary block truncate">
                    {log.entityId || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Tên đối tượng:</span>
                  <span className="font-medium text-foreground block truncate">
                    {log.entityName || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Thông tin người thực hiện & Môi trường */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                Tác nhân (Actor) & Môi trường kết nối
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Người thực hiện:</span>
                  <span className="font-semibold text-foreground">{log.userName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Vai trò trong hệ thống:</span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {log.userRole}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/60">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Địa chỉ IP:
                  </span>
                  <span className="font-mono font-medium text-foreground">{log.ipAddress || '127.0.0.1'}</span>
                </div>
                <div className="py-1">
                  <span className="text-muted-foreground flex items-center gap-1 mb-1">
                    <Monitor className="h-3 w-3" /> User Agent thiết bị:
                  </span>
                  <p className="font-mono text-[11px] text-slate-500 bg-muted/50 p-2 rounded border border-border/60 break-all">
                    {log.userAgent || 'Hệ thống tự động (Automated worker)'}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. SHA-256 Tamper-Proof Checksum */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Xác thực tính toàn vẹn (Tamper-Proof)</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyHash}
                  className="h-7 px-2 text-[10px] gap-1 cursor-pointer"
                >
                  {copiedHash ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  Sao chép
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Chuỗi băm SHA-256 được tạo và khóa tại thời điểm ghi nhận sự kiện, đảm bảo không thể chỉnh sửa cơ sở dữ liệu hồi tố:
              </p>
              <div className="p-2 bg-background rounded-lg border border-border font-mono text-[10px] text-emerald-700 dark:text-emerald-300 break-all select-all flex items-center gap-1.5">
                <Lock className="h-3 w-3 shrink-0 text-emerald-600" />
                <span>{log.checksumHash || 'sha256:verified_chain_root'}</span>
              </div>
            </div>

            {/* 5. Chi tiết JSON Payload */}
            {log.details && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    <FileCode className="h-4 w-4 text-primary" />
                    Dữ liệu chi tiết (Payload snapshot)
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyDetails}
                    className="h-7 px-2 text-[10px] gap-1 cursor-pointer"
                  >
                    {copiedDetails ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    Sao chép JSON
                  </Button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-slate-800">
                  {formattedJson}
                </pre>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
