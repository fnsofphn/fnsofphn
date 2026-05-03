import { format } from "date-fns";
import { Flame, ListChecks, Sparkles } from "lucide-react";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { RecordManager } from "@/features/shared/record-manager";
import { EnergyTracker } from "@/features/energy/energy-tracker";
import { tableSchemas } from "@/features/shared/record-schema";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import type { EnergyActivityLogRow, EnergyActivityTypeRow } from "@/types/database";
import { percent } from "@/lib/utils/format";

export default async function EnergyPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const [{ data: activityTypes, error: typeError }, { data: logs, error: logError }] = await Promise.all([
    supabase.from("energy_activity_types").select("*").eq("user_id", user.id).order("sort_order", { ascending: true }),
    supabase.from("energy_activity_logs").select("*").eq("user_id", user.id).eq("logged_on", today)
  ]);

  if (typeError || logError) {
    throw new Error(typeError?.message ?? logError?.message ?? "Không thể tải dữ liệu năng lượng.");
  }

  const typedActivities = (activityTypes ?? []) as EnergyActivityTypeRow[];
  const typedLogs = (logs ?? []) as EnergyActivityLogRow[];
  const completed = typedLogs.filter((log) => log.completed).length;
  const activeActivities = typedActivities.filter((activity) => activity.is_active);
  const score = percent(completed, activeActivities.length);

  return (
    <PageTransition className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="Tích lũy năng lượng"
        title="Nguồn phục hồi thật của bạn"
        description="Một module riêng cho flow, lặp lại, giải tỏa cảm xúc, drill kỹ năng, deep calm work và học thực dụng."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <FloatingStatCard icon={Flame} label="Điểm hôm nay" value={`${score}%`} helper="Tính từ các hoạt động hoàn tất." />
        <FloatingStatCard icon={ListChecks} label="Hoạt động hoàn tất" value={`${completed}/${activeActivities.length}`} helper="Checkbox hằng ngày theo từng nguồn." tone="cyan" />
        <FloatingStatCard icon={Sparkles} label="Nguồn tái sử dụng" value={String(activeActivities.length)} helper="Có thể thêm, sửa, ẩn nguồn năng lượng." tone="gold" />
      </section>

      <EnergyTracker activityTypes={activeActivities} logs={typedLogs} loggedOn={today} />

      <RecordManager
        table="energy_activity_types"
        path="/app/energy"
        title="Thêm nguồn năng lượng"
        description="Tạo nguồn tái sử dụng cho các ngày sau. Những nguồn mặc định đã phản ánh flow, repetition, release, drilling, calm work và practical learning."
        createLabel="Thêm nguồn"
        emptyTitle="Chưa có nguồn năng lượng"
        emptyDescription="Thêm một hoạt động giúp bạn hồi phục thật sự."
        schema={tableSchemas.energy_activity_types}
        rows={typedActivities as unknown as Array<Record<string, unknown>>}
        filterFields={["category", "is_active"]}
      />
    </PageTransition>
  );
}
