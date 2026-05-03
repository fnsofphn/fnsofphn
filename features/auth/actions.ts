"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvError } from "@/lib/supabase/env";
import { defaultProfile } from "@/lib/constants/profile";
import { signInSchema, signUpSchema, type SignInValues, type SignUpValues } from "@/lib/validations/auth";

export type AuthActionResult = {
  ok: boolean;
  message: string;
};

export async function signInWithPassword(values: SignInValues): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Thông tin đăng nhập chưa hợp lệ." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return { ok: false, message: "Email hoặc mật khẩu chưa đúng." };
    }

    revalidatePath("/app", "layout");
    return { ok: true, message: "Đã đăng nhập. Đang mở hệ điều hành cá nhân..." };
  } catch (error) {
    return { ok: false, message: getSupabaseEnvError(error) };
  }
}

export async function signUpWithPassword(values: SignUpValues): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Thông tin đăng ký chưa hợp lệ." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName,
          birth_date: defaultProfile.birthDate,
          western_zodiac_label: defaultProfile.westernZodiacLabel,
          lunar_year_label: defaultProfile.lunarYearLabel,
          element_label: defaultProfile.elementLabel
        }
      }
    });

    if (error) {
      return { ok: false, message: error.message.includes("already") ? "Email này đã được sử dụng." : "Không thể tạo tài khoản lúc này." };
    }

    revalidatePath("/app", "layout");
    return { ok: true, message: "Tài khoản đã sẵn sàng. Nếu dự án yêu cầu xác thực email, hãy xác nhận trước khi đăng nhập." };
  } catch (error) {
    return { ok: false, message: getSupabaseEnvError(error) };
  }
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
