'use client';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { currentProgramWeek, programProgress90Day, formatPercent } from '@/lib/calculations';
import { currentTargetDebt } from '@/lib/calculations';
import Link from 'next/link';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

const PHASES = [
  { phase: 1 as const, name: 'Stop the Bleeding', weeks: 'Weeks 1–2', color: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-400' },
  { phase: 2 as const, name: 'Create the Plan', weeks: 'Weeks 3–4', color: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-400' },
  { phase: 3 as const, name: 'Build Consistency', weeks: 'Weeks 5–8', color: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-400' },
  { phase: 4 as const, name: 'Lock In the System', weeks: 'Weeks 9–12', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-400' },
];

export default function PlanPage() {
  const currentUser = useStore(s => s.currentUser);
  const currentClient = useStore(s => s.currentClient);
  const clients = useStore(s => s.clients);
  const debts = useStore(s => s.debts);
  const programTasks = useStore(s => s.programTasks);
  const toggleTask = useStore(s => s.toggleTask);
  const updateClient = useStore(s => s.updateClient);

  const client = currentClient || clients.find(c => c.user_id === currentUser?.id);
  const clientDebts = debts.filter(d => d.client_id === client?.id);
  const clientTasks = programTasks.filter(t => t.client_id === client?.id);

  const week = client ? currentProgramWeek(client.program_start_date) : 1;
  const progress = client ? programProgress90Day(client.program_start_date) : 0;
  const target = client ? currentTargetDebt(clientDebts, client.payoff_method) : null;

  const currentPhase = week <= 2 ? 1 : week <= 4 ? 2 : week <= 8 ? 3 : 4;

  const completedTasks = clientTasks.filter(t => t.completed).length;
  const totalTasks = clientTasks.length;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">90-Day Program Plan</h1>
        <p className="text-slate-500 text-sm">Four phases. One system. Sustainable debt payoff.</p>
      </div>

      {/* Overall progress */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Current Week</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{week}</p>
            <p className="text-xs text-slate-500">of 12</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Current Phase</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{PHASES[currentPhase - 1].name}</p>
            <p className="text-xs text-slate-500">{PHASES[currentPhase - 1].weeks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tasks Complete</p>
            <p className="text-3xl font-bold text-teal-600 mt-1">{completedTasks}</p>
            <p className="text-xs text-slate-500">of {totalTasks}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-4">
          <ProgressBar value={progress} label="90-Day Progress" sublabel={formatPercent(progress)} color="teal" />
        </CardContent>
      </Card>

      {/* Payoff method selector */}
      {client && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Payoff Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">The best plan is the one you will actually stick to.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { method: 'snowball' as const, name: 'Debt Snowball', description: 'Smallest balance first', reason: 'Fastest emotional win — quick wins build momentum', color: 'teal' },
                { method: 'avalanche' as const, name: 'Debt Avalanche', description: 'Highest interest rate first', reason: 'Most efficient mathematically — saves the most in interest', color: 'blue' },
              ].map(m => (
                <button
                  key={m.method}
                  onClick={() => updateClient(client.id, { payoff_method: m.method })}
                  className={`text-left p-4 rounded-xl border-2 transition-colors ${
                    client.payoff_method === m.method
                      ? m.color === 'teal' ? 'border-teal-500 bg-teal-50' : 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-semibold ${client.payoff_method === m.method ? (m.color === 'teal' ? 'text-teal-800' : 'text-blue-800') : 'text-slate-700'}`}>{m.name}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{m.description}</p>
                      <p className="text-xs text-slate-400 mt-1">{m.reason}</p>
                    </div>
                    {client.payoff_method === m.method && (
                      <CheckCircle size={18} className={m.color === 'teal' ? 'text-teal-600' : 'text-blue-600'} />
                    )}
                  </div>
                </button>
              ))}
            </div>
            {target && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 font-medium">Your current target debt:</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{target.creditor_name} — ${target.current_balance.toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Phase breakdown */}
      <div className="space-y-4">
        {PHASES.map(phase => {
          const phaseTasks = clientTasks.filter(t => t.phase === phase.phase);
          const phaseCompleted = phaseTasks.filter(t => t.completed).length;
          const isCurrentPhase = phase.phase === currentPhase;
          const isPastPhase = phase.phase < currentPhase;

          return (
            <Card key={phase.phase} className={isCurrentPhase ? 'border-teal-300 ring-1 ring-teal-200' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${phase.dot}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>Phase {phase.phase}: {phase.name}</CardTitle>
                        {isCurrentPhase && <Badge variant="info">Current Phase</Badge>}
                        {isPastPhase && phaseCompleted === phaseTasks.length && <Badge variant="success">Complete</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{phase.weeks}</p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500 font-medium">{phaseCompleted}/{phaseTasks.length}</span>
                </div>
                {phaseTasks.length > 0 && (
                  <ProgressBar value={(phaseCompleted / phaseTasks.length) * 100} size="sm" color={isCurrentPhase ? 'teal' : isPastPhase ? 'emerald' : 'teal'} />
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {phaseTasks.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Tasks will appear here once your profile is set up.</p>
                ) : (
                  phaseTasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="w-full flex items-start gap-3 text-left hover:bg-slate-50 rounded-lg p-2 transition-colors group"
                    >
                      <div className={`mt-0.5 shrink-0 ${task.completed ? 'text-teal-500' : 'text-slate-300 group-hover:text-slate-400'}`}>
                        {task.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.task_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{task.task_description}</p>
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
