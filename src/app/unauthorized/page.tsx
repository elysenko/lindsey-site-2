import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Not authorized', robots: { index: false, follow: false } };

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-parchment px-5 text-center">
      <span className="font-serif text-6xl font-semibold text-gold">403</span>
      <h1 className="mt-4 text-3xl font-semibold">You don&rsquo;t have access to this area.</h1>
      <p className="mt-3 max-w-md text-ink-muted">
        This section is restricted to administrators. If you believe you should have access, contact
        your administrator.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary">Return home</Link>
        <Link href="/admin/login" className="btn-secondary">Admin sign in</Link>
      </div>
    </div>
  );
}
