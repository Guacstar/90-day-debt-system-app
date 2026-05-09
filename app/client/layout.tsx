'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Disclaimer } from '@/components/ui/disclaimer';
import {
  LayoutDashboard, CreditCard, DollarSign, Scissors,
  Calendar, ClipboardCheck, PiggyBank, Map, BarChart3,
  Menu, X, LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/client/debts', label: 'My Debts', icon: CreditCard },
  { href: '/client/cash-flow', label: 'Cash Flow', icon: DollarSign },
  { href: '/client/spending-leaks', label: 'Spending Leaks', icon: Scissors },
  { href: '/client/payments', label: 'Payments', icon: Calendar },
  { href: '/client/check-in', label: 'Weekly Check-In', icon: ClipboardCheck },
  { href: '/client/emergency-fund', label: 'Emergency Fund', icon: PiggyBank },
  { href: '/client/plan', label: '90-Day Plan', icon: Map },
  { href: '/client/report', label: 'Progress Report', icon: BarChart3 },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useStore(s => s.currentUser);
  const logout = useStore(s => s.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) router.replace('/login');
    else if (currentUser.role !== 'client') router.replace('/coach/dashboard');
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'client') return null;

  async function handleLogout() {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    logout();
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm font-bold">90</div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Debt Reset</p>
              <p className="text-xs text-slate-500">Dashboard</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-sm font-medium text-slate-800 truncate">{currentUser.full_name}</p>
          <p className="text-xs text-slate-500">Client</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={16} className={active ? 'text-teal-600' : 'text-slate-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 w-full px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
          <Disclaimer compact />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-600 p-1">
              <Menu size={20} />
            </button>
            <span className="text-sm font-semibold text-slate-800">Debt Reset</span>
          </div>
          <button onClick={handleLogout} className="text-slate-400 p-1">
            <LogOut size={18} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
