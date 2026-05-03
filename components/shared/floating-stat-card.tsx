import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type FloatingStatCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  tone?: "indigo" | "cyan" | "rose" | "gold";
  delay?: number;
};

const tones = {
  indigo: "from-primary-indigo to-secondary-violet text-white",
  cyan: "from-soft-cyan to-primary-indigo text-white",
  rose: "from-soft-rose to-secondary-violet text-white",
  gold: "from-premium-gold to-soft-rose text-slate-900"
};

export function FloatingStatCard({ label, value, helper, icon: Icon, tone = "indigo" }: FloatingStatCardProps) {
  return (
    <div className="rounded-[24px] border border-border-soft bg-white/70 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(91,108,255,0.13)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-normal text-text-primary">{value}</p>
        </div>
        <div className={cn("grid size-11 place-items-center rounded-2xl bg-gradient-to-br shadow-[0_16px_36px_rgba(91,108,255,0.22)]", tones[tone])}>
          <Icon className="size-5" />
        </div>
      </div>
      {helper ? <p className="mt-3 text-sm leading-6 text-text-secondary">{helper}</p> : null}
    </div>
  );
}
