-- DazelKey: shared Achievement posts for the friends-only Explore feed.
-- A row only exists here while its owner has share_achievement enabled
-- (see public_profiles_and_friends.sql) -- the app deletes a user's own
-- rows the moment they turn sharing off, and re-uploads their completed
-- Buckets the moment they turn it back on. So unlike public_profiles,
-- visibility here doesn't need to re-check that flag -- existence of the
-- row already means "this user opted in".
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket_id bigint not null,
  title text not null default '',
  mode text not null default '',
  place text,
  completed_date date,
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_user_bucket unique (user_id, bucket_id)
);

alter table public.achievements enable row level security;

drop policy if exists "Owners and friends read achievements" on public.achievements;
create policy "Owners and friends read achievements"
on public.achievements
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = (select auth.uid()) and f.addressee_id = achievements.user_id)
        or (f.addressee_id = (select auth.uid()) and f.requester_id = achievements.user_id)
      )
  )
);

drop policy if exists "Owners manage their own achievements" on public.achievements;
create policy "Owners manage their own achievements"
on public.achievements
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.set_achievements_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_achievements_updated_at on public.achievements;
create trigger set_achievements_updated_at
before update on public.achievements
for each row execute function public.set_achievements_updated_at();

-- One row per (user who tapped Inspired, achievement). Visibility follows
-- the parent achievement's own RLS (the subquery below re-runs it), so
-- there's nothing extra to check here beyond "does this achievement
-- still exist and can I see it".
create table if not exists public.achievement_inspirations (
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (achievement_id, user_id)
);

alter table public.achievement_inspirations enable row level security;

drop policy if exists "Anyone who can see the achievement can see its inspirations" on public.achievement_inspirations;
create policy "Anyone who can see the achievement can see its inspirations"
on public.achievement_inspirations
for select
to authenticated
using (
  exists (select 1 from public.achievements a where a.id = achievement_inspirations.achievement_id)
);

drop policy if exists "Users mark their own inspiration" on public.achievement_inspirations;
create policy "Users mark their own inspiration"
on public.achievement_inspirations
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (select 1 from public.achievements a where a.id = achievement_inspirations.achievement_id)
);

drop policy if exists "Users remove their own inspiration" on public.achievement_inspirations;
create policy "Users remove their own inspiration"
on public.achievement_inspirations
for delete
to authenticated
using ((select auth.uid()) = user_id);
