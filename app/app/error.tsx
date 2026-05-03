"use client";

import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <div className="max-w-lg rounded-[28px] border border-border-soft bg-white/80 p-8 text-center shadow-[0_22px_70px_rgba(15,23,42,0.1)] backdrop-blur-2xl">
        <h2 className="text-2xl font-bold text-text-primary">Không thể mở dashboard</h2>
        <p className="mt-3 text-sm leading-6 text-text-secondary">{error.message || "Có lỗi trong quá trình tải dữ liệu."}</p>
        <Button className="mt-6" onClick={reset}>
          Thử lại
        </Button>
      </div>
    </div>
  );
}
