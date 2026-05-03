import { Brain, Heart, Sparkles } from "lucide-react";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { PremiumCard } from "@/components/shared/premium-card";
import { StatChart } from "@/components/shared/stat-chart";
import { ModulePage } from "@/features/shared/module-page";
import { getRows } from "@/features/shared/data";
import { tableSchemas } from "@/features/shared/record-schema";
import { requireUser } from "@/lib/auth/guards";

export default async function EmotionsPage() {
  const user = await requireUser();
  const rows = await getRows("emotion_logs", user.id, { orderBy: "logged_on", limit: 21 });
  const latest = rows[0];
  const average = rows.length ? rows.reduce((total, row) => total + Number(row.mood_score ?? 0), 0) / rows.length : 0;

  return (
    <ModulePage
      eyebrow="Cảm xúc"
      title="Check-in mềm và an toàn"
      description="Ghi tâm trạng, biết ơn và nhật ký tự quan sát để cảm xúc được nhìn thấy trước khi nó điều khiển ngày của bạn."
      manager={{
        table: "emotion_logs",
        path: "/app/emotions",
        title: "Check-in cảm xúc",
        description: "Một check-in ngắn đủ để đưa cảm xúc từ nền mờ ra mặt phẳng quan sát.",
        createLabel: "Lưu check-in",
        emptyTitle: "Chưa có check-in cảm xúc",
        emptyDescription: "Bắt đầu bằng một điểm tâm trạng và một điều nhỏ bạn biết ơn.",
        schema: tableSchemas.emotion_logs,
        rows
      }}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <FloatingStatCard icon={Brain} label="Tâm trạng mới nhất" value={`${latest?.mood_score ?? 0}/10`} helper={latest?.journal_text ? String(latest.journal_text).slice(0, 90) : "Chưa có nhật ký mới."} />
        <FloatingStatCard icon={Heart} label="Trung bình gần đây" value={`${average.toFixed(1)}/10`} helper="Không phán xét, chỉ quan sát xu hướng." tone="rose" />
        <FloatingStatCard icon={Sparkles} label="Biết ơn gần nhất" value={latest?.gratitude_text ? "Đã ghi" : "Chưa ghi"} helper={latest?.gratitude_text ? String(latest.gratitude_text).slice(0, 90) : "Một câu ngắn là đủ."} tone="gold" />
      </section>

      <PremiumCard hover={false}>
        <h2 className="text-2xl font-bold text-text-primary">Mood trend</h2>
        <StatChart
          className="mt-5"
          max={100}
          data={[...rows]
            .reverse()
            .slice(-10)
            .map((row) => ({ label: String(row.logged_on).slice(5), value: Number(row.mood_score ?? 0) * 10, tone: "rose" as const }))}
        />
      </PremiumCard>
    </ModulePage>
  );
}
