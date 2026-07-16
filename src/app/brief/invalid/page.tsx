import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Brief Unavailable',
  robots: { index: false, follow: false },
};

export default function BriefInvalidPage() {
  return (
    <div className="container-page max-w-xl py-20 text-center" data-testid="brief-invalid">
      <h1 className="text-3xl font-semibold">This brief link isn&rsquo;t available</h1>
      <p className="mt-4 text-ink-muted">
        The link may have expired or already been completed. Please email{' '}
        <a href="mailto:hello@lebarregroup.com" className="font-semibold text-gold-deep">
          hello@lebarregroup.com
        </a>{' '}
        and we&rsquo;ll send you a fresh one.
      </p>
      <Link href="/" className="btn-secondary mt-8">Return home</Link>
    </div>
  );
}
