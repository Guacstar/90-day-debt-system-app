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
import { formatCurrency } from '@/lib/calculations';
import { Payment, PaymentStatus } from '@/lib/types';
import { PAYMENT_STATUS_LABELS } from '@/lib/utils';
import { Plus, Pencil, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';

const STATUS_BADGE: Record<PaymentStatus, 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  upcoming: 'info',
  paid: 'success',
  missed: 'danger',
  autopay_enabled: 'success',
  needs_attention: 'warning',
};

const STATUS_OPTIONS = Object.entries(PAYMENT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }));

const emptyForm = {
  debt_id: '', due_date: new Date().toISOString().split('T')[0], minimum_amount_due: '',
  amount_paid: '', extra_payment_amount: '', payment_status: 'upcoming' as PaymentStatus,
  autopay_status: false, notes: '',
};

export default function PaymentsPage() {
  const currentUser = useStore(s => s.currentUser);
  const currentClient = useStore(s => s.currentClient);
  const clients = useStore(s => s.clients);
  const debts = useStore(s => s.debts);
  const payments = useStore(s => s.payments);
  const addPayment = useStore(s => s.addPayment);
  const updatePayment = useStore(s => s.updatePayment);
  const deletePayment = useStore(s => s.deletePayment);

  const client = currentClient || clients.find(c => c.user_id === currentUser?.id);
  const clientDebts = debts.filter(d => d.client_id === client?.id);
  const clientPayments = payments.filter(p => p.client_id === client?.id);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const DEBT_OPTIONS = clientDebts.map(d => ({ value: d.id, label: d.creditor_name }));

  function setF(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function openAdd() {
    setForm({ ...emptyForm, debt_id: clientDebts[0]?.id || '' });
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(p: Payment) {
    setForm({
      debt_id: p.debt_id, due_date: p.due_date, minimum_amount_due: String(p.minimum_amount_due),
      amount_paid: String(p.amount_paid), extra_payment_amount: String(p.extra_payment_amount),
      payment_status: p.payment_status, autopay_status: p.autopay_status, notes: p.notes,
    });
    setEditingId(p.id);
    setShowModal(true);
  }

  function handleSave() {
    if (!client) return;
    const data = {
      client_id: client.id, debt_id: form.debt_id, due_date: form.due_date,
      minimum_amount_due: parseFloat(form.minimum_amount_due) || 0,
      amount_paid: parseFloat(form.amount_paid) || 0,
      extra_payment_amount: parseFloat(form.extra_payment_amount) || 0,
      payment_status: form.payment_status, autopay_status: form.autopay_status, notes: form.notes,
    };
    if (editingId) updatePayment(editingId, data);
    else addPayment(data);
    setShowModal(false);
  }

  const now = new Date();
  const dueSoon = clientPayments.filter(p => {
    if (p.payment_status === 'paid') return false;
    const due = parseISO(p.due_date);
    const diff = differenceInDays(due, now);
    return diff >= 0 && diff <= 7;
  });
  const missed = clientPayments.filter(p => p.payment_status === 'missed');
  const needsAttention = clientPayments.filter(p => p.payment_status === 'needs_attention');
  const totalPaid = clientPayments.filter(p => p.payment_status === 'paid').reduce((s, p) => s + p.amount_paid, 0);
  const totalExtra = clientPayments.filter(p => p.payment_status === 'paid').reduce((s, p) => s + p.extra_payment_amount, 0);

  const sortedPayments = [...clientPayments].sort((a, b) => a.due_date.localeCompare(b.due_date));

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Calendar</h1>
          <p className="text-slate-500 text-sm">Track all your debt payments in one place.</p>
        </div>
        <Button onClick={openAdd} disabled={clientDebts.length === 0}>
          <Plus size={16} />
          Add Payment
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Paid" value={formatCurrency(totalPaid)} color="emerald" />
        <StatCard label="Extra Payments" value={formatCurrency(totalExtra)} sub="Above minimums" color="teal" />
        <StatCard label="Due in 7 Days" value={String(dueSoon.length)} color={dueSoon.length > 0 ? 'amber' : 'default'} />
        <StatCard label="Missed Payments" value={String(missed.length)} color={missed.length > 0 ? 'rose' : 'default'} />
      </div>

      {missed.length > 0 && (
        <AlertBanner variant="danger">
          <strong>You have {missed.length} missed payment{missed.length > 1 ? 's' : ''}.</strong> Contact your creditor as soon as possible to discuss your options.
        </AlertBanner>
      )}

      {dueSoon.length > 0 && (
        <AlertBanner variant="warning">
          <strong>{dueSoon.length} payment{dueSoon.length > 1 ? 's are' : ' is'} due in the next 7 days.</strong> Make sure you have funds ready.
        </AlertBanner>
      )}

      <Card>
        <CardHeader><CardTitle>All Payments ({sortedPayments.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {sortedPayments.length === 0 ? (
            <div className="px-5 py-12 text-center space-y-2">
              <Calendar size={32} className="text-slate-300 mx-auto" />
              <p className="text-slate-500 text-sm">No payments added yet. Add your debts first, then log your payments here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Debt', 'Due Date', 'Min. Due', 'Paid', 'Extra', 'Status', 'Autopay', ''].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedPayments.map(p => {
                    const debt = clientDebts.find(d => d.id === p.debt_id);
                    const due = parseISO(p.due_date);
                    const daysDiff = differenceInDays(due, now);
                    const isUrgent = p.payment_status !== 'paid' && daysDiff >= 0 && daysDiff <= 7;
                    return (
                      <tr key={p.id} className={`border-b border-slate-50 hover:bg-slate-50 ${isUrgent ? 'bg-amber-50/50' : ''} ${p.payment_status === 'missed' ? 'bg-red-50/50' : ''}`}>
                        <td className="px-5 py-3 text-sm font-medium text-slate-700">{debt?.creditor_name || '—'}</td>
                        <td className="px-5 py-3 text-sm text-slate-600 whitespace-nowrap">
                          {format(due, 'MMM d, yyyy')}
                          {isUrgent && <span className="ml-1 text-xs text-amber-600 font-medium">({daysDiff === 0 ? 'Today' : `${daysDiff}d`})</span>}
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-slate-700">{formatCurrency(p.minimum_amount_due)}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{p.amount_paid > 0 ? formatCurrency(p.amount_paid) : '—'}</td>
                        <td className="px-5 py-3 text-sm text-emerald-600">{p.extra_payment_amount > 0 ? `+${formatCurrency(p.extra_payment_amount)}` : '—'}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <Badge variant={STATUS_BADGE[p.payment_status]}>{PAYMENT_STATUS_LABELS[p.payment_status]}</Badge>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={p.autopay_status ? 'success' : 'muted'}>{p.autopay_status ? 'On' : 'Off'}</Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(p)} className="p-1.5 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50"><Pencil size={14} /></button>
                            <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Payment' : 'Add Payment'} size="lg">
        <div className="space-y-4">
          <Select label="Debt" value={form.debt_id} onChange={e => setF('debt_id', e.target.value)} options={DEBT_OPTIONS} placeholder="Select a debt" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Due date" type="date" value={form.due_date} onChange={e => setF('due_date', e.target.value)} />
            <Input label="Minimum amount due ($)" type="number" value={form.minimum_amount_due} onChange={e => setF('minimum_amount_due', e.target.value)} placeholder="0.00" min="0" />
            <Input label="Amount paid ($)" type="number" value={form.amount_paid} onChange={e => setF('amount_paid', e.target.value)} placeholder="0.00" min="0" />
            <Input label="Extra payment ($)" type="number" value={form.extra_payment_amount} onChange={e => setF('extra_payment_amount', e.target.value)} placeholder="0.00" min="0" />
          </div>
          <Select label="Payment status" value={form.payment_status} onChange={e => setF('payment_status', e.target.value)} options={STATUS_OPTIONS} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="autopay-p" checked={form.autopay_status} onChange={e => setF('autopay_status', e.target.checked)} className="rounded" />
            <label htmlFor="autopay-p" className="text-sm text-slate-700">Autopay enabled</label>
          </div>
          <Textarea label="Notes (optional)" value={form.notes} onChange={e => setF('notes', e.target.value)} rows={2} />
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={!form.debt_id}>Save</Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Payment" size="sm">
        <p className="text-sm text-slate-600 mb-4">Delete this payment record?</p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={() => { if (deleteConfirm) { deletePayment(deleteConfirm); setDeleteConfirm(null); } }}>Delete</Button>
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
