begin;

create table public.demo_session_state (
    session_id_hash text primary key check (session_id_hash ~ '^[0-9a-f]{64}$'),
    state jsonb not null check (jsonb_typeof(state) = 'object'),
    revision bigint not null default 0 check (revision >= 0),
    created_at timestamptz not null default statement_timestamp(),
    updated_at timestamptz not null default statement_timestamp(),
    expires_at timestamptz not null default (statement_timestamp() + interval '12 hours'),
    check (expires_at = created_at + interval '12 hours')
);

create index demo_session_state_expires_at_idx
    on public.demo_session_state (expires_at);

alter table public.demo_session_state enable row level security;

revoke all on table public.demo_session_state
    from public, anon, authenticated, service_role;
grant select, delete on table public.demo_session_state to service_role;
grant insert (session_id_hash, state) on table public.demo_session_state to service_role;

-- The server validates the complete fixture-plus-state snapshot at the expected
-- revision. Commit only against that revision, so competing writes cannot
-- invalidate the checks between validation and commit.
create function public.commit_demo_session_state(
    p_session_id_hash text,
    p_expected_revision bigint,
    p_next_state jsonb
) returns boolean
language sql
security definer
set search_path = ''
as $$
    with committed as (
        update public.demo_session_state
        set state = p_next_state,
            revision = revision + 1,
            updated_at = clock_timestamp()
        where session_id_hash = p_session_id_hash
          and revision = p_expected_revision
          and expires_at > clock_timestamp()
        returning 1
    )
    select exists (select 1 from committed);
$$;

revoke all on function public.commit_demo_session_state(text, bigint, jsonb)
    from public, anon, authenticated, service_role;
grant execute on function public.commit_demo_session_state(text, bigint, jsonb)
    to service_role;

commit;
