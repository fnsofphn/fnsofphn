"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type PremiumCardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
};

export function PremiumCard({ children, className, hover = true, delay = 0 }: PremiumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -3, boxShadow: "0 28px 90px rgba(91,108,255,0.16)" } : undefined}
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-border-soft bg-white/72 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.09)] backdrop-blur-2xl",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.76),rgba(255,255,255,0)_48%)]",
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
