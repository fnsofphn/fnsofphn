"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type MorphBackgroundProps = {
  className?: string;
  intensity?: "soft" | "strong";
};

export function MorphBackground({ className, intensity = "soft" }: MorphBackgroundProps) {
  const opacity = intensity === "strong" ? "opacity-80" : "opacity-55";

  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="soft-grid absolute inset-0" />
      <motion.div
        className={cn(
          "absolute -left-28 top-10 h-96 w-96 rounded-[44%_56%_61%_39%/45%_39%_61%_55%] bg-[radial-gradient(circle,rgba(103,232,249,0.48),rgba(91,108,255,0.08)_58%,transparent_72%)] blur-2xl",
          opacity
        )}
        animate={{
          borderRadius: [
            "44% 56% 61% 39% / 45% 39% 61% 55%",
            "54% 46% 43% 57% / 51% 58% 42% 49%",
            "44% 56% 61% 39% / 45% 39% 61% 55%"
          ],
          x: [0, 22, 0],
          y: [0, -18, 0]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={cn(
          "absolute right-[-7rem] top-20 h-[28rem] w-[28rem] rounded-[55%_45%_40%_60%/44%_54%_46%_56%] bg-[radial-gradient(circle,rgba(139,92,246,0.34),rgba(249,168,212,0.16)_50%,transparent_74%)] blur-3xl",
          opacity
        )}
        animate={{
          borderRadius: [
            "55% 45% 40% 60% / 44% 54% 46% 56%",
            "41% 59% 58% 42% / 57% 42% 58% 43%",
            "55% 45% 40% 60% / 44% 54% 46% 56%"
          ],
          x: [0, -24, 0],
          y: [0, 20, 0]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
