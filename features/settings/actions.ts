"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvError } from "@/lib/supabase/env";
import { settingsSchema, type SettingsValues } from "@/lib/validations/settings";

export type SettingsActionResult = {
  ok: boolean;
  message: string;
};

export async function updateSettings(values: SettingsValues): Promise<SettingsActionResult> {
  const parsed = settingsSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Cài đặt chưa hợp lệ." };
  }

  try {
    const user = await requireUser();
    const supabase = await createClient();

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        birth_date: parsed.data.birthDate,
        western_zodiac_label: parsed.data.westernZodiacLabel,
        lunar_year_label: parsed.data.lunarYearLabel,
        element_label: parsed.data.elementLabel,
        preferred_theme: parsed.data.preferredTheme
      })
      .eq("user_id", user.id);

    if (profileError) return { ok: false, message: profileError.message };

    const { error: spiritualError } = await supabase.from("spiritual_profiles").upsert(
      {
        user_id: user.id,
        birth_date: parsed.data.birthDate,
        western_zodiac_label: parsed.data.westernZodiacLabel,
        lunar_year_label: parsed.data.lunarYearLabel,
        element_label: parsed.data.elementLabel
      },
      { onConflict: "user_id" }
    );

    if (spiritualError) return { ok: false, message: spiritualError.message };

    revalidatePath("/app", "layout");
    revalidatePath("/app/settings");
    revalidatePath("/app/soul");
    return { ok: true, message: "Đã cập nhật cài đặt cá nhân." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : getSupabaseEnvError(error) };
  }
}
