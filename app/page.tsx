'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const currentUser = useStore(s => s.currentUser);

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    } else if (currentUser.role === 'coach') {
      router.replace('/coach/dashboard');
    } else {
      router.replace('/client/dashboard');
    }
  }, [currentUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 rounded-full border-4 border-teal-600 border-t-transparent" />
    </div>
  );
}
