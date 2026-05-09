'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Disclaimer } from '@/components/ui/disclaimer';
import { LayoutDashboard, Users, ClipboardCheck, Bell, StickyNote, BarChart3, Menu, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/coach/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/coach/clients', label: 'Clients', icon: Users },
  { href: '/coach/check-ins', label: 'Check-Ins', icon: ClipboardCheck },
  { href: '/coach/alerts', label: 'Alerts', icon: Bell },
  { href: '/coach/notes', label: 'Notes', icon: StickyNote },
  { href: '/coach/reports', label: 'Reports', icon: BarChart3 },
];

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useStore(s => s.currentUser);
  const coachAlerts = useStore(s => s.coachAlerts);
  const logout = useStore(s => s.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) router.replace('/login');
    else if (currentUser.role !== 'coach') router.replace('/client/dashboard');
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'coach') return null;

  const unresolvedAlerts = coachAlerts.filter(a => !a.resolved).length;

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
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-white flex items-center justify-center text-sm font-bold">90</div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Debt Reset</p>
              <p className="text-xs text-slate-500">Coach Portal</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-sm font-medium text-slate-800 truncate">{currentUser.full_name}</p>
          <p className="text-xs text-slate-500">Coach / Admin</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={active ? 'text-white' : 'text-slate-400'} />
                  {item.label}
                </div>
                {item.label === 'Alerts' && unresolvedAlerts > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white text-slate-800' : 'bg-red-500 text-white'}`}>
                    {unresolvedAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-600 p-1">
              <Menu size={20} />
            </button>
            <span className="text-sm font-semibold text-slate-800">Coach Portal</span>
          </div>
          <button onClick={handleLogout} className="text-slate-400 p-1">
            <LogOut size={18} />
          </button>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
