import { notFound } from "next/navigation";
import { ExamTaker } from "@/features/giup-cy/exam-taker";
import { getPublicExam } from "@/features/giup-cy/data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicExamPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = await getPublicExam(slug);

  if (!detail) notFound();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F7F8FC_0%,#EEF2F8_100%)] px-4 py-8">
      <ExamTaker exam={detail.exam} questions={detail.questions} />
    </main>
  );
}
