const missingSupabaseMessage =
  "Thiếu cấu hình Supabase. Hãy đặt NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY trong .env.local.";

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(missingSupabaseMessage);
  }

  return { url, publishableKey };
}

export function getSupabaseEnvError(error: unknown) {
  if (error instanceof Error && error.message.includes("Thiếu cấu hình Supabase")) {
    return error.message;
  }
  return "Không thể kết nối Supabase. Vui lòng kiểm tra cấu hình dự án.";
}
