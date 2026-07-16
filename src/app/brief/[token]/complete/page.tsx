import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Brief Submitted',
  robots: { index: false, follow: false },
};

export default function BriefCompletePage() {
  return (
    <div className="container-page max-w-xl py-20 text-center" data-testid="brief-complete">
      <span className="text-4xl" aria-hidden="true">✓</span>
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Thank you — your brief is in.</h1>
      <p className="mt-4 text-ink-muted">
        We&rsquo;ve received your Brand Intelligence Brief. Our team will review it before your
        strategy conversation so we can dive straight into what matters.
      </p>
      <Link href="/" className="btn-primary mt-8">Return home</Link>
    </div>
  );
}
