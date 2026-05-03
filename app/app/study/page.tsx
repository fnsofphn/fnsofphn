import { BookOpen, Clock3, Focus, GraduationCap } from "lucide-react";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { PremiumCard } from "@/components/shared/premium-card";
import { StatChart } from "@/components/shared/stat-chart";
import { ModulePage } from "@/features/shared/module-page";
import { getRows } from "@/features/shared/data";
import { tableSchemas } from "@/features/shared/record-schema";
import { requireUser } from "@/lib/auth/guards";
import { percent } from "@/lib/utils/format";

export default async function StudyPage() {
  const user = await requireUser();
  const rows = await getRows("study_sessions", user.id, { orderBy: "occurred_on", limit: 30 });
  const totalMinutes = rows.reduce((total, row) => total + Number(row.duration_minutes ?? 0), 0);
  const target = Number(rows[0]?.weekly_target_minutes ?? 600);
  const progress = percent(totalMinutes, target);
  const focusTopic = String(rows[0]?.topic ?? "Chưa có chủ đề");

  return (
    <ModulePage
      eyebrow="Học tập"
      title="Học thực dụng và tích lũy năng lực"
      description="Theo dõi phiên học, chủ đề, thời lượng và điều rút ra để biến kiến thức thành năng lực dùng được."
      manager={{
        table: "study_sessions",
        path: "/app/study",
        title: "Thêm phiên học",
        description: "Ghi lại một phiên học thật, ưu tiên điều có thể áp dụng ngay.",
        createLabel: "Lưu phiên học",
        emptyTitle: "Chưa có phiên học",
        emptyDescription: "Một phiên 25 phút cũng đủ để khởi động đường cong tích lũy.",
        schema: tableSchemas.study_sessions,
        rows,
        filterFields: ["topic"]
      }}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <FloatingStatCard icon={Clock3} label="Tổng phút đã học" value={`${totalMinutes}p`} helper="Tính trên dữ liệu đang hiển thị." />
        <FloatingStatCard icon={GraduationCap} label="Tiến độ mục tiêu" value={`${progress}%`} helper={`Mục tiêu tham chiếu: ${target} phút.`} tone="cyan" />
        <FloatingStatCard icon={Focus} label="Trọng tâm hiện tại" value={focusTopic} helper="Chủ đề mới nhất được ghi nhận." tone="gold" />
      </section>

      <PremiumCard hover={false}>
        <div className="flex items-center gap-3">
          <BookOpen className="size-5 text-primary-indigo" />
          <h2 className="text-2xl font-bold text-text-primary">Nhịp học gần đây</h2>
        </div>
        <StatChart
          className="mt-5"
          data={[...rows]
            .reverse()
            .slice(-7)
            .map((row) => ({ label: String(row.occurred_on).slice(5), value: Number(row.duration_minutes ?? 0), tone: "indigo" as const }))}
        />
      </PremiumCard>
    </ModulePage>
  );
}
