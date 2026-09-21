import React from "react";
import { AlertCircle, ChevronRight, MessageSquare, Truck, User } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { formatDateTime } from "@/shared/utils/formatters";
import {
  type Incident,
  INCIDENT_TYPE_LABELS,
  SEVERITY_META,
  STATUS_META,
} from "../types/incident";

interface IncidentTableProps {
  incidents: Incident[];
  isLoading?: boolean;
  onSelectIncident: (incident: Incident) => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  isLoading,
  onSelectIncident,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-card rounded-xl border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card/40 space-y-2">
        <AlertCircle className="h-8 w-8 text-muted-foreground/40 mx-auto" />
        <p className="text-sm font-medium text-foreground">Không tìm thấy sự cố nào</p>
        <p className="text-xs text-muted-foreground">Thử điều chỉnh bộ lọc hoặc tạo sự cố mới</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Mã sự cố</th>
                <th className="py-3 px-4">Mức độ</th>
                <th className="py-3 px-4">Phân loại & Tiêu đề</th>
                <th className="py-3 px-4">Đối tượng liên quan</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {incidents.map((incident) => {
                const sev = SEVERITY_META[incident.severity];
                const st = STATUS_META[incident.status];

                return (
                  <tr
                    key={incident.id}
                    onClick={() => onSelectIncident(incident)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    {/* Mã */}
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {incident.incidentCode}
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border",
                          sev.bg,
                          sev.color
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", sev.dot)} />
                        <span>{sev.label}</span>
                      </span>
                    </td>

                    {/* Phân loại & Tiêu đề */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider">
                          {INCIDENT_TYPE_LABELS[incident.type]}
                        </span>
                        <p className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {incident.title}
                        </p>
                      </div>
                    </td>

                    {/* Liên quan: Order, Driver, Plate */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5 text-[11px] text-muted-foreground">
                        {incident.orderCode && (
                          <span className="font-mono text-primary block">
                            Đơn: {incident.orderCode}
                          </span>
                        )}
                        {incident.driverName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {incident.driverName}
                          </span>
                        )}
                        {incident.vehiclePlate && (
                          <span className="flex items-center gap-1 font-mono">
                            <Truck className="h-3 w-3" />
                            {incident.vehiclePlate}
                          </span>
                        )}
                        {!incident.orderCode && !incident.driverName && !incident.vehiclePlate && (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border",
                          st.bg,
                          st.color
                        )}
                      >
                        {st.label}
                      </span>
                    </td>

                    {/* Thời gian & Bình luận */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground block text-[11px]">
                          {formatDateTime(incident.createdAt)}
                        </span>
                        {incident.comments.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-primary">
                            <MessageSquare className="h-3 w-3" />
                            {incident.comments.length} trao đổi
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Arrow */}
                    <td className="py-3 px-4 text-right">
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all inline-block" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2.5">
        {incidents.map((incident) => {
          const sev = SEVERITY_META[incident.severity];
          const st = STATUS_META[incident.status];

          return (
            <div
              key={incident.id}
              onClick={() => onSelectIncident(incident)}
              className="p-3.5 rounded-xl border border-border bg-card/70 hover:border-primary/40 transition-colors cursor-pointer space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-foreground">
                  {incident.incidentCode}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                    sev.bg,
                    sev.color
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", sev.dot)} />
                  <span>{sev.label}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider">
                  {INCIDENT_TYPE_LABELS[incident.type]}
                </span>
                <h4 className="font-semibold text-xs text-foreground line-clamp-2">
                  {incident.title}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                <span
                  className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border",
                    st.bg,
                    st.color
                  )}
                >
                  {st.label}
                </span>
                <span className="text-muted-foreground text-[10px]">
                  {formatDateTime(incident.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
