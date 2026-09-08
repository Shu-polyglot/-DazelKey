-- DazelKey: "誘う" -- inviting an already-accepted friend into one of
-- your own Bucket List intentions (see useBucketInvites.js). This is
-- deliberately a structured invite/accept object, not a DM/chat
-- surface: the MVP notes explicitly rule out DazelKey growing its own
-- Social Platform, and open-ended chatting about the details is left to
-- whatever app the two people already use (LINE, iMessage, ...) --
-- this table only ever carries "here's an experience, want in?" plus a
-- pending/accepted/declined status.
--
-- Buckets themselves live in each user's own private user_state JSON
-- blob (see useBuckets), invisible to anyone else under that table's
-- RLS -- so this table keeps its own snapshot of the shareable fields
-- (title/place/bucket_when/message) instead of a foreign key into that
-- blob, the same reason achievements.sql keeps its own copy rather than
-- reading user_state directly. `bucket_when` (not `when`, a reserved
-- word) mirrors Bucket's own `when` field -- 'thisYear' or 'beforeIDie'.
create table if not exists public.bucket_invites (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid not null references auth.users(id) on delete cascade,
  source_bucket_id bigint not null,
  title text not null default '',
  place text not null default '',
  bucket_when text not null default 'thisYear' check (bucket_when in ('thisYear', 'beforeIDie')),
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint different_users check (from_user_id <> to_user_id),
  -- Lets sendInvite re-invite after a decline via upsert (flips the same
  -- row back to 'pending') instead of erroring on a duplicate insert.
  constraint unique_bucket_invite unique (from_user_id, to_user_id, source_bucket_id)
);

alter table public.bucket_invites enable row level security;

drop policy if exists "Participants read their bucket invites" on public.bucket_invites;
create policy "Participants read their bucket invites"
on public.bucket_invites
for select
to authenticated
using ((select auth.uid()) = from_user_id or (select auth.uid()) = to_user_id);

-- Only reachable between two users who are already accepted friends --
-- this is not a cold-outreach mechanism like public_profiles' invite
-- link (see AddFriendScreen).
drop policy if exists "Friends send bucket invites" on public.bucket_invites;
create policy "Friends send bucket invites"
on public.bucket_invites
for insert
to authenticated
with check (
  (select auth.uid()) = from_user_id
  and exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = (select auth.uid()) and f.addressee_id = bucket_invites.to_user_id)
        or (f.addressee_id = (select auth.uid()) and f.requester_id = bucket_invites.to_user_id)
      )
  )
);

drop policy if exists "Participants update their bucket invite" on public.bucket_invites;
create policy "Participants update their bucket invite"
on public.bucket_invites
for update
to authenticated
using ((select auth.uid()) = from_user_id or (select auth.uid()) = to_user_id)
with check ((select auth.uid()) = from_user_id or (select auth.uid()) = to_user_id);

drop policy if exists "Senders remove their bucket invite" on public.bucket_invites;
create policy "Senders remove their bucket invite"
on public.bucket_invites
for delete
to authenticated
using ((select auth.uid()) = from_user_id);

create or replace function public.set_bucket_invites_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_bucket_invites_updated_at on public.bucket_invites;
create trigger set_bucket_invites_updated_at
before update on public.bucket_invites
for each row execute function public.set_bucket_invites_updated_at();
