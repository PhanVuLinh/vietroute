import React from "react";
import { cn } from "@/shared/utils/cn";

export interface PageContainerProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  fullHeight?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  action,
  breadcrumbs,
  fullHeight = false,
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col w-full",
        fullHeight ? "h-full overflow-hidden" : "min-h-full space-y-6 pb-8",
        className
      )}
    >
      {/* Breadcrumbs slot */}
      {breadcrumbs && <div className="mb-1">{breadcrumbs}</div>}

      {/* Page Header */}
      {(title || action) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
          <div>
            {title && <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{title}</h1>}
            {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{action}</div>}
        </div>
      )}

      {/* Page Content */}
      <div className={cn("w-full", fullHeight ? "flex-1 overflow-hidden" : "space-y-6")}>
        {children}
      </div>
    </div>
  );
};
