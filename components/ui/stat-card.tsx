import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'teal' | 'emerald' | 'amber' | 'rose' | 'blue';
  className?: string;
}

const colorMap = {
  default: 'text-slate-800',
  teal: 'text-teal-700',
  emerald: 'text-emerald-700',
  amber: 'text-amber-700',
  rose: 'text-rose-700',
  blue: 'text-blue-700',
};

export function StatCard({ label, value, sub, icon, color = 'default', className }: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 shadow-sm p-5', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className={cn('text-2xl font-bold truncate', colorMap[color])}>{value}</p>
          {sub && <p className="text-xs text-slate-500">{sub}</p>}
        </div>
        {icon && <div className="text-slate-300 shrink-0 ml-2">{icon}</div>}
      </div>
    </div>
  );
}
