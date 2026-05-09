'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { COACH_NOTE_TYPE_LABELS } from '@/lib/utils';
import { CoachNoteType } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Plus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const NOTE_TYPE_OPTIONS = Object.entries(COACH_NOTE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));

export default function NotesPage() {
  const currentUser = useStore(s => s.currentUser);
  const clients = useStore(s => s.clients);
  const users = useStore(s => s.users);
  const coachNotes = useStore(s => s.coachNotes);
  const addCoachNote = useStore(s => s.addCoachNote);

  const [showModal, setShowModal] = useState(false);
  const [filterClient, setFilterClient] = useState('');
  const [filterType, setFilterType] = useState('');
  const [form, setForm] = useState({
    client_id: '', note_type: 'general' as CoachNoteType, note_content: '', follow_up_needed: false, follow_up_due_date: '',
  });

  const CLIENT_OPTIONS = clients.map(c => {
    const u = users.find(u => u.id === c.user_id);
    return { value: c.id, label: u?.full_name || c.id };
  });

  const filteredNotes = coachNotes
    .filter(n => !filterClient || n.client_id === filterClient)
    .filter(n => !filterType || n.note_type === filterType)
    .slice()
    .reverse();

  function handleAdd() {
    if (!currentUser) return;
    addCoachNote({
      client_id: form.client_id,
      coach_id: currentUser.id,
      note_type: form.note_type,
      note_content: form.note_content,
      follow_up_needed: form.follow_up_needed,
      follow_up_due_date: form.follow_up_due_date || undefined,
    });
    setForm({ client_id: '', note_type: 'general', note_content: '', follow_up_needed: false, follow_up_due_date: '' });
    setShowModal(false);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coach Notes</h1>
          <p className="text-slate-500 text-sm">Internal notes for client coaching sessions and observations.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Note
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterClient}
          onChange={e => setFilterClient(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Clients</option>
          {CLIENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Types</option>
          {NOTE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">No notes found.</p>
        ) : (
          filteredNotes.map(note => {
            const client = clients.find(c => c.id === note.client_id);
            const clientUser = users.find(u => u.id === client?.user_id);
            return (
              <Card key={note.id}>
                <CardContent className="py-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Link href={`/coach/clients/${note.client_id}`} className="text-sm font-semibold text-teal-700 hover:underline">
                        {clientUser?.full_name}
                      </Link>
                      <Badge variant="info">{COACH_NOTE_TYPE_LABELS[note.note_type]}</Badge>
                    </div>
                    <p className="text-xs text-slate-400">{format(parseISO(note.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <p className="text-sm text-slate-700">{note.note_content}</p>
                  {note.follow_up_needed && (
                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5">
                      <AlertTriangle size={12} />
                      Follow-up needed{note.follow_up_due_date ? ` by ${format(parseISO(note.follow_up_due_date), 'MMM d, yyyy')}` : ''}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Coach Note">
        <div className="space-y-4">
          <Select label="Client" value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} options={CLIENT_OPTIONS} placeholder="Select a client" />
          <Select label="Note type" value={form.note_type} onChange={e => setForm(f => ({ ...f, note_type: e.target.value as CoachNoteType }))} options={NOTE_TYPE_OPTIONS} />
          <Textarea label="Note content" value={form.note_content} onChange={e => setForm(f => ({ ...f, note_content: e.target.value }))} placeholder="Write your coaching note here..." rows={4} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="fu2" checked={form.follow_up_needed} onChange={e => setForm(f => ({ ...f, follow_up_needed: e.target.checked }))} className="rounded" />
            <label htmlFor="fu2" className="text-sm text-slate-700">Follow-up needed</label>
          </div>
          {form.follow_up_needed && (
            <Input label="Follow-up due date" type="date" value={form.follow_up_due_date} onChange={e => setForm(f => ({ ...f, follow_up_due_date: e.target.value }))} />
          )}
          <div className="flex gap-3">
            <Button onClick={handleAdd} disabled={!form.client_id || !form.note_content}>Save Note</Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
