import { cn } from "@/lib/utils/cn";

type SurfacePanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function SurfacePanel({ children, className }: SurfacePanelProps) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-border-soft bg-white/58 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07)] backdrop-blur-2xl",
        className
      )}
    >
      {children}
    </section>
  );
}
