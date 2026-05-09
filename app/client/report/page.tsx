'use client';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Badge } from '@/components/ui/badge';
import { Disclaimer } from '@/components/ui/disclaimer';
import {
  totalStartingDebt, totalCurrentDebt, debtReduced, percentageDebtPaid,
  currentProgramWeek, programProgress90Day, emergencyFundProgress,
  confirmedMonthlySavings, formatCurrency, formatPercent
} from '@/lib/calculations';
import { format, parseISO, addDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingDown, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

export default function ReportPage() {
  const currentUser = useStore(s => s.currentUser);
  const currentClient = useStore(s => s.currentClient);
  const clients = useStore(s => s.clients);
  const debts = useStore(s => s.debts);
  const checkins = useStore(s => s.checkins);
  const payments = useStore(s => s.payments);
  const emergencyFunds = useStore(s => s.emergencyFunds);
  const spendingLeaks = useStore(s => s.spendingLeaks);
  const programTasks = useStore(s => s.programTasks);

  const client = currentClient || clients.find(c => c.user_id === currentUser?.id);
  if (!client) return null;

  const clientDebts = debts.filter(d => d.client_id === client.id);
  const clientCheckins = checkins.filter(c => c.client_id === client.id);
  const clientPayments = payments.filter(p => p.client_id === client.id);
  const ef = emergencyFunds.find(e => e.client_id === client.id);
  const leaks = spendingLeaks.filter(l => l.client_id === client.id);

  const startingDebt = totalStartingDebt(clientDebts);
  const currentDebt = totalCurrentDebt(clientDebts);
  const reduced = debtReduced(clientDebts);
  const paidPct = percentageDebtPaid(clientDebts);
  const week = currentProgramWeek(client.program_start_date);
  const progress = programProgress90Day(client.program_start_date);
  const efProgress = ef ? emergencyFundProgress(ef) : 0;
  const confirmedSavings = confirmedMonthlySavings(leaks);
  const paidOffDebts = clientDebts.filter(d => d.status === 'paid_off').length;
  const totalPaidPayments = clientPayments.filter(p => p.payment_status === 'paid').length;
  const totalExtra = clientPayments.filter(p => p.payment_status === 'paid').reduce((s, p) => s + p.extra_payment_amount, 0);

  const endDate = format(addDays(parseISO(client.program_start_date), 90), 'MMM d, yyyy');

  // Six-month forecast
  const monthlyReduction = reduced / Math.max(week, 1) * 4.33;
  const sixMonthForecast = Math.max(currentDebt - monthlyReduction * 6, 0);

  // Check-in stress/confidence trend
  const checkinTrend = clientCheckins.map(ci => ({
    week: `W${ci.week_number}`,
    stress: ci.stress_level,
    confidence: ci.confidence_level,
  }));

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">90-Day Progress Report</h1>
          <p className="text-slate-500 text-sm">A summary of your debt payoff journey.</p>
        </div>
        <Badge variant={week >= 12 ? 'success' : 'info'}>
          Week {week} of 12
        </Badge>
      </div>

      {/* Program dates */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Program Start</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{format(parseISO(client.program_start_date), 'MMMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Program End</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{endDate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Program Status</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{client.program_status.replace('_', ' ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 90-day progress bar */}
      <Card>
        <CardContent className="py-5">
          <ProgressBar value={progress} label="90-Day Program Progress" sublabel={formatPercent(progress)} color="teal" />
        </CardContent>
      </Card>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Starting Debt" value={formatCurrency(startingDebt)} color="default" />
        <StatCard label="Current Debt" value={formatCurrency(currentDebt)} color="rose" />
        <StatCard label="Debt Reduced" value={formatCurrency(reduced)} color="emerald" />
        <StatCard label="% Paid Down" value={formatPercent(paidPct)} color="teal" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Check-Ins Completed" value={String(clientCheckins.length)} sub={`of ${week} weeks`} color="blue" />
        <StatCard label="Payments Logged" value={String(totalPaidPayments)} color="default" />
        <StatCard label="Extra Payments" value={formatCurrency(totalExtra)} sub="Above minimums" color="teal" />
        <StatCard label="Debts Paid Off" value={String(paidOffDebts)} color="emerald" />
      </div>

      {/* Stress / confidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">Stress Level</p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-400">{client.starting_stress_level}</p>
                <p className="text-xs text-slate-400">Start</p>
              </div>
              <div className="flex-1 flex items-center justify-center">
                {client.current_stress_level < client.starting_stress_level
                  ? <TrendingDown size={24} className="text-emerald-500" />
                  : <TrendingUp size={24} className="text-red-500" />}
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-800">{client.current_stress_level}</p>
                <p className="text-xs text-slate-500">Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">Confidence Level</p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-400">{client.starting_confidence_level}</p>
                <p className="text-xs text-slate-400">Start</p>
              </div>
              <div className="flex-1 flex items-center justify-center">
                {client.current_confidence_level > client.starting_confidence_level
                  ? <TrendingUp size={24} className="text-emerald-500" />
                  : <TrendingDown size={24} className="text-red-500" />}
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-800">{client.current_confidence_level}</p>
                <p className="text-xs text-slate-500">Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending leaks & emergency fund */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Spending Leaks Addressed</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(confirmedSavings)}</p>
            <p className="text-sm text-slate-500 mt-1">Per month in confirmed savings from cancelled/reduced items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Emergency Fund</CardTitle></CardHeader>
          <CardContent>
            {ef ? (
              <div className="space-y-3">
                <p className="text-3xl font-bold text-teal-600">{formatCurrency(ef.current_balance)}</p>
                <ProgressBar value={efProgress} sublabel={`${Math.round(efProgress)}% of ${formatCurrency(ef.goal_amount)} goal`} color="blue" size="sm" />
              </div>
            ) : (
              <p className="text-sm text-slate-500">No emergency fund set up yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stress/confidence trend chart */}
      {checkinTrend.length > 1 && (
        <Card>
          <CardHeader><CardTitle>Stress & Confidence Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={checkinTrend} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="stress" stroke="#f87171" name="Stress" strokeWidth={2} dot />
                  <Line type="monotone" dataKey="confidence" stroke="#34d399" name="Confidence" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Six-month forecast */}
      <Card>
        <CardHeader><CardTitle>Six-Month Forecast</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Based on your current rate of debt reduction ({formatCurrency(monthlyReduction)}/month), here's where you could be in 6 months:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Today</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{formatCurrency(currentDebt)}</p>
            </div>
            <div className="bg-teal-50 rounded-lg p-4 text-center">
              <p className="text-xs text-teal-600 font-medium uppercase tracking-wide">6 Months</p>
              <p className="text-2xl font-bold text-teal-700 mt-1">{formatCurrency(sixMonthForecast)}</p>
            </div>
          </div>
          {monthlyReduction > 0 && (
            <p className="text-sm text-slate-500">That's a projected reduction of <strong>{formatCurrency(monthlyReduction * 6)}</strong> over the next 6 months.</p>
          )}
        </CardContent>
      </Card>

      {/* Progress message */}
      {reduced > 0 && (
        <div className="bg-teal-600 rounded-2xl p-6 text-center text-white">
          <CheckCircle size={32} className="mx-auto mb-2 opacity-80" />
          <p className="text-lg font-bold">You have reduced your debt by {formatCurrency(reduced)} since starting the program.</p>
          <p className="text-teal-200 text-sm mt-1">Every payment counts. Keep going.</p>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
