"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { TradingActionState } from "@/features/vibe-trading/types";

const path = "/app/trading";

const marketSchema = z.enum(["crypto", "us_stock", "vn_stock", "forex", "futures", "other"]);

const ideaSchema = z.object({
  title: z.string().trim().min(1, "Can co ten y tuong."),
  prompt: z.string().trim().min(1, "Can co prompt nghien cuu."),
  symbol: z.string().trim().optional(),
  market: marketSchema,
  timeframe: z.string().trim().min(1).default("4H"),
  thesis: z.string().trim().optional(),
  risk_notes: z.string().trim().optional()
});

const watchlistSchema = z.object({
  symbol: z.string().trim().min(1, "Can co ma tai san."),
  market: marketSchema,
  bias: z.enum(["bullish", "bearish", "neutral"]),
  alert_price: z.coerce.number().optional(),
  thesis: z.string().trim().optional()
});

const backtestSchema = z.object({
  title: z.string().trim().min(1, "Can co ten backtest."),
  symbol: z.string().trim().optional(),
  timeframe: z.string().trim().min(1).default("4H"),
  period_label: z.string().trim().min(1).default("Manual"),
  total_return: z.coerce.number().default(0),
  max_drawdown: z.coerce.number().default(0),
  sharpe: z.coerce.number().default(0),
  win_rate: z.coerce.number().default(0),
  trade_count: z.coerce.number().int().min(0).default(0),
  verdict: z.enum(["promising", "observe", "reject"]),
  notes: z.string().trim().optional()
});

const aiIdeaSchema = ideaSchema.pick({
  title: true,
  prompt: true,
  symbol: true,
  market: true,
  timeframe: true
});

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

type GeminiTradingPlan = {
  thesis?: string;
  risk_notes?: string;
  test_plan?: string[];
};

function formValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || undefined;
}

function parseOptionalNumber(formData: FormData, key: string) {
  const value = formValue(formData, key);
  return value === undefined ? undefined : value;
}

function fail(message: string): TradingActionState {
  return { ok: false, message };
}

function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Chua cau hinh GEMINI_API_KEY trong .env.local.");
  return key;
}

function parseGeminiJson(text: string): GeminiTradingPlan {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as GeminiTradingPlan;
  } catch {
    return {
      thesis: cleaned,
      risk_notes: "Gemini tra ve khong dung JSON; da luu toan bo phan tich vao thesis.",
      test_plan: []
    };
  }
}

async function generateGeminiTradingPlan(input: z.infer<typeof aiIdeaSchema>) {
  const systemPrompt = [
    "You are a trading research assistant for simulation and backtesting only.",
    "Do not provide investment advice or trade execution instructions.",
    "Return strict JSON with keys: thesis, risk_notes, test_plan.",
    "test_plan must be an array of concise backtest checks.",
    "Use Vietnamese."
  ].join("\n");

  const userPrompt = [
    `Title: ${input.title}`,
    `Symbol: ${input.symbol || "N/A"}`,
    `Market: ${input.market}`,
    `Timeframe: ${input.timeframe}`,
    "User idea:",
    input.prompt
  ].join("\n");

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": getGeminiApiKey()
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.25,
        responseMimeType: "application/json"
      }
    }),
    signal: AbortSignal.timeout(45000)
  });

  const body = (await response.json()) as GeminiResponse;
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Gemini API loi HTTP ${response.status}.`);
  }

  const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n").trim();
  if (!text) throw new Error("Gemini khong tra ve noi dung phan tich.");
  return parseGeminiJson(text);
}

export async function generateTradingIdeaAction(
  _state: TradingActionState,
  formData: FormData
): Promise<TradingActionState> {
  const parsed = aiIdeaSchema.safeParse({
    title: formValue(formData, "title"),
    prompt: formValue(formData, "prompt"),
    symbol: formValue(formData, "symbol"),
    market: formValue(formData, "market") ?? "crypto",
    timeframe: formValue(formData, "timeframe") ?? "4H"
  });

  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Du lieu chua hop le.");

  try {
    const user = await requireUser();
    const plan = await generateGeminiTradingPlan(parsed.data);
    const supabase = await createClient();
    const testPlan = plan.test_plan?.length ? `\n\nTest plan:\n${plan.test_plan.map((item) => `- ${item}`).join("\n")}` : "";
    const { error } = await supabase.from("trading_ideas").insert({
      ...parsed.data,
      user_id: user.id,
      status: "ready",
      thesis: plan.thesis ?? null,
      risk_notes: `${plan.risk_notes ?? ""}${testPlan}`.trim() || null
    } as never);

    if (error) return fail(error.message);
    revalidatePath(path);
    return { ok: true, message: "Gemini da tao va luu trading idea." };
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Khong the goi Gemini.");
  }
}

export async function createTradingIdeaAction(
  _state: TradingActionState,
  formData: FormData
): Promise<TradingActionState> {
  const parsed = ideaSchema.safeParse({
    title: formValue(formData, "title"),
    prompt: formValue(formData, "prompt"),
    symbol: formValue(formData, "symbol"),
    market: formValue(formData, "market") ?? "crypto",
    timeframe: formValue(formData, "timeframe") ?? "4H",
    thesis: formValue(formData, "thesis"),
    risk_notes: formValue(formData, "risk_notes")
  });

  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Du lieu chua hop le.");

  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("trading_ideas").insert({
    ...parsed.data,
    user_id: user.id,
    status: "researching"
  } as never);

  if (error) return fail(error.message);
  revalidatePath(path);
  return { ok: true, message: "Da luu y tuong trading." };
}

export async function createWatchlistAction(
  _state: TradingActionState,
  formData: FormData
): Promise<TradingActionState> {
  const parsed = watchlistSchema.safeParse({
    symbol: formValue(formData, "symbol"),
    market: formValue(formData, "market") ?? "crypto",
    bias: formValue(formData, "bias") ?? "neutral",
    alert_price: parseOptionalNumber(formData, "alert_price"),
    thesis: formValue(formData, "thesis")
  });

  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Du lieu chua hop le.");

  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("trading_watchlist").insert({
    ...parsed.data,
    user_id: user.id,
    symbol: parsed.data.symbol.toUpperCase()
  } as never);

  if (error) return fail(error.message);
  revalidatePath(path);
  return { ok: true, message: "Da them vao watchlist." };
}

export async function createBacktestAction(
  _state: TradingActionState,
  formData: FormData
): Promise<TradingActionState> {
  const parsed = backtestSchema.safeParse({
    title: formValue(formData, "title"),
    symbol: formValue(formData, "symbol"),
    timeframe: formValue(formData, "timeframe") ?? "4H",
    period_label: formValue(formData, "period_label") ?? "Manual",
    total_return: formValue(formData, "total_return") ?? "0",
    max_drawdown: formValue(formData, "max_drawdown") ?? "0",
    sharpe: formValue(formData, "sharpe") ?? "0",
    win_rate: formValue(formData, "win_rate") ?? "0",
    trade_count: formValue(formData, "trade_count") ?? "0",
    verdict: formValue(formData, "verdict") ?? "observe",
    notes: formValue(formData, "notes")
  });

  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Du lieu chua hop le.");

  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("trading_backtests").insert({
    ...parsed.data,
    user_id: user.id,
    symbol: parsed.data.symbol?.toUpperCase()
  } as never);

  if (error) return fail(error.message);
  revalidatePath(path);
  return { ok: true, message: "Da luu backtest journal." };
}
