import type { TradingBacktestRow, TradingIdeaRow, TradingWatchlistRow } from "@/types/database";

export type TradingModuleData = {
  ideas: TradingIdeaRow[];
  watchlist: TradingWatchlistRow[];
  backtests: TradingBacktestRow[];
};

export type TradingActionState = {
  ok: boolean;
  message: string;
};
