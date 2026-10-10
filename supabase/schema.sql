-- Verified Weekly Challenge: run this once in Supabase -> SQL Editor.
-- Stores ONLY: public username, Discord account id, score, duration, timestamps.

create table if not exists public.verified_users (
  username    text primary key check (username = lower(username) and length(username) between 1 and 64),
  proof_id    text not null unique,
  verified_at timestamptz not null default now()
);

create table if not exists public.scores (
  id          bigint generated always as identity primary key,
  username    text not null references public.verified_users(username) on delete cascade,
  score       smallint not null check (score >= 0),
  total       smallint not null check (total > 0 and score <= total),
  duration_ms integer  not null check (duration_ms >= 0),
  played_at   timestamptz not null default now()   -- the moment the score was saved
);

create index if not exists scores_username_played_at_idx
  on public.scores (username, played_at desc);

-- Best play per username, used by the public leaderboard.
create or replace view public.leaderboard as
select distinct on (username)
  username, score, total, duration_ms, played_at
from public.scores
order by username, score desc, duration_ms asc, played_at asc;

-- Race-safe save: enforces the 7-day rule inside the database.
create or replace function public.submit_score(
  p_username    text,
  p_score       int,
  p_total       int,
  p_duration_ms int
) returns table (saved boolean, next_allowed_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last timestamptz;
begin
  -- serialise concurrent submissions for the same username
  perform pg_advisory_xact_lock(hashtextextended(p_username, 0));

  select max(played_at) into v_last from public.scores where username = p_username;

  if v_last is not null and v_last + interval '7 days' > now() then
    return query select false, v_last + interval '7 days';
    return;
  end if;

  insert into public.scores (username, score, total, duration_ms)
  values (p_username, p_score, p_total, p_duration_ms);

  return query select true, now() + interval '7 days';
end;
$$;

-- Lock everything down. The app talks to Supabase only from server code using the
-- service-role key, which bypasses RLS. Browsers never touch the database directly.
alter table public.verified_users enable row level security;
alter table public.scores         enable row level security;

revoke all on public.verified_users from anon, authenticated;
revoke all on public.scores         from anon, authenticated;
revoke all on public.leaderboard    from anon, authenticated;
revoke all on function public.submit_score(text, int, int, int) from public, anon, authenticated;

grant select, insert, update on public.verified_users to service_role;
grant select on public.scores, public.leaderboard to service_role;
grant execute on function public.submit_score(text, int, int, int) to service_role;
