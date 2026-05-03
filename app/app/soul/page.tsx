import { Leaf, MoonStar, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { PremiumCard } from "@/components/shared/premium-card";
import { ModulePage } from "@/features/shared/module-page";
import { getRows } from "@/features/shared/data";
import { tableSchemas } from "@/features/shared/record-schema";
import { requireUser } from "@/lib/auth/guards";

export default async function SoulPage() {
  const user = await requireUser();
  const rows = await getRows("spiritual_profiles", user.id, { orderBy: "updated_at", limit: 1 });
  const profile = rows[0];

  return (
    <ModulePage
      eyebrow="Tâm linh / tự quan sát"
      title="Không gian phản chiếu cá nhân"
      description="Module này mang tính tham khảo / tự quan sát bản thân. Các nhãn ngày sinh chỉ dùng để gợi mở suy ngẫm, không phải kết luận khoa học."
      manager={{
        table: "spiritual_profiles",
        path: "/app/soul",
        title: "Cập nhật hồ sơ phản chiếu",
        description: "Điều chỉnh nhãn, điểm sáng rõ, năng lượng và nghi thức tự quan sát theo cảm nhận hiện tại.",
        createLabel: "Lưu hồ sơ",
        emptyTitle: "Chưa có hồ sơ phản chiếu",
        emptyDescription: "Bootstrap lần đầu sẽ tạo hồ sơ mặc định; bạn cũng có thể thêm lại tại đây.",
        schema: tableSchemas.spiritual_profiles,
        rows
      }}
    >
      <PremiumCard hover={false}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Nhãn phản chiếu hiện tại</h2>
            <p className="mt-2 text-sm text-text-secondary">Mang tính tham khảo / tự quan sát bản thân.</p>
          </div>
          <Badge variant="gold">Không phải cơ sở khoa học</Badge>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <FloatingStatCard icon={Sparkles} label="Cung" value={String(profile?.western_zodiac_label ?? "Bạch Dương")} helper="Nhãn gợi mở suy ngẫm." />
          <FloatingStatCard icon={MoonStar} label="Năm âm" value={String(profile?.lunar_year_label ?? "Đinh Sửu")} helper="Chỉ dùng làm chất liệu tự quan sát." tone="cyan" />
          <FloatingStatCard icon={Leaf} label="Yếu tố" value={String(profile?.element_label ?? "Giản Hạ Thủy")} helper="Không dùng để quyết định thay bạn." tone="gold" />
        </div>
      </PremiumCard>
    </ModulePage>
  );
}
