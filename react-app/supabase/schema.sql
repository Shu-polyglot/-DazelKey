-- DazelKey: private per-user application state
-- Run this in Supabase Dashboard -> SQL Editor, then enable Anonymous Sign-ins
-- in Authentication -> Providers -> Anonymous.

create table if not exists public.user_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  state_key text not null check (char_length(state_key) <= 120),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, state_key)
);

alter table public.user_state enable row level security;

drop policy if exists "Users manage their own state" on public.user_state;
create policy "Users manage their own state"
on public.user_state
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Keeps updated_at accurate without trusting the browser to supply it.
create or replace function public.set_user_state_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_state_updated_at on public.user_state;
create trigger set_user_state_updated_at
before update on public.user_state
for each row execute function public.set_user_state_updated_at();
