-- 1. Profiles Table (Extends Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamptz default now(),
  pin_admin text,
  family_name text
);

-- 2. Children Table
create table children (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  birth_date date,
  current_balance integer default 0,
  avatar_url text
);

-- Index for faster lookups by parent
create index children_parent_id_idx on children(parent_id);

-- 3. Tasks Table (Templates)
create table tasks (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  reward_value integer not null default 0,
  type text check (type in ('ONE_TIME', 'RECURRING')) default 'ONE_TIME',
  recurrence_rule text, -- e.g., 'Daily', 'Weekly'
  is_active boolean default true,
  created_at timestamptz default now()
);

create index tasks_parent_id_idx on tasks(parent_id);

-- 4. Rewards Table (Templates)
create table rewards (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  cost_value integer not null default 0,
  category text,
  type text check (type in ('ONE_TIME', 'UNLIMITED', 'ACCUMULATIVE')) default 'UNLIMITED',
  required_task_id uuid references tasks(id) on delete set null,
  required_task_count integer default 0,
  created_at timestamptz default now()
);

create index rewards_parent_id_idx on rewards(parent_id);

-- 5. Child Task Log (Verification Queue)
create table child_tasks_log (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references profiles(id) on delete cascade not null,
  child_id uuid references children(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete set null,
  status text check (status in ('PENDING', 'VERIFIED', 'REJECTED')) default 'PENDING',
  rejection_reason text,
  completed_at timestamptz default now()
);

create index log_status_child_idx on child_tasks_log(status, child_id);
create index log_parent_idx on child_tasks_log(parent_id);

-- 6. Coin Transactions (Ledger)
create table coin_transactions (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references profiles(id) on delete cascade not null,
  child_id uuid references children(id) on delete cascade not null,
  amount integer not null, -- Positive for earning, Negative for spending
  type text check (type in ('TASK_VERIFIED', 'REWARD_REDEEMED', 'MANUAL_ADJ')),
  reference_id uuid, -- Can link to log_id or reward_id
  description text, -- Optional reason/description for the transaction
  created_at timestamptz default now()
);

create index tx_child_created_idx on coin_transactions(child_id, created_at);

-- 7. Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table children enable row level security;
alter table tasks enable row level security;
alter table rewards enable row level security;
alter table child_tasks_log enable row level security;
alter table coin_transactions enable row level security;

-- 8. RLS Policies (Simple: Users can only see/edit their own data)
-- Profiles: Users can select/update their own profile
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- Children: Parents can do everything
create policy "Parents can view own children." on children for select using ( auth.uid() = parent_id );
create policy "Parents can insert own children." on children for insert with check ( auth.uid() = parent_id );
create policy "Parents can update own children." on children for update using ( auth.uid() = parent_id );
create policy "Parents can delete own children." on children for delete using ( auth.uid() = parent_id );

-- Tasks: Parents can do everything
create policy "Parents can view own tasks." on tasks for select using ( auth.uid() = parent_id );
create policy "Parents can insert own tasks." on tasks for insert with check ( auth.uid() = parent_id );
create policy "Parents can update own tasks." on tasks for update using ( auth.uid() = parent_id );
create policy "Parents can delete own tasks." on tasks for delete using ( auth.uid() = parent_id );

-- Rewards: Parents can do everything
create policy "Parents can view own rewards." on rewards for select using ( auth.uid() = parent_id );
create policy "Parents can insert own rewards." on rewards for insert with check ( auth.uid() = parent_id );
create policy "Parents can update own rewards." on rewards for update using ( auth.uid() = parent_id );
create policy "Parents can delete own rewards." on rewards for delete using ( auth.uid() = parent_id );

-- Logs: Parents can do everything
create policy "Parents can view own logs." on child_tasks_log for select using ( auth.uid() = parent_id );
create policy "Parents can insert own logs." on child_tasks_log for insert with check ( auth.uid() = parent_id );
create policy "Parents can update own logs." on child_tasks_log for update using ( auth.uid() = parent_id );

-- Transactions: Parents can do everything
create policy "Parents can view own tx." on coin_transactions for select using ( auth.uid() = parent_id );
create policy "Parents can insert own tx." on coin_transactions for insert with check ( auth.uid() = parent_id );

