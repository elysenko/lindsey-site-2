import type { Metadata } from 'next';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { SITE } from '@/content/site';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment px-5 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center font-serif text-2xl font-semibold">
          {SITE.name}
        </Link>
        <div className="rounded-2xl border border-ink/10 bg-white p-8">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-ink-muted">Welcome back.</p>
          <div className="mt-6">
            <AuthForm mode="login" endpoint="/api/auth/login" redirectTo="/" submitLabel="Sign in" />
          </div>
          <p className="mt-6 text-center text-sm text-ink-muted">
            No account?{' '}
            <Link href="/signup" className="font-semibold text-gold-deep">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
