'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertBanner } from '@/components/ui/alert-banner';
import { Disclaimer } from '@/components/ui/disclaimer';
import { generateId, now } from '@/lib/utils';
import { Client } from '@/lib/types';

const STEPS = ['Your Info', 'Financial Snapshot', 'Your Goals', 'Risk Check'];

const INCOME_FREQ_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'semimonthly', label: 'Semi-Monthly' },
  { value: 'monthly', label: 'Monthly' },
];

const STRESS_OPTIONS = Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

export default function OnboardingPage() {
  const router = useRouter();
  const currentUser = useStore(s => s.currentUser);
  const createClient = useStore(s => s.createClient);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    program_start_date: new Date().toISOString().split('T')[0],
    monthly_income: '',
    income_frequency: 'biweekly',
    estimated_total_debt: '',
    current_emergency_fund: '',
    main_goal: '',
    stress_level: '7',
    confidence_level: '5',
    current_on_rent: '',
    current_on_food_utilities: '',
    considering_bankruptcy: '',
    facing_legal_action: '',
    wants_debt_settlement: '',
  });
  const [submitted, setSubmitted] = useState(false);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  const showReferralWarning =
    form.considering_bankruptcy === 'yes' ||
    form.facing_legal_action === 'yes' ||
    form.wants_debt_settlement === 'yes';

  const showBehindWarning =
    form.current_on_rent === 'no' || form.current_on_food_utilities === 'no';

  async function handleFinish() {
    if (!currentUser) return;
    // In Supabase mode, the trigger will associate the client with no coach by default —
    // a coach can later be assigned. In demo mode, default to the seeded Orlando Coach.
    await createClient({
      user_id: currentUser.id,
      coach_id: null,
      program_start_date: form.program_start_date,
      program_status: 'active',
      monthly_income: parseFloat(form.monthly_income) || 0,
      income_frequency: form.income_frequency as Client['income_frequency'],
      estimated_total_debt: parseFloat(form.estimated_total_debt) || 0,
      current_emergency_fund: parseFloat(form.current_emergency_fund) || 0,
      main_goal: form.main_goal,
      starting_stress_level: parseInt(form.stress_level),
      starting_confidence_level: parseInt(form.confidence_level),
      current_stress_level: parseInt(form.stress_level),
      current_confidence_level: parseInt(form.confidence_level),
      current_on_rent: form.current_on_rent !== 'no',
      current_on_food_utilities: form.current_on_food_utilities !== 'no',
      considering_bankruptcy: form.considering_bankruptcy === 'yes',
      facing_legal_action: form.facing_legal_action === 'yes',
      wants_debt_settlement: form.wants_debt_settlement === 'yes',
      payoff_method: 'snowball',
    });
    setSubmitted(true);
    setTimeout(() => router.push('/client/dashboard'), 1500);
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600 text-white text-lg font-bold mb-1">
            90
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to the 90-Day Debt Reset</h1>
          <p className="text-slate-500 text-sm">Let's get your profile set up. This takes about 3 minutes.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-colors ${i <= step ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block truncate ${i <= step ? 'text-teal-700' : 'text-slate-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-teal-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl">🎉</div>
              <h2 className="text-xl font-bold text-slate-800">You're all set!</h2>
              <p className="text-slate-500 text-sm">Taking you to your dashboard...</p>
            </div>
          ) : (
            <>
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-800">Step 1: Your Information</h2>
                  <Input label="Program start date" type="date" value={form.program_start_date} onChange={e => set('program_start_date', e.target.value)} />
                  <p className="text-sm text-slate-500">Your name and email are already on file from your account.</p>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-800">Step 2: Financial Snapshot</h2>
                  <Input label="Monthly take-home income ($)" type="number" value={form.monthly_income} onChange={e => set('monthly_income', e.target.value)} placeholder="e.g. 3500" min="0" />
                  <Select label="How often do you get paid?" value={form.income_frequency} onChange={e => set('income_frequency', e.target.value)} options={INCOME_FREQ_OPTIONS} />
                  <Input label="Estimated total debt ($)" type="number" value={form.estimated_total_debt} onChange={e => set('estimated_total_debt', e.target.value)} placeholder="e.g. 15000" min="0" />
                  <Input label="Current emergency fund balance ($)" type="number" value={form.current_emergency_fund} onChange={e => set('current_emergency_fund', e.target.value)} placeholder="e.g. 0" min="0" />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-800">Step 3: Your Goals</h2>
                  <Textarea label="What is your main financial goal?" value={form.main_goal} onChange={e => set('main_goal', e.target.value)} placeholder="e.g. Pay off all credit card debt and stop living paycheck to paycheck." rows={3} />
                  <Select label="Current money stress level (1 = low, 10 = high)" value={form.stress_level} onChange={e => set('stress_level', e.target.value)} options={STRESS_OPTIONS} />
                  <Select label="Current confidence level (1 = low, 10 = high)" value={form.confidence_level} onChange={e => set('confidence_level', e.target.value)} options={STRESS_OPTIONS} />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold text-slate-800">Step 4: A Few Important Questions</h2>
                  <p className="text-sm text-slate-500">Answer honestly. This helps your coach understand your situation and flag anything that might need special attention.</p>

                  {[
                    { key: 'current_on_rent', label: 'Are you current on your rent or mortgage?' },
                    { key: 'current_on_food_utilities', label: 'Are you current on food and utilities?' },
                    { key: 'considering_bankruptcy', label: 'Are you actively considering bankruptcy?' },
                    { key: 'facing_legal_action', label: 'Are you facing lawsuits, wage garnishment, repossession, or eviction?' },
                    { key: 'wants_debt_settlement', label: 'Are you looking for creditor negotiation or debt settlement help?' },
                  ].map(q => (
                    <div key={q.key} className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">{q.label}</p>
                      <div className="flex gap-3">
                        {['yes', 'no'].map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => set(q.key, v)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                              (form as Record<string, string>)[q.key] === v
                                ? 'bg-teal-600 border-teal-600 text-white'
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {v === 'yes' ? 'Yes' : 'No'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {showBehindWarning && (
                    <AlertBanner variant="warning">
                      <strong>Important:</strong> If you're behind on rent, food, or utilities, please prioritize those before focusing on debt payoff. Your coach can help you create a triage plan.
                    </AlertBanner>
                  )}

                  {showReferralWarning && (
                    <AlertBanner variant="danger">
                      <strong>A note about your answers:</strong> Based on what you shared, this may be outside the scope of coaching. You may benefit from speaking with a <strong>nonprofit credit counselor</strong>, <strong>legal aid organization</strong>, or <strong>bankruptcy attorney</strong>. Your coach will follow up with you about this.
                    </AlertBanner>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-2">
                {step > 0 ? (
                  <Button variant="outline" onClick={() => setStep(s => s - 1)}>Back</Button>
                ) : <div />}
                {step < STEPS.length - 1 ? (
                  <Button onClick={() => setStep(s => s + 1)}>Continue</Button>
                ) : (
                  <Button onClick={handleFinish}>Complete Setup</Button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-2">
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}
