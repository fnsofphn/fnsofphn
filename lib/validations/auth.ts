import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("Email chưa đúng định dạng."),
  password: z.string().min(6, "Mật khẩu cần ít nhất 6 ký tự.")
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, "Tên hiển thị cần ít nhất 2 ký tự.")
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
