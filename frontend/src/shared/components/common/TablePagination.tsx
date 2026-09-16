import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemName?: string;
  onPageChange: (page: number) => void;
  pageSize?: number;
  className?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemName = "bản ghi",
  onPageChange,
  pageSize,
  className,
}) => {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safePage = Math.min(Math.max(1, currentPage || 1), safeTotalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * (pageSize || 10) + 1;
  const endItem = pageSize ? Math.min(safePage * pageSize, totalItems) : null;

  return (
    <div
      className={cn(
        "p-3 border-t border-border/70 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs text-muted-foreground select-none",
        className
      )}
    >
      <div className="font-mono flex items-center gap-1.5 flex-wrap">
        <span>
          Trang <strong className="text-foreground">{safePage}</strong> / {safeTotalPages}
        </span>
        <span className="text-border">•</span>
        <span>
          Tổng <strong className="text-foreground">{totalItems.toLocaleString("vi-VN")}</strong> {itemName}
        </span>
        {endItem !== null && totalItems > 0 && (
          <span className="hidden md:inline text-muted-foreground/75">
            ({startItem}-{endItem})
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage <= 1}
          className="h-8 px-2.5 text-xs gap-1 cursor-pointer disabled:cursor-not-allowed"
          title="Về trang trước"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Trang trước</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
          disabled={safePage >= safeTotalPages}
          className="h-8 px-2.5 text-xs gap-1 cursor-pointer disabled:cursor-not-allowed"
          title="Sang trang sau"
        >
          <span className="hidden sm:inline">Trang sau</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
