export type UserRole = 'client' | 'coach';

export interface User {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  coach_id: string | null;
  program_start_date: string;
  program_end_date?: string;
  program_status: ProgramStatus;
  monthly_income: number;
  income_frequency: IncomeFrequency;
  estimated_total_debt: number;
  current_emergency_fund: number;
  main_goal: string;
  starting_stress_level: number;
  starting_confidence_level: number;
  current_stress_level: number;
  current_confidence_level: number;
  next_coaching_call_date?: string;
  // onboarding risk flags
  current_on_rent: boolean;
  current_on_food_utilities: boolean;
  considering_bankruptcy: boolean;
  facing_legal_action: boolean;
  wants_debt_settlement: boolean;
  payoff_method: 'snowball' | 'avalanche';
  created_at: string;
  updated_at: string;
}

export type ProgramStatus = 'onboarding' | 'active' | 'needs_attention' | 'completed' | 'paused' | 'referred_out';
export type IncomeFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

export interface Debt {
  id: string;
  client_id: string;
  creditor_name: string;
  debt_type: DebtType;
  starting_balance: number;
  current_balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date: number; // day of month 1-31
  autopay_enabled: boolean;
  status: DebtStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type DebtType = 'credit_card' | 'personal_loan' | 'auto_loan' | 'medical_debt' | 'student_loan' | 'bnpl' | 'other';
export type DebtStatus = 'current' | 'late' | 'in_collections' | 'paid_off' | 'needs_attention';

export interface CashFlowEntry {
  id: string;
  client_id: string;
  category: string;
  amount: number;
  entry_type: 'income' | 'expense';
  expense_type?: 'fixed' | 'variable';
  essential?: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface SpendingLeak {
  id: string;
  client_id: string;
  name: string;
  category: SpendingLeakCategory;
  monthly_cost: number;
  decision: SpendingLeakDecision;
  potential_monthly_savings: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type SpendingLeakCategory = 'subscription' | 'food_delivery' | 'dining_out' | 'shopping' | 'convenience' | 'app_software' | 'membership' | 'impulse_buy' | 'bank_fee' | 'late_fee' | 'other';
export type SpendingLeakDecision = 'keep' | 'cancel' | 'reduce' | 'review_later';

export interface Payment {
  id: string;
  client_id: string;
  debt_id: string;
  due_date: string;
  minimum_amount_due: number;
  amount_paid: number;
  extra_payment_amount: number;
  payment_status: PaymentStatus;
  autopay_status: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'upcoming' | 'paid' | 'missed' | 'autopay_enabled' | 'needs_attention';

export interface WeeklyCheckin {
  id: string;
  client_id: string;
  week_number: number;
  avoided_new_debt: boolean;
  made_all_required_payments: boolean;
  stayed_within_weekly_spending_limit: boolean;
  extra_debt_payment: number;
  total_debt_went_up: boolean;
  biggest_money_win: string;
  biggest_challenge: string;
  spending_temptation: string;
  help_needed: string;
  stress_level: number;
  confidence_level: number;
  coach_response: string;
  submitted_at: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyFund {
  id: string;
  client_id: string;
  goal_amount: number;
  current_balance: number;
  weekly_contribution: number;
  monthly_contribution: number;
  goal_type: EmergencyFundGoalType;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type EmergencyFundGoalType = '250' | '500' | '1000' | 'one_month' | 'custom';

export interface ProgramTask {
  id: string;
  client_id: string;
  phase: 1 | 2 | 3 | 4;
  week_range: string;
  task_name: string;
  task_description: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CoachNote {
  id: string;
  client_id: string;
  coach_id: string;
  note_type: CoachNoteType;
  note_content: string;
  follow_up_needed: boolean;
  follow_up_due_date?: string;
  created_at: string;
  updated_at: string;
}

export type CoachNoteType = 'general' | 'spending_behavior' | 'debt_progress' | 'missed_checkin' | 'risk_flag' | 'referral_concern' | 'coaching_call_notes';

export interface CoachAlert {
  id: string;
  client_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  alert_message: string;
  resolved: boolean;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export type AlertType = 'missed_checkin' | 'new_debt_added' | 'missed_payment' | 'high_stress' | 'low_confidence' | 'over_spending_limit' | 'no_debt_reduction' | 'considering_bankruptcy' | 'legal_action' | 'debt_settlement_request';
export type AlertSeverity = 'low' | 'medium' | 'high';

export interface ClientRiskFlag {
  id: string;
  client_id: string;
  flag_type: RiskFlagType;
  flag_value: string;
  severity: AlertSeverity;
  message: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

export type RiskFlagType = 'no_income' | 'behind_on_essentials' | 'considering_bankruptcy' | 'legal_action' | 'debt_settlement_request' | 'creditor_negotiation_request' | 'high_stress' | 'low_confidence' | 'missed_payment' | 'missed_checkin' | 'new_debt_added';

// Derived/computed types
export interface ClientDashboardData {
  client: Client;
  user: User;
  debts: Debt[];
  payments: Payment[];
  checkins: WeeklyCheckin[];
  emergencyFund?: EmergencyFund;
  programTasks: ProgramTask[];
  cashFlowEntries: CashFlowEntry[];
  spendingLeaks: SpendingLeak[];
}

export interface AppStore {
  currentUser: User | null;
  currentClient: Client | null;
  users: User[];
  clients: Client[];
  debts: Debt[];
  cashFlowEntries: CashFlowEntry[];
  spendingLeaks: SpendingLeak[];
  payments: Payment[];
  checkins: WeeklyCheckin[];
  emergencyFunds: EmergencyFund[];
  programTasks: ProgramTask[];
  coachNotes: CoachNote[];
  coachAlerts: CoachAlert[];
  clientRiskFlags: ClientRiskFlag[];
}
