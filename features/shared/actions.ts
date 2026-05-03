"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnvError } from "@/lib/supabase/env";
import { editableTableNames, tableSchemas, type EditableTable, type RecordField } from "@/features/shared/record-schema";

const recordInputSchema = z.object({
  table: z.enum(editableTableNames as [EditableTable, ...EditableTable[]]),
  id: z.string().uuid().optional(),
  values: z.record(z.string(), z.unknown()),
  path: z.string().min(1)
});

const deleteInputSchema = z.object({
  table: z.enum(editableTableNames as [EditableTable, ...EditableTable[]]),
  id: z.string().uuid(),
  path: z.string().min(1)
});

export type RecordActionResult = {
  ok: boolean;
  message: string;
};

type MutationError = { message: string } | null;
type DynamicMutationQuery = PromiseLike<{ error: MutationError }> & {
  eq(column: string, value: string): DynamicMutationQuery;
};
type DynamicMutationTable = {
  insert(payload: Record<string, unknown>): DynamicMutationQuery;
  update(payload: Record<string, unknown>): DynamicMutationQuery;
  delete(): DynamicMutationQuery;
};

function coerceFieldValue(field: RecordField, rawValue: unknown) {
  if (field.type === "checkbox") {
    return rawValue === true || rawValue === "true" || rawValue === "on";
  }

  const empty = rawValue === undefined || rawValue === null || rawValue === "";

  if (empty) {
    if (field.required) throw new Error(`${field.label} là bắt buộc.`);
    if (field.type === "lines") return [];
    return null;
  }

  if (field.type === "number") {
    const numberValue = Number(rawValue);
    if (!Number.isFinite(numberValue)) throw new Error(`${field.label} cần là một con số hợp lệ.`);
    if (field.min !== undefined && numberValue < field.min) throw new Error(`${field.label} cần lớn hơn hoặc bằng ${field.min}.`);
    if (field.max !== undefined && numberValue > field.max) throw new Error(`${field.label} cần nhỏ hơn hoặc bằng ${field.max}.`);
    return numberValue;
  }

  if (field.type === "lines") {
    return String(rawValue)
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (field.type === "select") {
    const value = String(rawValue);
    if (field.options?.length && !field.options.some((option) => option.value === value)) {
      throw new Error(`${field.label} chưa hợp lệ.`);
    }
    return value;
  }

  if (field.type === "date") {
    return String(rawValue);
  }

  return String(rawValue).trim();
}

export async function upsertRecord(input: unknown): Promise<RecordActionResult> {
  const parsed = recordInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Dữ liệu gửi lên chưa hợp lệ." };
  }

  try {
    const user = await requireUser();
    const supabase = await createClient();
    const schema = tableSchemas[parsed.data.table];
    const payload: Record<string, unknown> = {};

    for (const field of schema.fields) {
      if (Object.prototype.hasOwnProperty.call(parsed.data.values, field.name)) {
        payload[field.name] = coerceFieldValue(field, parsed.data.values[field.name]);
      }
    }

    if (!Object.keys(payload).length) {
      return { ok: false, message: "Chưa có dữ liệu để lưu." };
    }

    if (parsed.data.id) {
      const tableClient = supabase.from(parsed.data.table as never) as unknown as DynamicMutationTable;
      const { error } = await tableClient
        .update(payload)
        .eq("id", parsed.data.id)
        .eq("user_id", user.id);

      if (error) return { ok: false, message: error.message };
      revalidatePath(parsed.data.path);
      return { ok: true, message: "Đã cập nhật dữ liệu." };
    }

    const tableClient = supabase.from(parsed.data.table as never) as unknown as DynamicMutationTable;
    const { error } = await tableClient.insert({
      ...payload,
      user_id: user.id
    });

    if (error) return { ok: false, message: error.message };

    revalidatePath(parsed.data.path);
    return { ok: true, message: "Đã thêm dữ liệu mới." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : getSupabaseEnvError(error) };
  }
}

export async function deleteRecord(input: unknown): Promise<RecordActionResult> {
  const parsed = deleteInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Không thể xác định bản ghi cần xóa." };
  }

  try {
    const user = await requireUser();
    const supabase = await createClient();
    const tableClient = supabase.from(parsed.data.table as never) as unknown as DynamicMutationTable;
    const { error } = await tableClient
      .delete()
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);

    if (error) return { ok: false, message: error.message };

    revalidatePath(parsed.data.path);
    return { ok: true, message: "Đã xóa bản ghi." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : getSupabaseEnvError(error) };
  }
}
