import * as React from "react";
import { cn } from "@/shared/utils/cn";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-xs font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";
