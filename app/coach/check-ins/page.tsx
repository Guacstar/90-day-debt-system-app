'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/calculations';
import { now } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export default function CheckInsPage() {
  const clients = useStore(s => s.clients);
  const users = useStore(s => s.users);
  const checkins = useStore(s => s.checkins);
  const updateCheckin = useStore(s => s.updateCheckin);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [filterClient, setFilterClient] = useState('');

  const CLIENT_OPTIONS = clients.map(c => {
    const u = users.find(u => u.id === c.user_id);
    return { value: c.id, label: u?.full_name || c.id };
  });

  const filteredCheckins = checkins
    .filter(ci => !filterClient || ci.client_id === filterClient)
    .slice()
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));

  const unreviewed = checkins.filter(ci => !ci.reviewed_at).length;

  function saveResponse(id: string, original: string) {
    updateCheckin(id, { coach_response: responses[id] ?? original, reviewed_at: now() });
    setSaved(s => ({ ...s, [id]: true }));
    setTimeout(() => setSaved(s => ({ ...s, [id]: false })), 2000);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Weekly Check-Ins</h1>
          <p className="text-slate-500 text-sm">Review and respond to client check-ins.</p>
        </div>
        {unreviewed > 0 && (
          <Badge variant="warning">{unreviewed} unreviewed</Badge>
        )}
      </div>

      <div className="flex gap-3">
        <select
          value={filterClient}
          onChange={e => setFilterClient(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Clients</option>
          {CLIENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {filteredCheckins.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">No check-ins found.</p>
        ) : (
          filteredCheckins.map(ci => {
            const client = clients.find(c => c.id === ci.client_id);
            const user = users.find(u => u.id === client?.user_id);
            return (
              <Card key={ci.id} className={!ci.reviewed_at ? 'border-amber-200' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <Link href={`/coach/clients/${ci.client_id}`} className="text-sm font-semibold text-teal-700 hover:underline">
                        {user?.full_name}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Week {ci.week_number} • {format(parseISO(ci.submitted_at), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!ci.reviewed_at && <Badge variant="warning">Needs Review</Badge>}
                      {ci.reviewed_at && <Badge variant="info">Reviewed</Badge>}
                      <Badge variant={ci.stress_level >= 8 ? 'danger' : 'muted'}>Stress: {ci.stress_level}</Badge>
                      <Badge variant={ci.confidence_level <= 3 ? 'danger' : 'muted'}>Conf: {ci.confidence_level}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'No new debt', value: ci.avoided_new_debt, good: true },
                      { label: 'All payments', value: ci.made_all_required_payments, good: true },
                      { label: 'Within limit', value: ci.stayed_within_weekly_spending_limit, good: true },
                      { label: 'Debt up', value: ci.total_debt_went_up, good: false },
                    ].map(item => (
                      <div key={item.label} className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                        <Badge variant={item.good === item.value ? 'success' : 'danger'} className="text-xs">
                          {item.value ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {ci.extra_debt_payment > 0 && (
                    <p className="text-sm text-teal-600 font-medium">Extra payment: {formatCurrency(ci.extra_debt_payment)}</p>
                  )}
                  {ci.biggest_money_win && <p className="text-sm text-slate-600"><span className="font-medium">Win:</span> {ci.biggest_money_win}</p>}
                  {ci.biggest_challenge && <p className="text-sm text-slate-600"><span className="font-medium">Challenge:</span> {ci.biggest_challenge}</p>}
                  {ci.help_needed && <p className="text-sm text-slate-600"><span className="font-medium">Needs help with:</span> {ci.help_needed}</p>}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-teal-600" />
                      <p className="text-xs font-semibold text-slate-600">Coach Response</p>
                    </div>
                    <Textarea
                      value={responses[ci.id] !== undefined ? responses[ci.id] : (ci.coach_response || '')}
                      onChange={e => setResponses(r => ({ ...r, [ci.id]: e.target.value }))}
                      placeholder="Write a response for the client..."
                      rows={2}
                    />
                    <Button size="sm" onClick={() => saveResponse(ci.id, ci.coach_response || '')}>
                      {saved[ci.id] ? 'Saved!' : 'Save Response'}
                    </Button>
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
