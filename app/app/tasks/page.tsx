import { CheckCircle2, CircleDot, ListChecks } from "lucide-react";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { ModulePage } from "@/features/shared/module-page";
import { getRows } from "@/features/shared/data";
import { tableSchemas } from "@/features/shared/record-schema";
import { requireUser } from "@/lib/auth/guards";

export default async function TasksPage() {
  const user = await requireUser();
  const rows = await getRows("tasks", user.id, { orderBy: "created_at" });
  const doing = rows.filter((row) => row.status === "doing").length;
  const done = rows.filter((row) => row.status === "done").length;
  const topPriority = rows
    .filter((row) => row.status !== "done")
    .sort((a, b) => Number(b.priority ?? 0) - Number(a.priority ?? 0))[0];

  return (
    <ModulePage
      eyebrow="Nhiệm vụ"
      title="Ưu tiên và tiến độ"
      description="Quản lý nhiệm vụ theo trạng thái, nhóm, mức ưu tiên và hạn xử lý để ngày làm việc luôn có điểm tựa rõ ràng."
      manager={{
        table: "tasks",
        path: "/app/tasks",
        title: "Thêm nhiệm vụ",
        description: "Ghi nhanh việc cần làm, sau đó cập nhật trạng thái khi tiến triển.",
        createLabel: "Thêm nhiệm vụ",
        emptyTitle: "Chưa có nhiệm vụ nào",
        emptyDescription: "Bắt đầu với một việc nhỏ nhưng có lực kéo rõ ràng cho hôm nay.",
        schema: tableSchemas.tasks,
        rows,
        filterFields: ["status", "category"]
      }}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <FloatingStatCard icon={ListChecks} label="Tổng nhiệm vụ" value={String(rows.length)} helper="Toàn bộ việc đang được theo dõi." />
        <FloatingStatCard icon={CircleDot} label="Đang làm" value={String(doing)} helper={topPriority ? `Ưu tiên mạnh nhất: ${topPriority.title}` : "Chưa có ưu tiên đang mở."} tone="cyan" />
        <FloatingStatCard icon={CheckCircle2} label="Hoàn tất" value={String(done)} helper="Dấu vết của tiến độ thực tế." tone="gold" />
      </section>
    </ModulePage>
  );
}
