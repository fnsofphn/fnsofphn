import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, label, ...props }, ref) => (
  <label className="inline-flex items-center gap-3 text-sm font-medium text-text-primary">
    <span className="relative grid size-5 place-items-center">
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "peer size-5 appearance-none rounded-md border border-border-soft bg-white/80 transition checked:border-primary-indigo checked:bg-primary-indigo focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-indigo/15",
          className
        )}
        {...props}
      />
      <Check className="pointer-events-none absolute size-3.5 text-white opacity-0 transition peer-checked:opacity-100" />
    </span>
    {label ? <span>{label}</span> : null}
  </label>
));
Checkbox.displayName = "Checkbox";

export { Checkbox };
