import { cn } from "@/lib/utils/cn";

type GlowBadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function GlowBadge({ children, className }: GlowBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-primary-indigo/15 bg-white/65 px-3 py-1 text-xs font-semibold text-primary-indigo shadow-[0_10px_28px_rgba(91,108,255,0.12)] backdrop-blur-xl",
        className
      )}
    >
      {children}
    </span>
  );
}
