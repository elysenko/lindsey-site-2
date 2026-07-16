import type { Metadata } from 'next';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { SITE } from '@/content/site';

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center font-serif text-2xl font-semibold text-parchment">
          {SITE.name}
        </Link>
        <div className="rounded-2xl bg-white p-8">
          <h1 className="text-2xl font-semibold">Admin console</h1>
          <p className="mt-1 text-sm text-ink-muted">Sign in to manage leads and insights.</p>
          <div className="mt-6">
            <AuthForm
              mode="admin-login"
              endpoint="/api/admin/login"
              redirectTo="/admin"
              submitLabel="Sign in"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
