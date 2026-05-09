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
  totalMonthlyIncome, totalMonthlyExpenses, monthlyFlowSurplus,
  suggestedWeeklySpendingLimit, totalMinimumPayments, formatCurrency
} from '@/lib/calculations';
import { CashFlowEntry } from '@/lib/types';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const INCOME_CATEGORIES = [
  { value: 'Monthly Income', label: 'Monthly Income' },
  { value: 'Additional Income', label: 'Additional Income' },
  { value: 'Side Income', label: 'Side Income' },
  { value: 'Other Income', label: 'Other Income' },
];

const EXPENSE_CATEGORIES = [
  { value: 'Housing', label: 'Housing (Rent/Mortgage)' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Food/Groceries', label: 'Food/Groceries' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Insurance', label: 'Insurance' },
  { value: 'Phone/Internet', label: 'Phone/Internet' },
  { value: 'Childcare/Family', label: 'Childcare/Family' },
  { value: 'Minimum Debt Payments', label: 'Minimum Debt Payments' },
  { value: 'Subscriptions', label: 'Subscriptions' },
  { value: 'Dining Out', label: 'Dining Out' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Other Fixed', label: 'Other Fixed Expenses' },
  { value: 'Other Variable', label: 'Other Variable Expenses' },
];

const emptyForm = { category: '', amount: '', entry_type: 'expense' as 'income' | 'expense', expense_type: 'fixed' as 'fixed' | 'variable', essential: false, notes: '' };

const PIE_COLORS = ['#0d9488', '#0891b2', '#7c3aed', '#d97706', '#dc2626', '#059669', '#ea580c', '#6366f1'];

export default function CashFlowPage() {
  const currentUser = useStore(s => s.currentUser);
  const currentClient = useStore(s => s.currentClient);
  const clients = useStore(s => s.clients);
  const cashFlowEntries = useStore(s => s.cashFlowEntries);
  const addCashFlowEntry = useStore(s => s.addCashFlowEntry);
  const updateCashFlowEntry = useStore(s => s.updateCashFlowEntry);
  const deleteCashFlowEntry = useStore(s => s.deleteCashFlowEntry);

  const client = currentClient || clients.find(c => c.user_id === currentUser?.id);
  const entries = cashFlowEntries.filter(e => e.client_id === client?.id);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [tab, setTab] = useState<'income' | 'expense'>('income');

  function setF(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function openAdd(type: 'income' | 'expense') {
    setForm({ ...emptyForm, entry_type: type, category: type === 'income' ? 'Monthly Income' : 'Housing' });
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(entry: CashFlowEntry) {
    setForm({
      category: entry.category,
      amount: String(entry.amount),
      entry_type: entry.entry_type,
      expense_type: (entry.expense_type as 'fixed' | 'variable') || 'fixed',
      essential: !!entry.essential,
      notes: entry.notes,
    });
    setEditingId(entry.id);
    setShowModal(true);
  }

  function handleSave() {
    if (!client) return;
    const data = {
      client_id: client.id,
      category: form.category,
      amount: parseFloat(form.amount) || 0,
      entry_type: form.entry_type,
      expense_type: form.expense_type,
      essential: form.essential,
      notes: form.notes,
    };
    if (editingId) updateCashFlowEntry(editingId, data);
    else addCashFlowEntry(data);
    setShowModal(false);
  }

  const income = entries.filter(e => e.entry_type === 'income');
  const expenses = entries.filter(e => e.entry_type === 'expense');
  const totalIncome = totalMonthlyIncome(entries);
  const totalExpenses = totalMonthlyExpenses(entries);
  const surplus = monthlyFlowSurplus(entries);
  const weeklyLimit = suggestedWeeklySpendingLimit(entries);

  const pieData = expenses.map(e => ({ name: e.category, value: e.amount }));

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cash Flow Audit</h1>
        <p className="text-slate-500 text-sm">Track your monthly income and expenses to find extra money for debt payoff.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Income" value={formatCurrency(totalIncome)} icon={<TrendingUp size={24} />} color="emerald" />
        <StatCard label="Monthly Expenses" value={formatCurrency(totalExpenses)} icon={<TrendingDown size={24} />} color="rose" />
        <StatCard
          label="Monthly Surplus"
          value={formatCurrency(Math.abs(surplus))}
          sub={surplus >= 0 ? 'Available for debt' : 'Over budget'}
          color={surplus >= 0 ? 'teal' : 'rose'}
        />
        <StatCard label="Weekly Spending Limit" value={formatCurrency(weeklyLimit)} sub="Variable expenses / 4.33" color="blue" />
      </div>

      {surplus < 0 && (
        <AlertBanner variant="warning">
          <strong>Your expenses exceed your income by {formatCurrency(Math.abs(surplus))}/month.</strong> Review your expense entries and look for areas to reduce spending.
        </AlertBanner>
      )}

      {surplus > 0 && (
        <AlertBanner variant="success">
          You have <strong>{formatCurrency(surplus)}</strong> per month potentially available for extra debt payments. Even putting half of this toward your target debt can make a big difference.
        </AlertBanner>
      )}

      {/* Tab selector */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {(['income', 'expense'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t === 'income' ? 'Income' : 'Expenses'}
          </button>
        ))}
      </div>

      {tab === 'income' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Income ({income.length} items)</CardTitle>
              <Button size="sm" onClick={() => openAdd('income')}>
                <Plus size={14} />
                Add Income
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {income.length === 0 ? (
              <div className="px-5 py-10 text-center text-slate-500 text-sm">No income entries yet.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Category', 'Amount', 'Notes', ''].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {income.map(e => (
                    <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-5 py-3 text-sm font-medium text-slate-700">{e.category}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-emerald-600">{formatCurrency(e.amount)}</td>
                      <td className="px-5 py-3 text-sm text-slate-500">{e.notes || '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(e)} className="p-1.5 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50"><Pencil size={14} /></button>
                          <button onClick={() => deleteCashFlowEntry(e.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50">
                    <td className="px-5 py-3 text-sm font-bold text-slate-800">Total Income</td>
                    <td className="px-5 py-3 text-sm font-bold text-emerald-700">{formatCurrency(totalIncome)}</td>
                    <td /><td />
                  </tr>
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'expense' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Expenses ({expenses.length} items)</CardTitle>
                <Button size="sm" onClick={() => openAdd('expense')}>
                  <Plus size={14} />
                  Add Expense
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {expenses.length === 0 ? (
                <div className="px-5 py-10 text-center text-slate-500 text-sm">No expense entries yet.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Category', 'Amount', 'Type', 'Essential', 'Notes', ''].map(h => (
                        <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(e => (
                      <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-5 py-3 text-sm font-medium text-slate-700">{e.category}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-rose-600">{formatCurrency(e.amount)}</td>
                        <td className="px-5 py-3"><Badge variant={e.expense_type === 'fixed' ? 'info' : 'warning'}>{e.expense_type}</Badge></td>
                        <td className="px-5 py-3"><Badge variant={e.essential ? 'success' : 'muted'}>{e.essential ? 'Yes' : 'No'}</Badge></td>
                        <td className="px-5 py-3 text-sm text-slate-500">{e.notes || '—'}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(e)} className="p-1.5 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50"><Pencil size={14} /></button>
                            <button onClick={() => deleteCashFlowEntry(e.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-rose-50">
                      <td className="px-5 py-3 text-sm font-bold text-slate-800">Total Expenses</td>
                      <td className="px-5 py-3 text-sm font-bold text-rose-700">{formatCurrency(totalExpenses)}</td>
                      <td /><td /><td /><td />
                    </tr>
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {expenses.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={false} labelLine={false} fontSize={11}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [formatCurrency(Number(v))]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Entry' : `Add ${form.entry_type === 'income' ? 'Income' : 'Expense'}`}>
        <div className="space-y-4">
          <Select
            label="Category"
            value={form.category}
            onChange={e => setF('category', e.target.value)}
            options={form.entry_type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES}
          />
          <Input label="Monthly amount ($)" type="number" value={form.amount} onChange={e => setF('amount', e.target.value)} placeholder="0.00" min="0" step="0.01" />
          {form.entry_type === 'expense' && (
            <>
              <Select
                label="Expense type"
                value={form.expense_type}
                onChange={e => setF('expense_type', e.target.value)}
                options={[{ value: 'fixed', label: 'Fixed (same every month)' }, { value: 'variable', label: 'Variable (changes monthly)' }]}
              />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="essential" checked={form.essential} onChange={e => setF('essential', e.target.checked)} className="rounded" />
                <label htmlFor="essential" className="text-sm text-slate-700">Essential expense (housing, food, utilities, etc.)</label>
              </div>
            </>
          )}
          <Textarea label="Notes (optional)" value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="Any notes..." rows={2} />
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={!form.category || !form.amount}>Save</Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
