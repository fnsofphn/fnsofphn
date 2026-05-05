create table public.trading_watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  market text not null default 'crypto' check (market in ('crypto', 'us_stock', 'vn_stock', 'forex', 'futures', 'other')),
  thesis text,
  bias text not null default 'neutral' check (bias in ('bullish', 'bearish', 'neutral')),
  alert_price numeric(18, 6),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trading_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  prompt text not null,
  symbol text,
  market text not null default 'crypto' check (market in ('crypto', 'us_stock', 'vn_stock', 'forex', 'futures', 'other')),
  timeframe text not null default '4H',
  status text not null default 'researching' check (status in ('researching', 'ready', 'testing', 'archived')),
  thesis text,
  risk_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trading_backtests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idea_id uuid references public.trading_ideas(id) on delete set null,
  title text not null,
  symbol text,
  timeframe text not null default '4H',
  period_label text not null default 'Manual',
  total_return numeric(9, 4) not null default 0,
  max_drawdown numeric(9, 4) not null default 0,
  sharpe numeric(9, 4) not null default 0,
  win_rate numeric(9, 4) not null default 0,
  trade_count integer not null default 0 check (trade_count >= 0),
  verdict text not null default 'observe' check (verdict in ('promising', 'observe', 'reject')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trading_watchlist_user_active_idx
  on public.trading_watchlist (user_id, is_active desc, updated_at desc);

create index trading_ideas_user_status_idx
  on public.trading_ideas (user_id, status, updated_at desc);

create index trading_backtests_user_created_idx
  on public.trading_backtests (user_id, created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'trading_watchlist',
    'trading_ideas',
    'trading_backtests'
  ]
  loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy "%s_select_own_rows" on public.%I for select to authenticated using (auth.uid() = user_id)', table_name, table_name);
    execute format('create policy "%s_insert_own_rows" on public.%I for insert to authenticated with check (auth.uid() = user_id)', table_name, table_name);
    execute format('create policy "%s_update_own_rows" on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', table_name, table_name);
    execute format('create policy "%s_delete_own_rows" on public.%I for delete to authenticated using (auth.uid() = user_id)', table_name, table_name);
  end loop;
end;
$$;
