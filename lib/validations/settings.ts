import { z } from "zod";

export const settingsSchema = z.object({
  fullName: z.string().trim().min(2, "Tên hiển thị cần ít nhất 2 ký tự."),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày sinh chưa đúng định dạng."),
  westernZodiacLabel: z.string().trim().min(1, "Cần nhập nhãn cung hoàng đạo."),
  lunarYearLabel: z.string().trim().min(1, "Cần nhập nhãn năm âm lịch."),
  elementLabel: z.string().trim().min(1, "Cần nhập nhãn yếu tố."),
  preferredTheme: z.enum(["aether", "silver", "calm"], {
    error: "Chủ đề giao diện chưa hợp lệ."
  })
});

export type SettingsValues = z.infer<typeof settingsSchema>;
