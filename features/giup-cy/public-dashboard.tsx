"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clipboard, Eye, Power } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/shared/premium-card";
import { togglePublicExamActive } from "@/features/giup-cy/actions";
import type { ExamWithStats } from "@/features/giup-cy/data";

const text = {
  copied: "\u0110\u00e3 copy link \u0111\u1ec1.",
  open: "\u0110ang m\u1edf",
  closed: "\u0110ang \u0111\u00f3ng",
  questions: "c\u00e2u",
  minutes: "ph\u00fat",
  source: "Ngu\u1ed3n",
  imported: "\u0110\u1ec1 import",
  close: "\u0110\u00f3ng",
  openAction: "M\u1edf",
  results: "Xem k\u1ebft qu\u1ea3",
  copy: "Copy link",
  empty: "Ch\u01b0a c\u00f3 \u0111\u1ec1 n\u00e0o \u0111ang m\u1edf."
};

export function PublicGiupCyDashboard() {
  const [exams, setExams] = useState<ExamWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadExams() {
      try {
        const response = await fetch("/api/giup-cy/exams", { cache: "no-store" });
        const payload = (await response.json()) as { exams?: ExamWithStats[]; error?: string };
        if (!active) return;
        setExams(payload.exams ?? []);
        setLoadError(payload.error ?? "");
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Kh\u00f4ng th\u1ec3 t\u1ea3i danh s\u00e1ch \u0111\u1ec1.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadExams();
    return () => {
      active = false;
    };
  }, []);

  async function copyLink(slug: string) {
    const url = `${window.location.origin}/exam/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success(text.copied);
  }

  async function toggle(exam: ExamWithStats) {
    const result = await togglePublicExamActive({ examId: exam.id, isActive: !exam.is_active });
    if (result.ok) {
      toast.success(result.message);
      setExams((current) => current.map((item) => (item.id === exam.id ? { ...item, is_active: !exam.is_active } : item)));
      return;
    }
    toast.error(result.message);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-indigo">{"Gi\u00fap Cy"}</p>
          <h1 className="mt-2 text-3xl font-bold text-text-primary">{"\u0110\u1ec1 \u0111ang m\u1edf"}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            {"Qu\u1ea3n l\u00fd nhanh c\u00e1c \u0111\u1ec1 \u0111ang m\u1edf. Trang n\u00e0y kh\u00f4ng c\u1ea7n \u0111\u0103ng nh\u1eadp."}
          </p>
        </div>
        <Badge variant="cyan">
          {exams.length} {"\u0111\u1ec1"}
        </Badge>
      </div>

      {loadError ? (
        <PremiumCard hover={false} className="rounded-2xl border-amber-200 bg-amber-50/80">
          <p className="text-sm font-semibold leading-6 text-amber-900">{loadError}</p>
        </PremiumCard>
      ) : null}

      {isLoading ? (
        <PremiumCard hover={false} className="rounded-2xl">
          <p className="text-sm leading-6 text-text-secondary">{"\u0110ang t\u1ea3i danh s\u00e1ch \u0111\u1ec1..."}</p>
        </PremiumCard>
      ) : null}

      {exams.map((exam) => (
        <PremiumCard key={exam.id} hover={false} className="rounded-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant={exam.is_active ? "cyan" : "neutral"}>{exam.is_active ? text.open : text.closed}</Badge>
                <Badge variant="neutral">
                  {exam.questionCount} {text.questions}
                </Badge>
                <Badge variant="neutral">
                  {exam.duration_minutes} {text.minutes}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-text-primary">{exam.title}</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{exam.description}</p>
              <p className="mt-2 break-all text-xs text-text-secondary">
                {text.source}: {exam.source_file_name ?? text.imported}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button type="button" variant={exam.is_active ? "outline" : "default"} onClick={() => toggle(exam)}>
                <Power className="size-4" />
                {exam.is_active ? text.close : text.openAction}
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/giup-cy/results/${exam.id}`}>
                  <Eye className="size-4" />
                  {text.results}
                </Link>
              </Button>
              <Button type="button" variant="secondary" onClick={() => copyLink(exam.slug)}>
                <Clipboard className="size-4" />
                {text.copy}
              </Button>
            </div>
          </div>
        </PremiumCard>
      ))}

      {!exams.length ? (
        <PremiumCard hover={false} className="rounded-2xl">
          <p className="text-sm leading-6 text-text-secondary">{text.empty}</p>
        </PremiumCard>
      ) : null}
    </div>
  );
}
