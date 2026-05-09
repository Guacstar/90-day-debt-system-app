import { Debt, CashFlowEntry, SpendingLeak, WeeklyCheckin, EmergencyFund } from './types';
import { differenceInDays, differenceInWeeks } from 'date-fns';

export function totalStartingDebt(debts: Debt[]): number {
  return debts.reduce((sum, d) => sum + d.starting_balance, 0);
}

export function totalCurrentDebt(debts: Debt[]): number {
  return debts.reduce((sum, d) => sum + d.current_balance, 0);
}

export function debtReduced(debts: Debt[]): number {
  return totalStartingDebt(debts) - totalCurrentDebt(debts);
}

export function percentageDebtPaid(debts: Debt[]): number {
  const starting = totalStartingDebt(debts);
  if (starting === 0) return 0;
  return (debtReduced(debts) / starting) * 100;
}

export function totalMinimumPayments(debts: Debt[]): number {
  return debts.filter(d => d.status !== 'paid_off').reduce((sum, d) => sum + d.minimum_payment, 0);
}

export function highestInterestDebt(debts: Debt[]): Debt | null {
  const active = debts.filter(d => d.status !== 'paid_off');
  if (active.length === 0) return null;
  return active.reduce((max, d) => d.interest_rate > max.interest_rate ? d : max, active[0]);
}

export function smallestBalanceDebt(debts: Debt[]): Debt | null {
  const active = debts.filter(d => d.status !== 'paid_off');
  if (active.length === 0) return null;
  return active.reduce((min, d) => d.current_balance < min.current_balance ? d : min, active[0]);
}

export function snowballOrder(debts: Debt[]): Debt[] {
  return [...debts.filter(d => d.status !== 'paid_off')].sort((a, b) => a.current_balance - b.current_balance);
}

export function avalancheOrder(debts: Debt[]): Debt[] {
  return [...debts.filter(d => d.status !== 'paid_off')].sort((a, b) => b.interest_rate - a.interest_rate);
}

export function currentTargetDebt(debts: Debt[], method: 'snowball' | 'avalanche'): Debt | null {
  const ordered = method === 'snowball' ? snowballOrder(debts) : avalancheOrder(debts);
  return ordered[0] || null;
}

export function totalMonthlyIncome(entries: CashFlowEntry[]): number {
  return entries.filter(e => e.entry_type === 'income').reduce((sum, e) => sum + e.amount, 0);
}

export function totalMonthlyExpenses(entries: CashFlowEntry[]): number {
  return entries.filter(e => e.entry_type === 'expense').reduce((sum, e) => sum + e.amount, 0);
}

export function monthlyFlowSurplus(entries: CashFlowEntry[]): number {
  return totalMonthlyIncome(entries) - totalMonthlyExpenses(entries);
}

export function suggestedWeeklySpendingLimit(entries: CashFlowEntry[]): number {
  const variableExpenses = entries
    .filter(e => e.entry_type === 'expense' && e.expense_type === 'variable')
    .reduce((sum, e) => sum + e.amount, 0);
  return variableExpenses / 4.33;
}

export function totalSpendingLeaks(leaks: SpendingLeak[]): number {
  return leaks.reduce((sum, l) => sum + l.monthly_cost, 0);
}

export function totalPotentialSavings(leaks: SpendingLeak[]): number {
  return leaks.reduce((sum, l) => sum + l.potential_monthly_savings, 0);
}

export function confirmedMonthlySavings(leaks: SpendingLeak[]): number {
  return leaks
    .filter(l => l.decision === 'cancel' || l.decision === 'reduce')
    .reduce((sum, l) => sum + l.potential_monthly_savings, 0);
}

export function emergencyFundProgress(fund: EmergencyFund): number {
  if (fund.goal_amount === 0) return 0;
  return Math.min((fund.current_balance / fund.goal_amount) * 100, 100);
}

export function currentProgramWeek(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const weeks = Math.ceil(differenceInDays(now, start) / 7);
  return Math.min(Math.max(weeks, 1), 12);
}

export function programProgress90Day(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const days = differenceInDays(now, start);
  return Math.min((days / 90) * 100, 100);
}

export function checkinCompletionRate(checkins: WeeklyCheckin[], startDate: string): number {
  const week = currentProgramWeek(startDate);
  if (week === 0) return 0;
  return (checkins.length / week) * 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
