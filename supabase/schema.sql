-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Enum Types
create type user_role as enum ('view_only', 'dept_user', 'dept_manager', 'admin');
create type ticket_status as enum ('open', 'in_progress', 'resolved', 'closed', 'on_hold');
create type ticket_priority as enum ('low', 'medium', 'high', 'critical');

-- Departments Table
create table public.departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  manager_id uuid, -- Reference to auth.users, can be null initially
  manager_email text, -- Email for notifications
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles Table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role user_role default 'view_only',
  department_id uuid references public.departments(id),
  password_changed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  password_reset_required boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tickets Table
create table public.tickets (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status ticket_status default 'open',
  priority ticket_priority default 'medium',
  creator_id uuid references public.profiles(id) not null,
  assigned_dept_id uuid references public.departments(id),
  assigned_user_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sla_deadline timestamp with time zone,
  resolved_at timestamp with time zone
);

-- Ticket Activity Log (For audit and history)
create table public.ticket_activity (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) not null,
  action text not null, -- e.g., 'created', 'status_change', 'comment'
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert Default Departments
insert into public.departments (name) values 
('Engineering'),
('IT'),
('Housekeeping'),
('IRD');

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_activity enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Departments Policies
create policy "Departments are viewable by everyone" on public.departments
  for select using (true);

-- Tickets Policies
-- 1. View Only: Can see all tickets (or maybe just their own? Requirement says "view only -- the person who can only see the what are the ticket is raised")
-- Assuming View Only can see ALL tickets for transparency, or maybe restricted. Let's start with ALL.
create policy "Tickets are viewable by everyone" on public.tickets
  for select using (true);

-- 2. Dept User: Create tickets
create policy "Dept Users can create tickets" on public.tickets
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('dept_user', 'dept_manager', 'admin')
    )
  );

-- 3. Dept User: Update own tickets (Only within 20 mins - logic handled in App/Edge Function, but RLS can allow update if owner)
create policy "Creators can update own tickets" on public.tickets
  for update using (
    auth.uid() = creator_id
  );

-- 4. Dept Manager: Update tickets assigned to their department
create policy "Managers can update dept tickets" on public.tickets
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() 
      and role = 'dept_manager'
      and department_id = tickets.assigned_dept_id
    )
  );

-- 5. Admin: Full Access
create policy "Admins can do everything" on public.tickets
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, password_changed_at)
  values (new.id, new.raw_user_meta_data->>'full_name', 'view_only', timezone('utc'::text, now()));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to check if password is expired (30 days)
create or replace function public.is_password_expired(user_id uuid)
returns boolean as $$
declare
  profile_record record;
  is_expired boolean;
begin
  select role, password_changed_at into profile_record
  from public.profiles
  where id = user_id;
  
  -- Admins never have password expiry
  if profile_record.role = 'admin' then
    return false;
  end if;
  
  -- Check if password is older than 30 days
  is_expired := profile_record.password_changed_at < (now() - interval '30 days');
  
  return is_expired;
end;
$$ language plpgsql security definer;
