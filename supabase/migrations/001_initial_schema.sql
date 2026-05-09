-- 90-Day Debt Reset Dashboard — Initial Schema
-- For use with Supabase + PostgreSQL + Row Level Security

-- Users table (mirrors Supabase auth.users with additional fields)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('client', 'coach')),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  auth_provider_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES users(id),
  program_start_date DATE NOT NULL,
  program_end_date DATE,
  program_status TEXT NOT NULL DEFAULT 'onboarding'
    CHECK (program_status IN ('onboarding','active','needs_attention','completed','paused','referred_out')),
  monthly_income NUMERIC(12,2) DEFAULT 0,
  income_frequency TEXT DEFAULT 'biweekly'
    CHECK (income_frequency IN ('weekly','biweekly','semimonthly','monthly')),
  estimated_total_debt NUMERIC(12,2) DEFAULT 0,
  current_emergency_fund NUMERIC(12,2) DEFAULT 0,
  main_goal TEXT,
  starting_stress_level INT CHECK (starting_stress_level BETWEEN 1 AND 10),
  starting_confidence_level INT CHECK (starting_confidence_level BETWEEN 1 AND 10),
  current_stress_level INT CHECK (current_stress_level BETWEEN 1 AND 10),
  current_confidence_level INT CHECK (current_confidence_level BETWEEN 1 AND 10),
  next_coaching_call_date DATE,
  current_on_rent BOOLEAN DEFAULT TRUE,
  current_on_food_utilities BOOLEAN DEFAULT TRUE,
  considering_bankruptcy BOOLEAN DEFAULT FALSE,
  facing_legal_action BOOLEAN DEFAULT FALSE,
  wants_debt_settlement BOOLEAN DEFAULT FALSE,
  payoff_method TEXT DEFAULT 'snowball' CHECK (payoff_method IN ('snowball','avalanche')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client risk flags
CREATE TABLE client_risk_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL,
  flag_value TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low','medium','high')),
  message TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Debts
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  creditor_name TEXT NOT NULL,
  debt_type TEXT NOT NULL CHECK (debt_type IN ('credit_card','personal_loan','auto_loan','medical_debt','student_loan','bnpl','other')),
  starting_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  interest_rate NUMERIC(5,2) DEFAULT 0,
  minimum_payment NUMERIC(12,2) DEFAULT 0,
  due_date INT CHECK (due_date BETWEEN 1 AND 31),
  autopay_enabled BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'current'
    CHECK (status IN ('current','late','in_collections','paid_off','needs_attention')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cash flow entries
CREATE TABLE cash_flow_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('income','expense')),
  expense_type TEXT CHECK (expense_type IN ('fixed','variable')),
  essential BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spending leaks
CREATE TABLE spending_leaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  monthly_cost NUMERIC(12,2) DEFAULT 0,
  decision TEXT NOT NULL DEFAULT 'review_later'
    CHECK (decision IN ('keep','cancel','reduce','review_later')),
  potential_monthly_savings NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  debt_id UUID NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  minimum_amount_due NUMERIC(12,2) DEFAULT 0,
  amount_paid NUMERIC(12,2) DEFAULT 0,
  extra_payment_amount NUMERIC(12,2) DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (payment_status IN ('upcoming','paid','missed','autopay_enabled','needs_attention')),
  autopay_status BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly check-ins
CREATE TABLE weekly_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 12),
  avoided_new_debt BOOLEAN DEFAULT TRUE,
  made_all_required_payments BOOLEAN DEFAULT TRUE,
  stayed_within_weekly_spending_limit BOOLEAN DEFAULT TRUE,
  extra_debt_payment NUMERIC(12,2) DEFAULT 0,
  total_debt_went_up BOOLEAN DEFAULT FALSE,
  biggest_money_win TEXT,
  biggest_challenge TEXT,
  spending_temptation TEXT,
  help_needed TEXT,
  stress_level INT CHECK (stress_level BETWEEN 1 AND 10),
  confidence_level INT CHECK (confidence_level BETWEEN 1 AND 10),
  coach_response TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (client_id, week_number)
);

-- Emergency funds
CREATE TABLE emergency_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  goal_amount NUMERIC(12,2) DEFAULT 1000,
  current_balance NUMERIC(12,2) DEFAULT 0,
  weekly_contribution NUMERIC(12,2) DEFAULT 0,
  monthly_contribution NUMERIC(12,2) DEFAULT 0,
  goal_type TEXT DEFAULT '1000' CHECK (goal_type IN ('250','500','1000','one_month','custom')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Program tasks
CREATE TABLE program_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  phase INT NOT NULL CHECK (phase BETWEEN 1 AND 4),
  week_range TEXT NOT NULL,
  task_name TEXT NOT NULL,
  task_description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach notes
CREATE TABLE coach_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES users(id),
  note_type TEXT NOT NULL DEFAULT 'general'
    CHECK (note_type IN ('general','spending_behavior','debt_progress','missed_checkin','risk_flag','referral_concern','coaching_call_notes')),
  note_content TEXT NOT NULL,
  follow_up_needed BOOLEAN DEFAULT FALSE,
  follow_up_due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach alerts
CREATE TABLE coach_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low','medium','high')),
  alert_message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_leaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_alerts ENABLE ROW LEVEL SECURITY;

-- Clients can only see their own data; coaches can see all
CREATE POLICY "clients_own_data" ON clients
  FOR ALL USING (
    auth.uid()::text = user_id::text
    OR EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'coach')
  );

CREATE POLICY "debts_policy" ON debts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM clients WHERE id = client_id AND user_id::text = auth.uid()::text)
    OR EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'coach')
  );

-- (Similar policies for other tables — abbreviated for clarity)
CREATE POLICY "cash_flow_policy" ON cash_flow_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM clients WHERE id = client_id AND user_id::text = auth.uid()::text)
  OR EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'coach')
);

CREATE POLICY "spending_leaks_policy" ON spending_leaks FOR ALL USING (
  EXISTS (SELECT 1 FROM clients WHERE id = client_id AND user_id::text = auth.uid()::text)
  OR EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'coach')
);

CREATE POLICY "payments_policy" ON payments FOR ALL USING (
  EXISTS (SELECT 1 FROM clients WHERE id = client_id AND user_id::text = auth.uid()::text)
  OR EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'coach')
);

CREATE POLICY "checkins_policy" ON weekly_checkins FOR ALL USING (
  EXISTS (SELECT 1 FROM clients WHERE id = client_id AND user_id::text = auth.uid()::text)
  OR EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'coach')
);

CREATE POLICY "ef_policy" ON emergency_funds FOR ALL USING (
  EXISTS (SELECT 1 FROM clients WHERE id = client_id AND user_id::text = auth.uid()::text)
  OR EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'coach')
);

CREATE POLICY "tasks_policy" ON program_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM clients WHERE id = client_id AND user_id::text = auth.uid()::text)
  OR EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'coach')
);

CREATE POLICY "coach_notes_policy" ON coach_notes FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'coach')
);

CREATE POLICY "coach_alerts_policy" ON coach_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'coach')
);
