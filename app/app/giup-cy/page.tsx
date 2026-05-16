import { FileText, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { FloatingStatCard } from "@/components/shared/floating-stat-card";
import { GiupCyAdminDashboard } from "@/features/giup-cy/admin-dashboard";
import { getAdminExams } from "@/features/giup-cy/data";
import { requireUser } from "@/lib/auth/guards";

export default async function GiupCyPage() {
  const user = await requireUser();
  const exams = await getAdminExams(user.id);
  const activeCount = exams.filter((exam) => exam.is_active).length;
  const attemptCount = exams.reduce((total, exam) => total + exam.attemptCount, 0);

  return (
    <PageTransition className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="Giúp Cy"
        title="Đề thi online"
        description="Tạo link làm bài, quản lý đáp án, bật tắt đề và theo dõi kết quả từng học sinh."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <FloatingStatCard icon={FileText} label="Tổng số đề" value={String(exams.length)} helper="Gồm đề mẫu và đề import." />
        <FloatingStatCard icon={FileText} label="Đề đang mở" value={String(activeCount)} helper="Học sinh chỉ vào được đề active." tone="cyan" />
        <FloatingStatCard icon={UsersRound} label="Bài đã nộp" value={String(attemptCount)} helper="Tổng bài làm đã lưu." tone="gold" />
      </section>

      <GiupCyAdminDashboard exams={exams} />
    </PageTransition>
  );
}
