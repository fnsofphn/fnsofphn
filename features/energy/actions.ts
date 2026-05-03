"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvError } from "@/lib/supabase/env";

const logInputSchema = z.object({
  activityTypeId: z.string().uuid(),
  loggedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completed: z.boolean().optional(),
  durationMinutes: z.number().min(0).max(1440).nullable().optional(),
  notes: z.string().max(1000).nullable().optional()
});

export type EnergyActionResult = {
  ok: boolean;
  message: string;
};

async function assertActivityOwner(activityTypeId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("energy_activity_types")
    .select("id")
    .eq("id", activityTypeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Nguồn năng lượng không tồn tại hoặc không thuộc tài khoản này.");
  }
}

export async function saveEnergyLog(input: unknown): Promise<EnergyActionResult> {
  const parsed = logInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Dữ liệu năng lượng chưa hợp lệ." };
  }

  try {
    const user = await requireUser();
    await assertActivityOwner(parsed.data.activityTypeId, user.id);
    const supabase = await createClient();

    const { error } = await supabase.from("energy_activity_logs").upsert(
      {
        user_id: user.id,
        activity_type_id: parsed.data.activityTypeId,
        logged_on: parsed.data.loggedOn,
        completed: parsed.data.completed ?? true,
        duration_minutes: parsed.data.durationMinutes ?? null,
        notes: parsed.data.notes?.trim() || null
      },
      { onConflict: "user_id,activity_type_id,logged_on" }
    );

    if (error) return { ok: false, message: error.message };

    revalidatePath("/app/energy");
    revalidatePath("/app");
    return { ok: true, message: "Đã cập nhật tích lũy năng lượng." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : getSupabaseEnvError(error) };
  }
}
