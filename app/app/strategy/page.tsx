import { Compass, Eye, Target } from "lucide-react";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { ModulePage } from "@/features/shared/module-page";
import { getRows } from "@/features/shared/data";
import { tableSchemas } from "@/features/shared/record-schema";
import { requireUser } from "@/lib/auth/guards";

export default async function StrategyPage() {
  const user = await requireUser();
  const rows = await getRows("strategy_profiles", user.id, { orderBy: "updated_at", limit: 1 });
  const strategy = rows[0];

  return (
    <ModulePage
      eyebrow="Chiến lược cá nhân"
      title="90 ngày có chủ đích"
      description="Làm rõ chủ đề đời sống, đòn bẩy mạnh nhất, điểm mù, nguyên tắc không thương lượng và kế hoạch 90 ngày."
      manager={{
        table: "strategy_profiles",
        path: "/app/strategy",
        title: "Cập nhật chiến lược",
        description: "Giữ chiến lược đủ rõ để mọi module còn lại phục vụ cùng một hướng.",
        createLabel: "Lưu chiến lược",
        emptyTitle: "Chưa có chiến lược",
        emptyDescription: "Bắt đầu bằng một chủ đề đời sống và một đòn bẩy mạnh nhất.",
        schema: tableSchemas.strategy_profiles,
        rows
      }}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <FloatingStatCard icon={Target} label="Điểm tập trung" value={`${strategy?.focus_level_score ?? 0}/100`} helper="Tự đánh giá mức sắc nét hiện tại." />
        <FloatingStatCard icon={Compass} label="Đòn bẩy" value={strategy?.strongest_leverage ? "Đã rõ" : "Chưa rõ"} helper={String(strategy?.strongest_leverage ?? "Hãy chọn một đòn bẩy mạnh nhất.")} tone="cyan" />
        <FloatingStatCard icon={Eye} label="Điểm mù" value={strategy?.blind_spot ? "Đã nhận diện" : "Chưa ghi"} helper={String(strategy?.blind_spot ?? "Điểm mù được viết ra sẽ bớt điều khiển bạn.")} tone="rose" />
      </section>
    </ModulePage>
  );
}
