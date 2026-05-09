'use client';
/**
 * Data Access Layer — wraps Supabase queries.
 *
 * If Supabase is not configured (env vars missing), all functions become no-ops
 * so the app still works in demo mode using local-only Zustand state.
 */
import { createClient, isSupabaseConfigured } from './client';
import type {
  User, Client, Debt, CashFlowEntry, SpendingLeak, Payment,
  WeeklyCheckin, EmergencyFund, ProgramTask, CoachNote, CoachAlert
} from '../types';

export const SUPABASE_ENABLED = isSupabaseConfigured();

function db() { return createClient(); }

// ---------- USERS ----------
export async function fetchCurrentUserProfile(): Promise<User | null> {
  if (!SUPABASE_ENABLED) return null;
  const supabase = db();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase.from('users').select('*').eq('id', auth.user.id).single();
  return (data as User) || null;
}

export async function fetchAllUsers(): Promise<User[]> {
  if (!SUPABASE_ENABLED) return [];
  const { data } = await db().from('users').select('*');
  return (data as User[]) || [];
}

// ---------- CLIENTS ----------
export async function fetchClients(): Promise<Client[]> {
  if (!SUPABASE_ENABLED) return [];
  const { data } = await db().from('clients').select('*');
  return (data as Client[]) || [];
}

