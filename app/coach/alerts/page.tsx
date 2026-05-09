'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertBanner } from '@/components/ui/alert-banner';
import { AlertSeverity } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Bell, CheckCircle } from 'lucide-react';

const SEVERITY_BADGE: Record<AlertSeverity, 'danger' | 'warning' | 'info'> = {
  high: 'danger', medium: 'warning', low: 'info',
};

export default function AlertsPage() {
  const clients = useStore(s => s.clients);
  const users = useStore(s => s.users);
  const coachAlerts = useStore(s => s.coachAlerts);
  const resolveAlert = useStore(s => s.resolveAlert);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'high'>('unresolved');

  const filtered = coachAlerts.filter(a => {
    if (filter === 'unresolved') return !a.resolved;
    if (filter === 'high') return !a.resolved && a.severity === 'high';
    return true;
  }).sort((a, b) => {
    const sev = { high: 0, medium: 1, low: 2 };
    if (sev[a.severity] !== sev[b.severity]) return sev[a.severity] - sev[b.severity];
    return b.created_at.localeCompare(a.created_at);
  });

  const unresolved = coachAlerts.filter(a => !a.resolved);
  const high = unresolved.filter(a => a.severity === 'high');
  const medium = unresolved.filter(a => a.severity === 'medium');

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Coach Alerts</h1>
        <p className="text-slate-500 text-sm">Automated alerts based on client activity and check-ins.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Unresolved" value={String(unresolved.length)} color={unresolved.length > 0 ? 'rose' : 'default'} />
        <StatCard label="High Priority" value={String(high.length)} color={high.length > 0 ? 'rose' : 'default'} />
        <StatCard label="Medium Priority" value={String(medium.length)} color={medium.length > 0 ? 'amber' : 'default'} />
      </div>

      {high.length > 0 && (
        <AlertBanner variant="danger">
          <strong>{high.length} high-priority alert{high.length > 1 ? 's' : ''} require your attention.</strong> These clients may need immediate follow-up or referral.
        </AlertBanner>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {([['unresolved', 'Unresolved'], ['high', 'High Priority'], ['all', 'All']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === val ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <CheckCircle size={32} className="text-emerald-400 mx-auto" />
            <p className="text-slate-500">No alerts matching this filter.</p>
          </div>
        ) : (
          filtered.map(alert => {
            const client = clients.find(c => c.id === alert.client_id);
            const user = users.find(u => u.id === client?.user_id);
            return (
              <Card key={alert.id} className={alert.severity === 'high' && !alert.resolved ? 'border-red-200' : ''}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={SEVERITY_BADGE[alert.severity]}>{alert.severity.toUpperCase()}</Badge>
                        {alert.resolved && <Badge variant="muted">Resolved</Badge>}
                        <span className="text-xs text-slate-400">{format(parseISO(alert.created_at), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        <Link href={`/coach/clients/${alert.client_id}`} className="text-teal-600 hover:underline">
                          {user?.full_name}
                        </Link>
                      </p>
                      <p className="text-sm text-slate-600">{alert.alert_message}</p>
                      {alert.severity === 'high' && !alert.resolved && (
                        <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                          This may be outside the scope of coaching. Consider referring the client to a nonprofit credit counselor, legal aid organization, or bankruptcy attorney.
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/coach/clients/${alert.client_id}`}>
                        <Button size="sm" variant="outline">View Client</Button>
                      </Link>
                      {!alert.resolved && (
                        <Button size="sm" variant="secondary" onClick={() => resolveAlert(alert.id)}>Resolve</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
