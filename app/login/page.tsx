'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Disclaimer } from '@/components/ui/disclaimer';

export default function LoginPage() {
  const router = useRouter();
  const login = useStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Login failed.');
      return;
    }
    router.push('/');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white text-xl font-bold mb-2">
            90
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Debt Reset Dashboard</h1>
          <p className="text-slate-500 text-sm">The 90-Day Debt Reset Program</p>
        </div>

        {/* Demo credentials */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">Demo Logins</p>
          <div className="space-y-1 text-xs text-teal-700">
            <p><span className="font-medium">Coach:</span> coach@example.com / coach123</p>
            <p><span className="font-medium">Client 1:</span> maria@example.com / maria123</p>
            <p><span className="font-medium">Client 2:</span> james@example.com / james123</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>
          <p className="text-sm text-center text-slate-500">
            New client?{' '}
            <Link href="/register" className="text-teal-600 font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <div className="px-2">
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}
