import React from "react";
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  User,
  Package,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";
import {
  type Incident,
  type IncidentStatus,
  INCIDENT_TYPE_LABELS,
  SEVERITY_META,
} from "../types/incident";

interface IncidentWorkflowBoardProps {
  columns: {
    NEW: Incident[];
    IN_PROGRESS: Incident[];
    PENDING_REVIEW: Incident[];
    RESOLVED: Incident[];
  };
  onSelectIncident: (incident: Incident) => void;
  onUpdateStatus: (id: string, status: IncidentStatus) => void;
}

const COLUMN_CONFIG: {
  key: keyof IncidentWorkflowBoardProps["columns"];
  title: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
  nextStatus?: IncidentStatus;
  nextLabel?: string;
}[] = [
  {
    key: "NEW",
    title: "Mới phát sinh",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: AlertCircle,
    nextStatus: "IN_PROGRESS",
    nextLabel: "Tiếp nhận",
  },
  {
    key: "IN_PROGRESS",
    title: "Đang xử lý",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Clock,
    nextStatus: "PENDING_REVIEW",
    nextLabel: "Gửi duyệt",
  },
  {
    key: "PENDING_REVIEW",
    title: "Chờ thẩm định",
    badgeClass: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    icon: FileQuestion,
    nextStatus: "RESOLVED",
    nextLabel: "Phê duyệt",
  },
  {
    key: "RESOLVED",
    title: "Đã giải quyết",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckCircle2,
  },
];

export const IncidentWorkflowBoard: React.FC<IncidentWorkflowBoardProps> = ({
  columns,
  onSelectIncident,
  onUpdateStatus,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMN_CONFIG.map((col) => {
        const Icon = col.icon;
        const items = columns[col.key] || [];

        return (
          <div
            key={col.key}
            className="flex flex-col rounded-xl border border-border bg-card/40 backdrop-blur-xs p-3 space-y-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {col.title}
                </h3>
              </div>
              <Badge variant="outline" className={cn("text-[10px] font-mono px-2", col.badgeClass)}>
                {items.length}
              </Badge>
            </div>

            {/* Column Content */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[650px] pr-1">
              {items.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground/60 border border-dashed border-border/60 rounded-lg">
                  Không có sự cố nào
                </div>
              ) : (
                items.map((incident) => {
                  const sev = SEVERITY_META[incident.severity];

                  return (
                    <div
                      key={incident.id}
                      onClick={() => onSelectIncident(incident)}
                      className="p-3 rounded-lg border border-border/80 bg-card hover:border-primary/50 transition-all cursor-pointer shadow-xs space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-foreground">
                          {incident.incidentCode}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border",
                            sev.bg,
                            sev.color
                          )}
                        >
                          <span className={cn("h-1 w-1 rounded-full", sev.dot)} />
                          <span>{sev.label}</span>
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground/70">
                          {INCIDENT_TYPE_LABELS[incident.type]}
                        </span>
                        <p className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {incident.title}
                        </p>
                      </div>

                      {/* Associated details */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                        {incident.orderCode ? (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-primary">
                            <Package className="h-3 w-3" />
                            {incident.orderCode}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/60">
                            Chung
                          </span>
                        )}

                        {incident.assignedTo && (
                          <span className="flex items-center gap-1 text-[10px]">
                            <User className="h-3 w-3" />
                            {incident.assignedTo}
                          </span>
                        )}
                      </div>

                      {/* Quick Move Action */}
                      {col.nextStatus && col.nextLabel && (
                        <div
                          className="pt-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(incident.id, col.nextStatus!);
                          }}
                        >
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full h-6 text-[10px] font-medium gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <span>{col.nextLabel}</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
