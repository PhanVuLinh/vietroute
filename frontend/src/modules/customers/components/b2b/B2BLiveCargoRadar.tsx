import React, { useState } from 'react';
import {
  MapPin,
  Truck,
  Phone,
  Clock,
  Navigation,
  Thermometer,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Progress } from '@/shared/components/ui/progress';
import { MapContainer } from '@/shared/components/map/MapContainer';
import type { B2BCargoItem } from '../../types/b2bPortal';

interface B2BLiveCargoRadarProps {
  cargoList: B2BCargoItem[];
  onSelectCargo: (cargo: B2BCargoItem) => void;
}

export const B2BLiveCargoRadar: React.FC<B2BLiveCargoRadarProps> = ({
  cargoList,
  onSelectCargo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>(cargoList[0]?.id || '');

  const filteredCargo = cargoList.filter(
    (c) =>
      c.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cargoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCargo = cargoList.find((c) => c.id === selectedId) || cargoList[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Cột Trái (7 cols): Bản Đồ Số Trực Tuyến Live Radar */}
      <div className="lg:col-span-7 flex flex-col space-y-3">
        <Card className="overflow-hidden border-border/80 shadow-md flex-1 flex flex-col min-h-[460px]">
          <CardHeader className="py-3 px-4 bg-muted/40 border-b border-border/60 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Navigation className="h-4 w-4 text-primary" />
                Live Cargo Radar — Bản Đồ Giám Sát Vị Trí Xe Tải B2B
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-[11px] font-mono bg-background">
              Tọa độ: {activeCargo ? `${activeCargo.currentCoords[1].toFixed(4)}°N, ${activeCargo.currentCoords[0].toFixed(4)}°E` : '10.7769°N, 106.7009°E'}
            </Badge>
          </CardHeader>

          <div className="relative flex-1 min-h-[380px]">
            {/* Map Container */}
            <MapContainer
              center={activeCargo ? [activeCargo.currentCoords[0], activeCargo.currentCoords[1]] : [106.7009, 10.7769]}
              zoom={13}
              className="h-full w-full"
            />

            {/* Floating Info Overlay on Map */}
            {activeCargo && (
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-card/95 backdrop-blur-md p-3.5 rounded-xl border border-border shadow-lg space-y-2 z-10 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-foreground truncate">
                    <Truck className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{activeCargo.vehiclePlate}</span>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] shrink-0 font-semibold">
                    Đang di chuyển ({activeCargo.etaMinutes} phút nữa tới)
                  </Badge>
                </div>

                <div className="text-[11px] text-muted-foreground line-clamp-1">
                  <strong>Kiện hàng:</strong> {activeCargo.cargoName}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/50 p-2 rounded-lg">
                  <div>
                    <div className="text-muted-foreground text-[10px]">Tài xế chuyên trách:</div>
                    <div className="font-semibold text-foreground truncate">
                      {activeCargo.driverName}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[10px]">Hotline cabin:</div>
                    <a
                      href={`tel:${activeCargo.driverPhone}`}
                      className="font-semibold text-primary flex items-center gap-1 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {activeCargo.driverPhone}
                    </a>
                  </div>
                </div>

                {activeCargo.temperature && (
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                    <Thermometer className="h-3.5 w-3.5 shrink-0" />
                    <span>Nhiệt độ cảm biến: {activeCargo.temperature}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Cột Phải (5 cols): Danh Sách Các Lô Hàng Đang Giao */}
      <div className="lg:col-span-5 flex flex-col space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm mã vận đơn, người nhận, biển số xe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
          <Badge variant="secondary" className="h-9 px-3 text-xs shrink-0 font-medium">
            {filteredCargo.length} chuyến đang chạy
          </Badge>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
          {filteredCargo.map((cargo) => {
            const isSelected = cargo.id === selectedId;
            return (
              <Card
                key={cargo.id}
                onClick={() => {
                  setSelectedId(cargo.id);
                  onSelectCargo(cargo);
                }}
                className={`cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 shadow-md bg-primary/5 dark:bg-primary/10'
                    : 'border-border/70 hover:border-primary/40 hover:bg-muted/30 shadow-xs'
                }`}
              >
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-primary font-mono">
                        {cargo.orderCode}
                      </span>
                      <span className="text-[11px] text-muted-foreground">•</span>
                      <span className="text-xs font-semibold text-foreground">
                        {cargo.weightKg.toLocaleString('vi-VN')} kg
                      </span>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
                      <Clock className="mr-1 h-3 w-3 inline" />
                      Dự kiến {cargo.etaTime}
                    </Badge>
                  </div>

                  <div className="text-xs font-bold text-foreground line-clamp-1">
                    {cargo.cargoName}
                  </div>

                  {/* Lộ trình Điểm lấy -> Điểm giao */}
                  <div className="space-y-1.5 text-[11px] bg-background/80 p-2.5 rounded-lg border border-border/50">
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <span className="text-muted-foreground truncate">
                        <strong>Xuất phát:</strong> {cargo.originName}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-foreground truncate font-medium">
                        <strong>Giao đến:</strong> {cargo.receiverName} ({cargo.receiverAddress})
                      </span>
                    </div>
                  </div>

                  {/* Tiến độ giao hàng */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Tiến độ hành trình:</span>
                      <span className="font-bold text-foreground">{cargo.progressPercent}%</span>
                    </div>
                    <Progress value={cargo.progressPercent} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                    <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                      <Truck className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{cargo.vehiclePlate}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] text-primary gap-1 cursor-pointer font-medium hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCargo(cargo);
                      }}
                    >
                      Chi tiết lộ trình
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
