import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { defaultEnergyActivities, defaultProfile } from "@/lib/constants/profile";
import type { AuthUser } from "@/lib/auth/guards";

export async function ensureUserBootstrap(user: AuthUser) {
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from("profiles").insert({
      user_id: user.id,
      email: user.email,
      full_name: "Người vận hành",
      birth_date: defaultProfile.birthDate,
      western_zodiac_label: defaultProfile.westernZodiacLabel,
      lunar_year_label: defaultProfile.lunarYearLabel,
      element_label: defaultProfile.elementLabel,
      preferred_theme: "aether"
    });
  }

  const { data: spiritualProfile } = await supabase
    .from("spiritual_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!spiritualProfile) {
    await supabase.from("spiritual_profiles").insert({
      user_id: user.id,
      birth_date: defaultProfile.birthDate,
      western_zodiac_label: defaultProfile.westernZodiacLabel,
      lunar_year_label: defaultProfile.lunarYearLabel,
      element_label: defaultProfile.elementLabel,
      clarity_score: 72,
      energy_score: 68,
      ritual_text: "10 phút tự quan sát, ghi một điều đang cần được làm dịu.",
      feng_shui_focus_text: "Giữ góc làm việc sáng, ít vật nhiễu, ưu tiên tông xanh dịu.",
      reflection_note: "Các nhãn này chỉ mang tính tham khảo / tự quan sát bản thân, không phải kết luận khoa học."
    });
  }

  const { data: strategyProfile } = await supabase
    .from("strategy_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!strategyProfile) {
    await supabase.from("strategy_profiles").insert({
      user_id: user.id,
      life_theme: "Tích lũy năng lượng ổn định để xây năng lực dài hạn.",
      strongest_leverage: "Coding sâu, học thực dụng và luyện kỹ năng qua lặp lại có chủ đích.",
      blind_spot: "Dễ phân tán khi cảm xúc chưa có đường xả.",
      next_90_days_plan: "Tạo nhịp sinh hoạt nền, chọn một kỹ năng lõi, đo tiến bộ mỗi tuần.",
      non_negotiables: ["Ngủ đủ", "Một phiên học thực dụng", "Một hoạt động tích lũy năng lượng"],
      focus_level_score: 74
    });
  }

  const { count: energyTypeCount } = await supabase
    .from("energy_activity_types")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (!energyTypeCount) {
    await supabase.from("energy_activity_types").insert(
      defaultEnergyActivities.map((activity, index) => ({
        user_id: user.id,
        name: activity.name,
        category: activity.category,
        description: activity.description,
        sort_order: index + 1,
        is_active: true
      }))
    );
  }

  const { count: priorityCount } = await supabase
    .from("daily_priorities")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("planned_on", today);

  if (!priorityCount) {
    await supabase.from("daily_priorities").insert([
      { user_id: user.id, title: "Một khối deep work yên tĩnh", rank: 1, planned_on: today },
      { user_id: user.id, title: "Hoàn thành một hoạt động tích lũy năng lượng", rank: 2, planned_on: today },
      { user_id: user.id, title: "Ghi lại một điều học được có thể dùng ngay", rank: 3, planned_on: today }
    ]);
  }
}
