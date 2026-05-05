import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/components/shared/page-transition";
import { getTradingModuleData } from "@/features/vibe-trading/data";
import { TradingWorkspace } from "@/features/vibe-trading/trading-workspace";
import { requireUser } from "@/lib/auth/guards";

export default async function TradingPage() {
  const user = await requireUser();
  const data = await getTradingModuleData(user.id);

  return (
    <PageTransition className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="Vibe Trading"
        title="Trading research workspace"
        description="Nen tang trading co ban: watchlist, prompt y tuong, journal backtest va khung du lieu de mo rong engine sau."
      />
      <TradingWorkspace data={data} />
    </PageTransition>
  );
}
