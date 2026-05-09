import { cn } from '@/lib/utils';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

type AlertBannerVariant = 'info' | 'warning' | 'danger' | 'success';

const config: Record<AlertBannerVariant, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  info: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', icon: <Info size={16} /> },
  warning: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: <AlertTriangle size={16} /> },
  danger: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', icon: <AlertTriangle size={16} /> },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: <CheckCircle size={16} /> },
};

export function AlertBanner({ children, variant = 'info', className }: {
  children: React.ReactNode;
  variant?: AlertBannerVariant;
  className?: string;
}) {
  const c = config[variant];
  return (
    <div className={cn('rounded-lg border px-4 py-3 flex items-start gap-3', c.bg, c.border, className)}>
      <span className={cn('shrink-0 mt-0.5', c.text)}>{c.icon}</span>
      <div className={cn('text-sm', c.text)}>{children}</div>
    </div>
  );
}
