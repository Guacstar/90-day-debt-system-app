import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  sublabel?: string;
  color?: 'teal' | 'blue' | 'amber' | 'emerald' | 'rose';
  size?: 'sm' | 'md';
}

const colorMap = {
  teal: 'bg-teal-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
};

export function ProgressBar({ value, label, sublabel, color = 'teal', size = 'md' }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div className="space-y-1.5">
      {(label || sublabel) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
          {sublabel && <span className="text-sm text-slate-500">{sublabel}</span>}
        </div>
      )}
      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', size === 'sm' ? 'h-2' : 'h-3')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorMap[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
