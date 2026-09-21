import React, { useState } from "react";
import {
  X,
  Clock,
  User,
  Package,
  Truck,
  Building2,
  CheckCircle2,
  Send,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/utils/cn";
import { formatDateTime } from "@/shared/utils/formatters";
import {
  type Incident,
  type IncidentStatus,
  SEVERITY_META,
  STATUS_META,
} from "../types/incident";

interface IncidentDetailDrawerProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: IncidentStatus) => void;
  onAddComment: (id: string, user: string, message: string) => void;
}

export const IncidentDetailDrawer: React.FC<IncidentDetailDrawerProps> = ({
  incident,
  isOpen,
  onClose,
  onUpdateStatus,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState("");

  if (!isOpen || !incident) return null;

  const sev = SEVERITY_META[incident.severity];
  const st = STATUS_META[incident.status];

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onAddComment(incident.id, "Điều phối viên", commentText.trim());
    setCommentText("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-full max-w-xl bg-card border-l border-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-foreground">
                  {incident.incidentCode}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
                    sev.bg,
                    sev.color
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", sev.dot)} />
                  <span>{sev.label}</span>
                </span>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
                    st.bg,
                    st.color
                  )}
                >
                  {st.label}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <h2 className="text-base font-bold text-foreground">
              {incident.title}
            </h2>

            {/* Workflow Quick Action Buttons */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
              {incident.status === "NEW" && (
                <Button
                  size="sm"
                  onClick={() => onUpdateStatus(incident.id, "IN_PROGRESS")}
                  className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1"
                >
                  <Clock className="h-3 w-3" />
                  <span>Tiếp nhận xử lý</span>
                </Button>
              )}
              {incident.status === "IN_PROGRESS" && (
                <Button
                  size="sm"
                  onClick={() => onUpdateStatus(incident.id, "PENDING_REVIEW")}
                  className="h-7 text-xs bg-violet-600 hover:bg-violet-700 text-white gap-1"
                >
                  <ArrowRight className="h-3 w-3" />
                  <span>Gửi duyệt giải pháp</span>
                </Button>
              )}
              {(incident.status === "PENDING_REVIEW" || incident.status === "IN_PROGRESS") && (
                <Button
                  size="sm"
                  onClick={() => onUpdateStatus(incident.id, "RESOLVED")}
                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Xác nhận giải quyết</span>
                </Button>
              )}
              {incident.status === "RESOLVED" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(incident.id, "CLOSED")}
                  className="h-7 text-xs gap-1"
                >
                  <span>Đóng hồ sơ sự cố</span>
                </Button>
              )}
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Description */}
            <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1.5 text-xs">
              <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
                Mô tả chi tiết sự cố
              </span>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {incident.description}
              </p>
            </div>

            {/* Entities involved */}
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-2.5 text-xs">
              <span className="font-semibold text-foreground uppercase tracking-wider text-[10px] block">
                Thông tin liên quan
              </span>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>Báo cáo bởi: <strong>{incident.reportedBy}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>Thời gian: {formatDateTime(incident.createdAt)}</span>
                </div>

                {incident.orderCode && (
                  <div className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-blue-500" />
                    <span>Mã đơn: <strong className="font-mono text-primary">{incident.orderCode}</strong></span>
                  </div>
                )}

                {incident.driverName && (
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Tài xế: <strong>{incident.driverName}</strong></span>
                  </div>
                )}

                {incident.vehiclePlate && (
                  <div className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-amber-500" />
                    <span>Xe: <strong className="font-mono">{incident.vehiclePlate}</strong></span>
                  </div>
                )}

                {incident.warehouseName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Kho: <strong>{incident.warehouseName}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Resolution Note if resolved */}
            {incident.resolutionNote && (
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200">
                <span className="font-semibold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Phương án & Kết quả giải quyết
                </span>
                <p className="leading-relaxed">{incident.resolutionNote}</p>
                {incident.resolvedAt && (
                  <span className="text-[10px] opacity-80 block pt-1">
                    Hoàn tất lúc: {formatDateTime(incident.resolvedAt)}
                  </span>
                )}
              </div>
            )}

            {/* Comments / Timeline */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Nhật ký trao đổi & xử lý ({incident.comments.length})
                </h3>
              </div>

              <div className="space-y-2.5">
                {incident.comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground/60 italic p-3 text-center border border-dashed rounded-lg">
                    Chưa có phản hồi nào
                  </p>
                ) : (
                  incident.comments.map((cmt) => (
                    <div
                      key={cmt.id}
                      className="p-3 rounded-lg border border-border/70 bg-card/60 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-foreground">{cmt.user}</span>
                        <span className="text-muted-foreground text-[10px]">
                          {formatDateTime(cmt.createdAt)}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {cmt.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment input */}
              <form onSubmit={handleSendComment} className="space-y-2 pt-2">
                <Textarea
                  placeholder="Nhập ghi chú hoặc chỉ đạo xử lý sự cố..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[70px] text-xs resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!commentText.trim()}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Gửi bình luận</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-muted/20 flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
