import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 text-xs [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-3.5 [&>svg]:top-3.5 [&>svg]:text-foreground [&>svg~*]:pl-6",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "border-destructive/30 text-destructive bg-destructive/10 dark:bg-destructive/15 [&>svg]:text-destructive",
        warning:
          "border-warning/30 text-warning bg-warning/10 dark:bg-warning/15 [&>svg]:text-warning",
        info:
          "border-info/30 text-info bg-info/10 dark:bg-info/15 [&>svg]:text-info",
        success:
          "border-success/30 text-success bg-success/10 dark:bg-success/15 [&>svg]:text-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-xs [&_p]:leading-relaxed text-inherit", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
