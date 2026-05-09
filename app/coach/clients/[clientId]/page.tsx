'use client';
import { useState } from 'react';
import { use } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { AlertBanner } from '@/components/ui/alert-banner';
import {
  totalStartingDebt, totalCurrentDebt, debtReduced, percentageDebtPaid,
  currentProgramWeek, programProgress90Day, emergencyFundProgress,
  formatCurrency, formatPercent
} from '@/lib/calculations';
import {
  PROGRAM_STATUS_LABELS, DEBT_TYPE_LABELS, DEBT_STATUS_LABELS,
  COACH_NOTE_TYPE_LABELS, now
} from '@/lib/utils';
import { CoachNoteType, ProgramStatus } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import {
  ArrowLeft, Plus, CheckCircle, Circle, MessageSquare, AlertTriangle,
  CreditCard, DollarSign, Scissors, Calendar, ClipboardCheck, PiggyBank
} from 'lucide-react';
import Link from 'next/link';

const NOTE_TYPE_OPTIONS = Object.entries(COACH_NOTE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));
const STATUS_OPTIONS = Object.entries(PROGRAM_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }));

export default function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const currentUser = useStore(s => s.currentUser);
  const clients = useStore(s => s.clients);
  const users = useStore(s => s.users);
  const debts = useStore(s => s.debts);
  const cashFlowEntries = useStore(s => s.cashFlowEntries);
  const spendingLeaks = useStore(s => s.spendingLeaks);
  const payments = useStore(s => s.payments);
  const checkins = useStore(s => s.checkins);
  const emergencyFunds = useStore(s => s.emergencyFunds);
  const programTasks = useStore(s => s.programTasks);
  const coachNotes = useStore(s => s.coachNotes);
  const coachAlerts = useStore(s => s.coachAlerts);
  const addCoachNote = useStore(s => s.addCoachNote);
  const updateCheckin = useStore(s => s.updateCheckin);
  const updateClient = useStore(s => s.updateClient);
  const resolveAlert = useStore(s => s.resolveAlert);
  const toggleTask = useStore(s => s.toggleTask);

  const client = clients.find(c => c.id === clientId);
  const clientUser = users.find(u => u.id === client?.user_id);

  const [activeTab, setActiveTab] = useState('overview');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({ note_type: 'general' as CoachNoteType, note_content: '', follow_up_needed: false, follow_up_due_date: '' });
  const [checkinResponse, setCheckinResponse] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  if (!client || !clientUser) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Client not found.</p>
        <Link href="/coach/clients"><Button variant="outline" className="mt-4">Back to Clients</Button></Link>
      </div>
    );
  }

  const clientDebts = debts.filter(d => d.client_id === client.id);
  const clientCheckins = checkins.filter(c => c.client_id === client.id).slice().reverse();
  const clientPayments = payments.filter(p => p.client_id === client.id);
  const clientLeaks = spendingLeaks.filter(l => l.client_id === client.id);
  const clientTasks = programTasks.filter(t => t.client_id === client.id);
  const clientNotes = coachNotes.filter(n => n.client_id === client.id).slice().reverse();
  const clientAlerts = coachAlerts.filter(a => a.client_id === client.id && !a.resolved);
  const ef = emergencyFunds.find(e => e.client_id === client.id);

  const starting = totalStartingDebt(clientDebts);
  const current = totalCurrentDebt(clientDebts);
  const reduced = debtReduced(clientDebts);
  const pct = percentageDebtPaid(clientDebts);
  const week = currentProgramWeek(client.program_start_date);
  const progress = programProgress90Day(client.program_start_date);

  function addNote() {
    if (!currentUser) return;
    addCoachNote({
      client_id: client!.id,
      coach_id: currentUser.id,
      note_type: noteForm.note_type,
      note_content: noteForm.note_content,
      follow_up_needed: noteForm.follow_up_needed,
      follow_up_due_date: noteForm.follow_up_due_date || undefined,
    });
    setNoteForm({ note_type: 'general', note_content: '', follow_up_needed: false, follow_up_due_date: '' });
    setShowNoteModal(false);
  }

  function saveCheckinResponse(checkinId: string) {
    updateCheckin(checkinId, { coach_response: checkinResponse[checkinId] || '', reviewed_at: now() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'debts', label: 'Debts', icon: '💳' },
    { id: 'checkins', label: 'Check-Ins', icon: '✅' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'alerts', label: `Alerts ${clientAlerts.length > 0 ? `(${clientAlerts.length})` : ''}`, icon: '🔔' },
    { id: 'tasks', label: 'Plan Tasks', icon: '🗓' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link href="/coach/clients" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2">
            <ArrowLeft size={14} /> Back to Clients
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{clientUser.full_name}</h1>
          <p className="text-slate-500 text-sm">{clientUser.email} • {clientUser.phone}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={client.program_status}
            onChange={e => updateClient(client.id, { program_status: e.target.value as ProgramStatus })}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Button size="sm" onClick={() => setShowNoteModal(true)}>
            <Plus size={14} />
            Add Note
          </Button>
        </div>
      </div>

      {clientAlerts.length > 0 && (
        <AlertBanner variant="danger">
          <strong>{clientAlerts.length} unresolved alert{clientAlerts.length > 1 ? 's' : ''}.</strong> Review and resolve them in the Alerts tab.
        </AlertBanner>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Starting Debt" value={formatCurrency(starting)} />
        <StatCard label="Current Debt" value={formatCurrency(current)} color="rose" />
        <StatCard label="Debt Reduced" value={formatCurrency(reduced)} sub={formatPercent(pct)} color="emerald" />
        <StatCard label="Program Week" value={String(week)} sub="of 12" color="blue" />
      </div>

      <Card>
        <CardContent className="py-4">
          <ProgressBar value={progress} label="90-Day Progress" sublabel={formatPercent(progress)} color="teal" />
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Client Profile</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: 'Program Start', value: format(parseISO(client.program_start_date), 'MMM d, yyyy') },
                  { label: 'Monthly Income', value: formatCurrency(client.monthly_income) },
                  { label: 'Main Goal', value: client.main_goal },
                  { label: 'Payoff Method', value: client.payoff_method === 'snowball' ? 'Debt Snowball' : 'Debt Avalanche' },
                  { label: 'Starting Stress', value: `${client.starting_stress_level}/10` },
                  { label: 'Current Stress', value: `${client.current_stress_level}/10` },
                  { label: 'Starting Confidence', value: `${client.starting_confidence_level}/10` },
                  { label: 'Current Confidence', value: `${client.current_confidence_level}/10` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-start">
                    <p className="text-xs text-slate-500 font-medium">{row.label}</p>
                    <p className="text-sm text-slate-700 font-medium text-right max-w-[60%]">{row.value}</p>
                  </div>
                ))}
                <div className="pt-2 space-y-2">
                  <label className="text-xs font-medium text-slate-500">Next Coaching Call</label>
                  <Input
                    type="date"
                    value={client.next_coaching_call_date || ''}
                    onChange={e => updateClient(client.id, { next_coaching_call_date: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Risk Flags</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: 'Current on rent/mortgage', value: client.current_on_rent, good: true },
                  { label: 'Current on food/utilities', value: client.current_on_food_utilities, good: true },
                  { label: 'Considering bankruptcy', value: client.considering_bankruptcy, good: false },
                  { label: 'Facing legal action', value: client.facing_legal_action, good: false },
                  { label: 'Wants debt settlement', value: client.wants_debt_settlement, good: false },
                ].map(flag => (
                  <div key={flag.label} className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">{flag.label}</p>
                    <Badge variant={flag.good ? (flag.value ? 'success' : 'danger') : (flag.value ? 'danger' : 'success')}>
                      {flag.value ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                ))}
                {(client.considering_bankruptcy || client.facing_legal_action || client.wants_debt_settlement) && (
                  <AlertBanner variant="danger" className="mt-2">
                    This may be outside the scope of coaching. Consider referring to a nonprofit credit counselor, legal aid, or bankruptcy attorney.
                  </AlertBanner>
                )}
              </CardContent>
            </Card>
          </div>

          {ef && (
            <Card>
              <CardHeader><CardTitle>Emergency Fund</CardTitle></CardHeader>
              <CardContent>
                <ProgressBar
                  value={emergencyFundProgress(ef)}
                  label={`${formatCurrency(ef.current_balance)} saved`}
                  sublabel={`Goal: ${formatCurrency(ef.goal_amount)}`}
                  color="blue"
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Debts tab */}
      {activeTab === 'debts' && (
        <Card>
          <CardHeader><CardTitle>Debts ({clientDebts.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            {clientDebts.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500 text-center">No debts added.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Creditor', 'Type', 'Balance', 'Rate', 'Min. Payment', 'Status'].map(h => (
                        <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clientDebts.map(d => (
                      <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-5 py-3 text-sm font-medium text-slate-700">{d.creditor_name}</td>
                        <td className="px-5 py-3 text-sm text-slate-500">{DEBT_TYPE_LABELS[d.debt_type]}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-rose-600">{formatCurrency(d.current_balance)}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{d.interest_rate}%</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{formatCurrency(d.minimum_payment)}/mo</td>
                        <td className="px-5 py-3">
                          <Badge variant={d.status === 'current' ? 'success' : d.status === 'paid_off' ? 'muted' : 'danger'}>
                            {DEBT_STATUS_LABELS[d.status]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Check-ins tab */}
      {activeTab === 'checkins' && (
        <div className="space-y-4">
          {clientCheckins.length === 0 ? (
            <p className="text-sm text-slate-500">No check-ins submitted yet.</p>
          ) : (
            clientCheckins.map(ci => (
              <Card key={ci.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Week {ci.week_number}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={ci.avoided_new_debt ? 'success' : 'danger'}>
                        {ci.avoided_new_debt ? 'No new debt' : 'New debt'}
                      </Badge>
                      {ci.reviewed_at ? <Badge variant="info">Reviewed</Badge> : <Badge variant="warning">Needs Review</Badge>}
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
                      <p className="text-sm font-semibold">{ci.stress_level} / {ci.confidence_level}</p>
                    </div>
                  </div>
                  {ci.biggest_money_win && <div><p className="text-xs text-slate-500 font-medium">Win</p><p className="text-sm text-slate-700 mt-0.5">{ci.biggest_money_win}</p></div>}
                  {ci.biggest_challenge && <div><p className="text-xs text-slate-500 font-medium">Challenge</p><p className="text-sm text-slate-700 mt-0.5">{ci.biggest_challenge}</p></div>}
                  {ci.help_needed && <div><p className="text-xs text-slate-500 font-medium">Help Needed</p><p className="text-sm text-slate-700 mt-0.5">{ci.help_needed}</p></div>}

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-600">Coach Response</p>
                    <Textarea
                      value={checkinResponse[ci.id] !== undefined ? checkinResponse[ci.id] : (ci.coach_response || '')}
                      onChange={e => setCheckinResponse(r => ({ ...r, [ci.id]: e.target.value }))}
                      placeholder="Leave a response for the client..."
                      rows={2}
                    />
                    <Button size="sm" onClick={() => saveCheckinResponse(ci.id)}>
                      {saved ? 'Saved!' : 'Save Response'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Notes tab */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowNoteModal(true)}>
              <Plus size={14} />
              Add Note
            </Button>
          </div>
          {clientNotes.length === 0 ? (
            <p className="text-sm text-slate-500">No notes yet.</p>
          ) : (
            clientNotes.map(note => (
              <Card key={note.id}>
                <CardContent className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="info">{COACH_NOTE_TYPE_LABELS[note.note_type]}</Badge>
                    <p className="text-xs text-slate-400">{format(parseISO(note.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <p className="text-sm text-slate-700">{note.note_content}</p>
                  {note.follow_up_needed && (
                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                      <AlertTriangle size={12} />
                      Follow-up needed{note.follow_up_due_date ? ` by ${format(parseISO(note.follow_up_due_date), 'MMM d, yyyy')}` : ''}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Alerts tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {clientAlerts.length === 0 ? (
            <AlertBanner variant="success">No unresolved alerts for this client.</AlertBanner>
          ) : (
            clientAlerts.map(alert => (
              <Card key={alert.id} className={alert.severity === 'high' ? 'border-red-200' : alert.severity === 'medium' ? 'border-amber-200' : ''}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.severity === 'high' ? 'danger' : alert.severity === 'medium' ? 'warning' : 'info'}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-slate-400">{format(parseISO(alert.created_at), 'MMM d, yyyy')}</p>
                      </div>
                      <p className="text-sm text-slate-700">{alert.alert_message}</p>
                      {alert.severity === 'high' && (
                        <p className="text-xs text-red-600">This may be outside the scope of coaching. Consider referring to a nonprofit credit counselor, legal aid, or bankruptcy attorney.</p>
                      )}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>Resolve</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tasks tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {clientTasks.map(task => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="w-full flex items-start gap-3 text-left bg-white border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors"
            >
              <div className={`mt-0.5 shrink-0 ${task.completed ? 'text-teal-500' : 'text-slate-300'}`}>
                {task.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
              </div>
              <div>
                <p className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.task_name}</p>
                <p className="text-xs text-slate-400 mt-0.5">Phase {task.phase} • {task.week_range}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Add note modal */}
      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Add Coach Note">
        <div className="space-y-4">
          <Select
            label="Note type"
            value={noteForm.note_type}
            onChange={e => setNoteForm(f => ({ ...f, note_type: e.target.value as CoachNoteType }))}
            options={NOTE_TYPE_OPTIONS}
          />
          <Textarea
            label="Note content"
            value={noteForm.note_content}
            onChange={e => setNoteForm(f => ({ ...f, note_content: e.target.value }))}
            placeholder="Write your coaching note here..."
            rows={4}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="followup"
              checked={noteForm.follow_up_needed}
              onChange={e => setNoteForm(f => ({ ...f, follow_up_needed: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="followup" className="text-sm text-slate-700">Follow-up needed</label>
          </div>
          {noteForm.follow_up_needed && (
            <Input
              label="Follow-up due date"
              type="date"
              value={noteForm.follow_up_due_date}
              onChange={e => setNoteForm(f => ({ ...f, follow_up_due_date: e.target.value }))}
            />
          )}
          <div className="flex gap-3">
            <Button onClick={addNote} disabled={!noteForm.note_content}>Save Note</Button>
            <Button variant="outline" onClick={() => setShowNoteModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
