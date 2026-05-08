import { FlaskConical, Gauge, Gamepad2, Shield, Sparkles, Swords, Target, Trophy } from "lucide-react";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { PremiumCard } from "@/components/shared/premium-card";
import { cn } from "@/lib/utils/cn";

const coreIdeas = [
  {
    name: "Aatrox chí mạng Vô Cực Kiếm",
    tag: "Burst crit",
    fantasy: "Căn sweet spot để tích chí mạng, rồi tung cú chém lớn dọn cả wave.",
    loop: "Đánh trúng Q chuẩn, giữ combo, hồi máu bằng sát thương chí mạng.",
    upgrades: ["Chí mạng gây nổ", "Kiếm bay phụ", "Hồi máu dư thành giáp"],
    tone: "rose"
  },
  {
    name: "Rammus chạy vòng vòng",
    tag: "Speed crash",
    fantasy: "Lăn càng lâu càng nhanh, bo cua đúng góc rồi húc quái liên hoàn.",
    loop: "Giữ tốc độ, né tường, gom quái thành đoàn trước khi va chạm.",
    upgrades: ["Vệt gai sau lưng", "Phản sát thương theo tốc độ", "Húc tường tạo sóng chấn động"],
    tone: "cyan"
  },
  {
    name: "Singed thả độc",
    tag: "Poison trail",
    fantasy: "Chạy trước mọi nguy hiểm, để cả bản đồ chết dần phía sau.",
    loop: "Dụ quái qua đường độc, quản lý bình độc và bật thuốc đúng lúc.",
    upgrades: ["Độc lan mục tiêu gần", "Keo làm chậm", "Thuốc biến độc thành lửa"],
    tone: "gold"
  }
] as const;

const extraIdeas = [
  {
    name: "Garen quay chí mạng",
    icon: Swords,
    mechanic: "Mỗi tick quay có thể chí mạng, đánh trúng liên tục làm vòng quay lớn hơn."
  },
  {
    name: "Yasuo tốc đánh lốc liên tục",
    icon: Gauge,
    mechanic: "Tốc đánh giảm nhịp Q, lốc xuyên nhiều mục tiêu sẽ mạnh hơn."
  },
  {
    name: "Teemo phủ nấm kín bản đồ",
    icon: Target,
    mechanic: "Đặt nấm ở choke point, dụ wave đi vào bẫy nổ dây chuyền."
  },
  {
    name: "Sion đâm xe không phanh",
    icon: Shield,
    mechanic: "Chỉ điều khiển hướng, càng đâm nhiều càng tăng tốc và sát thương."
  },
  {
    name: "Draven bắt rìu sinh tồn",
    icon: Trophy,
    mechanic: "Bắt rìu giữ combo sát thương, rớt rìu thì mất stack."
  },
  {
    name: "Blitzcrank kéo xổ số",
    icon: Gamepad2,
    mechanic: "Mỗi cú kéo có thể kéo quái, item, bom, rương hoặc mini boss."
  },
  {
    name: "Jhin bốn viên đạn",
    icon: Sparkles,
    mechanic: "Ba viên đầu để setup, viên thứ tư chí mạng để kết liễu mục tiêu lớn."
  },
  {
    name: "Mundo ném dao hồi máu",
    icon: FlaskConical,
    mechanic: "Dao trúng hồi máu, dao hụt tự mất máu nhẹ nên phải chơi liều có tính toán."
  }
];

const toneClasses = {
  rose: "from-soft-rose to-secondary-violet text-white",
  cyan: "from-soft-cyan to-primary-indigo text-white",
  gold: "from-premium-gold to-soft-rose text-slate-900"
};

export default function GamePage() {
  return (
    <PageTransition className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="Game lab"
        title="Champion meme roguelike"
        description="Kho ý tưởng cho mini game kiểu mỗi champion có một luật chơi dị: Aatrox chí mạng, Rammus lăn vòng vòng, Singed thả độc và các build vui khác."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <FloatingStatCard icon={Gamepad2} label="Prototype đầu tiên" value="3 tướng" helper="Aatrox, Rammus, Singed là core loop nên làm trước." />
        <FloatingStatCard icon={Sparkles} label="Ý tưởng mở rộng" value={`${extraIdeas.length}`} helper="Các build meme có thể mở khóa sau mỗi run." tone="cyan" />
        <FloatingStatCard icon={Trophy} label="Thể loại" value="Arena" helper="Survival roguelike, wave quái, XP và nâng cấp theo level." tone="gold" />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {coreIdeas.map((idea) => (
          <PremiumCard key={idea.name} className="p-0">
            <div className={cn("rounded-t-[28px] bg-gradient-to-br p-5", toneClasses[idea.tone])}>
              <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-80">{idea.tag}</p>
              <h2 className="mt-3 text-2xl font-bold tracking-normal">{idea.name}</h2>
            </div>
            <div className="space-y-5 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">Fantasy</p>
                <p className="mt-2 text-sm leading-6 text-text-primary">{idea.fantasy}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">Loop chơi</p>
                <p className="mt-2 text-sm leading-6 text-text-primary">{idea.loop}</p>
              </div>
              <div className="space-y-2">
                {idea.upgrades.map((upgrade) => (
                  <div key={upgrade} className="rounded-2xl border border-border-soft bg-white/72 px-3 py-2 text-sm font-semibold text-text-secondary">
                    {upgrade}
                  </div>
                ))}
              </div>
            </div>
          </PremiumCard>
        ))}
      </section>

      <PremiumCard hover={false}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-normal text-text-primary">Backlog build meme</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Các ý tưởng này dùng để mở rộng sau khi core loop arena, wave quái và hệ nâng cấp đã ổn định.
            </p>
          </div>
          <div className="rounded-2xl border border-border-soft bg-white/72 px-4 py-2 text-sm font-bold text-primary-indigo">
            {extraIdeas.length} concept
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {extraIdeas.map((idea) => (
            <div key={idea.name} className="rounded-3xl border border-border-soft bg-white/70 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
              <div className="grid size-10 place-items-center rounded-2xl bg-white text-primary-indigo shadow-[0_10px_30px_rgba(91,108,255,0.16)]">
                <idea.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-bold tracking-normal text-text-primary">{idea.name}</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{idea.mechanic}</p>
            </div>
          ))}
        </div>
      </PremiumCard>
    </PageTransition>
  );
}
