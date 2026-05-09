-- =============================================================================
-- 90-Day Debt Reset Dashboard — Initial Schema
-- For use with Supabase + PostgreSQL + Row Level Security
--
-- Run this entire file in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- =============================================================================

-- USERS TABLE -----------------------------------------------------------------
-- Mirrors auth.users (Supabase's built-in auth table) with role + profile info.
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'coach')),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-create a public.users row when an auth user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, role, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CLIENTS ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  coach_id UUID REFERENCES public.users(id),
  program_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
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

-- DEBTS -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
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
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CASH FLOW ENTRIES -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cash_flow_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('income','expense')),
  expense_type TEXT CHECK (expense_type IN ('fixed','variable')),
  essential BOOLEAN DEFAULT FALSE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPENDING LEAKS --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.spending_leaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  monthly_cost NUMERIC(12,2) DEFAULT 0,
  decision TEXT NOT NULL DEFAULT 'review_later'
    CHECK (decision IN ('keep','cancel','reduce','review_later')),
  potential_monthly_savings NUMERIC(12,2) DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  minimum_amount_due NUMERIC(12,2) DEFAULT 0,
  amount_paid NUMERIC(12,2) DEFAULT 0,
  extra_payment_amount NUMERIC(12,2) DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (payment_status IN ('upcoming','paid','missed','autopay_enabled','needs_attention')),
  autopay_status BOOLEAN DEFAULT FALSE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WEEKLY CHECK-INS ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weekly_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 12),
  avoided_new_debt BOOLEAN DEFAULT TRUE,
  made_all_required_payments BOOLEAN DEFAULT TRUE,
  stayed_within_weekly_spending_limit BOOLEAN DEFAULT TRUE,
  extra_debt_payment NUMERIC(12,2) DEFAULT 0,
  total_debt_went_up BOOLEAN DEFAULT FALSE,
  biggest_money_win TEXT DEFAULT '',
  biggest_challenge TEXT DEFAULT '',
  spending_temptation TEXT DEFAULT '',
  help_needed TEXT DEFAULT '',
  stress_level INT CHECK (stress_level BETWEEN 1 AND 10),
  confidence_level INT CHECK (confidence_level BETWEEN 1 AND 10),
  coach_response TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (client_id, week_number)
);

-- EMERGENCY FUNDS -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE UNIQUE,
  goal_amount NUMERIC(12,2) DEFAULT 1000,
  current_balance NUMERIC(12,2) DEFAULT 0,
  weekly_contribution NUMERIC(12,2) DEFAULT 0,
  monthly_contribution NUMERIC(12,2) DEFAULT 0,
  goal_type TEXT DEFAULT '1000' CHECK (goal_type IN ('250','500','1000','one_month','custom')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROGRAM TASKS ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.program_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  phase INT NOT NULL CHECK (phase BETWEEN 1 AND 4),
  week_range TEXT NOT NULL,
  task_name TEXT NOT NULL,
  task_description TEXT DEFAULT '',
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COACH NOTES -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coach_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.users(id),
  note_type TEXT NOT NULL DEFAULT 'general'
    CHECK (note_type IN ('general','spending_behavior','debt_progress','missed_checkin','risk_flag','referral_concern','coaching_call_notes')),
  note_content TEXT NOT NULL,
  follow_up_needed BOOLEAN DEFAULT FALSE,
  follow_up_due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COACH ALERTS ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coach_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low','medium','high')),
  alert_message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_leaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_alerts ENABLE ROW LEVEL SECURITY;

-- Helper: returns true if the current authenticated user is a coach
CREATE OR REPLACE FUNCTION public.is_coach() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coach'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- USERS policies
CREATE POLICY "users_select_own_or_coach" ON public.users FOR SELECT
  USING (id = auth.uid() OR public.is_coach());
CREATE POLICY "users_update_self" ON public.users FOR UPDATE
  USING (id = auth.uid());

-- CLIENTS policies
CREATE POLICY "clients_select" ON public.clients FOR SELECT
  USING (user_id = auth.uid() OR public.is_coach());
CREATE POLICY "clients_insert_self" ON public.clients FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_coach());
CREATE POLICY "clients_update" ON public.clients FOR UPDATE
  USING (user_id = auth.uid() OR public.is_coach());
