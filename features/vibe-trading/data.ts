import { createClient } from "@/lib/supabase/server";
import type { TradingModuleData } from "@/features/vibe-trading/types";
import type { TradingBacktestRow, TradingIdeaRow, TradingWatchlistRow } from "@/types/database";

export async function getTradingModuleData(userId: string): Promise<TradingModuleData> {
  const supabase = await createClient();

  const [ideasResult, watchlistResult, backtestsResult] = await Promise.all([
    supabase
      .from("trading_ideas")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase
      .from("trading_watchlist")
      .select("*")
      .eq("user_id", userId)
      .order("is_active", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase
      .from("trading_backtests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
  ]);

  return {
    ideas: (ideasResult.data ?? []) as TradingIdeaRow[],
    watchlist: (watchlistResult.data ?? []) as TradingWatchlistRow[],
    backtests: (backtestsResult.data ?? []) as TradingBacktestRow[]
  };
}
