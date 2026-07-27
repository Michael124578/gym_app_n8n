-- 1. Enable UUID generator
create extension if not exists "uuid-ossp";

-- 2. Create Members Table
create table public.members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  phone text,
  qr_code_token text unique default uuid_generate_v4()::text,
  status text check (status in ('active', 'inactive', 'suspended')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Subscriptions Table
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid references public.members(id) on delete cascade not null,
  plan_name text not null,
  start_date date not null,
  end_date date not null,
  status text check (status in ('active', 'expired', 'pending')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Check-Ins Table
create table public.check_ins (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid references public.members(id) on delete cascade not null,
  checked_in_at timestamp with time zone default timezone('utc'::text, now()) not null,
  access_granted boolean default true,
  notes text
);

-- 5. Enable Row Level Security (RLS)
alter table public.members enable row level security;
alter table public.subscriptions enable row level security;
alter table public.check_ins enable row level security;

-- 6. Basic RLS Policies (Allow authenticated users to read/write)
create policy "Allow authenticated read on members" on public.members for select using (auth.role() = 'authenticated');
create policy "Allow authenticated write on members" on public.members for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated read on subscriptions" on public.subscriptions for select using (auth.role() = 'authenticated');
create policy "Allow authenticated read write on check_ins" on public.check_ins for all using (auth.role() = 'authenticated');