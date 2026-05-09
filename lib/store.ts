'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User, Client, Debt, CashFlowEntry, SpendingLeak,
  Payment, WeeklyCheckin, EmergencyFund, ProgramTask,
  CoachNote, CoachAlert, ClientRiskFlag, AlertType, AlertSeverity
} from './types';
import {
  DEMO_USERS, DEMO_CLIENTS, DEMO_DEBTS, DEMO_CASH_FLOW, DEMO_SPENDING_LEAKS,
  DEMO_PAYMENTS, DEMO_CHECKINS, DEMO_EMERGENCY_FUNDS, DEMO_PROGRAM_TASKS,
  DEMO_COACH_NOTES, DEMO_COACH_ALERTS, DEMO_PASSWORDS
} from './seed-data';
import { generateId, now } from './utils';

interface Store {
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

  // Auth
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  register: (data: { full_name: string; email: string; phone: string; password: string; role: 'client' | 'coach' }) => { success: boolean; error?: string };

  // Client
  updateClient: (id: string, data: Partial<Client>) => void;
  createClient: (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Client;

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

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      currentUser: null,
      currentClient: null,
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
      clientRiskFlags: [],

      login: (email, password) => {
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

      logout: () => set({ currentUser: null, currentClient: null }),

      register: (data) => {
        const existing = get().users.find(u => u.email === data.email);
        if (existing) return { success: false, error: 'Email already registered.' };
        const user: User = {
          id: generateId(),
          role: data.role,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          created_at: now(),
          updated_at: now(),
        };
        // Store password in demo passwords map (in-memory only)
        DEMO_PASSWORDS[data.email] = data.password;
        set(s => ({ users: [...s.users, user], currentUser: user }));
        return { success: true };
      },

      updateClient: (id, data) => {
        set(s => ({
          clients: s.clients.map(c => c.id === id ? { ...c, ...data, updated_at: now() } : c),
          currentClient: s.currentClient?.id === id ? { ...s.currentClient, ...data, updated_at: now() } : s.currentClient,
        }));
      },

      createClient: (data) => {
        const client: Client = { ...data, id: generateId(), created_at: now(), updated_at: now() };
        set(s => ({ clients: [...s.clients, client] }));
        return client;
      },

      addDebt: (debt) => {
        const newDebt: Debt = { ...debt, id: generateId(), created_at: now(), updated_at: now() };
        set(s => ({ debts: [...s.debts, newDebt] }));
        // Auto-create alert for new debt added (if not the initial onboarding)
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

      updateDebt: (id, data) => set(s => ({
        debts: s.debts.map(d => d.id === id ? { ...d, ...data, updated_at: now() } : d),
      })),

      deleteDebt: (id) => set(s => ({ debts: s.debts.filter(d => d.id !== id) })),

      addCashFlowEntry: (entry) => set(s => ({
        cashFlowEntries: [...s.cashFlowEntries, { ...entry, id: generateId(), created_at: now(), updated_at: now() }],
      })),

      updateCashFlowEntry: (id, data) => set(s => ({
        cashFlowEntries: s.cashFlowEntries.map(e => e.id === id ? { ...e, ...data, updated_at: now() } : e),
      })),

      deleteCashFlowEntry: (id) => set(s => ({
        cashFlowEntries: s.cashFlowEntries.filter(e => e.id !== id),
      })),

      addSpendingLeak: (leak) => set(s => ({
        spendingLeaks: [...s.spendingLeaks, { ...leak, id: generateId(), created_at: now(), updated_at: now() }],
      })),

      updateSpendingLeak: (id, data) => set(s => ({
        spendingLeaks: s.spendingLeaks.map(l => l.id === id ? { ...l, ...data, updated_at: now() } : l),
      })),

      deleteSpendingLeak: (id) => set(s => ({
        spendingLeaks: s.spendingLeaks.filter(l => l.id !== id),
      })),

      addPayment: (payment) => set(s => ({
        payments: [...s.payments, { ...payment, id: generateId(), created_at: now(), updated_at: now() }],
      })),

      updatePayment: (id, data) => set(s => ({
        payments: s.payments.map(p => p.id === id ? { ...p, ...data, updated_at: now() } : p),
      })),

      deletePayment: (id) => set(s => ({ payments: s.payments.filter(p => p.id !== id) })),

      submitCheckin: (checkin) => {
        const newCheckin: WeeklyCheckin = { ...checkin, id: generateId(), created_at: now(), updated_at: now() };
        set(s => ({ checkins: [...s.checkins, newCheckin] }));
        // Auto-alerts based on check-in content
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
        // Update client stress/confidence
        if (client) {
          get().updateClient(client.id, { current_stress_level: checkin.stress_level, current_confidence_level: checkin.confidence_level });
        }
      },

      updateCheckin: (id, data) => set(s => ({
        checkins: s.checkins.map(c => c.id === id ? { ...c, ...data, updated_at: now() } : c),
      })),

      saveEmergencyFund: (clientId, data) => {
        const existing = get().emergencyFunds.find(e => e.client_id === clientId);
        if (existing) {
          set(s => ({
            emergencyFunds: s.emergencyFunds.map(e => e.client_id === clientId
              ? { ...e, ...data, updated_at: now() } : e),
          }));
        } else {
          set(s => ({
            emergencyFunds: [...s.emergencyFunds, { ...data, id: generateId(), created_at: now(), updated_at: now() }],
          }));
        }
      },

      toggleTask: (id) => set(s => ({
        programTasks: s.programTasks.map(t => t.id === id
          ? { ...t, completed: !t.completed, completed_at: !t.completed ? now() : undefined, updated_at: now() }
          : t),
      })),

      addCoachNote: (note) => set(s => ({
        coachNotes: [...s.coachNotes, { ...note, id: generateId(), created_at: now(), updated_at: now() }],
      })),

      updateCoachNote: (id, data) => set(s => ({
        coachNotes: s.coachNotes.map(n => n.id === id ? { ...n, ...data, updated_at: now() } : n),
      })),

      resolveAlert: (id) => set(s => ({
        coachAlerts: s.coachAlerts.map(a => a.id === id ? { ...a, resolved: true, resolved_at: now(), updated_at: now() } : a),
      })),

      addAlert: (alert) => set(s => ({
        coachAlerts: [...s.coachAlerts, { ...alert, id: generateId(), created_at: now(), updated_at: now() }],
      })),
    }),
    {
      name: 'debt-reset-store',
      partialize: (state) => ({
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
        clientRiskFlags: state.clientRiskFlags,
      }),
    }
  )
);
