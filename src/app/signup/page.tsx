import type { Metadata } from 'next';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { SITE } from '@/content/site';

export const metadata: Metadata = { title: 'Create account', robots: { index: false, follow: false } };

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment px-5 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center font-serif text-2xl font-semibold">
          {SITE.name}
        </Link>
        <div className="rounded-2xl border border-ink/10 bg-white p-8">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-ink-muted">Passwords must be at least 8 characters.</p>
          <div className="mt-6">
            <AuthForm
              mode="signup"
              endpoint="/api/auth/signup"
              redirectTo="/"
              submitLabel="Create account"
              minPassword={8}
            />
          </div>
          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-gold-deep">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
