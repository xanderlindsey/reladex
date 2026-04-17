-- Run this in the Supabase SQL editor: https://supabase.com/dashboard/project/ulkzgtigejzjzxikthxn/sql

create table contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  context text not null,
  tier int not null check (tier in (1, 2, 3)),
  channel text not null,
  offer text,
  notes text,
  last_contact date,
  reminder_days int,
  created_at timestamptz default now() not null
);

alter table contacts enable row level security;

create policy "select own contacts" on contacts for select using (auth.uid() = user_id);
create policy "insert own contacts" on contacts for insert with check (auth.uid() = user_id);
create policy "update own contacts" on contacts for update using (auth.uid() = user_id);
create policy "delete own contacts" on contacts for delete using (auth.uid() = user_id);


create table interaction_log (
  id uuid default gen_random_uuid() primary key,
  contact_id uuid references contacts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  note text,
  created_at timestamptz default now() not null
);

alter table interaction_log enable row level security;

create policy "select own logs" on interaction_log for select using (auth.uid() = user_id);
create policy "insert own logs" on interaction_log for insert with check (auth.uid() = user_id);
