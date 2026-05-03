import { endOfWeek, format, isWithinInterval, parseISO, startOfMonth, startOfWeek, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { clampScore, percent } from "@/lib/utils/format";
import type {
  DailyPriorityRow,
  EmotionLogRow,
  EnergyActivityLogRow,
  EnergyActivityTypeRow,
  FinanceEntryRow,
  HealthLogRow,
  StrategyProfileRow,
  StudySessionRow,
  TaskRow,
  TimeLogRow
} from "@/types/database";

type DashboardQueryResult<T> = { data: T[] | null; error: { message: string } | null };

function byRecentDate<T extends { created_at: string }>(items: T[]) {
  return [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export async function getDashboardData(userId: string) {
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const [
    tasksResult,
    prioritiesResult,
    financeResult,
    healthResult,
    studyResult,
    timeResult,
    emotionResult,
    strategyResult,
    energyTypesResult,
    energyLogsResult
  ] = await Promise.all([
    supabase.from("tasks").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(30) as unknown as Promise<DashboardQueryResult<TaskRow>>,
    supabase.from("daily_priorities").select("*").eq("user_id", userId).eq("planned_on", today).order("rank", { ascending: true }) as unknown as Promise<DashboardQueryResult<DailyPriorityRow>>,
    supabase.from("finance_entries").select("*").eq("user_id", userId).gte("occurred_on", monthStart).order("occurred_on", { ascending: false }) as unknown as Promise<DashboardQueryResult<FinanceEntryRow>>,
    supabase.from("health_logs").select("*").eq("user_id", userId).order("logged_on", { ascending: false }).limit(7) as unknown as Promise<DashboardQueryResult<HealthLogRow>>,
    supabase.from("study_sessions").select("*").eq("user_id", userId).order("occurred_on", { ascending: false }).limit(30) as unknown as Promise<DashboardQueryResult<StudySessionRow>>,
    supabase.from("time_logs").select("*").eq("user_id", userId).order("logged_on", { ascending: false }).limit(7) as unknown as Promise<DashboardQueryResult<TimeLogRow>>,
    supabase.from("emotion_logs").select("*").eq("user_id", userId).order("logged_on", { ascending: false }).limit(14) as unknown as Promise<DashboardQueryResult<EmotionLogRow>>,
    supabase.from("strategy_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("energy_activity_types").select("*").eq("user_id", userId).eq("is_active", true).order("sort_order", { ascending: true }) as unknown as Promise<DashboardQueryResult<EnergyActivityTypeRow>>,
    supabase.from("energy_activity_logs").select("*").eq("user_id", userId).eq("logged_on", today) as unknown as Promise<DashboardQueryResult<EnergyActivityLogRow>>
  ]);

  const errors = [
    tasksResult.error,
    prioritiesResult.error,
    financeResult.error,
    healthResult.error,
    studyResult.error,
    timeResult.error,
    emotionResult.error,
    energyTypesResult.error,
    energyLogsResult.error
  ].filter(Boolean);

  if (errors.length) {
    throw new Error(errors[0]?.message ?? "Không thể tải dashboard.");
  }

  const tasks = tasksResult.data ?? [];
  const priorities = prioritiesResult.data ?? [];
  const financeEntries = financeResult.data ?? [];
  const healthLogs = healthResult.data ?? [];
  const studySessions = studyResult.data ?? [];
  const timeLogs = timeResult.data ?? [];
  const emotionLogs = emotionResult.data ?? [];
  const strategy = (strategyResult.data ?? null) as StrategyProfileRow | null;
  const energyTypes = energyTypesResult.data ?? [];
  const energyLogs = energyLogsResult.data ?? [];

  const income = sum(financeEntries.filter((entry) => entry.type === "income").map((entry) => Number(entry.amount)));
  const expense = sum(financeEntries.filter((entry) => entry.type === "expense").map((entry) => Number(entry.amount)));
  const saving = sum(financeEntries.filter((entry) => entry.type === "saving").map((entry) => Number(entry.amount)));
  const balance = income - expense - saving;

  const weeklyStudy = studySessions.filter((session) =>
    isWithinInterval(parseISO(session.occurred_on), { start: weekStart, end: weekEnd })
  );
  const weeklyStudyMinutes = sum(weeklyStudy.map((session) => session.duration_minutes));
  const weeklyTarget = studySessions[0]?.weekly_target_minutes ?? 600;
  const studyProgress = percent(weeklyStudyMinutes, weeklyTarget);

  const latestHealth = healthLogs[0] ?? null;
  const latestMood = emotionLogs[0] ?? null;
  const averageMood = emotionLogs.length
    ? emotionLogs.reduce((total, log) => total + log.mood_score, 0) / emotionLogs.length
    : 0;
  const latestTime = timeLogs[0] ?? null;

  const completedEnergy = energyLogs.filter((log) => log.completed).length;
  const energyScore = percent(completedEnergy, energyTypes.length);

  const taskCompletion = percent(tasks.filter((task) => task.status === "done").length, tasks.length || 1);
  const financeScore = balance >= 0 ? 82 : 45;
  const lifeBalanceScore = clampScore(
    (taskCompletion +
      financeScore +
      (latestHealth?.energy_score ?? 65) +
      studyProgress +
      (latestMood ? latestMood.mood_score * 10 : 65) +
      energyScore +
      (strategy?.focus_level_score ?? 70)) /
      7
  );

  const fallbackPriorities = tasks
    .filter((task) => task.status !== "done")
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)
    .map((task, index) => ({ id: task.id, title: task.title, completed: false, rank: index + 1 }));

  const chartData = [
    { label: "Việc", value: taskCompletion, tone: "indigo" as const },
    { label: "Tiền", value: financeScore, tone: "gold" as const },
    { label: "Khỏe", value: latestHealth?.energy_score ?? 65, tone: "cyan" as const },
    { label: "Học", value: studyProgress, tone: "indigo" as const },
    { label: "Cảm", value: latestMood ? latestMood.mood_score * 10 : 65, tone: "rose" as const },
    { label: "Năng", value: energyScore, tone: "cyan" as const }
  ];

  const trendWindow = Array.from({ length: 7 }, (_, index) => format(subDays(new Date(), 6 - index), "yyyy-MM-dd"));
  const moodTrend = trendWindow.map((day) => {
    const mood = emotionLogs.find((log) => log.logged_on === day);
    return { label: day.slice(5), value: mood ? mood.mood_score * 10 : 0, tone: "rose" as const };
  });

  const timeline = byRecentDate([
    ...tasks.slice(0, 3).map((item) => ({ created_at: item.created_at, title: item.title, label: "Nhiệm vụ" })),
    ...financeEntries.slice(0, 3).map((item) => ({ created_at: item.created_at, title: item.category, label: "Tài chính" })),
    ...studySessions.slice(0, 2).map((item) => ({ created_at: item.created_at, title: item.topic, label: "Học tập" })),
    ...emotionLogs.slice(0, 2).map((item) => ({ created_at: item.created_at, title: `Tâm trạng ${item.mood_score}/10`, label: "Cảm xúc" }))
  ]).slice(0, 6);

  return {
    today,
    lifeBalanceScore,
    topPriorities: priorities.length ? priorities : fallbackPriorities,
    finance: { income, expense, saving, balance },
    study: { weeklyStudyMinutes, weeklyTarget, studyProgress, currentFocus: studySessions[0]?.topic ?? "Chưa chọn chủ đề" },
    mood: { latest: latestMood, averageMood, moodTrend },
    health: { latest: latestHealth },
    time: { latest: latestTime },
    strategy,
    energy: { completedEnergy, totalEnergy: energyTypes.length, energyScore },
    chartData,
    timeline
  };
}
