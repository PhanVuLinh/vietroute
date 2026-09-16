import React from "react";
import { Table as TableIcon, Map as MapIcon, Columns2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";

export type ViewMode = "TABLE" | "MAP" | "SPLIT";

export interface ViewModeToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
  showSplit?: boolean;
  className?: string;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onChange,
  showSplit = true,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center bg-muted p-0.5 rounded-lg border border-border shrink-0 select-none",
        className
      )}
    >
      <Button
        size="sm"
        variant={viewMode === "TABLE" ? "default" : "ghost"}
        onClick={() => onChange("TABLE")}
        className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer"
        title="Chế độ xem bảng dữ liệu"
      >
        <TableIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Danh sách</span>
      </Button>

      <Button
        size="sm"
        variant={viewMode === "MAP" ? "default" : "ghost"}
        onClick={() => onChange("MAP")}
        className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer"
        title="Chế độ xem bản đồ toàn cảnh"
      >
        <MapIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Bản đồ</span>
      </Button>

      {showSplit && (
        <Button
          size="sm"
          variant={viewMode === "SPLIT" ? "default" : "ghost"}
          onClick={() => onChange("SPLIT")}
          className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer"
          title="Chế độ chia đôi: Bản đồ & Danh sách song song"
        >
          <Columns2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Song song</span>
        </Button>
      )}
    </div>
  );
};
