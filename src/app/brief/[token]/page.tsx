import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import BrandBriefForm from '@/components/BrandBriefForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Brand Intelligence Brief',
  robots: { index: false, follow: false },
};

// Renders the brief form for a valid PENDING token. Unknown or already-consumed
// tokens render a helpful not-found message (matching the API's 404 semantics).
export default async function BriefPage({ params }: { params: { token: string } }) {
  const lead = await db.lead.findUnique({
    where: { briefToken: params.token },
    select: { fullName: true, briefStatus: true },
  });

  if (!lead || lead.briefStatus !== 'PENDING') {
    return (
      <div className="container-page max-w-xl py-20 text-center" data-testid="brief-invalid">
        <h1 className="text-3xl font-semibold">This brief link isn&rsquo;t available</h1>
        <p className="mt-4 text-ink-muted">
          The link may have expired, already been completed, or been superseded. If you believe
          this is an error, please email{' '}
          <a href="mailto:hello@lebarregroup.com" className="font-semibold text-gold-deep">
            hello@lebarregroup.com
          </a>{' '}
          and we&rsquo;ll send you a fresh link.
        </p>
        <Link href="/" className="btn-secondary mt-8">Return home</Link>
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl py-14">
      <span className="eyebrow">Brand Intelligence Brief</span>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
        {lead.fullName ? `Welcome, ${lead.fullName.split(' ')[0]}.` : 'Welcome.'}
      </h1>
      <p className="mt-3 text-ink-muted">
        These questions help us understand your brand from the inside out. There are no wrong
        answers — write as much or as little as feels true. Everything you share is confidential.
      </p>

      <div className="mt-10 rounded-2xl border border-ink/10 bg-white p-7 sm:p-9">
        <BrandBriefForm token={params.token} />
      </div>
    </div>
  );
}
