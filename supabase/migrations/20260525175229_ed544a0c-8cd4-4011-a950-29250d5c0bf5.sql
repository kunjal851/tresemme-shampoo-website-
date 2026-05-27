
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  created_at timestamptz not null default now()
);
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);
alter table public.cart_items enable row level security;
alter table public.contact_messages enable row level security;
create policy "anyone can insert cart_items" on public.cart_items for insert to anon, authenticated with check (true);
create policy "anyone can insert contact_messages" on public.contact_messages for insert to anon, authenticated with check (true);