CREATE POLICY "clients_delete_coach" ON public.clients FOR DELETE
  USING (public.is_coach());

-- Generic helper macro applied per child table.
-- Each child table allows full access to (a) the owning client OR (b) any coach.

DO $$
DECLARE
  tbl TEXT;
  child_tables TEXT[] := ARRAY[
    'debts', 'cash_flow_entries', 'spending_leaks', 'payments',
    'weekly_checkins', 'emergency_funds', 'program_tasks',
    'coach_notes', 'coach_alerts'
  ];
BEGIN
  FOREACH tbl IN ARRAY child_tables LOOP
    EXECUTE format($f$
      CREATE POLICY "%s_all" ON public.%s FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.clients
          WHERE clients.id = %s.client_id
            AND (clients.user_id = auth.uid() OR public.is_coach())
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.clients
          WHERE clients.id = %s.client_id
            AND (clients.user_id = auth.uid() OR public.is_coach())
        )
      );
    $f$, tbl, tbl, tbl, tbl);
  END LOOP;
END$$;

-- =============================================================================
-- AUTO-CREATE PROGRAM TASKS WHEN A CLIENT IS CREATED
-- =============================================================================
CREATE OR REPLACE FUNCTION public.seed_program_tasks_for_client()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.program_tasks (client_id, phase, week_range, task_name, task_description) VALUES
    (NEW.id, 1, 'Weeks 1–2', 'Add all debts', 'Enter every debt including creditor, balance, interest rate, and minimum payment.'),
    (NEW.id, 1, 'Weeks 1–2', 'Add all expenses', 'Complete your cash-flow audit with all monthly income and expenses.'),
    (NEW.id, 1, 'Weeks 1–2', 'Build payment calendar', 'Set up your payment calendar with all upcoming due dates.'),
    (NEW.id, 1, 'Weeks 1–2', 'Stop new credit card usage', 'Commit to not adding new charges to any credit card.'),
    (NEW.id, 1, 'Weeks 1–2', 'Cancel wasteful subscriptions', 'Review subscriptions and cancel any you don''t actively use.'),
    (NEW.id, 2, 'Weeks 3–4', 'Choose payoff method', 'Select either Snowball (smallest balance first) or Avalanche (highest interest first).'),
    (NEW.id, 2, 'Weeks 3–4', 'Pick target debt', 'Identify your current target debt based on your chosen method.'),
    (NEW.id, 2, 'Weeks 3–4', 'Set weekly spending limits', 'Use your cash-flow audit to set a realistic weekly spending limit.'),
    (NEW.id, 2, 'Weeks 3–4', 'Set extra-payment rules', 'Decide how much extra you will put toward your target debt each month.'),
    (NEW.id, 2, 'Weeks 3–4', 'Create emergency buffer goal', 'Set your emergency fund starter goal ($250, $500, or $1,000).'),
    (NEW.id, 3, 'Weeks 5–8', 'Submit weekly check-ins', 'Submit your check-in every week so your coach can monitor your progress.'),
    (NEW.id, 3, 'Weeks 5–8', 'Track payments', 'Log every debt payment in the payment calendar as you make them.'),
    (NEW.id, 3, 'Weeks 5–8', 'Review spending', 'Each week, review your spending against your weekly limit.'),
    (NEW.id, 3, 'Weeks 5–8', 'Adjust the plan', 'Talk to your coach about any adjustments needed based on your results.'),
    (NEW.id, 3, 'Weeks 5–8', 'Avoid new debt', 'Continue to avoid adding any new debt during this phase.'),
    (NEW.id, 4, 'Weeks 9–12', 'Review total progress', 'Review how much debt you''ve paid down since starting the program.'),
    (NEW.id, 4, 'Weeks 9–12', 'Create six-month forecast', 'Project where your debt will be in six months if you continue at the current pace.'),
    (NEW.id, 4, 'Weeks 9–12', 'Set next debt milestone', 'Identify the next debt you will pay off after the current target.'),
    (NEW.id, 4, 'Weeks 9–12', 'Move into monthly accountability', 'Transition from weekly to monthly check-ins as you build consistency.');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_client_created ON public.clients;
CREATE TRIGGER on_client_created
  AFTER INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.seed_program_tasks_for_client();
