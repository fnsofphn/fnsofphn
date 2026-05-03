import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { SettingsForm } from "@/features/settings/settings-form";
import { defaultProfile } from "@/lib/constants/profile";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { SettingsValues } from "@/lib/validations/settings";

export default async function SettingsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const defaults: SettingsValues = {
    fullName: profile?.full_name ?? "Người vận hành",
    birthDate: profile?.birth_date ?? defaultProfile.birthDate,
    westernZodiacLabel: profile?.western_zodiac_label ?? defaultProfile.westernZodiacLabel,
    lunarYearLabel: profile?.lunar_year_label ?? defaultProfile.lunarYearLabel,
    elementLabel: profile?.element_label ?? defaultProfile.elementLabel,
    preferredTheme: (profile?.preferred_theme as SettingsValues["preferredTheme"]) ?? "aether"
  };

  return (
    <PageTransition className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="Cài đặt"
        title="Không gian cá nhân"
        description="Quản lý hồ sơ cơ bản, nhãn phản chiếu, ngày sinh và tài khoản đăng nhập."
      />
      <SettingsForm defaultValues={defaults} email={profile?.email ?? user.email} />
    </PageTransition>
  );
}
