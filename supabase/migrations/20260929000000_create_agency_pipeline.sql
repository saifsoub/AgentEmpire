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

-- Companies and opportunities are deliberately staff-created. There are no
-- triggers from lead_sources (or from university_interest) into these tables.
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index companies_domain_normalized_key
  on public.companies (lower(btrim(domain))) where domain is not null;

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete restrict,
  company_id uuid references public.companies(id) on delete restrict,
  name text not null,
  stage text not null default 'qualification'
    check (stage in ('qualification', 'discovery', 'proposal', 'won', 'lost')),
  value_amount numeric(14,2) check (value_amount is null or value_amount >= 0),
  currency text check (currency is null or currency ~ '^[A-Z]{3}$'),
  owner_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;
alter table public.lead_sources enable row level security;
alter table public.companies enable row level security;
alter table public.opportunities enable row level security;

revoke all on public.leads, public.lead_sources, public.companies, public.opportunities
  from anon, authenticated;

comment on table public.leads is 'Private S/Agency leads; separate from University admissions interest.';
comment on table public.lead_sources is 'Purpose-scoped capture receipts and consent evidence.';
comment on table public.companies is 'Staff-created companies; never inferred from intake submissions.';
comment on table public.opportunities is 'Staff-owned qualified opportunities; never created by intake submissions.';
