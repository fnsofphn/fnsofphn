import { PublicGiupCyDashboard } from "@/features/giup-cy/public-dashboard";

export const dynamic = "force-dynamic";

export default function PublicGiupCyPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F7F8FC_0%,#EEF2F8_100%)] px-4 py-8">
      <section className="mx-auto max-w-5xl space-y-6">
        <PublicGiupCyDashboard />
      </section>
    </main>
  );
}
