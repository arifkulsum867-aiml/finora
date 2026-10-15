create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  description text not null check (char_length(btrim(description)) between 1 and 100),
  amount numeric(12, 2) not null check (amount > 0),
  category text not null check (category in (
    'Food', 'Groceries', 'Transport', 'Education', 'Shopping', 'Health',
    'Bills and Utilities', 'Entertainment', 'Housing', 'Travel', 'Personal Care', 'Other'
  )),
  transaction_date date not null check (transaction_date <= current_date),
  payment_method text not null check (payment_method in (
    'Cash', 'UPI', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Other'
  )),
  notes text check (char_length(notes) <= 500),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  category text check (category is null or category in (
    'Food', 'Groceries', 'Transport', 'Education', 'Shopping', 'Health',
    'Bills and Utilities', 'Entertainment', 'Housing', 'Travel', 'Personal Care', 'Other'
  )),
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budgets_user_month_category_unique unique nulls not distinct (user_id, month, category)
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, transaction_date desc);
create index if not exists transactions_user_category_date_idx
  on public.transactions (user_id, category, transaction_date desc);
create index if not exists budgets_user_month_idx
  on public.budgets (user_id, month desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists transactions_updated_at on public.transactions;
create trigger transactions_updated_at before update on public.transactions
for each row execute function public.set_updated_at();
drop trigger if exists budgets_updated_at on public.budgets;
create trigger budgets_updated_at before update on public.budgets
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_user();

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles
for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Users can manage their own transactions" on public.transactions;
create policy "Users can manage their own transactions" on public.transactions
for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage their own budgets" on public.budgets;
create policy "Users can manage their own budgets" on public.budgets
for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
