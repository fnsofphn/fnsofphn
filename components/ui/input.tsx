import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-2xl border border-border-soft bg-white/72 px-4 py-2 text-sm text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_12px_30px_rgba(15,23,42,0.04)] transition duration-200 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-indigo/15 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
