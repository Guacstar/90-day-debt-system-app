'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ProgressBar } from '@/components/ui/progress-bar';
import { StatCard } from '@/components/ui/stat-card';
import { AlertBanner } from '@/components/ui/alert-banner';
import { emergencyFundProgress, formatCurrency } from '@/lib/calculations';
import { EMERGENCY_FUND_GOAL_LABELS } from '@/lib/utils';
import { EmergencyFundGoalType } from '@/lib/types';
import { PiggyBank, CheckCircle } from 'lucide-react';

const GOAL_OPTIONS = [
  { value: '250', label: '$250 — Starter cushion' },
  { value: '500', label: '$500 — Basic safety net' },
  { value: '1000', label: '$1,000 — Recommended starter goal' },
  { value: 'one_month', label: 'One month of expenses' },
  { value: 'custom', label: 'Custom amount' },
];

export default function EmergencyFundPage() {
  const currentUser = useStore(s => s.currentUser);
  const currentClient = useStore(s => s.currentClient);
  const clients = useStore(s => s.clients);
  const emergencyFunds = useStore(s => s.emergencyFunds);
  const saveEmergencyFund = useStore(s => s.saveEmergencyFund);

  const client = currentClient || clients.find(c => c.user_id === currentUser?.id);
  const ef = emergencyFunds.find(e => e.client_id === client?.id);

  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    goal_type: (ef?.goal_type || '1000') as EmergencyFundGoalType,
    goal_amount: String(ef?.goal_amount || 1000),
    current_balance: String(ef?.current_balance || 0),
    weekly_contribution: String(ef?.weekly_contribution || 0),
    monthly_contribution: String(ef?.monthly_contribution || 0),
    notes: ef?.notes || '',
  });

  function setF(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    if (field === 'goal_type') {
      const presets: Record<string, string> = { '250': '250', '500': '500', '1000': '1000' };
      if (presets[value]) setForm(f => ({ ...f, [field]: value as EmergencyFundGoalType, goal_amount: presets[value] }));
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;
    saveEmergencyFund(client.id, {
      client_id: client.id,
      goal_type: form.goal_type,
      goal_amount: parseFloat(form.goal_amount) || 0,
      current_balance: parseFloat(form.current_balance) || 0,
      weekly_contribution: parseFloat(form.weekly_contribution) || 0,
      monthly_contribution: parseFloat(form.monthly_contribution) || 0,
      notes: form.notes,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const goalAmount = parseFloat(form.goal_amount) || 0;
  const currentBalance = parseFloat(form.current_balance) || 0;
  const progress = goalAmount > 0 ? Math.min((currentBalance / goalAmount) * 100, 100) : 0;
  const remaining = Math.max(goalAmount - currentBalance, 0);
  const weeksToGoal = form.weekly_contribution && parseFloat(form.weekly_contribution) > 0
    ? Math.ceil(remaining / parseFloat(form.weekly_contribution)) : null;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Emergency Fund</h1>
        <p className="text-slate-500 text-sm">Building even a small emergency fund protects you from going deeper into debt when surprises happen.</p>
      </div>

      <AlertBanner variant="info">
        <div className="space-y-1">
          <p><strong>Why build an emergency fund while paying off debt?</strong></p>
          <p>Without a cushion, any unexpected expense forces you back onto credit cards. A starter goal of $500–$1,000 breaks that cycle.</p>
        </div>
      </AlertBanner>

      {ef && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Current Balance" value={formatCurrency(ef.current_balance)} color="emerald" />
          <StatCard label="Goal" value={formatCurrency(ef.goal_amount)} color="teal" />
          <StatCard label="Remaining" value={formatCurrency(remaining)} color={remaining === 0 ? 'emerald' : 'default'} />
        </div>
      )}

      {ef && (
        <Card>
          <CardContent className="py-5">
            <ProgressBar
              value={progress}
              label="Emergency Fund Progress"
              sublabel={`${Math.round(progress)}% — ${formatCurrency(currentBalance)} of ${formatCurrency(goalAmount)}`}
              color="blue"
            />
            {progress >= 100 && (
              <div className="mt-3 flex items-center gap-2 text-emerald-700">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Goal reached! Great job building your safety net.</span>
              </div>
            )}
            {weeksToGoal && progress < 100 && (
              <p className="text-xs text-slate-500 mt-2">
                At {formatCurrency(parseFloat(form.weekly_contribution))}/week, you'll reach your goal in approximately <strong>{weeksToGoal} week{weeksToGoal !== 1 ? 's' : ''}</strong>.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank size={16} className="text-teal-600" />
            {ef ? 'Update Your Emergency Fund' : 'Set Up Your Emergency Fund'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <Select
              label="Starter goal"
              value={form.goal_type}
              onChange={e => {
                const v = e.target.value as EmergencyFundGoalType;
                const presets: Record<string, string> = { '250': '250', '500': '500', '1000': '1000' };
                setForm(f => ({ ...f, goal_type: v, goal_amount: presets[v] || f.goal_amount }));
              }}
              options={GOAL_OPTIONS}
            />
            {(form.goal_type === 'one_month' || form.goal_type === 'custom') && (
              <Input label="Goal amount ($)" type="number" value={form.goal_amount} onChange={e => setF('goal_amount', e.target.value)} placeholder="e.g. 2000" min="0" />
            )}
            <Input label="Current balance ($)" type="number" value={form.current_balance} onChange={e => setF('current_balance', e.target.value)} placeholder="0.00" min="0" step="0.01" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Weekly contribution ($)" type="number" value={form.weekly_contribution} onChange={e => setF('weekly_contribution', e.target.value)} placeholder="0.00" min="0" step="0.01" />
              <Input label="Monthly contribution ($)" type="number" value={form.monthly_contribution} onChange={e => setF('monthly_contribution', e.target.value)} placeholder="0.00" min="0" step="0.01" />
            </div>
            <Textarea label="Notes (optional)" value={form.notes} onChange={e => setF('notes', e.target.value)} rows={2} placeholder="Any notes about your emergency fund plan..." />
            <div className="flex items-center gap-4">
              <Button type="submit">Save Emergency Fund</Button>
              {saved && <span className="text-sm text-emerald-600 font-medium">Saved!</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
