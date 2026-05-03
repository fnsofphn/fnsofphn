import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatDate(value?: string | null) {
  if (!value) return "Chưa đặt";
  return format(new Date(`${value}T00:00:00`), "dd MMM yyyy", { locale: vi });
}

export function clampScore(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function percent(part: number, total: number) {
  if (!total) return 0;
  return clampScore((part / total) * 100);
}
