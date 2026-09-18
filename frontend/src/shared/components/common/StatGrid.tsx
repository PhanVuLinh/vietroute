import React from "react";
import { cn } from "@/shared/utils/cn";

export interface StatGridProps {
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
  children: React.ReactNode;
}

export const StatGrid: React.FC<StatGridProps> = ({
  columns = 5,
  className,
  children,
}) => {
  const colClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
  }[columns];

  return (
    <div className={cn("grid gap-3 sm:gap-4", colClasses, className)}>
      {children}
    </div>
  );
};
