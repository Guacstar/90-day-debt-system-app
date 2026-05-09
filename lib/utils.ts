import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function now(): string {
  return new Date().toISOString();
}

export const DEBT_TYPE_LABELS: Record<string, string> = {
  credit_card: 'Credit Card',
  personal_loan: 'Personal Loan',
  auto_loan: 'Auto Loan',
  medical_debt: 'Medical Debt',
  student_loan: 'Student Loan',
  bnpl: 'Buy Now / Pay Later',
  other: 'Other',
};

export const DEBT_STATUS_LABELS: Record<string, string> = {
  current: 'Current',
  late: 'Late',
  in_collections: 'In Collections',
  paid_off: 'Paid Off',
  needs_attention: 'Needs Attention',
};

export const PROGRAM_STATUS_LABELS: Record<string, string> = {
  onboarding: 'Onboarding',
  active: 'Active',
  needs_attention: 'Needs Attention',
  completed: 'Completed',
  paused: 'Paused',
  referred_out: 'Referred Out',
};

export const SPENDING_LEAK_CATEGORY_LABELS: Record<string, string> = {
  subscription: 'Subscription',
  food_delivery: 'Food Delivery',
  dining_out: 'Dining Out',
  shopping: 'Shopping',
  convenience: 'Convenience Purchase',
  app_software: 'App / Software',
  membership: 'Membership',
  impulse_buy: 'Impulse Buy',
  bank_fee: 'Bank Fee',
  late_fee: 'Late Fee',
  other: 'Other',
};

export const SPENDING_LEAK_DECISION_LABELS: Record<string, string> = {
  keep: 'Keep',
  cancel: 'Cancel',
  reduce: 'Reduce',
  review_later: 'Review Later',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  upcoming: 'Upcoming',
  paid: 'Paid',
  missed: 'Missed',
  autopay_enabled: 'Autopay Enabled',
  needs_attention: 'Needs Attention',
};

export const COACH_NOTE_TYPE_LABELS: Record<string, string> = {
  general: 'General',
  spending_behavior: 'Spending Behavior',
  debt_progress: 'Debt Progress',
  missed_checkin: 'Missed Check-In',
  risk_flag: 'Risk Flag',
  referral_concern: 'Referral Concern',
  coaching_call_notes: 'Coaching Call Notes',
};

export const ALERT_SEVERITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const INCOME_FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-Weekly',
  semimonthly: 'Semi-Monthly',
  monthly: 'Monthly',
};

export const EMERGENCY_FUND_GOAL_LABELS: Record<string, string> = {
  '250': '$250',
  '500': '$500',
  '1000': '$1,000',
  one_month: 'One Month of Expenses',
  custom: 'Custom Amount',
};
