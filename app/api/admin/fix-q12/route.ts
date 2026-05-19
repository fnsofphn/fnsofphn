import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const key = request.headers.get("x-admin-key");
  if (key !== process.env.GIUP_CY_PUBLIC_MANAGER_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: exams, error: examErr } = await supabase
    .from("giup_cy_exams")
    .select("id")
    .eq("slug", "hung-yen-hki-hoa-12-2026-3d1d5844");

  if (examErr || !exams?.length) {
    return NextResponse.json({ error: examErr?.message ?? "Exam not found" }, { status: 404 });
  }

  const examIds = exams.map((e) => e.id);

  const { data, error } = await supabase
    .from("giup_cy_exam_questions")
    .update({
      prompt:
        "Cho biết: E₀(Fe²⁺/Fe) = -0,440V; E₀(Cu²⁺/Cu) = +0,340V. Sức điện động chuẩn của pin điện hoá Fe - Cu là",
    })
    .eq("question_number", 12)
    .in("exam_id", examIds)
    .like("prompt", "%E0(Fe2+%")
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, updated: data?.length ?? 0 });
}
