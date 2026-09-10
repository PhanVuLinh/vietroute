import React from "react";
import { Sparkles, SlidersHorizontal, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";

interface DispatchHeaderProps {
  mode: "MANUAL" | "AUTO";
  onModeChange: (mode: "MANUAL" | "AUTO") => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DispatchHeader: React.FC<DispatchHeaderProps> = ({
  mode,
  onModeChange,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border/60">
      {/* 1. Tiêu đề & Mô tả */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Điều phối giao hàng
          </h1>
          <Badge
            variant="outline"
            className="hidden sm:inline-flex text-[11px] font-semibold border-primary/30 text-primary bg-primary/5"
          >
            Trung tâm chỉ huy
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Phân công và giám sát đơn hàng theo thời gian thực
        </p>
      </div>

      {/* 2. Switch chế độ Tự động / Thủ công & Nút Làm mới */}
      <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
        <Tabs
          value={mode}
          onValueChange={(val) => onModeChange(val as "MANUAL" | "AUTO")}
          className="h-9"
        >
          <TabsList className="h-9 p-0.5 bg-muted/80">
            <TabsTrigger
              value="MANUAL"
              className="h-8 px-3 text-xs font-semibold gap-1.5 cursor-pointer data-[state=active]:bg-card data-[state=active]:text-foreground"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Phân công thủ công</span>
            </TabsTrigger>
            <TabsTrigger
              value="AUTO"
              className="h-8 px-3 text-xs font-semibold gap-1.5 cursor-pointer data-[state=active]:bg-card data-[state=active]:text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Chế độ tự động</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 w-9 shrink-0 cursor-pointer"
            title="Đồng bộ lại dữ liệu"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        )}
      </div>
    </div>
  );
};
