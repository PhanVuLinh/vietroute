import React from 'react';
import {
  Building2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { POPULAR_SHIPPERS } from '../../hooks/useB2BPortal';
import type { B2BShipperProfile } from '../../types/b2bPortal';

interface B2BShipperHeaderProps {
  currentShipper: B2BShipperProfile;
  onSelectShipper: (id: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const B2BShipperHeader: React.FC<B2BShipperHeaderProps> = ({
  currentShipper,
  onSelectShipper,
  isLoading,
  onRefresh,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl border border-white/10">
      {/* Decorative background glows */}
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left: Enterprise Brand Identity */}
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-black text-xl shadow-lg border border-white/20 transition-transform hover:scale-105"
            style={{ backgroundColor: currentShipper.brandColor }}
          >
            {currentShipper.logoText}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {currentShipper.name}
              </h1>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[11px] font-bold px-2 py-0.5">
                <Sparkles className="mr-1 h-3 w-3 inline text-amber-400" />
                ĐỐI TÁC CHIẾN LƯỢC {currentShipper.tier}
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live GPS Connected
              </Badge>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <span>
                <strong className="text-slate-400">MST:</strong> {currentShipper.taxCode}
              </span>
              <span>•</span>
              <span>
                <strong className="text-slate-400">Đầu mối:</strong> {currentShipper.contactPerson}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> SLA Cam kết 99.8%
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Shipper Quick Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white cursor-pointer h-9 px-3 text-xs gap-2 font-medium"
              >
                <Building2 className="h-4 w-4 text-blue-400" />
                <span>Chuyển đối tác B2B</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold px-2 py-1.5">
                CHỌN DOANH NGHIỆP TRẢI NGHIỆM PORTAL
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {POPULAR_SHIPPERS.map((shipper) => {
                const isSelected = shipper.id === currentShipper.id;
                return (
                  <DropdownMenuItem
                    key={shipper.id}
                    onClick={() => onSelectShipper(shipper.id)}
                    className="flex items-center justify-between p-2.5 cursor-pointer rounded-lg hover:bg-accent"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
                        style={{ backgroundColor: shipper.brandColor }}
                      >
                        {shipper.logoText}
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-foreground">
                          {shipper.shortName}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[170px]">
                          MST: {shipper.taxCode}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white cursor-pointer h-9 px-3 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>
    </div>
  );
};
