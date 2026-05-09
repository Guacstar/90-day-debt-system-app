'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  totalStartingDebt, totalCurrentDebt, debtReduced, currentProgramWeek, formatCurrency
} from '@/lib/calculations';
import { PROGRAM_STATUS_LABELS } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Plus, Search, ArrowRight } from 'lucide-react';

const STATUS_OPTIONS = Object.entries(PROGRAM_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }));

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  onboarding: 'info', active: 'success', needs_attention: 'warning',
  completed: 'muted', paused: 'muted', referred_out: 'danger',
};

export default function ClientsPage() {
  const currentUser = useStore(s => s.currentUser);
  const clients = useStore(s => s.clients);
  const users = useStore(s => s.users);
  const debts = useStore(s => s.debts);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredClients = clients.filter(c => {
    const user = users.find(u => u.id === c.user_id);
    const matchesSearch = !search ||
      user?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user?.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || c.program_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 text-sm">Manage and monitor all client accounts.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredClients.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-500 text-sm">No clients found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Client', 'Start Date', 'Week', 'Status', 'Starting Debt', 'Current Debt', 'Reduced', 'Next Call', ''].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(client => {
                    const user = users.find(u => u.id === client.user_id);
                    const cd = debts.filter(d => d.client_id === client.id);
                    const starting = totalStartingDebt(cd);
                    const current = totalCurrentDebt(cd);
                    const reduced = debtReduced(cd);
                    const week = currentProgramWeek(client.program_start_date);
                    return (
                      <tr key={client.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-slate-800">{user?.full_name}</p>
                          <p className="text-xs text-slate-400">{user?.email}</p>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600 whitespace-nowrap">
                          {format(parseISO(client.program_start_date), 'MMM d, yyyy')}
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-slate-700">{week}</td>
                        <td className="px-5 py-3">
                          <Badge variant={STATUS_BADGE[client.program_status]}>{PROGRAM_STATUS_LABELS[client.program_status]}</Badge>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">{formatCurrency(starting)}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-rose-600">{formatCurrency(current)}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-emerald-600">{formatCurrency(reduced)}</td>
                        <td className="px-5 py-3 text-sm text-slate-500 whitespace-nowrap">
                          {client.next_coaching_call_date ? format(parseISO(client.next_coaching_call_date), 'MMM d') : '—'}
                        </td>
                        <td className="px-5 py-3">
                          <Link href={`/coach/clients/${client.id}`}>
                            <Button size="sm" variant="outline">
                              View <ArrowRight size={12} />
                            </Button>
                          </Link>
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
    </div>
  );
}
