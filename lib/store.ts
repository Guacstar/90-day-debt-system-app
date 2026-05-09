'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User, Client, Debt, CashFlowEntry, SpendingLeak, Payment,
  WeeklyCheckin, EmergencyFund, ProgramTask, CoachNote, CoachAlert
} from './types';
import {
  DEMO_USERS, DEMO_CLIENTS, DEMO_DEBTS, DEMO_CASH_FLOW, DEMO_SPENDING_LEAKS,
  DEMO_PAYMENTS, DEMO_CHECKINS, DEMO_EMERGENCY_FUNDS, DEMO_PROGRAM_TASKS,
  DEMO_COACH_NOTES, DEMO_COACH_ALERTS, DEMO_PASSWORDS
} from './seed-data';
import { generateId, now } from './utils';
import * as dal from './supabase/dal';

// SUPABASE_ENABLED = whether real backend env vars are configured.
// When false, the store falls back to local-only demo mode.
const SUPABASE_ENABLED = dal.SUPABASE_ENABLED;

interface Store {
  hydrated: boolean;
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

  // Hydration / auth
  setCurrentUser: (user: User | null) => void;
  hydrateFromSupabase: () => Promise<void>;
  resetToDemoData: () => void;

  // Demo-mode auth (only used when Supabase is not configured)
  loginDemo: (email: string, password: string) => { success: boolean; error?: string };
  registerDemo: (data: { full_name: string; email: string; phone: string; password: string; role: 'client' | 'coach' }) => { success: boolean; error?: string };
  logout: () => void;

