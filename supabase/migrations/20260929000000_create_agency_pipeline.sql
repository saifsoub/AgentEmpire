-- S/Agency commercial capture and staff-owned qualification pipeline.
-- This migration intentionally does not alter or project public.university_interest.

create extension if not exists pgcrypto;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  email text not null,
  email_normalized text generated always as (lower(btrim(email))) stored,
  phone text,
  qualification_stage text not null default 'unqualified'
    check (qualification_stage in ('unqualified', 'qualifying', 'qualified', 'disqualified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  source text not null check (source = 'agent_empire_capture'),
  source_record_id uuid not null,
  purpose text not null check (purpose in ('agency_offer_interest', 'agency_asset_interest')),
  source_type text not null check (source_type in ('offer', 'asset')),
  source_id text not null,
  source_name text not null,
  message text,
  contact_consent boolean not null check (contact_consent),
  consent_text text not null,
  consented_at timestamptz not null,
  source_created_at timestamptz not null default now(),
  unique (source, source_record_id)
);

alter table public.leads enable row level security;
alter table public.lead_sources enable row level security;

revoke all on public.leads, public.lead_sources
  from anon, authenticated;

comment on table public.leads is 'Private S/Agency leads; separate from University admissions interest.';
comment on table public.lead_sources is 'Purpose-scoped capture receipts and consent evidence.';
-- Add company/opportunity tables only with an agreed staff qualification workflow.

-- The server calls one RPC so a source receipt and its lead commit together.
-- The lock serializes concurrent retries of the same submission ID. It never
-- coalesces people across different consent purposes or source records.
create function public.capture_agency_interest(
  p_submission_id uuid, p_first_name text, p_last_name text, p_email text,
  p_source_type text, p_source_id text, p_source_name text,
  p_message text, p_consent_text text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  existing public.lead_sources%rowtype;
  existing_email text;
  new_lead_id uuid;
begin
  if p_submission_id is null or nullif(btrim(p_email), '') is null
     or p_source_type not in ('offer', 'asset')
     or nullif(btrim(p_source_id), '') is null
     or nullif(btrim(p_source_name), '') is null
     or nullif(btrim(p_consent_text), '') is null then
    raise exception 'Invalid agency capture';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_submission_id::text));
  select * into existing from public.lead_sources
    where source = 'agent_empire_capture' and source_record_id = p_submission_id;
  if found then
    select email into existing_email from public.leads where id = existing.lead_id;
    if lower(btrim(existing_email)) <> lower(btrim(p_email))
       or existing.source_type <> p_source_type or existing.source_id <> p_source_id
       or existing.consent_text <> p_consent_text then
      raise exception 'Submission ID reused with different content';
    end if;
    return pg_catalog.jsonb_build_object('receipt_id', p_submission_id, 'duplicate', true);
  end if;
  insert into public.leads (first_name, last_name, email)
    values (p_first_name, p_last_name, btrim(p_email)) returning id into new_lead_id;
  insert into public.lead_sources
    (lead_id, source, source_record_id, purpose, source_type, source_id,
     source_name, message, contact_consent, consent_text, consented_at)
    values (new_lead_id, 'agent_empire_capture', p_submission_id,
      case p_source_type when 'offer' then 'agency_offer_interest' else 'agency_asset_interest' end,
      p_source_type, p_source_id, p_source_name, p_message, true, p_consent_text, now());
  return pg_catalog.jsonb_build_object('receipt_id', p_submission_id, 'duplicate', false);
end $$;

revoke all on function public.capture_agency_interest(uuid,text,text,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.capture_agency_interest(uuid,text,text,text,text,text,text,text,text) to service_role;
