import Link from "next/link";
import { redirectIfAuthenticated } from "@/lib/auth/guards";
import { AuthCard } from "@/features/auth/auth-card";
import { MorphBackground } from "@/components/shared/morph-background";

export default async function SignInPage() {
  await redirectIfAuthenticated();

  return (
    <main className="relative grid min-h-screen place-items-center px-5 py-12">
      <MorphBackground intensity="strong" />
      <Link href="/" className="absolute left-6 top-6 text-sm font-semibold text-text-secondary transition hover:text-primary-indigo">
        Life & Work OS
      </Link>
      <AuthCard mode="sign-in" />
    </main>
  );
}
