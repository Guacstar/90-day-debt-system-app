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
import { totalSpendingLeaks, totalPotentialSavings, confirmedMonthlySavings, formatCurrency } from '@/lib/calculations';
import { SpendingLeak, SpendingLeakCategory, SpendingLeakDecision } from '@/lib/types';
import { SPENDING_LEAK_CATEGORY_LABELS, SPENDING_LEAK_DECISION_LABELS } from '@/lib/utils';
import { Plus, Pencil, Trash2, Scissors, TrendingDown } from 'lucide-react';

const CATEGORY_OPTIONS = Object.entries(SPENDING_LEAK_CATEGORY_LABELS).map(([v, l]) => ({ value: v, label: l }));
const DECISION_OPTIONS = Object.entries(SPENDING_LEAK_DECISION_LABELS).map(([v, l]) => ({ value: v, label: l }));

const DECISION_BADGE: Record<SpendingLeakDecision, 'success' | 'danger' | 'warning' | 'muted'> = {
  keep: 'muted', cancel: 'danger', reduce: 'warning', review_later: 'info' as any,
};

const emptyForm = { name: '', category: 'subscription' as SpendingLeakCategory, monthly_cost: '', decision: 'review_later' as SpendingLeakDecision, potential_monthly_savings: '', notes: '' };

export default function SpendingLeaksPage() {
  const currentUser = useStore(s => s.currentUser);
  const currentClient = useStore(s => s.currentClient);
  const clients = useStore(s => s.clients);
  const spendingLeaks = useStore(s => s.spendingLeaks);
  const addSpendingLeak = useStore(s => s.addSpendingLeak);
  const updateSpendingLeak = useStore(s => s.updateSpendingLeak);
  const deleteSpendingLeak = useStore(s => s.deleteSpendingLeak);

  const client = currentClient || clients.find(c => c.user_id === currentUser?.id);
  const leaks = spendingLeaks.filter(l => l.client_id === client?.id);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function setF(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function openAdd() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(leak: SpendingLeak) {
    setForm({
      name: leak.name, category: leak.category, monthly_cost: String(leak.monthly_cost),
      decision: leak.decision, potential_monthly_savings: String(leak.potential_monthly_savings), notes: leak.notes,
    });
    setEditingId(leak.id);
    setShowModal(true);
  }

  function handleSave() {
    if (!client) return;
    const data = {
      client_id: client.id,
      name: form.name,
      category: form.category,
      monthly_cost: parseFloat(form.monthly_cost) || 0,
      decision: form.decision,
      potential_monthly_savings: parseFloat(form.potential_monthly_savings) || 0,
      notes: form.notes,
    };
    if (editingId) updateSpendingLeak(editingId, data);
    else addSpendingLeak(data);
    setShowModal(false);
  }

  const totalLeaks = totalSpendingLeaks(leaks);
  const potentialSavings = totalPotentialSavings(leaks);
  const confirmedSavings = confirmedMonthlySavings(leaks);

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Spending Leak Audit</h1>
          <p className="text-slate-500 text-sm">Find and cut the spending that's slowing your debt payoff.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} />
          Add Leak
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Monthly Leaks" value={formatCurrency(totalLeaks)} color="rose" />
        <StatCard label="Potential Savings" value={formatCurrency(potentialSavings)} color="amber" />
        <StatCard label="Confirmed Savings" value={formatCurrency(confirmedSavings)} sub="From Cancel + Reduce decisions" color="emerald" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 bg-teal-50 rounded-lg p-3">
            <Scissors size={18} className="text-teal-600 shrink-0 mt-0.5" />
            <p className="text-sm text-teal-800">Review each item and decide: <strong>Keep</strong> (essential), <strong>Cancel</strong> (cut it), <strong>Reduce</strong> (spend less), or <strong>Review Later</strong>. Every dollar freed up goes toward your debt.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spending Leaks ({leaks.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {leaks.length === 0 ? (
            <div className="px-5 py-12 text-center space-y-3">
              <Scissors size={32} className="text-slate-300 mx-auto" />
              <p className="text-slate-500">No spending leaks added yet.</p>
              <p className="text-sm text-slate-400">Think about subscriptions, dining out, delivery apps, and impulse purchases.</p>
              <Button onClick={openAdd} variant="outline" size="sm">Add First Leak</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Name', 'Category', 'Monthly Cost', 'Decision', 'Potential Savings', 'Notes', ''].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaks.map(leak => (
                    <tr key={leak.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-5 py-3 text-sm font-medium text-slate-700">{leak.name}</td>
                      <td className="px-5 py-3 text-sm text-slate-500 whitespace-nowrap">{SPENDING_LEAK_CATEGORY_LABELS[leak.category]}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-rose-600">{formatCurrency(leak.monthly_cost)}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <Badge variant={DECISION_BADGE[leak.decision]}>{SPENDING_LEAK_DECISION_LABELS[leak.decision]}</Badge>
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-emerald-600">{formatCurrency(leak.potential_monthly_savings)}</td>
                      <td className="px-5 py-3 text-sm text-slate-500 max-w-xs truncate">{leak.notes || '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(leak)} className="p-1.5 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50"><Pencil size={14} /></button>
                          <button onClick={() => setDeleteConfirm(leak.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Spending Leak' : 'Add Spending Leak'}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. Netflix, DoorDash" required />
          <Select label="Category" value={form.category} onChange={e => setF('category', e.target.value)} options={CATEGORY_OPTIONS} />
          <Input label="Monthly cost ($)" type="number" value={form.monthly_cost} onChange={e => setF('monthly_cost', e.target.value)} placeholder="0.00" min="0" step="0.01" />
          <Select label="Decision" value={form.decision} onChange={e => setF('decision', e.target.value)} options={DECISION_OPTIONS} />
          <Input label="Potential monthly savings ($)" type="number" value={form.potential_monthly_savings} onChange={e => setF('potential_monthly_savings', e.target.value)} placeholder="0.00" min="0" step="0.01" />
          <Textarea label="Notes (optional)" value={form.notes} onChange={e => setF('notes', e.target.value)} rows={2} />
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={!form.name}>Save</Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Remove Spending Leak" size="sm">
        <p className="text-sm text-slate-600 mb-4">Remove this spending leak from your list?</p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => { if (deleteConfirm) { deleteSpendingLeak(deleteConfirm); setDeleteConfirm(null); } }}>Remove</Button>
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
