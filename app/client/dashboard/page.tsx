'use client';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Badge } from '@/components/ui/badge';
import { AlertBanner } from '@/components/ui/alert-banner';
import { Disclaimer } from '@/components/ui/disclaimer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  totalStartingDebt, totalCurrentDebt, debtReduced, percentageDebtPaid,
  currentProgramWeek, programProgress90Day, currentTargetDebt,
  totalMinimumPayments, emergencyFundProgress, formatCurrency, formatPercent
} from '@/lib/calculations';
import { format, addDays, parseISO } from 'date-fns';
import { CreditCard, TrendingDown, Target, PiggyBank, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ClientDashboard() {
  const currentUser = useStore(s => s.currentUser);
  const currentClient = useStore(s => s.currentClient);
  const clients = useStore(s => s.clients);
  const debts = useStore(s => s.debts);
  const checkins = useStore(s => s.checkins);
  const payments = useStore(s => s.payments);
  const emergencyFunds = useStore(s => s.emergencyFunds);

  const client = currentClient || clients.find(c => c.user_id === currentUser?.id);
  if (!client) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Your profile isn't set up yet.</p>
        <Link href="/onboarding">
          <Button>Complete Onboarding</Button>
        </Link>
      </div>
    );
  }

  const clientDebts = debts.filter(d => d.client_id === client.id);
  const clientCheckins = checkins.filter(c => c.client_id === client.id);
  const clientPayments = payments.filter(p => p.client_id === client.id);
  const emergencyFund = emergencyFunds.find(e => e.client_id === client.id);

  const startingDebt = totalStartingDebt(clientDebts);
  const currentDebt = totalCurrentDebt(clientDebts);
  const reduced = debtReduced(clientDebts);
  const paidPct = percentageDebtPaid(clientDebts);
  const week = currentProgramWeek(client.program_start_date);
  const progress = programProgress90Day(client.program_start_date);
  const targetDebt = currentTargetDebt(clientDebts, client.payoff_method);
  const efProgress = emergencyFund ? emergencyFundProgress(emergencyFund) : 0;
  const minPayments = totalMinimumPayments(clientDebts);
  const activeDebts = clientDebts.filter(d => d.status !== 'paid_off');

  // Next payment
  const upcomingPayments = clientPayments
    .filter(p => p.payment_status === 'upcoming' || p.payment_status === 'needs_attention')
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  const nextPayment = upcomingPayments[0];
  const nextPaymentDebt = nextPayment ? clientDebts.find(d => d.id === nextPayment.debt_id) : null;

  // Check-in status
  const thisWeekCheckin = clientCheckins.find(c => c.week_number === week);
  const checkinDue = !thisWeekCheckin;

  // Debt chart data
  const chartData = clientDebts
    .filter(d => d.status !== 'paid_off')
    .map(d => ({ name: d.creditor_name, balance: d.current_balance }))
    .sort((a, b) => b.balance - a.balance);

  const COLORS = ['#0d9488', '#0891b2', '#7c3aed', '#d97706', '#dc2626'];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {currentUser?.full_name?.split(' ')[0]}.</h1>
        <p className="text-slate-500">Here's where your debt payoff plan stands today.</p>
      </div>

      {/* Check-in reminder */}
      {checkinDue && (
        <AlertBanner variant="info">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>Your weekly check-in is due. Submit it so your coach can review your progress.</span>
            <Link href="/client/check-in">
              <Button size="sm" variant="primary">Submit Check-In</Button>
            </Link>
          </div>
        </AlertBanner>
      )}

      {/* Progress message */}
      {reduced > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
          <p className="text-teal-800 font-medium">
            You have reduced your debt by <strong>{formatCurrency(reduced)}</strong> since starting the program. Keep going!
          </p>
        </div>
      )}

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Starting Debt"
          value={formatCurrency(startingDebt)}
          icon={<CreditCard size={24} />}
          color="default"
        />
        <StatCard
          label="Current Debt"
          value={formatCurrency(currentDebt)}
          sub={`${activeDebts.length} debt${activeDebts.length !== 1 ? 's' : ''} remaining`}
          icon={<TrendingDown size={24} />}
          color="rose"
        />
        <StatCard
          label="Debt Reduced"
          value={formatCurrency(reduced)}
          sub={formatPercent(paidPct) + ' paid down'}
          icon={<TrendingDown size={24} />}
          color="emerald"
        />
        <StatCard
          label="Min. Payments / Mo"
          value={formatCurrency(minPayments)}
          icon={<Calendar size={24} />}
          color="default"
        />
      </div>

      {/* Progress bars row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 90-day progress */}
        <Card>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">90-Day Program Progress</p>
                <Badge variant="info">Week {week} of 12</Badge>
              </div>
              <ProgressBar value={progress} sublabel={`${Math.round(progress)}%`} color="teal" />
              <p className="text-xs text-slate-500">
                Started {format(parseISO(client.program_start_date), 'MMM d, yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Debt paid off */}
        <Card>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Debt Paid Down</p>
                <Badge variant="success">{formatPercent(paidPct)}</Badge>
              </div>
              <ProgressBar value={paidPct} sublabel={`${formatCurrency(reduced)} of ${formatCurrency(startingDebt)}`} color="emerald" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Target debt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={16} className="text-teal-600" />
              Current Target Debt
            </CardTitle>
          </CardHeader>
          <CardContent>
            {targetDebt ? (
              <div className="space-y-2">
                <p className="font-semibold text-slate-800">{targetDebt.creditor_name}</p>
                <p className="text-2xl font-bold text-rose-600">{formatCurrency(targetDebt.current_balance)}</p>
                <p className="text-xs text-slate-500">{targetDebt.interest_rate}% APR • Min. {formatCurrency(targetDebt.minimum_payment)}/mo</p>
                <Badge variant={client.payoff_method === 'snowball' ? 'info' : 'warning'}>
                  {client.payoff_method === 'snowball' ? 'Snowball Method' : 'Avalanche Method'}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No active debts.</p>
            )}
          </CardContent>
        </Card>

        {/* Next payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={16} className="text-teal-600" />
              Next Payment Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextPayment && nextPaymentDebt ? (
              <div className="space-y-2">
                <p className="font-semibold text-slate-800">{nextPaymentDebt.creditor_name}</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(nextPayment.minimum_amount_due)}</p>
                <p className="text-xs text-slate-500">Due {format(parseISO(nextPayment.due_date), 'MMM d, yyyy')}</p>
                {nextPayment.autopay_status && <Badge variant="success">Autopay On</Badge>}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No upcoming payments.</p>
            )}
          </CardContent>
        </Card>

        {/* Emergency fund */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank size={16} className="text-teal-600" />
              Emergency Fund
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emergencyFund ? (
              <div className="space-y-3">
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(emergencyFund.current_balance)}</p>
                <ProgressBar value={efProgress} sublabel={`${Math.round(efProgress)}% of ${formatCurrency(emergencyFund.goal_amount)}`} color="blue" size="sm" />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-500">No emergency fund set up yet.</p>
                <Link href="/client/emergency-fund">
                  <Button size="sm" variant="outline">Set Up Now</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly goal */}
      <Card>
        <CardContent>
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Your goal this week</p>
              <p className="text-sm text-slate-600 mt-0.5">Stay current on minimums, avoid new debt, and make progress on your target debt.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debt breakdown chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Debt Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Balance']} />
                  <Bar dataKey="balance" radius={[0, 4, 4, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-in summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Check-Ins</CardTitle>
            <Link href="/client/check-in">
              <Button size="sm" variant="outline">
                {checkinDue ? 'Submit This Week' : 'View All'}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {clientCheckins.length === 0 ? (
            <p className="text-sm text-slate-500">No check-ins submitted yet.</p>
          ) : (
            <div className="space-y-2">
              {clientCheckins.slice(-3).reverse().map(ci => (
                <div key={ci.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Week {ci.week_number}</p>
                    <p className="text-xs text-slate-500">{format(parseISO(ci.submitted_at), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={ci.avoided_new_debt ? 'success' : 'danger'}>
                      {ci.avoided_new_debt ? 'No new debt' : 'New debt'}
                    </Badge>
                    <Badge variant="muted">Stress: {ci.stress_level}/10</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Disclaimer />
    </div>
  );
}
