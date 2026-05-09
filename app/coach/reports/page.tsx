'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Disclaimer } from '@/components/ui/disclaimer';
import {
  totalStartingDebt, totalCurrentDebt, debtReduced, percentageDebtPaid,
  currentProgramWeek, programProgress90Day, confirmedMonthlySavings,
  emergencyFundProgress, formatCurrency, formatPercent
} from '@/lib/calculations';
import { PROGRAM_STATUS_LABELS } from '@/lib/utils';
import { format, parseISO, addDays } from 'date-fns';
import { TrendingDown, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const clients = useStore(s => s.clients);
  const users = useStore(s => s.users);
  const debts = useStore(s => s.debts);
  const checkins = useStore(s => s.checkins);
  const payments = useStore(s => s.payments);
  const emergencyFunds = useStore(s => s.emergencyFunds);
  const spendingLeaks = useStore(s => s.spendingLeaks);
  const coachNotes = useStore(s => s.coachNotes);
  const addCoachNote = useStore(s => s.addCoachNote);
  const currentUser = useStore(s => s.currentUser);

  const [selectedClient, setSelectedClient] = useState(clients[0]?.id || '');
  const [summaryNote, setSummaryNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const CLIENT_OPTIONS = clients.map(c => {
    const u = users.find(u => u.id === c.user_id);
    return { value: c.id, label: u?.full_name || c.id };
  });

  const client = clients.find(c => c.id === selectedClient);
  const clientUser = users.find(u => u.id === client?.user_id);

  if (!client || !clientUser) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Select a client to view their report.</p>
      </div>
    );
  }

  const clientDebts = debts.filter(d => d.client_id === client.id);
  const clientCheckins = checkins.filter(c => c.client_id === client.id);
  const clientPayments = payments.filter(p => p.client_id === client.id);
  const ef = emergencyFunds.find(e => e.client_id === client.id);
  const leaks = spendingLeaks.filter(l => l.client_id === client.id);

  const starting = totalStartingDebt(clientDebts);
  const current = totalCurrentDebt(clientDebts);
  const reduced = debtReduced(clientDebts);
  const pct = percentageDebtPaid(clientDebts);
  const week = currentProgramWeek(client.program_start_date);
  const progress = programProgress90Day(client.program_start_date);
  const efPct = ef ? emergencyFundProgress(ef) : 0;
  const savings = confirmedMonthlySavings(leaks);
  const paidOff = clientDebts.filter(d => d.status === 'paid_off').length;
  const totalExtra = clientPayments.filter(p => p.payment_status === 'paid').reduce((s, p) => s + p.extra_payment_amount, 0);
  const endDate = format(addDays(parseISO(client.program_start_date), 90), 'MMMM d, yyyy');

  const monthlyReduction = reduced / Math.max(week, 1) * 4.33;
  const sixMonthForecast = Math.max(current - monthlyReduction * 6, 0);

  function saveSummaryNote() {
    if (!currentUser || !summaryNote) return;
    addCoachNote({
      client_id: client!.id,
      coach_id: currentUser.id,
      note_type: 'general',
      note_content: `90-Day Report Summary: ${summaryNote}`,
      follow_up_needed: false,
    });
    setNoteSaved(true);
    setSummaryNote('');
    setTimeout(() => setNoteSaved(false), 3000);
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">90-Day Reports</h1>
          <p className="text-slate-500 text-sm">Full program summary for each client.</p>
        </div>
        <Select
          value={selectedClient}
          onChange={e => setSelectedClient(e.target.value)}
          options={CLIENT_OPTIONS}
          className="min-w-[200px]"
        />
      </div>

      {/* Client header */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{clientUser.full_name}</h2>
              <p className="text-slate-500 text-sm">{clientUser.email}</p>
            </div>
            <Badge variant={client.program_status === 'active' ? 'success' : client.program_status === 'needs_attention' ? 'warning' : 'muted'}>
              {PROGRAM_STATUS_LABELS[client.program_status]}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-6 mt-4 text-sm">
            <div><p className="text-xs text-slate-500">Program Start</p><p className="font-medium">{format(parseISO(client.program_start_date), 'MMM d, yyyy')}</p></div>
            <div><p className="text-xs text-slate-500">Program End</p><p className="font-medium">{endDate}</p></div>
            <div><p className="text-xs text-slate-500">Current Week</p><p className="font-medium">Week {week} of 12</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-5">
          <ProgressBar value={progress} label="90-Day Progress" sublabel={formatPercent(progress)} color="teal" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Starting Debt" value={formatCurrency(starting)} />
        <StatCard label="Current Debt" value={formatCurrency(current)} color="rose" />
        <StatCard label="Debt Reduced" value={formatCurrency(reduced)} sub={formatPercent(pct)} color="emerald" />
        <StatCard label="Debts Paid Off" value={String(paidOff)} color={paidOff > 0 ? 'teal' : 'default'} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Check-Ins" value={String(clientCheckins.length)} sub={`of ${week} weeks`} color="blue" />
        <StatCard label="Extra Payments" value={formatCurrency(totalExtra)} color="teal" />
        <StatCard label="Monthly Savings" value={formatCurrency(savings)} sub="From leaks removed" color="emerald" />
        <StatCard label="Emergency Fund" value={ef ? formatCurrency(ef.current_balance) : '$0'} sub={ef ? `${Math.round(efPct)}% of goal` : 'Not set up'} color="blue" />
      </div>

      {/* Stress/confidence */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Stress Level</p>
            <div className="flex items-center gap-4">
              <div className="text-center"><p className="text-2xl font-bold text-slate-400">{client.starting_stress_level}</p><p className="text-xs text-slate-400">Start</p></div>
              <div className="flex-1 flex justify-center">{client.current_stress_level < client.starting_stress_level ? <TrendingDown className="text-emerald-500" /> : <TrendingUp className="text-red-500" />}</div>
              <div className="text-center"><p className="text-2xl font-bold">{client.current_stress_level}</p><p className="text-xs text-slate-500">Now</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Confidence Level</p>
            <div className="flex items-center gap-4">
              <div className="text-center"><p className="text-2xl font-bold text-slate-400">{client.starting_confidence_level}</p><p className="text-xs text-slate-400">Start</p></div>
              <div className="flex-1 flex justify-center">{client.current_confidence_level > client.starting_confidence_level ? <TrendingUp className="text-emerald-500" /> : <TrendingDown className="text-red-500" />}</div>
              <div className="text-center"><p className="text-2xl font-bold">{client.current_confidence_level}</p><p className="text-xs text-slate-500">Now</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6-month forecast */}
      <Card>
        <CardHeader><CardTitle>Six-Month Forecast</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            Based on {formatCurrency(monthlyReduction)}/month average reduction rate:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-xs text-slate-500 font-medium uppercase">Today</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{formatCurrency(current)}</p>
            </div>
            <div className="bg-teal-50 rounded-lg p-4 text-center">
              <p className="text-xs text-teal-600 font-medium uppercase">In 6 Months</p>
              <p className="text-2xl font-bold text-teal-700 mt-1">{formatCurrency(sixMonthForecast)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coach summary notes */}
      <Card>
        <CardHeader><CardTitle>Add Report Summary Note</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={summaryNote}
            onChange={e => setSummaryNote(e.target.value)}
            placeholder="Write a summary note for this client's 90-day report..."
            rows={4}
          />
          <div className="flex items-center gap-3">
            <Button onClick={saveSummaryNote} disabled={!summaryNote}>Save Note</Button>
            {noteSaved && <span className="text-sm text-emerald-600 font-medium">Saved!</span>}
          </div>
        </CardContent>
      </Card>

      <Disclaimer />
    </div>
  );
}