  // Client
  updateClient: (id: string, data: Partial<Client>) => void;
  createClient: (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<Client>;

  // Debts
  addDebt: (debt: Omit<Debt, 'id' | 'created_at' | 'updated_at'>) => void;
  updateDebt: (id: string, data: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;

  // Cash flow
  addCashFlowEntry: (entry: Omit<CashFlowEntry, 'id' | 'created_at' | 'updated_at'>) => void;
  updateCashFlowEntry: (id: string, data: Partial<CashFlowEntry>) => void;
  deleteCashFlowEntry: (id: string) => void;

  // Spending leaks
  addSpendingLeak: (leak: Omit<SpendingLeak, 'id' | 'created_at' | 'updated_at'>) => void;
  updateSpendingLeak: (id: string, data: Partial<SpendingLeak>) => void;
  deleteSpendingLeak: (id: string) => void;

  // Payments
  addPayment: (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => void;
  updatePayment: (id: string, data: Partial<Payment>) => void;
  deletePayment: (id: string) => void;

  // Check-ins
  submitCheckin: (checkin: Omit<WeeklyCheckin, 'id' | 'created_at' | 'updated_at'>) => void;
  updateCheckin: (id: string, data: Partial<WeeklyCheckin>) => void;

  // Emergency fund
  saveEmergencyFund: (clientId: string, data: Omit<EmergencyFund, 'id' | 'created_at' | 'updated_at'>) => void;

  // Program tasks
  toggleTask: (id: string) => void;

  // Coach notes
  addCoachNote: (note: Omit<CoachNote, 'id' | 'created_at' | 'updated_at'>) => void;
  updateCoachNote: (id: string, data: Partial<CoachNote>) => void;

  // Coach alerts
  resolveAlert: (id: string) => void;
  addAlert: (alert: Omit<CoachAlert, 'id' | 'created_at' | 'updated_at'>) => void;
}

// Initial state — demo data when not using Supabase, empty when using Supabase
const initialDemoState = () => ({
  users: DEMO_USERS,
  clients: DEMO_CLIENTS,
  debts: DEMO_DEBTS,
  cashFlowEntries: DEMO_CASH_FLOW,
  spendingLeaks: DEMO_SPENDING_LEAKS,
  payments: DEMO_PAYMENTS,
  checkins: DEMO_CHECKINS,
  emergencyFunds: DEMO_EMERGENCY_FUNDS,
  programTasks: DEMO_PROGRAM_TASKS,
  coachNotes: DEMO_COACH_NOTES,
  coachAlerts: DEMO_COACH_ALERTS,
});

const initialEmptyState = () => ({
  users: [], clients: [], debts: [], cashFlowEntries: [], spendingLeaks: [],
  payments: [], checkins: [], emergencyFunds: [], programTasks: [],
  coachNotes: [], coachAlerts: [],
});

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      hydrated: false,
      currentUser: null,
      currentClient: null,
      ...(SUPABASE_ENABLED ? initialEmptyState() : initialDemoState()),

      setCurrentUser: (user) => {
        const client = user ? get().clients.find(c => c.user_id === user.id) || null : null;
        set({ currentUser: user, currentClient: client });
      },

      resetToDemoData: () => {
        set({ ...initialDemoState(), currentUser: null, currentClient: null, hydrated: true });
      },

      hydrateFromSupabase: async () => {
        if (!SUPABASE_ENABLED) {
          set({ hydrated: true });
          return;
        }
        try {
          const [
            currentUser, users, clients, debts, cashFlow, leaks,
            payments, checkins, emergencyFunds, tasks, notes, alerts
          ] = await Promise.all([
            dal.fetchCurrentUserProfile(),
            dal.fetchAllUsers(),
            dal.fetchClients(),
            dal.fetchDebts(),
            dal.fetchCashFlow(),
            dal.fetchSpendingLeaks(),
            dal.fetchPayments(),
            dal.fetchCheckins(),
            dal.fetchEmergencyFunds(),
            dal.fetchProgramTasks(),
            dal.fetchCoachNotes(),
            dal.fetchCoachAlerts(),
          ]);
          const currentClient = currentUser ? clients.find(c => c.user_id === currentUser.id) || null : null;
          set({
            currentUser, currentClient, users, clients, debts,
            cashFlowEntries: cashFlow, spendingLeaks: leaks, payments,
            checkins, emergencyFunds, programTasks: tasks,
            coachNotes: notes, coachAlerts: alerts, hydrated: true,
          });
        } catch (err) {
          console.error('Supabase hydration failed:', err);
          set({ hydrated: true });
        }
      },

      // Demo auth — only used in demo mode
      loginDemo: (email, password) => {
        const expected = DEMO_PASSWORDS[email];
        if (!expected || expected !== password) {
          return { success: false, error: 'Invalid email or password.' };
        }
        const user = get().users.find(u => u.email === email);
        if (!user) return { success: false, error: 'User not found.' };
        const client = user.role === 'client' ? get().clients.find(c => c.user_id === user.id) || null : null;
        set({ currentUser: user, currentClient: client });
        return { success: true };
      },

      registerDemo: (data) => {
        const existing = get().users.find(u => u.email === data.email);
        if (existing) return { success: false, error: 'Email already registered.' };
        const user: User = {
          id: generateId(), role: data.role, full_name: data.full_name,
          email: data.email, phone: data.phone, created_at: now(), updated_at: now(),
        };
        DEMO_PASSWORDS[data.email] = data.password;
        set(s => ({ users: [...s.users, user], currentUser: user }));
        return { success: true };
      },

      logout: () => set({ currentUser: null, currentClient: null }),

      updateClient: (id, data) => {
        set(s => ({
          clients: s.clients.map(c => c.id === id ? { ...c, ...data, updated_at: now() } : c),
          currentClient: s.currentClient?.id === id ? { ...s.currentClient, ...data, updated_at: now() } : s.currentClient,
        }));
        if (SUPABASE_ENABLED) dal.updateClientRecord(id, data).catch(console.error);
      },

      createClient: async (data) => {
        if (SUPABASE_ENABLED) {
          const created = await dal.createClientRecord(data);
          if (created) {
            set(s => ({ clients: [...s.clients, created], currentClient: created }));
            // Re-fetch tasks since they're auto-seeded by SQL trigger
            const tasks = await dal.fetchProgramTasks();
            set({ programTasks: tasks });
            return created;
          }
        }
        const client: Client = { ...data, id: generateId(), created_at: now(), updated_at: now() };
        set(s => ({ clients: [...s.clients, client], currentClient: client }));
        return client;
      },

      addDebt: (debt) => {
        const tempDebt: Debt = { ...debt, id: generateId(), created_at: now(), updated_at: now() };
        set(s => ({ debts: [...s.debts, tempDebt] }));
        if (SUPABASE_ENABLED) {
          dal.insertDebt(debt).then(real => {
            if (real) set(s => ({ debts: s.debts.map(d => d.id === tempDebt.id ? real : d) }));
          }).catch(console.error);
        }
        // Auto-create alert
        const client = get().clients.find(c => c.id === debt.client_id);
        if (client && client.program_status !== 'onboarding') {
          get().addAlert({
            client_id: debt.client_id,
            alert_type: 'new_debt_added',
            severity: 'medium',
            alert_message: `${get().users.find(u => u.id === client.user_id)?.full_name} added a new debt: ${debt.creditor_name} ($${debt.current_balance}).`,
            resolved: false,
          });
        }
      },

      updateDebt: (id, data) => {
        set(s => ({ debts: s.debts.map(d => d.id === id ? { ...d, ...data, updated_at: now() } : d) }));
        if (SUPABASE_ENABLED) dal.updateDebtRecord(id, data).catch(console.error);
      },

      deleteDebt: (id) => {
        set(s => ({ debts: s.debts.filter(d => d.id !== id) }));
        if (SUPABASE_ENABLED) dal.deleteDebtRecord(id).catch(console.error);
      },

      addCashFlowEntry: (entry) => {
        const temp: CashFlowEntry = { ...entry, id: generateId(), created_at: now(), updated_at: now() };
        set(s => ({ cashFlowEntries: [...s.cashFlowEntries, temp] }));
        if (SUPABASE_ENABLED) {
          dal.insertCashFlow(entry).then(real => {
            if (real) set(s => ({ cashFlowEntries: s.cashFlowEntries.map(e => e.id === temp.id ? real : e) }));
          }).catch(console.error);
        }
      },

      updateCashFlowEntry: (id, data) => {
        set(s => ({ cashFlowEntries: s.cashFlowEntries.map(e => e.id === id ? { ...e, ...data, updated_at: now() } : e) }));
        if (SUPABASE_ENABLED) dal.updateCashFlowRecord(id, data).catch(console.error);
      },

      deleteCashFlowEntry: (id) => {
        set(s => ({ cashFlowEntries: s.cashFlowEntries.filter(e => e.id !== id) }));
        if (SUPABASE_ENABLED) dal.deleteCashFlowRecord(id).catch(console.error);
      },

      addSpendingLeak: (leak) => {
        const temp: SpendingLeak = { ...leak, id: generateId(), created_at: now(), updated_at: now() };
        set(s => ({ spendingLeaks: [...s.spendingLeaks, temp] }));
        if (SUPABASE_ENABLED) {
          dal.insertSpendingLeak(leak).then(real => {
            if (real) set(s => ({ spendingLeaks: s.spendingLeaks.map(l => l.id === temp.id ? real : l) }));
          }).catch(console.error);
        }
      },

      updateSpendingLeak: (id, data) => {
        set(s => ({ spendingLeaks: s.spendingLeaks.map(l => l.id === id ? { ...l, ...data, updated_at: now() } : l) }));
        if (SUPABASE_ENABLED) dal.updateSpendingLeakRecord(id, data).catch(console.error);
      },

      deleteSpendingLeak: (id) => {
        set(s => ({ spendingLeaks: s.spendingLeaks.filter(l => l.id !== id) }));
        if (SUPABASE_ENABLED) dal.deleteSpendingLeakRecord(id).catch(console.error);
      },

      addPayment: (payment) => {
        const temp: Payment = { ...payment, id: generateId(), created_at: now(), updated_at: now() };
        set(s => ({ payments: [...s.payments, temp] }));
        if (SUPABASE_ENABLED) {
          dal.insertPayment(payment).then(real => {
            if (real) set(s => ({ payments: s.payments.map(p => p.id === temp.id ? real : p) }));
          }).catch(console.error);
        }
      },

      updatePayment: (id, data) => {
        set(s => ({ payments: s.payments.map(p => p.id === id ? { ...p, ...data, updated_at: now() } : p) }));
        if (SUPABASE_ENABLED) dal.updatePaymentRecord(id, data).catch(console.error);
      },

      deletePayment: (id) => {
        set(s => ({ payments: s.payments.filter(p => p.id !== id) }));
        if (SUPABASE_ENABLED) dal.deletePaymentRecord(id).catch(console.error);
      },

      submitCheckin: (checkin) => {
        const temp: WeeklyCheckin = { ...checkin, id: generateId(), created_at: now(), updated_at: now() };
        set(s => ({ checkins: [...s.checkins, temp] }));
        if (SUPABASE_ENABLED) {
          dal.insertCheckin(checkin).then(real => {
            if (real) set(s => ({ checkins: s.checkins.map(c => c.id === temp.id ? real : c) }));
          }).catch(console.error);
        }
        const client = get().clients.find(c => c.id === checkin.client_id);
        const userName = get().users.find(u => u.id === client?.user_id)?.full_name || 'Client';
        if (checkin.stress_level >= 8) {
          get().addAlert({ client_id: checkin.client_id, alert_type: 'high_stress', severity: 'high', alert_message: `${userName} reported a stress level of ${checkin.stress_level} in week ${checkin.week_number} check-in.`, resolved: false });
        }
        if (checkin.confidence_level <= 3) {
          get().addAlert({ client_id: checkin.client_id, alert_type: 'low_confidence', severity: 'medium', alert_message: `${userName} reported a confidence level of ${checkin.confidence_level} in week ${checkin.week_number} check-in.`, resolved: false });
        }
        if (checkin.total_debt_went_up) {
          get().addAlert({ client_id: checkin.client_id, alert_type: 'new_debt_added', severity: 'medium', alert_message: `${userName} reported their total debt went up in week ${checkin.week_number}.`, resolved: false });
        }
        if (!checkin.stayed_within_weekly_spending_limit) {
          get().addAlert({ client_id: checkin.client_id, alert_type: 'over_spending_limit', severity: 'low', alert_message: `${userName} went over their weekly spending limit in week ${checkin.week_number}.`, resolved: false });
        }
        if (client) {
          get().updateClient(client.id, { current_stress_level: checkin.stress_level, current_confidence_level: checkin.confidence_level });
        }
      },

      updateCheckin: (id, data) => {
        set(s => ({ checkins: s.checkins.map(c => c.id === id ? { ...c, ...data, updated_at: now() } : c) }));
        if (SUPABASE_ENABLED) dal.updateCheckinRecord(id, data).catch(console.error);
      },

      saveEmergencyFund: (clientId, data) => {
        const existing = get().emergencyFunds.find(e => e.client_id === clientId);
        if (existing) {
          set(s => ({ emergencyFunds: s.emergencyFunds.map(e => e.client_id === clientId ? { ...e, ...data, updated_at: now() } : e) }));
        } else {
          set(s => ({ emergencyFunds: [...s.emergencyFunds, { ...data, id: generateId(), created_at: now(), updated_at: now() }] }));
        }
        if (SUPABASE_ENABLED) dal.upsertEmergencyFund(data).catch(console.error);
      },

      toggleTask: (id) => {
        const task = get().programTasks.find(t => t.id === id);
        const completed = !task?.completed;
        const completed_at = completed ? now() : undefined;
        set(s => ({
          programTasks: s.programTasks.map(t => t.id === id ? { ...t, completed, completed_at, updated_at: now() } : t),
        }));
        if (SUPABASE_ENABLED) dal.updateProgramTask(id, { completed, completed_at }).catch(console.error);
      },

      addCoachNote: (note) => {
        const temp: CoachNote = { ...note, id: generateId(), created_at: now(), updated_at: now() };
        set(s => ({ coachNotes: [...s.coachNotes, temp] }));
        if (SUPABASE_ENABLED) {
          dal.insertCoachNote(note).then(real => {
            if (real) set(s => ({ coachNotes: s.coachNotes.map(n => n.id === temp.id ? real : n) }));
          }).catch(console.error);
        }
      },

      updateCoachNote: (id, data) => {
        set(s => ({ coachNotes: s.coachNotes.map(n => n.id === id ? { ...n, ...data, updated_at: now() } : n) }));
        if (SUPABASE_ENABLED) dal.updateCoachNoteRecord(id, data).catch(console.error);
      },

      resolveAlert: (id) => {
        set(s => ({ coachAlerts: s.coachAlerts.map(a => a.id === id ? { ...a, resolved: true, resolved_at: now(), updated_at: now() } : a) }));
        if (SUPABASE_ENABLED) dal.resolveAlertRecord(id).catch(console.error);
      },

      addAlert: (alert) => {
        const temp: CoachAlert = { ...alert, id: generateId(), created_at: now(), updated_at: now() };
        set(s => ({ coachAlerts: [...s.coachAlerts, temp] }));
        if (SUPABASE_ENABLED) {
          dal.insertCoachAlert(alert).then(real => {
            if (real) set(s => ({ coachAlerts: s.coachAlerts.map(a => a.id === temp.id ? real : a) }));
          }).catch(console.error);
        }
      },
    }),
    {
      name: 'debt-reset-store',
      partialize: (state) => SUPABASE_ENABLED
        ? { currentUser: state.currentUser, currentClient: state.currentClient }
        : {
            currentUser: state.currentUser,
            currentClient: state.currentClient,
            users: state.users,
            clients: state.clients,
            debts: state.debts,
            cashFlowEntries: state.cashFlowEntries,
            spendingLeaks: state.spendingLeaks,
            payments: state.payments,
            checkins: state.checkins,
            emergencyFunds: state.emergencyFunds,
            programTasks: state.programTasks,
            coachNotes: state.coachNotes,
            coachAlerts: state.coachAlerts,
          },
    }
  )
);

// Backwards-compat alias used by older callsites
export const SUPABASE_MODE = SUPABASE_ENABLED;
