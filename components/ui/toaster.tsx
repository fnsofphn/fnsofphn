"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "border border-border-soft bg-white/90 text-text-primary shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-xl",
          description: "text-text-secondary",
          actionButton: "bg-primary-indigo text-white",
          cancelButton: "bg-slate-100 text-text-primary"
        }
      }}
    />
  );
}
