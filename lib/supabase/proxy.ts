import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isGiupCyOnlyEmail, isGiupCyPath } from "@/lib/auth/access";
import { hasSupabaseEnv, getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request });
  }

  const { url, publishableKey } = getSupabaseEnv();
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      }
    }
  });

  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;

  if (request.nextUrl.pathname.startsWith("/app") && isGiupCyOnlyEmail(email) && !isGiupCyPath(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/app/giup-cy";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
