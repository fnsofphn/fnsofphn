import { createClient } from "@/lib/supabase/server";
import type { TableName } from "@/types/database";

type QueryError = { message: string } | null;
type DynamicSelectQuery = PromiseLike<{ data: Array<Record<string, unknown>> | null; error: QueryError }> & {
  eq(column: string, value: string): DynamicSelectQuery;
  order(column: string, options: { ascending: boolean }): DynamicSelectQuery;
  limit(count: number): DynamicSelectQuery;
};
type DynamicSelectTable = {
  select(columns: string): DynamicSelectQuery;
};

export async function getRows<T extends TableName>(
  table: T,
  userId: string,
  options?: {
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
  }
) {
  const supabase = await createClient();
  const tableClient = supabase.from(table as never) as unknown as DynamicSelectTable;
  let query = tableClient.select("*").eq("user_id", userId);

  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Array<Record<string, unknown>>;
}
