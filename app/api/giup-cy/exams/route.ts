import { NextResponse } from "next/server";
import { getPublicActiveExams } from "@/features/giup-cy/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const exams = await getPublicActiveExams();
    return NextResponse.json({ exams });
  } catch (error) {
    return NextResponse.json(
      {
        exams: [],
        error: error instanceof Error ? error.message : "Không thể tải danh sách đề."
      },
      { status: 200 }
    );
  }
}
