import React, { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface SearchBarProps {
  className?: string;
  onSearch?: (query: string) => void;
  onOpenCommandPalette?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className,
  onSearch,
  onOpenCommandPalette,
}) => {
  const [query, setQuery] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(query);
    }
  };

  return (
    <div
      onClick={onOpenCommandPalette}
      className={cn(
        "group relative flex items-center w-full max-w-xs md:max-w-sm lg:max-w-md transition-all",
        className
      )}
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80 group-hover:text-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Tìm đơn hàng, tài xế, biển số xe..."
        className="h-9 w-full rounded-lg border border-border/80 bg-muted/40 hover:bg-muted/60 focus:bg-background pl-9 pr-14 text-xs placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/15 transition-all shadow-2xs"
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1 rounded border border-border/80 bg-card px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground shadow-[0_1px_1px_rgba(0,0,0,0.08)] select-none">
        <kbd className="text-[9px]">Ctrl</kbd>
        <span className="text-[9px]">K</span>
      </div>
    </div>
  );
};
