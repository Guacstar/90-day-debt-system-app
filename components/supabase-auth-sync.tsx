'use client';
import { useEffect } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useStore } from '@/lib/store';

/**
 * Listens for Supabase auth state changes and keeps the Zustand store in sync.
 * Should be mounted once at the root layout.
 *
 * In demo mode (no Supabase env vars), this is a no-op.
 */
export function SupabaseAuthSync() {
  const hydrateFromSupabase = useStore(s => s.hydrateFromSupabase);
  const setCurrentUser = useStore(s => s.setCurrentUser);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // In demo mode, mark store as hydrated so loading guards pass.
      useStore.setState({ hydrated: true });
      return;
    }

    const supabase = createClient();

    // On mount: check for existing session and hydrate
    hydrateFromSupabase();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          hydrateFromSupabase();
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        // Clear all data on logout
        useStore.setState({
          users: [], clients: [], debts: [], cashFlowEntries: [],
          spendingLeaks: [], payments: [], checkins: [], emergencyFunds: [],
          programTasks: [], coachNotes: [], coachAlerts: [],
        });
      }
    });

    return () => { subscription.unsubscribe(); };
  }, [hydrateFromSupabase, setCurrentUser]);

  return null;
}
