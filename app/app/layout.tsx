import { AppShell } from "@/components/shared/app-shell";
import { ensureUserBootstrap } from "@/lib/auth/bootstrap";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  await ensureUserBootstrap(user);

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("user_id", user.id)
    .maybeSingle();

  return <AppShell profile={profile}>{children}</AppShell>;
}
