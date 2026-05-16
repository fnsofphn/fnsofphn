import type { GiupCyExamRow } from "@/types/database";

export function getExamPdfUrl(exam: Pick<GiupCyExamRow, "slug" | "source_file_name">) {
  const source = `${exam.slug} ${exam.source_file_name ?? ""}`.toLowerCase();

  if (source.includes("cam-pha")) {
    return "/exam-assets/cam-pha-lan-1/original.pdf";
  }

  if (source.includes("hung-yen")) {
    return "/exam-assets/hung-yen-hki/original.pdf";
  }

  return null;
}
