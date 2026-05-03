import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary-indigo/15 bg-primary-indigo/10 text-primary-indigo",
        cyan: "border-cyan-300/30 bg-cyan-100/70 text-cyan-700",
        rose: "border-pink-300/30 bg-pink-100/70 text-pink-700",
        gold: "border-amber-300/30 bg-amber-100/70 text-amber-700",
        neutral: "border-border-soft bg-white/70 text-text-secondary"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
