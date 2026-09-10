import React from "react";
import {
  Route as RouteIcon,
  Navigation,
  Clock,
  Fuel,
  Coins,
  Truck,
  User,
  Building2,
  MoreVertical,
  Eye,
  Edit,
  Play,
  CheckCircle2,
  Trash2,
  MapPin,
  Copy,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { RouteStatusBadge } from "./RouteStatusBadge";
import type { RouteStatus } from "@/core/types/logistics";
import type { EnrichedRoute } from "../hooks/useRoutes";
import { cn } from "@/shared/utils/cn";

interface RouteMobileCardsProps {
  routes: EnrichedRoute[];
  selectedRouteId: string | null;
  onSelectRoute: (route: EnrichedRoute) => void;
  onViewDetail: (route: EnrichedRoute) => void;
  onFocusMap?: (route: EnrichedRoute) => void;
  onEdit: (route: EnrichedRoute) => void;
  onDuplicate?: (route: EnrichedRoute) => void;
  onUpdateStatus: (id: string, status: RouteStatus) => void;
  onDelete: (route: EnrichedRoute) => void;
}

export const RouteMobileCards: React.FC<RouteMobileCardsProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  onViewDetail,
  onFocusMap,
  onEdit,
  onDuplicate,
  onUpdateStatus,
  onDelete,
}) => {
  if (routes.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {routes.map((route) => {
        const isSelected = selectedRouteId === route.id;

        return (
          <div
            key={route.id}
            onClick={() => onSelectRoute(route)}
            className={cn(
              "bg-card border rounded-xl p-3.5 shadow-2xs space-y-3 transition-all cursor-pointer",
              isSelected
                ? "border-primary/50 bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/30"
                : "border-border hover:border-border/80"
            )}
          >
            {/* Header: Code, Name, Status & Menu */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono font-bold text-xs bg-muted px-1.5 py-0.5 rounded border border-border/50 text-foreground">
                    {route.routeCode}
                  </span>
                  <RouteStatusBadge status={route.status} />
                </div>
                <h4 className="font-bold text-sm text-foreground line-clamp-1">
                  {route.routeName || route.routeCode}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Building2 className="h-3 w-3 shrink-0 text-muted-foreground/80" />
                  <span>{route.warehouse?.name || "Kho xuất phát"}</span>
                </div>
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 shadow-lg">
                    <DropdownMenuItem
                      onClick={() => onViewDetail(route)}
                      className="gap-2 text-xs cursor-pointer font-semibold"
                    >
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      <span>Xem chi tiết tuyến</span>
                    </DropdownMenuItem>

                    {onFocusMap && (
                      <DropdownMenuItem
                        onClick={() => onFocusMap(route)}
                        className="gap-2 text-xs cursor-pointer"
                      >
                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                        <span>Xem trên bản đồ</span>
                      </DropdownMenuItem>
                    )}

                    {route.status === "PLANNED" && (
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(route.id, "ACTIVE")}
                        className="gap-2 text-xs text-amber-600 font-semibold cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Bắt đầu chạy</span>
                      </DropdownMenuItem>
                    )}

                    {route.status === "ACTIVE" && (
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(route.id, "COMPLETED")}
                        className="gap-2 text-xs text-emerald-600 font-semibold cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Hoàn thành tuyến</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={() => onEdit(route)}
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5 text-amber-500" />
                      <span>Chỉnh sửa tuyến</span>
                    </DropdownMenuItem>

                    {onDuplicate && (
                      <DropdownMenuItem
                        onClick={() => onDuplicate(route)}
                        className="gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>Nhân bản tuyến này</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => onDelete(route)}
                      className="gap-2 text-xs text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Xóa tuyến</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Driver & Vehicle */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 text-xs">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <User className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate font-medium text-foreground">
                  {route.driver?.fullName || "Chưa phân tài"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground overflow-hidden">
                <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{route.vehicle?.licensePlate || "Chưa gán xe"}</span>
              </div>
            </div>

            {/* Progress of Stops */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">
                  Tiến độ chặng: <strong>{route.completedStopsCount}/{route.totalStopsCount}</strong>
                </span>
                <span className="font-mono font-bold text-foreground">{route.progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    route.progressPercent === 100 ? "bg-emerald-500" : "bg-primary"
                  )}
                  style={{ width: `${route.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Distance, Duration, Fuel, Toll */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60 text-[11px]">
              <div className="flex items-center gap-1 text-muted-foreground font-mono">
                <Navigation className="h-3 w-3 text-primary shrink-0" />
                <span>{route.totalDistance} km (~{route.estimatedDuration}p)</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground font-mono justify-end">
                <Fuel className="h-3 w-3 text-blue-500 shrink-0" />
                <span>~{route.fuelEstLiters || 0}L Dầu</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(route);
                }}
                className="flex-1 h-8 text-xs gap-1"
              >
                <Eye className="h-3.5 w-3.5 text-primary" />
                <span>Xem chặng dừng</span>
              </Button>
              {onFocusMap && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFocusMap(route);
                  }}
                  className="h-8 text-xs gap-1 px-3"
                >
                  <MapPin className="h-3.5 w-3.5 text-blue-500" />
                  <span>Bản đồ</span>
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
