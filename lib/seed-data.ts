import { User, Client, Debt, CashFlowEntry, SpendingLeak, Payment, WeeklyCheckin, EmergencyFund, ProgramTask, CoachNote, CoachAlert } from './types';
import { generateId } from './utils';

const COACH_ID = 'coach-orlando-001';
const COACH_USER_ID = 'user-coach-001';
const CLIENT1_ID = 'client-maria-001';
const CLIENT1_USER_ID = 'user-maria-001';
const CLIENT2_ID = 'client-james-001';
const CLIENT2_USER_ID = 'user-james-001';

export const DEMO_USERS: User[] = [
  {
    id: COACH_USER_ID,
    role: 'coach',
    full_name: 'Orlando Coach',
    email: 'coach@example.com',
    phone: '555-100-0001',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: CLIENT1_USER_ID,
    role: 'client',
    full_name: 'Maria Lopez',
    email: 'maria@example.com',
    phone: '555-200-0001',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
  },
  {
    id: CLIENT2_USER_ID,
    role: 'client',
    full_name: 'James Carter',
    email: 'james@example.com',
    phone: '555-300-0001',
    created_at: '2026-02-05T00:00:00Z',
    updated_at: '2026-02-05T00:00:00Z',
  },
];

export const DEMO_CLIENTS: Client[] = [
  {
    id: CLIENT1_ID,
    user_id: CLIENT1_USER_ID,
    coach_id: COACH_ID,
    program_start_date: '2026-02-15',
    program_status: 'active',
    monthly_income: 4200,
    income_frequency: 'biweekly',
    estimated_total_debt: 18500,
    current_emergency_fund: 250,
    main_goal: 'Pay off credit card debt and build a small emergency fund',
    starting_stress_level: 7,
    starting_confidence_level: 5,
    current_stress_level: 6,
    current_confidence_level: 6,
    next_coaching_call_date: '2026-05-15',
    current_on_rent: true,
    current_on_food_utilities: true,
    considering_bankruptcy: false,
    facing_legal_action: false,
    wants_debt_settlement: false,
    payoff_method: 'snowball',
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  },
  {
    id: CLIENT2_ID,
    user_id: CLIENT2_USER_ID,
    coach_id: COACH_ID,
    program_start_date: '2026-02-20',
    program_status: 'needs_attention',
    monthly_income: 5500,
    income_frequency: 'biweekly',
    estimated_total_debt: 32000,
    current_emergency_fund: 100,
    main_goal: 'Reduce total debt load and stop using credit cards',
    starting_stress_level: 8,
    starting_confidence_level: 4,
    current_stress_level: 8,
    current_confidence_level: 4,
    next_coaching_call_date: '2026-05-12',
    current_on_rent: true,
    current_on_food_utilities: true,
    considering_bankruptcy: false,
    facing_legal_action: false,
    wants_debt_settlement: false,
    payoff_method: 'avalanche',
    created_at: '2026-02-20T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  },
];

export const DEMO_DEBTS: Debt[] = [
  // Maria's debts
  {
    id: 'debt-m-001',
    client_id: CLIENT1_ID,
    creditor_name: 'Chase Sapphire',
    debt_type: 'credit_card',
    starting_balance: 4200,
    current_balance: 3950,
    interest_rate: 22.99,
    minimum_payment: 95,
    due_date: 15,
    autopay_enabled: true,
    status: 'current',
    notes: 'Main focus for snowball - smallest balance',
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'debt-m-002',
    client_id: CLIENT1_ID,
    creditor_name: 'Capital One',
    debt_type: 'credit_card',
    starting_balance: 6800,
    current_balance: 6600,
    interest_rate: 19.99,
    minimum_payment: 150,
    due_date: 22,
    autopay_enabled: false,
    status: 'current',
    notes: '',
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'debt-m-003',
    client_id: CLIENT1_ID,
    creditor_name: 'Marcus by Goldman Sachs',
    debt_type: 'personal_loan',
    starting_balance: 7500,
    current_balance: 7350,
    interest_rate: 14.5,
    minimum_payment: 210,
    due_date: 8,
    autopay_enabled: true,
    status: 'current',
    notes: '',
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  },
  // James's debts
  {
    id: 'debt-j-001',
    client_id: CLIENT2_ID,
    creditor_name: 'Citi Double Cash',
    debt_type: 'credit_card',
    starting_balance: 9500,
    current_balance: 9450,
    interest_rate: 24.99,
    minimum_payment: 220,
    due_date: 10,
    autopay_enabled: false,
    status: 'current',
    notes: 'Highest interest - avalanche target',
    created_at: '2026-02-20T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'debt-j-002',
    client_id: CLIENT2_ID,
    creditor_name: 'Discover It',
    debt_type: 'credit_card',
    starting_balance: 5500,
    current_balance: 5400,
    interest_rate: 21.49,
    minimum_payment: 120,
    due_date: 18,
    autopay_enabled: true,
    status: 'current',
    notes: '',
    created_at: '2026-02-20T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'debt-j-003',
    client_id: CLIENT2_ID,
    creditor_name: 'Honda Financial',
    debt_type: 'auto_loan',
    starting_balance: 12000,
    current_balance: 11800,
    interest_rate: 7.9,
    minimum_payment: 350,
    due_date: 5,
    autopay_enabled: true,
    status: 'current',
    notes: '',
    created_at: '2026-02-20T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'debt-j-004',
    client_id: CLIENT2_ID,
    creditor_name: 'Navient',
    debt_type: 'student_loan',
    starting_balance: 5000,
    current_balance: 5050,
    interest_rate: 6.0,
    minimum_payment: 80,
    due_date: 25,
    autopay_enabled: false,
    status: 'late',
    notes: 'One payment behind',
    created_at: '2026-02-20T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  },
];

export const DEMO_CASH_FLOW: CashFlowEntry[] = [
  // Maria
  { id: 'cf-m-001', client_id: CLIENT1_ID, category: 'Monthly Income', amount: 4200, entry_type: 'income', notes: 'Salary after taxes', created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-15T00:00:00Z' },
  { id: 'cf-m-002', client_id: CLIENT1_ID, category: 'Housing', amount: 1100, entry_type: 'expense', expense_type: 'fixed', essential: true, notes: 'Rent', created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-15T00:00:00Z' },
  { id: 'cf-m-003', client_id: CLIENT1_ID, category: 'Utilities', amount: 120, entry_type: 'expense', expense_type: 'fixed', essential: true, notes: '', created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-15T00:00:00Z' },
  { id: 'cf-m-004', client_id: CLIENT1_ID, category: 'Food/Groceries', amount: 350, entry_type: 'expense', expense_type: 'variable', essential: true, notes: '', created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-15T00:00:00Z' },
  { id: 'cf-m-005', client_id: CLIENT1_ID, category: 'Transportation', amount: 180, entry_type: 'expense', expense_type: 'fixed', essential: true, notes: 'Car insurance + gas', created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-15T00:00:00Z' },
  { id: 'cf-m-006', client_id: CLIENT1_ID, category: 'Phone/Internet', amount: 85, entry_type: 'expense', expense_type: 'fixed', essential: true, notes: '', created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-15T00:00:00Z' },
  { id: 'cf-m-007', client_id: CLIENT1_ID, category: 'Minimum Debt Payments', amount: 455, entry_type: 'expense', expense_type: 'fixed', essential: true, notes: 'All three debts', created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-15T00:00:00Z' },
  { id: 'cf-m-008', client_id: CLIENT1_ID, category: 'Dining Out', amount: 150, entry_type: 'expense', expense_type: 'variable', essential: false, notes: '', created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-15T00:00:00Z' },
  { id: 'cf-m-009', client_id: CLIENT1_ID, category: 'Shopping', amount: 100, entry_type: 'expense', expense_type: 'variable', essential: false, notes: '', created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-15T00:00:00Z' },
  { id: 'cf-m-010', client_id: CLIENT1_ID, category: 'Entertainment', amount: 60, entry_type: 'expense', expense_type: 'variable', essential: false, notes: '', created_at: '2026-02-15T00:00:00Z', updated_at: '2026-02-15T00:00:00Z' },
  // James
  { id: 'cf-j-001', client_id: CLIENT2_ID, category: 'Monthly Income', amount: 5500, entry_type: 'income', notes: 'Salary after taxes', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
  { id: 'cf-j-002', client_id: CLIENT2_ID, category: 'Housing', amount: 1450, entry_type: 'expense', expense_type: 'fixed', essential: true, notes: 'Mortgage', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
  { id: 'cf-j-003', client_id: CLIENT2_ID, category: 'Utilities', amount: 200, entry_type: 'expense', expense_type: 'fixed', essential: true, notes: '', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
  { id: 'cf-j-004', client_id: CLIENT2_ID, category: 'Food/Groceries', amount: 500, entry_type: 'expense', expense_type: 'variable', essential: true, notes: '', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
  { id: 'cf-j-005', client_id: CLIENT2_ID, category: 'Transportation', amount: 250, entry_type: 'expense', expense_type: 'fixed', essential: true, notes: 'Car payment + insurance', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
  { id: 'cf-j-006', client_id: CLIENT2_ID, category: 'Minimum Debt Payments', amount: 770, entry_type: 'expense', expense_type: 'fixed', essential: true, notes: '', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
  { id: 'cf-j-007', client_id: CLIENT2_ID, category: 'Dining Out', amount: 300, entry_type: 'expense', expense_type: 'variable', essential: false, notes: '', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
  { id: 'cf-j-008', client_id: CLIENT2_ID, category: 'Shopping', amount: 200, entry_type: 'expense', expense_type: 'variable', essential: false, notes: '', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
];

export const DEMO_SPENDING_LEAKS: SpendingLeak[] = [
  { id: 'sl-m-001', client_id: CLIENT1_ID, name: 'Netflix', category: 'subscription', monthly_cost: 18, decision: 'keep', potential_monthly_savings: 18, notes: '', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
  { id: 'sl-m-002', client_id: CLIENT1_ID, name: 'Hulu', category: 'subscription', monthly_cost: 12, decision: 'cancel', potential_monthly_savings: 12, notes: 'Rarely used', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
  { id: 'sl-m-003', client_id: CLIENT1_ID, name: 'DoorDash orders', category: 'food_delivery', monthly_cost: 80, decision: 'reduce', potential_monthly_savings: 50, notes: 'Cut back to once a week', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
  { id: 'sl-m-004', client_id: CLIENT1_ID, name: 'Gym membership', category: 'membership', monthly_cost: 45, decision: 'review_later', potential_monthly_savings: 45, notes: 'Decide by end of month', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-02-20T00:00:00Z' },
  { id: 'sl-j-001', client_id: CLIENT2_ID, name: 'Amazon Prime', category: 'subscription', monthly_cost: 15, decision: 'keep', potential_monthly_savings: 15, notes: 'Used regularly', created_at: '2026-02-25T00:00:00Z', updated_at: '2026-02-25T00:00:00Z' },
  { id: 'sl-j-002', client_id: CLIENT2_ID, name: 'Spotify', category: 'subscription', monthly_cost: 10, decision: 'keep', potential_monthly_savings: 10, notes: '', created_at: '2026-02-25T00:00:00Z', updated_at: '2026-02-25T00:00:00Z' },
  { id: 'sl-j-003', client_id: CLIENT2_ID, name: 'Lunch takeout 3x/week', category: 'dining_out', monthly_cost: 180, decision: 'reduce', potential_monthly_savings: 100, notes: 'Bring lunch 2 days per week', created_at: '2026-02-25T00:00:00Z', updated_at: '2026-02-25T00:00:00Z' },
  { id: 'sl-j-004', client_id: CLIENT2_ID, name: 'Late fees (credit cards)', category: 'late_fee', monthly_cost: 35, decision: 'cancel', potential_monthly_savings: 35, notes: 'Set up autopay to avoid', created_at: '2026-02-25T00:00:00Z', updated_at: '2026-02-25T00:00:00Z' },
];

export const DEMO_PAYMENTS: Payment[] = [
  { id: 'pay-m-001', client_id: CLIENT1_ID, debt_id: 'debt-m-001', due_date: '2026-05-15', minimum_amount_due: 95, amount_paid: 95, extra_payment_amount: 50, payment_status: 'paid', autopay_status: true, notes: '', created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-15T00:00:00Z' },
  { id: 'pay-m-002', client_id: CLIENT1_ID, debt_id: 'debt-m-002', due_date: '2026-05-22', minimum_amount_due: 150, amount_paid: 0, extra_payment_amount: 0, payment_status: 'upcoming', autopay_status: false, notes: '', created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z' },
  { id: 'pay-m-003', client_id: CLIENT1_ID, debt_id: 'debt-m-003', due_date: '2026-05-08', minimum_amount_due: 210, amount_paid: 210, extra_payment_amount: 0, payment_status: 'paid', autopay_status: true, notes: '', created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-08T00:00:00Z' },
  { id: 'pay-j-001', client_id: CLIENT2_ID, debt_id: 'debt-j-001', due_date: '2026-05-10', minimum_amount_due: 220, amount_paid: 0, extra_payment_amount: 0, payment_status: 'missed', autopay_status: false, notes: 'Missed - needs follow-up', created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z' },
  { id: 'pay-j-002', client_id: CLIENT2_ID, debt_id: 'debt-j-002', due_date: '2026-05-18', minimum_amount_due: 120, amount_paid: 0, extra_payment_amount: 0, payment_status: 'upcoming', autopay_status: true, notes: '', created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z' },
  { id: 'pay-j-003', client_id: CLIENT2_ID, debt_id: 'debt-j-003', due_date: '2026-05-05', minimum_amount_due: 350, amount_paid: 350, extra_payment_amount: 0, payment_status: 'paid', autopay_status: true, notes: '', created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-05T00:00:00Z' },
];

export const DEMO_CHECKINS: WeeklyCheckin[] = [
  { id: 'ci-m-001', client_id: CLIENT1_ID, week_number: 1, avoided_new_debt: true, made_all_required_payments: true, stayed_within_weekly_spending_limit: true, extra_debt_payment: 50, total_debt_went_up: false, biggest_money_win: 'Canceled Hulu subscription', biggest_challenge: 'Wanted to eat out Friday night', spending_temptation: 'New shoes sale', help_needed: '', stress_level: 7, confidence_level: 5, coach_response: 'Great start Maria! Canceling that subscription is a real win. Keep it up!', submitted_at: '2026-02-22T00:00:00Z', reviewed_at: '2026-02-22T12:00:00Z', created_at: '2026-02-22T00:00:00Z', updated_at: '2026-02-22T12:00:00Z' },
  { id: 'ci-m-002', client_id: CLIENT1_ID, week_number: 2, avoided_new_debt: true, made_all_required_payments: true, stayed_within_weekly_spending_limit: false, extra_debt_payment: 0, total_debt_went_up: false, biggest_money_win: 'Cooked at home all week', biggest_challenge: 'Went a little over on groceries', spending_temptation: 'Concert tickets', help_needed: 'How do I resist impulse spending?', stress_level: 6, confidence_level: 6, coach_response: 'You\'re doing well! Going over on groceries happens - just adjust next week. For impulse spending, try the 24-hour rule before buying anything over $20.', submitted_at: '2026-03-01T00:00:00Z', reviewed_at: '2026-03-01T14:00:00Z', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T14:00:00Z' },
  { id: 'ci-j-001', client_id: CLIENT2_ID, week_number: 1, avoided_new_debt: false, made_all_required_payments: false, stayed_within_weekly_spending_limit: false, extra_debt_payment: 0, total_debt_went_up: true, biggest_money_win: 'Added all debts to the app', biggest_challenge: 'Seeing the total was overwhelming', spending_temptation: 'New gaming equipment', help_needed: 'Feel like I might never get out of debt', stress_level: 9, confidence_level: 3, coach_response: 'James, I hear you - seeing it all at once is hard. But you\'re here and you\'re facing it. That\'s already progress. Let\'s talk on our call this week.', submitted_at: '2026-02-27T00:00:00Z', reviewed_at: '2026-02-27T10:00:00Z', created_at: '2026-02-27T00:00:00Z', updated_at: '2026-02-27T10:00:00Z' },
];

export const DEMO_EMERGENCY_FUNDS: EmergencyFund[] = [
  { id: 'ef-m-001', client_id: CLIENT1_ID, goal_amount: 1000, current_balance: 250, weekly_contribution: 25, monthly_contribution: 100, goal_type: '1000', notes: 'Building slowly while paying debt', created_at: '2026-02-15T00:00:00Z', updated_at: '2026-05-01T00:00:00Z' },
  { id: 'ef-j-001', client_id: CLIENT2_ID, goal_amount: 500, current_balance: 100, weekly_contribution: 20, monthly_contribution: 80, goal_type: '500', notes: 'Starting small', created_at: '2026-02-20T00:00:00Z', updated_at: '2026-05-01T00:00:00Z' },
];

const PROGRAM_TASKS_TEMPLATE = [
  { phase: 1 as const, week_range: 'Weeks 1–2', task_name: 'Add all debts', task_description: 'Enter every debt including creditor, balance, interest rate, and minimum payment.' },
  { phase: 1 as const, week_range: 'Weeks 1–2', task_name: 'Add all expenses', task_description: 'Complete your cash-flow audit with all monthly income and expenses.' },
  { phase: 1 as const, week_range: 'Weeks 1–2', task_name: 'Build payment calendar', task_description: 'Set up your payment calendar with all upcoming due dates.' },
  { phase: 1 as const, week_range: 'Weeks 1–2', task_name: 'Stop new credit card usage', task_description: 'Commit to not adding new charges to any credit card.' },
  { phase: 1 as const, week_range: 'Weeks 1–2', task_name: 'Cancel wasteful subscriptions', task_description: 'Review subscriptions and cancel any you don\'t actively use.' },
  { phase: 2 as const, week_range: 'Weeks 3–4', task_name: 'Choose payoff method', task_description: 'Select either Snowball (smallest balance first) or Avalanche (highest interest first).' },
  { phase: 2 as const, week_range: 'Weeks 3–4', task_name: 'Pick target debt', task_description: 'Identify your current target debt based on your chosen method.' },
  { phase: 2 as const, week_range: 'Weeks 3–4', task_name: 'Set weekly spending limits', task_description: 'Use your cash-flow audit to set a realistic weekly spending limit.' },
  { phase: 2 as const, week_range: 'Weeks 3–4', task_name: 'Set extra-payment rules', task_description: 'Decide how much extra you will put toward your target debt each month.' },
  { phase: 2 as const, week_range: 'Weeks 3–4', task_name: 'Create emergency buffer goal', task_description: 'Set your emergency fund starter goal ($250, $500, or $1,000).' },
  { phase: 3 as const, week_range: 'Weeks 5–8', task_name: 'Submit weekly check-ins', task_description: 'Submit your check-in every week so your coach can monitor your progress.' },
  { phase: 3 as const, week_range: 'Weeks 5–8', task_name: 'Track payments', task_description: 'Log every debt payment in the payment calendar as you make them.' },
  { phase: 3 as const, week_range: 'Weeks 5–8', task_name: 'Review spending', task_description: 'Each week, review your spending against your weekly limit.' },
  { phase: 3 as const, week_range: 'Weeks 5–8', task_name: 'Adjust the plan', task_description: 'Talk to your coach about any adjustments needed based on your results.' },
  { phase: 3 as const, week_range: 'Weeks 5–8', task_name: 'Avoid new debt', task_description: 'Continue to avoid adding any new debt during this phase.' },
  { phase: 4 as const, week_range: 'Weeks 9–12', task_name: 'Review total progress', task_description: 'Review how much debt you\'ve paid down since starting the program.' },
  { phase: 4 as const, week_range: 'Weeks 9–12', task_name: 'Create six-month forecast', task_description: 'Project where your debt will be in six months if you continue at the current pace.' },
  { phase: 4 as const, week_range: 'Weeks 9–12', task_name: 'Set next debt milestone', task_description: 'Identify the next debt you will pay off after the current target.' },
  { phase: 4 as const, week_range: 'Weeks 9–12', task_name: 'Move into monthly accountability', task_description: 'Transition from weekly to monthly check-ins as you build consistency.' },
];

function generateTasks(clientId: string, completedIndices: number[]): ProgramTask[] {
  return PROGRAM_TASKS_TEMPLATE.map((t, i) => ({
    id: `task-${clientId.slice(-3)}-${i.toString().padStart(3, '0')}`,
    client_id: clientId,
    phase: t.phase,
    week_range: t.week_range,
    task_name: t.task_name,
    task_description: t.task_description,
    completed: completedIndices.includes(i),
    completed_at: completedIndices.includes(i) ? '2026-03-01T00:00:00Z' : undefined,
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  }));
}

export const DEMO_PROGRAM_TASKS: ProgramTask[] = [
  ...generateTasks(CLIENT1_ID, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
  ...generateTasks(CLIENT2_ID, [0, 1, 2, 3]),
];

export const DEMO_COACH_NOTES: CoachNote[] = [
  { id: 'cn-001', client_id: CLIENT1_ID, coach_id: COACH_ID, note_type: 'coaching_call_notes', note_content: 'Maria is motivated and on track. She\'s been consistent with payments and is seeing early wins. Encouraged her to stay the course and keep building the emergency fund.', follow_up_needed: false, created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-10T00:00:00Z' },
  { id: 'cn-002', client_id: CLIENT1_ID, coach_id: COACH_ID, note_type: 'debt_progress', note_content: 'Snowball method is working well for Maria. Chase balance is coming down. Target is to have it paid off within 3 months if she maintains the extra $50/month.', follow_up_needed: true, follow_up_due_date: '2026-06-01', created_at: '2026-04-05T00:00:00Z', updated_at: '2026-04-05T00:00:00Z' },
  { id: 'cn-003', client_id: CLIENT2_ID, coach_id: COACH_ID, note_type: 'risk_flag', note_content: 'James missed a payment on the Citi card. Stress level is still high at 8. Need to have a deeper conversation about what\'s blocking him. Watch for further missed payments.', follow_up_needed: true, follow_up_due_date: '2026-05-12', created_at: '2026-05-09T00:00:00Z', updated_at: '2026-05-09T00:00:00Z' },
  { id: 'cn-004', client_id: CLIENT2_ID, coach_id: COACH_ID, note_type: 'spending_behavior', note_content: 'James admitted to eating out for lunch almost every day despite the plan. This is a key leak we need to address. Suggested meal prep Sunday as a habit.', follow_up_needed: true, follow_up_due_date: '2026-05-19', created_at: '2026-04-20T00:00:00Z', updated_at: '2026-04-20T00:00:00Z' },
];

export const DEMO_COACH_ALERTS: CoachAlert[] = [
  { id: 'ca-001', client_id: CLIENT2_ID, alert_type: 'missed_payment', severity: 'high', alert_message: 'James Carter missed a payment on Citi Double Cash due 2026-05-10.', resolved: false, created_at: '2026-05-11T00:00:00Z', updated_at: '2026-05-11T00:00:00Z' },
  { id: 'ca-002', client_id: CLIENT2_ID, alert_type: 'high_stress', severity: 'high', alert_message: 'James Carter reported a stress level of 9 in week 1 check-in. Consider follow-up.', resolved: false, created_at: '2026-02-27T00:00:00Z', updated_at: '2026-02-27T00:00:00Z' },
  { id: 'ca-003', client_id: CLIENT2_ID, alert_type: 'low_confidence', severity: 'medium', alert_message: 'James Carter reported a confidence level of 3 in week 1 check-in.', resolved: false, created_at: '2026-02-27T00:00:00Z', updated_at: '2026-02-27T00:00:00Z' },
  { id: 'ca-004', client_id: CLIENT2_ID, alert_type: 'new_debt_added', severity: 'medium', alert_message: 'James Carter reported taking on new debt in week 1 check-in.', resolved: false, created_at: '2026-02-27T00:00:00Z', updated_at: '2026-02-27T00:00:00Z' },
];

export const DEMO_PASSWORDS: Record<string, string> = {
  'coach@example.com': 'coach123',
  'maria@example.com': 'maria123',
  'james@example.com': 'james123',
};
