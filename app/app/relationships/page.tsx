import { HeartHandshake, MessageCircle, UsersRound } from "lucide-react";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { ModulePage } from "@/features/shared/module-page";
import { getRows } from "@/features/shared/data";
import { tableSchemas } from "@/features/shared/record-schema";
import { requireUser } from "@/lib/auth/guards";

export default async function RelationshipsPage() {
  const user = await requireUser();
  const rows = await getRows("relationship_logs", user.id, { orderBy: "occurred_on", limit: 50 });
  const completed = rows.filter((row) => row.completed).length;
  const people = new Set(rows.map((row) => row.person_name).filter(Boolean).map(String)).size;

  return (
    <ModulePage
      eyebrow="Mối quan hệ"
      title="Chăm sóc kết nối quan trọng"
      description="Theo dõi những hành động nhỏ dành cho người quan trọng để sự quan tâm không chỉ nằm trong ý định."
      manager={{
        table: "relationship_logs",
        path: "/app/relationships",
        title: "Thêm hành động chăm sóc",
        description: "Một tin nhắn, cuộc gọi hoặc sự giúp đỡ nhỏ cũng là dữ liệu đáng lưu.",
        createLabel: "Lưu hành động",
        emptyTitle: "Chưa có hành động quan hệ",
        emptyDescription: "Chọn một người quan trọng và ghi lại một hành động chăm sóc thật cụ thể.",
        schema: tableSchemas.relationship_logs,
        rows,
        filterFields: ["person_name", "completed"]
      }}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <FloatingStatCard icon={UsersRound} label="Người đã chăm sóc" value={String(people)} helper="Số kết nối riêng biệt trong dữ liệu." />
        <FloatingStatCard icon={HeartHandshake} label="Hành động hoàn tất" value={String(completed)} helper="Chăm sóc bằng hành động thực." tone="cyan" />
        <FloatingStatCard icon={MessageCircle} label="Tổng ghi nhận" value={String(rows.length)} helper="Lịch sử quan hệ gần đây." tone="gold" />
      </section>
    </ModulePage>
  );
}
