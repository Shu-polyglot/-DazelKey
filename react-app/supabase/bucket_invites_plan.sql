-- DazelKey: carries a Recommend-generated plan along with a Bucket
-- invite (see useBucketInvites.js / RecommendPlanFlow.jsx) so accepting
-- doesn't just create a bare Bucket for the invitee -- it arrives with
-- the same schedule/budget/shortcuts already attached, ready to act on
-- immediately instead of re-generating a plan from scratch. Nullable:
-- a plain "Invite" sent from ExpandedBucketCard (no Recommend flow
-- involved) still works exactly as before, with plan left null.
alter table public.bucket_invites add column if not exists plan jsonb;
