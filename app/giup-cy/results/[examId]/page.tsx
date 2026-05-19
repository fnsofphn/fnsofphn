import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PremiumCard } from "@/components/shared/premium-card";
import { getPublicExamResults } from "@/features/giup-cy/data";

type PageProps = {
  params: Promise<{ examId: string }>;
  searchParams: Promise<{ key?: string }>;
};

function formatScore(score: number, maxScore: number) {
  if (!maxScore) return "Chưa có";
  return `${score}/${maxScore}`;
}

export default async function PublicGiupCyResultsPage({ params, searchParams }: PageProps) {
  const [{ examId }, { key }] = await Promise.all([params, searchParams]);
  const detail = await getPublicExamResults(examId, key);

  if (!detail) notFound();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F7F8FC_0%,#EEF2F8_100%)] px-4 py-8">
      <section className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-indigo">{"Gi\u00fap Cy"}</p>
          <h1 className="mt-2 text-3xl font-bold text-text-primary">{"K\u1ebft qu\u1ea3"}</h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{detail.exam.title}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <PremiumCard hover={false} className="rounded-2xl">
            <p className="text-sm font-semibold text-text-secondary">{"S\u1ed1 b\u00e0i n\u1ed9p"}</p>
            <p className="mt-2 text-3xl font-bold text-text-primary">{detail.attempts.length}</p>
          </PremiumCard>
          <PremiumCard hover={false} className="rounded-2xl">
            <p className="text-sm font-semibold text-text-secondary">{"S\u1ed1 c\u00e2u"}</p>
            <p className="mt-2 text-3xl font-bold text-text-primary">{detail.questions.length}</p>
          </PremiumCard>
          <PremiumCard hover={false} className="rounded-2xl">
            <p className="text-sm font-semibold text-text-secondary">{"Tr\u1ea1ng th\u00e1i"}</p>
            <p className="mt-2 text-3xl font-bold text-text-primary">{detail.exam.is_active ? "Đang mở" : "Đang đóng"}</p>
          </PremiumCard>
        </div>

        <div className="space-y-3">
          {detail.attempts.map((attempt) => (
            <PremiumCard key={attempt.id} hover={false} className="rounded-2xl">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-text-primary">{attempt.student_name}</h2>
                  <p className="mt-1 text-sm text-text-secondary">{new Date(attempt.submitted_at).toLocaleString("vi-VN")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="cyan">{formatScore(attempt.score, attempt.max_score)}</Badge>
                  <Badge variant="neutral">
                    {"\u0110\u00fang"} {attempt.correct_count}/{attempt.graded_count}
                  </Badge>
                  <Badge variant="neutral">
                    {"T\u1ed5ng"} {attempt.total_count} {"c\u00e2u"}
                  </Badge>
                </div>
              </div>
            </PremiumCard>
          ))}

          {!detail.attempts.length ? (
            <PremiumCard hover={false} className="rounded-2xl">
              <p className="text-sm leading-6 text-text-secondary">{"Ch\u01b0a c\u00f3 b\u00e0i n\u1ed9p."}</p>
            </PremiumCard>
          ) : null}
        </div>
      </section>
    </main>
  );
}
