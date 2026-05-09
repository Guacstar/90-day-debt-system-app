'use client';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import Link from 'next/link';
import {
  totalStartingDebt, totalCurrentDebt, debtReduced, percentageDebtPaid,
  currentProgramWeek, formatCurrency, formatPercent
} from '@/lib/calculations';
import { PROGRAM_STATUS_LABELS } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Users, AlertTriangle, ClipboardCheck, Bell, ArrowRight } from 'lucide-react';

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  onboarding: 'info',
  active: 'success',
  needs_attention: 'warning',
  completed: 'muted',
  paused: 'muted',
  referred_out: 'danger',
};

export default function CoachDashboard() {
  const currentUser = useStore(s => s.currentUser);
  const clients = useStore(s => s.clients);
  const users = useStore(s => s.users);
  const debts = useStore(s => s.debts);
  const checkins = useStore(s => s.checkins);
  const coachAlerts = useStore(s => s.coachAlerts);
  const coachNotes = useStore(s => s.coachNotes);
  const payments = useStore(s => s.payments);

  const allClients = clients; // coach sees all
  const unresolvedAlerts = coachAlerts.filter(a => !a.resolved);
  const highAlerts = unresolvedAlerts.filter(a => a.severity === 'high');

  const totalDebtAcrossClients = allClients.reduce((sum, c) => {
    const cd = debts.filter(d => d.client_id === c.id);
    return sum + totalCurrentDebt(cd);
  }, 0);

  const activeClients = allClients.filter(c => c.program_status === 'active').length;
  const needsAttention = allClients.filter(c => c.program_status === 'needs_attention').length;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Coach Dashboard</h1>
        <p className="text-slate-500 text-sm">Monitor your clients' progress at a glance.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Clients" value={String(allClients.length)} icon={<Users size={24} />} />
        <StatCard label="Active Clients" value={String(activeClients)} color="emerald" />
        <StatCard label="Needs Attention" value={String(needsAttention)} color={needsAttention > 0 ? 'amber' : 'default'} />
        <StatCard label="Unresolved Alerts" value={String(unresolvedAlerts.length)} color={unresolvedAlerts.length > 0 ? 'rose' : 'default'} icon={<Bell size={24} />} />
      </div>

      {/* High-priority alerts */}
      {highAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" />
              <p className="text-sm font-semibold text-red-800">{highAlerts.length} High-Priority Alert{highAlerts.length > 1 ? 's' : ''}</p>
            </div>
            <Link href="/coach/alerts">
              <Button size="sm" variant="danger">View Alerts</Button>
            </Link>
          </div>
          <div className="space-y-2">
            {highAlerts.slice(0, 3).map(a => {
              const c = clients.find(cl => cl.id === a.client_id);
              const u = users.find(u => u.id === c?.user_id);
              return (
                <div key={a.id} className="text-sm text-red-700">
                  <strong>{u?.full_name}:</strong> {a.alert_message}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Client list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Clients ({allClients.length})</CardTitle>
            <Link href="/coach/clients">
              <Button size="sm" variant="outline">
                View All <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {allClients.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-500 text-sm">No clients yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Client', 'Week', 'Status', 'Starting Debt', 'Current Debt', 'Reduced', 'Stress', 'Confidence', 'Alerts', ''].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allClients.map(client => {
                    const user = users.find(u => u.id === client.user_id);
                    const cd = debts.filter(d => d.client_id === client.id);
                    const starting = totalStartingDebt(cd);
                    const current = totalCurrentDebt(cd);
                    const reduced = debtReduced(cd);
                    const pct = percentageDebtPaid(cd);
                    const week = currentProgramWeek(client.program_start_date);
                    const clientAlerts = unresolvedAlerts.filter(a => a.client_id === client.id);
                    const clientCheckins = checkins.filter(c => c.client_id === client.id);
                    const lastCheckin = clientCheckins.slice(-1)[0];

                    return (
                      <tr key={client.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-slate-800">{user?.full_name}</p>
                          <p className="text-xs text-slate-400">{user?.email}</p>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600 font-medium">{week}</td>
                        <td className="px-5 py-3">
                          <Badge variant={STATUS_BADGE[client.program_status]}>{PROGRAM_STATUS_LABELS[client.program_status]}</Badge>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">{formatCurrency(starting)}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-rose-600">{formatCurrency(current)}</td>
                        <td className="px-5 py-3">
                          <div>
                            <p className="text-sm font-semibold text-emerald-600">{formatCurrency(reduced)}</p>
                            <p className="text-xs text-slate-400">{formatPercent(pct)}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-sm font-semibold ${client.current_stress_level >= 8 ? 'text-red-600' : 'text-slate-700'}`}>
                            {client.current_stress_level}/10
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-sm font-semibold ${client.current_confidence_level <= 3 ? 'text-red-600' : 'text-slate-700'}`}>
                            {client.current_confidence_level}/10
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {clientAlerts.length > 0 ? (
                            <Badge variant="danger">{clientAlerts.length}</Badge>
                          ) : (
                            <Badge variant="muted">0</Badge>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <Link href={`/coach/clients/${client.id}`}>
                            <Button size="sm" variant="outline">View</Button>
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
