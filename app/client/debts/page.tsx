'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { AlertBanner } from '@/components/ui/alert-banner';
import {
  totalStartingDebt, totalCurrentDebt, debtReduced, percentageDebtPaid,
  totalMinimumPayments, highestInterestDebt, smallestBalanceDebt,
  snowballOrder, avalancheOrder, formatCurrency, formatPercent
} from '@/lib/calculations';
import { Debt, DebtType, DebtStatus } from '@/lib/types';
import { DEBT_TYPE_LABELS, DEBT_STATUS_LABELS } from '@/lib/utils';
import { Plus, Pencil, Trash2, TrendingDown, CreditCard, Target, Flame } from 'lucide-react';

const DEBT_TYPE_OPTIONS = Object.entries(DEBT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));
const DEBT_STATUS_OPTIONS = Object.entries(DEBT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }));

const STATUS_BADGE: Record<DebtStatus, 'success' | 'warning' | 'danger' | 'muted' | 'default'> = {
  current: 'success',
  late: 'warning',
  in_collections: 'danger',
  paid_off: 'muted',
  needs_attention: 'warning',
};

const emptyForm = {
  creditor_name: '', debt_type: 'credit_card' as DebtType, starting_balance: '',
  current_balance: '', interest_rate: '', minimum_payment: '', due_date: '',
  autopay_enabled: false, status: 'current' as DebtStatus, notes: '',
};

