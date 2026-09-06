import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface LoadingSpinnerProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  label = "Đang tải dữ liệu...",
  className,
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 p-6 text-muted-foreground", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}
