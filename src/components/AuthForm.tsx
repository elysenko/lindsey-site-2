'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  mode: 'login' | 'signup' | 'admin-login';
  endpoint: string;
  redirectTo: string;
  submitLabel: string;
  minPassword?: number;
}

// Generic email/password auth form used by /login, /signup, and /admin/login.
export default function AuthForm({ mode, endpoint, redirectTo, submitLabel, minPassword = 1 }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(
          body.error ||
            (body.fieldErrors ? Object.values(body.fieldErrors).flat().join(' ') : 'Something went wrong.'),
        );
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate data-testid={`${mode}-form`} className="space-y-5">
      {error && (
        <div role="alert" data-testid="auth-error" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input"
        />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          required
          minLength={minPassword}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input"
        />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
        {submitting ? 'Please wait…' : submitLabel}
      </button>
    </form>
  );
}
