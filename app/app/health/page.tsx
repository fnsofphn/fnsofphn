import { Activity, Droplets, Footprints, Moon } from "lucide-react";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { PremiumCard } from "@/components/shared/premium-card";
import { StatChart } from "@/components/shared/stat-chart";
import { ModulePage } from "@/features/shared/module-page";
import { getRows } from "@/features/shared/data";
import { tableSchemas } from "@/features/shared/record-schema";
import { requireUser } from "@/lib/auth/guards";
import { formatNumber } from "@/lib/utils/format";

export default async function HealthPage() {
  const user = await requireUser();
  const rows = await getRows("health_logs", user.id, { orderBy: "logged_on", limit: 14 });
  const latest = rows[0];
  const averageSleep = rows.length ? rows.reduce((total, row) => total + Number(row.sleep_hours ?? 0), 0) / rows.length : 0;
  const workouts = rows.reduce((total, row) => total + Number(row.workouts_count ?? 0), 0);

  return (
    <ModulePage
      eyebrow="Sức khỏe"
      title="Nền cơ thể và năng lượng"
      description="Ghi lại ngủ, nước, bước chân, vận động và điểm năng lượng để nhìn được nhịp phục hồi thật."
      manager={{
        table: "health_logs",
        path: "/app/health",
        title: "Thêm log sức khỏe",
        description: "Một log ngắn mỗi ngày giúp hệ điều hành cá nhân hiểu cơ thể bạn đang ở trạng thái nào.",
        createLabel: "Lưu log sức khỏe",
        emptyTitle: "Chưa có log sức khỏe",
        emptyDescription: "Hãy nhập ngày đầu tiên để bắt đầu thấy xu hướng năng lượng.",
        schema: tableSchemas.health_logs,
        rows
      }}
    >
      <section className="grid gap-4 md:grid-cols-4">
        <FloatingStatCard icon={Activity} label="Năng lượng mới nhất" value={`${latest?.energy_score ?? 0}/100`} helper="Điểm tự cảm nhận hằng ngày." />
        <FloatingStatCard icon={Moon} label="Ngủ trung bình" value={`${averageSleep.toFixed(1)}h`} helper="Tính trên các log gần nhất." tone="cyan" />
        <FloatingStatCard icon={Droplets} label="Nước hôm nay" value={`${latest?.water_liters ?? 0}L`} helper="Một tín hiệu nền rất thực dụng." tone="cyan" />
        <FloatingStatCard icon={Footprints} label="Bước mới nhất" value={formatNumber(Number(latest?.steps ?? 0))} helper={`${workouts} buổi vận động đã ghi.`} tone="gold" />
      </section>

      <PremiumCard hover={false}>
        <h2 className="text-2xl font-bold text-text-primary">Xu hướng năng lượng</h2>
        <StatChart
          className="mt-5"
          max={100}
          data={[...rows]
            .reverse()
            .slice(-7)
            .map((row) => ({ label: String(row.logged_on).slice(5), value: Number(row.energy_score ?? 0), tone: "cyan" as const }))}
        />
      </PremiumCard>
    </ModulePage>
  );
}
