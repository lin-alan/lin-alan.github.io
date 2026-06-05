create extension if not exists pgcrypto;

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity text default '',
  expiry date not null,
  added_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.ingredients enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "Allow public ingredients access" on public.ingredients;
create policy "Allow public ingredients access"
on public.ingredients
for all
to anon
using (true)
with check (true);

drop policy if exists "Allow public settings access" on public.app_settings;
create policy "Allow public settings access"
on public.app_settings
for all
to anon
using (true)
with check (true);