export default function DebtsPage() {
  const currentUser = useStore(s => s.currentUser);
  const currentClient = useStore(s => s.currentClient);
  const clients = useStore(s => s.clients);
  const debts = useStore(s => s.debts);
  const addDebt = useStore(s => s.addDebt);
  const updateDebt = useStore(s => s.updateDebt);
  const deleteDebt = useStore(s => s.deleteDebt);

  const client = currentClient || clients.find(c => c.user_id === currentUser?.id);
  const clientDebts = debts.filter(d => d.client_id === client?.id);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function setF(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function openAdd() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(debt: Debt) {
    setForm({
      creditor_name: debt.creditor_name,
      debt_type: debt.debt_type,
      starting_balance: String(debt.starting_balance),
      current_balance: String(debt.current_balance),
      interest_rate: String(debt.interest_rate),
      minimum_payment: String(debt.minimum_payment),
      due_date: String(debt.due_date),
      autopay_enabled: debt.autopay_enabled,
      status: debt.status,
      notes: debt.notes,
    });
    setEditingId(debt.id);
    setShowModal(true);
  }

  function handleSave() {
    if (!client) return;
    const data = {
      client_id: client.id,
      creditor_name: form.creditor_name,
      debt_type: form.debt_type,
      starting_balance: parseFloat(form.starting_balance) || 0,
      current_balance: parseFloat(form.current_balance) || 0,
      interest_rate: parseFloat(form.interest_rate) || 0,
      minimum_payment: parseFloat(form.minimum_payment) || 0,
      due_date: parseInt(form.due_date) || 1,
      autopay_enabled: form.autopay_enabled,
      status: form.status,
      notes: form.notes,
    };
    if (editingId) {
      updateDebt(editingId, data);
    } else {
      addDebt(data);
    }
    setShowModal(false);
  }

  const startingDebt = totalStartingDebt(clientDebts);
  const currentDebt = totalCurrentDebt(clientDebts);
  const reduced = debtReduced(clientDebts);
  const paidPct = percentageDebtPaid(clientDebts);
  const minPayments = totalMinimumPayments(clientDebts);
  const highestInterest = highestInterestDebt(clientDebts);
  const smallestBalance = smallestBalanceDebt(clientDebts);
  const snowball = snowballOrder(clientDebts);
  const avalanche = avalancheOrder(clientDebts);

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Debts</h1>
          <p className="text-slate-500 text-sm">Track and manage all your debts in one place.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} />
          Add Debt
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Starting Debt" value={formatCurrency(startingDebt)} color="default" />
        <StatCard label="Total Current Debt" value={formatCurrency(currentDebt)} color="rose" />
        <StatCard label="Total Debt Reduced" value={formatCurrency(reduced)} sub={formatPercent(paidPct) + ' paid'} color="emerald" />
        <StatCard label="Min. Payments / Mo" value={formatCurrency(minPayments)} color="default" />
      </div>

      {/* Quick insights */}
      {clientDebts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent>
              <div className="flex items-start gap-3">
                <Flame size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Highest Interest</p>
                  <p className="font-semibold text-slate-800">{highestInterest?.creditor_name || '—'}</p>
                  <p className="text-xs text-slate-500">{highestInterest ? `${highestInterest.interest_rate}% APR • ${formatCurrency(highestInterest.current_balance)}` : ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-start gap-3">
                <Target size={20} className="text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Smallest Balance</p>
                  <p className="font-semibold text-slate-800">{smallestBalance?.creditor_name || '—'}</p>
                  <p className="text-xs text-slate-500">{smallestBalance ? `${formatCurrency(smallestBalance.current_balance)} • Snowball target` : ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Debt list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Debts ({clientDebts.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {clientDebts.length === 0 ? (
            <div className="px-5 py-12 text-center space-y-3">
              <CreditCard size={32} className="text-slate-300 mx-auto" />
              <p className="text-slate-500">No debts added yet.</p>
              <Button onClick={openAdd} variant="outline" size="sm">Add Your First Debt</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Creditor', 'Type', 'Balance', 'Starting', 'Rate', 'Min. Payment', 'Due', 'Status', ''].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clientDebts.map((debt, i) => (
                    <tr key={debt.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-slate-800">{debt.creditor_name}</p>
                        {debt.autopay_enabled && <Badge variant="success" className="mt-0.5">Autopay</Badge>}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600 whitespace-nowrap">{DEBT_TYPE_LABELS[debt.debt_type]}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-rose-600 whitespace-nowrap">{formatCurrency(debt.current_balance)}</td>
                      <td className="px-5 py-3 text-sm text-slate-500 whitespace-nowrap">{formatCurrency(debt.starting_balance)}</td>
                      <td className="px-5 py-3 text-sm text-slate-600 whitespace-nowrap">{debt.interest_rate}%</td>
                      <td className="px-5 py-3 text-sm text-slate-600 whitespace-nowrap">{formatCurrency(debt.minimum_payment)}/mo</td>
                      <td className="px-5 py-3 text-sm text-slate-600 whitespace-nowrap">Day {debt.due_date}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <Badge variant={STATUS_BADGE[debt.status]}>{DEBT_STATUS_LABELS[debt.status]}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(debt)} className="p-1.5 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteConfirm(debt.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payoff order */}
      {clientDebts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Snowball Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-slate-500 mb-3">Smallest balance first — fastest motivation wins.</p>
              {snowball.map((d, i) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{d.creditor_name}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 shrink-0">{formatCurrency(d.current_balance)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Avalanche Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-slate-500 mb-3">Highest interest first — most efficient mathematically.</p>
              {avalanche.map((d, i) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{d.creditor_name}</p>
                  </div>
                  <span className="text-sm text-slate-500 shrink-0">{d.interest_rate}%</span>
                  <span className="text-sm font-semibold text-slate-800 shrink-0">{formatCurrency(d.current_balance)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Debt' : 'Add Debt'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Creditor name" value={form.creditor_name} onChange={e => setF('creditor_name', e.target.value)} placeholder="e.g. Chase Sapphire" required />
            <Select label="Debt type" value={form.debt_type} onChange={e => setF('debt_type', e.target.value)} options={DEBT_TYPE_OPTIONS} />
            <Input label="Starting balance ($)" type="number" value={form.starting_balance} onChange={e => setF('starting_balance', e.target.value)} placeholder="0.00" min="0" step="0.01" />
            <Input label="Current balance ($)" type="number" value={form.current_balance} onChange={e => setF('current_balance', e.target.value)} placeholder="0.00" min="0" step="0.01" />
            <Input label="Interest rate (%)" type="number" value={form.interest_rate} onChange={e => setF('interest_rate', e.target.value)} placeholder="e.g. 19.99" min="0" step="0.01" />
            <Input label="Minimum monthly payment ($)" type="number" value={form.minimum_payment} onChange={e => setF('minimum_payment', e.target.value)} placeholder="0.00" min="0" step="0.01" />
            <Input label="Due date (day of month)" type="number" value={form.due_date} onChange={e => setF('due_date', e.target.value)} placeholder="e.g. 15" min="1" max="31" />
            <Select label="Status" value={form.status} onChange={e => setF('status', e.target.value)} options={DEBT_STATUS_OPTIONS} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="autopay" checked={form.autopay_enabled} onChange={e => setF('autopay_enabled', e.target.checked)} className="rounded" />
            <label htmlFor="autopay" className="text-sm text-slate-700">Autopay enabled</label>
          </div>
          <Textarea label="Notes (optional)" value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="Any additional notes about this debt..." rows={2} />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={!form.creditor_name}>
              {editingId ? 'Save Changes' : 'Add Debt'}
            </Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Debt" size="sm">
        <p className="text-sm text-slate-600 mb-4">Are you sure you want to delete this debt? This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => { if (deleteConfirm) { deleteDebt(deleteConfirm); setDeleteConfirm(null); } }}>
            Delete
          </Button>
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
