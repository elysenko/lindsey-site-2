import type { Metadata } from 'next';
import Link from 'next/link';
import { resolveConfig } from '@/lib/config';
import CalendarEmbed from '@/components/CalendarEmbed';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Thank you',
  robots: { index: false, follow: false },
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;
  // NEXT_PUBLIC_CALCOM_LINK is a booking slug (e.g. "lebarre/intro"); null when unconfigured.
  const calLink = await resolveConfig('NEXT_PUBLIC_CALCOM_LINK');

  return (
    <div className="container-page max-w-3xl py-16">
      <div className="rounded-2xl border border-ink/10 bg-white p-8 text-center sm:p-12">
        <span className="text-4xl" aria-hidden="true">✓</span>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Request received.</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-muted">
          Thank you — your consultation request is in. A member of our team will be in touch
          shortly. In the meantime, you can take two quick steps to help us make the most of our
          first conversation.
        </p>
      </div>

      {/* Brief invite */}
      {token && (
        <section className="mt-8 rounded-2xl border border-gold/40 bg-parchment-deep p-8">
          <h2 className="text-2xl font-semibold">Complete your Brand Intelligence Brief</h2>
          <p className="mt-3 text-ink-soft">
            This short, private questionnaire captures your mission, differentiators, and audiences
            so our first strategy session starts from depth. It takes about ten minutes.
          </p>
          <Link
            href={`/brief/${encodeURIComponent(token)}`}
            data-testid="brief-invite-link"
            className="btn-primary mt-5"
          >
            Start the Brief
          </Link>
        </section>
      )}

      {/* Calendar */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold">Book your strategy call</h2>
        <p className="mt-2 text-ink-muted">Pick a time that works for you.</p>
        <div className="mt-5">
          <CalendarEmbed calLink={calLink} />
        </div>
      </section>

      <div className="mt-10 text-center">
        <Link href="/" className="text-sm font-semibold text-gold-deep">← Return home</Link>
      </div>
    </div>
  );
}
