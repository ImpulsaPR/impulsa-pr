-- Sliding-window rate limiting via Postgres RPC
-- Usado por src/lib/rate-limit.ts en /api/whatsapp/send y otros.

create table if not exists rate_limit_buckets (
  key text primary key,
  count int not null default 0,
  window_start timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_buckets_window_idx
  on rate_limit_buckets(window_start);

alter table rate_limit_buckets enable row level security;
-- Sin policies → solo service_role accede

create or replace function rate_limit_check(
  p_key text,
  p_limit int,
  p_window_seconds int
) returns table (
  allowed boolean,
  current_count int,
  reset_at timestamptz,
  retry_after_seconds int
) language plpgsql volatile security definer as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_count int;
  v_reset timestamptz;
begin
  insert into rate_limit_buckets (key, count, window_start)
  values (p_key, 1, v_now)
  on conflict (key) do update
    set count = case
      when rate_limit_buckets.window_start < v_now - make_interval(secs => p_window_seconds)
        then 1
      else rate_limit_buckets.count + 1
    end,
    window_start = case
      when rate_limit_buckets.window_start < v_now - make_interval(secs => p_window_seconds)
        then v_now
      else rate_limit_buckets.window_start
    end
  returning count, window_start into v_count, v_window_start;

  v_reset := v_window_start + make_interval(secs => p_window_seconds);

  return query select
    (v_count <= p_limit) as allowed,
    v_count as current_count,
    v_reset as reset_at,
    greatest(0, extract(epoch from (v_reset - v_now))::int) as retry_after_seconds;
end;
$$;

create or replace function rate_limit_cleanup() returns int
language sql volatile as $$
  with deleted as (
    delete from rate_limit_buckets
    where window_start < now() - interval '1 hour'
    returning 1
  )
  select count(*)::int from deleted
$$;
