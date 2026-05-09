'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Disclaimer } from '@/components/ui/disclaimer';

export default function RegisterPage() {
  const router = useRouter();
  const register = useStore(s => s.register);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = register({ full_name: form.full_name, email: form.email, phone: form.phone, password: form.password, role: 'client' });
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Registration failed.');
      return;
    }
    router.push('/onboarding');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white text-xl font-bold mb-2">
            90
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-slate-500 text-sm">Join the 90-Day Debt Reset Program</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your full name" required />
            <Input label="Email address" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
            <Input label="Phone number" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="555-000-0000" />
            <Input label="Password" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="At least 6 characters" required />
            <Input label="Confirm password" type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Re-enter password" required />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create account
            </Button>
          </form>
          <p className="text-sm text-center text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>

        <div className="px-2">
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}
