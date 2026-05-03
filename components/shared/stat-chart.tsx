"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export type StatPoint = {
  label: string;
  value: number;
  tone?: "indigo" | "cyan" | "rose" | "gold";
};

type StatChartProps = {
  data: StatPoint[];
  max?: number;
  className?: string;
};

const fills = {
  indigo: "linear-gradient(180deg,#5B6CFF,#8B5CF6)",
  cyan: "linear-gradient(180deg,#67E8F9,#5B6CFF)",
  rose: "linear-gradient(180deg,#F9A8D4,#8B5CF6)",
  gold: "linear-gradient(180deg,#F5C97A,#F9A8D4)"
};

export function StatChart({ data, max, className }: StatChartProps) {
  const chartMax = max ?? Math.max(10, ...data.map((item) => item.value));

  return (
    <div className={cn("flex h-48 items-end gap-3 rounded-[24px] border border-border-soft bg-white/55 p-4", className)}>
      {data.map((item, index) => {
        const height = Math.max(8, Math.min(100, (item.value / chartMax) * 100));
        return (
          <div key={`${item.label}-${index}`} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <div className="flex h-full w-full items-end rounded-full bg-slate-200/45 p-1">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${height}%`, opacity: 1 }}
                transition={{ duration: 0.55, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="w-full rounded-full shadow-[0_12px_28px_rgba(91,108,255,0.2)]"
                style={{ background: fills[item.tone ?? "indigo"] }}
              />
            </div>
            <span className="truncate text-xs font-medium text-text-secondary">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
