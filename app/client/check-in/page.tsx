'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertBanner } from '@/components/ui/alert-banner';
import { currentProgramWeek, formatCurrency } from '@/lib/calculations';
import { now } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { CheckCircle, ClipboardCheck, MessageSquare } from 'lucide-react';

const STRESS_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

export default function CheckInPage() {
  const currentUser = useStore(s => s.currentUser);
  const currentClient = useStore(s => s.currentClient);
  const clients = useStore(s => s.clients);
  const checkins = useStore(s => s.checkins);
  const submitCheckin = useStore(s => s.submitCheckin);

  const client = currentClient || clients.find(c => c.user_id === currentUser?.id);
  const clientCheckins = checkins.filter(c => c.client_id === client?.id);
  const week = client ? currentProgramWeek(client.program_start_date) : 1;
  const thisWeekCheckin = clientCheckins.find(c => c.week_number === week);

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    avoided_new_debt: '',
    made_all_required_payments: '',
    stayed_within_weekly_spending_limit: '',
    extra_debt_payment: '',
    total_debt_went_up: '',
    biggest_money_win: '',
    biggest_challenge: '',
    spending_temptation: '',
    help_needed: '',
    stress_level: '5',
    confidence_level: '6',
  });

  function setF(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;
    submitCheckin({
      client_id: client.id,
      week_number: week,
      avoided_new_debt: form.avoided_new_debt === 'yes',
      made_all_required_payments: form.made_all_required_payments === 'yes',
      stayed_within_weekly_spending_limit: form.stayed_within_weekly_spending_limit === 'yes',
      extra_debt_payment: parseFloat(form.extra_debt_payment) || 0,
      total_debt_went_up: form.total_debt_went_up === 'yes',
      biggest_money_win: form.biggest_money_win,
      biggest_challenge: form.biggest_challenge,
      spending_temptation: form.spending_temptation,
      help_needed: form.help_needed,
      stress_level: parseInt(form.stress_level),
      confidence_level: parseInt(form.confidence_level),
      coach_response: '',
      submitted_at: now(),
    });
    setSubmitted(true);
  }

  if (!client) return null;

  if (submitted || thisWeekCheckin) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Weekly Check-In</h1>
        </div>

        {submitted && (
          <AlertBanner variant="success">
            <strong>Check-in submitted.</strong> Your coach will review your progress.
          </AlertBanner>
        )}

        {thisWeekCheckin && !submitted && (
          <AlertBanner variant="success">
            You've already submitted your Week {week} check-in. Great work staying consistent!
          </AlertBanner>
        )}

        {/* Past check-ins */}
        <div className="space-y-4">
          {clientCheckins.slice().reverse().map(ci => (
            <Card key={ci.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Week {ci.week_number} Check-In</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={ci.avoided_new_debt ? 'success' : 'danger'}>
                      {ci.avoided_new_debt ? 'No new debt' : 'New debt added'}
                    </Badge>
                    {ci.reviewed_at && <Badge variant="info">Reviewed by coach</Badge>}
                  </div>
                </div>
                <p className="text-xs text-slate-500">{format(parseISO(ci.submitted_at), 'MMMM d, yyyy')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Avoided new debt', value: ci.avoided_new_debt },
                    { label: 'All payments made', value: ci.made_all_required_payments },
                    { label: 'Within spending limit', value: ci.stayed_within_weekly_spending_limit },
                    { label: 'Debt went up', value: ci.total_debt_went_up },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                      <Badge variant={item.label === 'Debt went up' ? (item.value ? 'danger' : 'success') : (item.value ? 'success' : 'danger')}>
                        {item.value ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  ))}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Extra payment</p>
                    <p className="text-sm font-semibold text-teal-600">{formatCurrency(ci.extra_debt_payment)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Stress / Confidence</p>
                    <p className="text-sm font-semibold text-slate-700">{ci.stress_level} / {ci.confidence_level}</p>
                  </div>
                </div>
                {ci.biggest_money_win && (
                  <div><p className="text-xs text-slate-500 font-medium">Biggest win</p><p className="text-sm text-slate-700 mt-0.5">{ci.biggest_money_win}</p></div>
                )}
                {ci.biggest_challenge && (
                  <div><p className="text-xs text-slate-500 font-medium">Biggest challenge</p><p className="text-sm text-slate-700 mt-0.5">{ci.biggest_challenge}</p></div>
                )}
                {ci.help_needed && (
                  <div><p className="text-xs text-slate-500 font-medium">Help needed</p><p className="text-sm text-slate-700 mt-0.5">{ci.help_needed}</p></div>
                )}
                {ci.coach_response && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare size={14} className="text-teal-600" />
                      <p className="text-xs font-semibold text-teal-700">Coach Response</p>
                    </div>
                    <p className="text-sm text-teal-800">{ci.coach_response}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function YesNoButtons({ field, value }: { field: string; value: string }) {
    return (
      <div className="flex gap-3">
        {['yes', 'no'].map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setF(field, v)}
            className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors ${
              value === v ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {v === 'yes' ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Weekly Check-In</h1>
        <p className="text-slate-500 text-sm">Week {week} of 12 — Take a few minutes to reflect on your progress.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle size={16} className="text-teal-600" />This Week's Progress</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {[
              { key: 'avoided_new_debt', label: 'Did you avoid new debt this week?' },
              { key: 'made_all_required_payments', label: 'Did you make all required payments?' },
              { key: 'stayed_within_weekly_spending_limit', label: 'Did you stay within your weekly spending limit?' },
              { key: 'total_debt_went_up', label: 'Did your total debt go up this week?' },
            ].map(q => (
              <div key={q.key} className="space-y-2">
                <p className="text-sm font-medium text-slate-700">{q.label}</p>
                <YesNoButtons field={q.key} value={(form as Record<string, string>)[q.key]} />
              </div>
            ))}
            <Input
              label="How much extra did you put toward debt this week? ($)"
              type="number"
              value={form.extra_debt_payment}
              onChange={e => setF('extra_debt_payment', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Reflection</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea label="Biggest money win this week" value={form.biggest_money_win} onChange={e => setF('biggest_money_win', e.target.value)} placeholder="What went well? Even small wins count." rows={2} />
            <Textarea label="Biggest challenge this week" value={form.biggest_challenge} onChange={e => setF('biggest_challenge', e.target.value)} placeholder="What was hard? No judgment here." rows={2} />
            <Textarea label="Spending temptation that came up" value={form.spending_temptation} onChange={e => setF('spending_temptation', e.target.value)} placeholder="What tempted you to spend outside the plan?" rows={2} />
            <Textarea label="What do you need help with this week?" value={form.help_needed} onChange={e => setF('help_needed', e.target.value)} placeholder="Anything you want your coach to address?" rows={2} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>How Are You Feeling?</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {[
              { key: 'stress_level', label: 'Money stress level this week (1 = low, 10 = high)', invert: true },
              { key: 'confidence_level', label: 'Confidence level this week (1 = low, 10 = high)', invert: false },
            ].map(item => (
              <div key={item.key} className="space-y-2">
                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                <div className="flex gap-2 flex-wrap">
                  {STRESS_OPTIONS.map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setF(item.key, String(n))}
                      className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                        (form as Record<string, string>)[item.key] === String(n)
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          <ClipboardCheck size={18} />
          Submit Week {week} Check-In
        </Button>
      </form>
    </div>
  );
}
