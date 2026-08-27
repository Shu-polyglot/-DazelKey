create table if not exists public.public_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-z0-9_]{3,20}$'),
  name text not null default '',
  photo text,
  bio text not null default '',
  role text not null default '',
  share_bucket_lists boolean not null default false,
  share_achievement boolean not null default false,
  share_core boolean not null default false,
  share_traits boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.public_profiles enable row level security;

drop policy if exists "Public profiles are readable by any signed-in user" on public.public_profiles;
create policy "Public profiles are readable by any signed-in user"
on public.public_profiles
for select
to authenticated
using (true);

drop policy if exists "Users manage their own public profile" on public.public_profiles;
create policy "Users manage their own public profile"
on public.public_profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users update their own public profile" on public.public_profiles;
create policy "Users update their own public profile"
on public.public_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete their own public profile" on public.public_profiles;
create policy "Users delete their own public profile"
on public.public_profiles
for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.set_public_profiles_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_public_profiles_updated_at on public.public_profiles;
create trigger set_public_profiles_updated_at
before update on public.public_profiles
for each row execute function public.set_public_profiles_updated_at();

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint different_users check (requester_id <> addressee_id),
  constraint unique_pair unique (requester_id, addressee_id)
);

alter table public.friendships enable row level security;

drop policy if exists "Users see friendships they're part of" on public.friendships;
create policy "Users see friendships they're part of"
on public.friendships
for select
to authenticated
using ((select auth.uid()) = requester_id or (select auth.uid()) = addressee_id);

drop policy if exists "Users send friend requests as themselves" on public.friendships;
create policy "Users send friend requests as themselves"
on public.friendships
for insert
to authenticated
with check ((select auth.uid()) = requester_id);

drop policy if exists "Participants update their friendship" on public.friendships;
create policy "Participants update their friendship"
on public.friendships
for update
to authenticated
using ((select auth.uid()) = requester_id or (select auth.uid()) = addressee_id)
with check ((select auth.uid()) = requester_id or (select auth.uid()) = addressee_id);

drop policy if exists "Participants remove their friendship" on public.friendships;
create policy "Participants remove their friendship"
on public.friendships
for delete
to authenticated
using ((select auth.uid()) = requester_id or (select auth.uid()) = addressee_id);

create or replace function public.set_friendships_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_friendships_updated_at on public.friendships;
create trigger set_friendships_updated_at
before update on public.friendships
for each row execute function public.set_friendships_updated_at();