export async function createClientRecord(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client | null> {
  if (!SUPABASE_ENABLED) return null;
  const { data } = await db().from('clients').insert(client).select().single();
  return (data as Client) || null;
}

export async function updateClientRecord(id: string, patch: Partial<Client>) {
  if (!SUPABASE_ENABLED) return;
  await db().from('clients').update(patch).eq('id', id);
}

// ---------- DEBTS ----------
export async function fetchDebts(): Promise<Debt[]> {
  if (!SUPABASE_ENABLED) return [];
  const { data } = await db().from('debts').select('*');
  return (data as Debt[]) || [];
}

export async function insertDebt(d: Omit<Debt, 'id' | 'created_at' | 'updated_at'>) {
  if (!SUPABASE_ENABLED) return null;
  const { data } = await db().from('debts').insert(d).select().single();
  return data as Debt | null;
}
export async function updateDebtRecord(id: string, patch: Partial<Debt>) {
  if (!SUPABASE_ENABLED) return;
  await db().from('debts').update(patch).eq('id', id);
}
export async function deleteDebtRecord(id: string) {
  if (!SUPABASE_ENABLED) return;
  await db().from('debts').delete().eq('id', id);
}

// ---------- CASH FLOW ----------
export async function fetchCashFlow(): Promise<CashFlowEntry[]> {
  if (!SUPABASE_ENABLED) return [];
  const { data } = await db().from('cash_flow_entries').select('*');
  return (data as CashFlowEntry[]) || [];
}
export async function insertCashFlow(e: Omit<CashFlowEntry, 'id' | 'created_at' | 'updated_at'>) {
  if (!SUPABASE_ENABLED) return null;
  const { data } = await db().from('cash_flow_entries').insert(e).select().single();
  return data as CashFlowEntry | null;
}
export async function updateCashFlowRecord(id: string, patch: Partial<CashFlowEntry>) {
  if (!SUPABASE_ENABLED) return;
  await db().from('cash_flow_entries').update(patch).eq('id', id);
}
export async function deleteCashFlowRecord(id: string) {
  if (!SUPABASE_ENABLED) return;
  await db().from('cash_flow_entries').delete().eq('id', id);
}

// ---------- SPENDING LEAKS ----------
export async function fetchSpendingLeaks(): Promise<SpendingLeak[]> {
  if (!SUPABASE_ENABLED) return [];
  const { data } = await db().from('spending_leaks').select('*');
  return (data as SpendingLeak[]) || [];
}
export async function insertSpendingLeak(l: Omit<SpendingLeak, 'id' | 'created_at' | 'updated_at'>) {
  if (!SUPABASE_ENABLED) return null;
  const { data } = await db().from('spending_leaks').insert(l).select().single();
  return data as SpendingLeak | null;
}
export async function updateSpendingLeakRecord(id: string, patch: Partial<SpendingLeak>) {
  if (!SUPABASE_ENABLED) return;
  await db().from('spending_leaks').update(patch).eq('id', id);
}
export async function deleteSpendingLeakRecord(id: string) {
  if (!SUPABASE_ENABLED) return;
  await db().from('spending_leaks').delete().eq('id', id);
}

// ---------- PAYMENTS ----------
export async function fetchPayments(): Promise<Payment[]> {
  if (!SUPABASE_ENABLED) return [];
  const { data } = await db().from('payments').select('*');
  return (data as Payment[]) || [];
}
export async function insertPayment(p: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) {
  if (!SUPABASE_ENABLED) return null;
  const { data } = await db().from('payments').insert(p).select().single();
  return data as Payment | null;
}
export async function updatePaymentRecord(id: string, patch: Partial<Payment>) {
  if (!SUPABASE_ENABLED) return;
  await db().from('payments').update(patch).eq('id', id);
}
export async function deletePaymentRecord(id: string) {
  if (!SUPABASE_ENABLED) return;
  await db().from('payments').delete().eq('id', id);
}

// ---------- CHECK-INS ----------
export async function fetchCheckins(): Promise<WeeklyCheckin[]> {
  if (!SUPABASE_ENABLED) return [];
  const { data } = await db().from('weekly_checkins').select('*');
  return (data as WeeklyCheckin[]) || [];
}
export async function insertCheckin(c: Omit<WeeklyCheckin, 'id' | 'created_at' | 'updated_at'>) {
  if (!SUPABASE_ENABLED) return null;
  const { data } = await db().from('weekly_checkins').insert(c).select().single();
  return data as WeeklyCheckin | null;
}
export async function updateCheckinRecord(id: string, patch: Partial<WeeklyCheckin>) {
  if (!SUPABASE_ENABLED) return;
  await db().from('weekly_checkins').update(patch).eq('id', id);
}

// ---------- EMERGENCY FUND ----------
export async function fetchEmergencyFunds(): Promise<EmergencyFund[]> {
  if (!SUPABASE_ENABLED) return [];
  const { data } = await db().from('emergency_funds').select('*');
  return (data as EmergencyFund[]) || [];
}
export async function upsertEmergencyFund(ef: Omit<EmergencyFund, 'id' | 'created_at' | 'updated_at'>) {
  if (!SUPABASE_ENABLED) return null;
  const { data } = await db().from('emergency_funds')
    .upsert(ef, { onConflict: 'client_id' })
    .select().single();
  return data as EmergencyFund | null;
}

// ---------- PROGRAM TASKS ----------
export async function fetchProgramTasks(): Promise<ProgramTask[]> {
  if (!SUPABASE_ENABLED) return [];
  const { data } = await db().from('program_tasks').select('*');
  return (data as ProgramTask[]) || [];
}
export async function updateProgramTask(id: string, patch: Partial<ProgramTask>) {
  if (!SUPABASE_ENABLED) return;
  await db().from('program_tasks').update(patch).eq('id', id);
}

// ---------- COACH NOTES ----------
export async function fetchCoachNotes(): Promise<CoachNote[]> {
  if (!SUPABASE_ENABLED) return [];
  const { data } = await db().from('coach_notes').select('*');
  return (data as CoachNote[]) || [];
}
export async function insertCoachNote(n: Omit<CoachNote, 'id' | 'created_at' | 'updated_at'>) {
  if (!SUPABASE_ENABLED) return null;
  const { data } = await db().from('coach_notes').insert(n).select().single();
  return data as CoachNote | null;
}
export async function updateCoachNoteRecord(id: string, patch: Partial<CoachNote>) {
  if (!SUPABASE_ENABLED) return;
  await db().from('coach_notes').update(patch).eq('id', id);
}

// ---------- COACH ALERTS ----------
export async function fetchCoachAlerts(): Promise<CoachAlert[]> {
  if (!SUPABASE_ENABLED) return [];
  const { data } = await db().from('coach_alerts').select('*');
  return (data as CoachAlert[]) || [];
}
export async function insertCoachAlert(a: Omit<CoachAlert, 'id' | 'created_at' | 'updated_at'>) {
  if (!SUPABASE_ENABLED) return null;
  const { data } = await db().from('coach_alerts').insert(a).select().single();
  return data as CoachAlert | null;
}
export async function resolveAlertRecord(id: string) {
  if (!SUPABASE_ENABLED) return;
  await db().from('coach_alerts').update({ resolved: true, resolved_at: new Date().toISOString() }).eq('id', id);
}
