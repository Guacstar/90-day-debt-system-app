-- Debt Reset Dashboard MVP relational schema, seed data, and starter RLS policies.
create extension if not exists pgcrypto;

create type app_role as enum ('client', 'coach');
create type program_status as enum ('Onboarding', 'Active', 'Needs attention', 'Completed', 'Paused', 'Referred out');
create type debt_status as enum ('Current', 'Late', 'In collections', 'Paid off', 'Needs attention');
create type payment_status as enum ('Upcoming', 'Paid', 'Missed', 'Autopay enabled', 'Needs attention');
create type alert_severity as enum ('Low', 'Medium', 'High');
create type cash_entry_type as enum ('income', 'expense');
create type expense_type as enum ('fixed', 'variable');

create table users (
  id uuid primary key default gen_random_uuid(),
  role app_role not null,
  full_name text not null,
  email text not null unique,
  phone text,
  password_hash text,
  auth_provider_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  coach_id uuid references users(id) on delete set null,
  program_start_date date not null,
  program_end_date date not null,
  program_status program_status not null default 'Onboarding',
  monthly_income numeric(12,2) not null default 0,
  income_frequency text,
  estimated_total_debt numeric(12,2) not null default 0,
  current_emergency_fund numeric(12,2) not null default 0,
  main_goal text,
  starting_stress_level int check (starting_stress_level between 1 and 10),
  starting_confidence_level int check (starting_confidence_level between 1 and 10),
  current_stress_level int check (current_stress_level between 1 and 10),
  current_confidence_level int check (current_confidence_level between 1 and 10),
  next_coaching_call_date date,
  payoff_method text not null default 'Snowball' check (payoff_method in ('Snowball', 'Avalanche')),
  current_on_rent_mortgage boolean not null default true,
  current_on_food_utilities boolean not null default true,
  considering_bankruptcy boolean not null default false,
  facing_legal_action boolean not null default false,
  wants_creditor_negotiation boolean not null default false,
  wants_debt_settlement boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table client_risk_flags (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  flag_type text not null check (flag_type in ('no_income','behind_on_essentials','considering_bankruptcy','legal_action','debt_settlement_request','creditor_negotiation_request','high_stress','low_confidence','missed_payment','missed_checkin','new_debt_added')),
  flag_value boolean not null default true,
  severity alert_severity not null default 'Medium',
  message text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table debts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  creditor_name text not null,
  debt_type text not null check (debt_type in ('Credit card','Personal loan','Auto loan','Medical debt','Student loan','Buy now/pay later','Other')),
  starting_balance numeric(12,2) not null default 0,
  current_balance numeric(12,2) not null default 0,
  interest_rate numeric(6,3) not null default 0,
  minimum_payment numeric(12,2) not null default 0,
  due_date date,
  autopay_enabled boolean not null default false,
  status debt_status not null default 'Current',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cash_flow_entries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  category text not null,
  amount numeric(12,2) not null default 0,
  entry_type cash_entry_type not null,
  expense_type expense_type,
  essential boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table spending_leaks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  category text not null check (category in ('Subscription','Food delivery','Dining out','Shopping','Convenience purchase','App/software','Membership','Impulse buy','Bank fee','Late fee','Other')),
  monthly_cost numeric(12,2) not null default 0,
  decision text not null default 'Review later' check (decision in ('Keep','Cancel','Reduce','Review later')),
  potential_monthly_savings numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  debt_id uuid references debts(id) on delete set null,
  due_date date not null,
  minimum_amount_due numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  extra_payment_amount numeric(12,2) not null default 0,
  payment_status payment_status not null default 'Upcoming',
  autopay_status boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table weekly_checkins (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  week_number int not null check (week_number between 1 and 12),
  avoided_new_debt boolean not null,
  made_all_required_payments boolean not null,
  stayed_within_weekly_spending_limit boolean not null,
  extra_debt_payment numeric(12,2) not null default 0,
  total_debt_went_up boolean not null,
  biggest_money_win text,
  biggest_challenge text,
  spending_temptation text,
  help_needed text,
  stress_level int check (stress_level between 1 and 10),
  confidence_level int check (confidence_level between 1 and 10),
  coach_response text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, week_number)
);

create table emergency_funds (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references clients(id) on delete cascade,
  goal_amount numeric(12,2) not null default 500,
  current_balance numeric(12,2) not null default 0,
  weekly_contribution numeric(12,2) not null default 0,
  monthly_contribution numeric(12,2) not null default 0,
  goal_type text not null check (goal_type in ('$250','$500','$1,000','One month of expenses','Custom')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table program_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  phase text not null,
  week_range text not null,
  task_name text not null,
  task_description text,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table coach_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  coach_id uuid not null references users(id) on delete cascade,
  note_type text not null check (note_type in ('General','Spending behavior','Debt progress','Missed check-in','Risk flag','Referral concern','Coaching call notes')),
  note_content text not null,
  follow_up_needed boolean not null default false,
  follow_up_due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table coach_alerts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  alert_type text not null,
  severity alert_severity not null default 'Low',
  alert_message text not null,
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function is_coach_for_client(target_client uuid) returns boolean language sql stable as $$
  select exists (
    select 1 from clients c join users u on u.id = c.coach_id
    where c.id = target_client and u.auth_provider_id = auth.uid()::text and u.role = 'coach'
  );
$$;

create or replace function is_client_owner(target_client uuid) returns boolean language sql stable as $$
  select exists (
    select 1 from clients c join users u on u.id = c.user_id
    where c.id = target_client and u.auth_provider_id = auth.uid()::text and u.role = 'client'
  );
$$;

alter table users enable row level security;
alter table clients enable row level security;
alter table client_risk_flags enable row level security;
alter table debts enable row level security;
alter table cash_flow_entries enable row level security;
alter table spending_leaks enable row level security;
alter table payments enable row level security;
alter table weekly_checkins enable row level security;
alter table emergency_funds enable row level security;
alter table program_tasks enable row level security;
alter table coach_notes enable row level security;
alter table coach_alerts enable row level security;

create policy "users can read own profile" on users for select using (auth_provider_id = auth.uid()::text or exists (select 1 from users u where u.auth_provider_id = auth.uid()::text and u.role = 'coach'));
create policy "clients read own or assigned" on clients for select using (is_client_owner(id) or is_coach_for_client(id));
create policy "clients update own or assigned" on clients for update using (is_client_owner(id) or is_coach_for_client(id));

create policy "debts client and coach access" on debts for all using (is_client_owner(client_id) or is_coach_for_client(client_id)) with check (is_client_owner(client_id) or is_coach_for_client(client_id));
create policy "cash flow client and coach access" on cash_flow_entries for all using (is_client_owner(client_id) or is_coach_for_client(client_id)) with check (is_client_owner(client_id) or is_coach_for_client(client_id));
create policy "leaks client and coach access" on spending_leaks for all using (is_client_owner(client_id) or is_coach_for_client(client_id)) with check (is_client_owner(client_id) or is_coach_for_client(client_id));
create policy "payments client and coach access" on payments for all using (is_client_owner(client_id) or is_coach_for_client(client_id)) with check (is_client_owner(client_id) or is_coach_for_client(client_id));
create policy "checkins client and coach access" on weekly_checkins for all using (is_client_owner(client_id) or is_coach_for_client(client_id)) with check (is_client_owner(client_id) or is_coach_for_client(client_id));
create policy "emergency funds client and coach access" on emergency_funds for all using (is_client_owner(client_id) or is_coach_for_client(client_id)) with check (is_client_owner(client_id) or is_coach_for_client(client_id));
create policy "tasks client and coach access" on program_tasks for all using (is_client_owner(client_id) or is_coach_for_client(client_id)) with check (is_client_owner(client_id) or is_coach_for_client(client_id));
create policy "risk flags visible to client and coach" on client_risk_flags for select using (is_client_owner(client_id) or is_coach_for_client(client_id));
create policy "coach notes coach only" on coach_notes for all using (is_coach_for_client(client_id)) with check (is_coach_for_client(client_id));
create policy "coach alerts coach only" on coach_alerts for all using (is_coach_for_client(client_id)) with check (is_coach_for_client(client_id));

insert into users (id, role, full_name, email, phone, auth_provider_id) values
  ('00000000-0000-0000-0000-000000000001','coach','Orlando Coach','coach@example.com','555-0100','seed-coach'),
  ('00000000-0000-0000-0000-000000000002','client','Maria Lopez','maria@example.com','555-0110','seed-maria'),
  ('00000000-0000-0000-0000-000000000003','client','James Carter','james@example.com','555-0120','seed-james');

insert into clients (id, user_id, coach_id, program_start_date, program_end_date, program_status, monthly_income, income_frequency, estimated_total_debt, current_emergency_fund, main_goal, starting_stress_level, starting_confidence_level, current_stress_level, current_confidence_level, next_coaching_call_date, payoff_method) values
  ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','2026-04-06','2026-07-05','Active',5200,'Biweekly',18500,350,'Pay off two cards and feel calm about bills.',7,5,6,6,'2026-05-12','Snowball'),
  ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','2026-04-20','2026-07-19','Needs attention',6400,'Monthly',32000,150,'Stop falling behind and build a reliable payoff rhythm.',8,4,8,4,'2026-05-09','Avalanche');

insert into debts (client_id, creditor_name, debt_type, starting_balance, current_balance, interest_rate, minimum_payment, due_date, autopay_enabled, status, notes) values
  ('10000000-0000-0000-0000-000000000001','Bright Bank Visa','Credit card',6200,5800,24.9,185,'2026-05-11',true,'Current','Target for snowball after store card.'),
  ('10000000-0000-0000-0000-000000000001','City Medical','Medical debt',2300,2100,0,75,'2026-05-18',false,'Current','No interest payment plan.'),
  ('10000000-0000-0000-0000-000000000001','Reliable Auto','Auto loan',10000,10000,6.4,340,'2026-05-22',true,'Current','Keep minimums current.'),
  ('10000000-0000-0000-0000-000000000002','Summit Mastercard','Credit card',12000,11800,27.5,360,'2026-05-10',false,'Needs attention','High interest target.'),
  ('10000000-0000-0000-0000-000000000002','Northside Personal Loan','Personal loan',8000,7900,12.2,250,'2026-05-16',true,'Current','Fixed monthly payment.'),
  ('10000000-0000-0000-0000-000000000002','State Student Loan','Student loan',12000,12000,5.1,140,'2026-05-28',true,'Current','Do not accelerate yet.');
