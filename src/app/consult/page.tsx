import type { Metadata } from 'next';
import { Suspense } from 'react';
import ConsultationForm from '@/components/ConsultationForm';

export const metadata: Metadata = {
  title: 'Request a Consultation',
  description: 'Tell us about your brand challenge and we will follow up to schedule a strategy conversation.',
  robots: { index: true, follow: true },
};

export default function ConsultPage() {
  return (
    <div className="container-page max-w-2xl py-14">
      <span className="eyebrow">Request a Consultation</span>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
        Let&rsquo;s talk about your brand.
      </h1>
      <p className="mt-3 text-ink-muted">
        Share a little about your organization and the challenge you&rsquo;re facing. We&rsquo;ll
        follow up to schedule a strategy conversation — usually within one business day.
      </p>

      <div className="mt-10 rounded-2xl border border-ink/10 bg-white p-7 sm:p-9">
        <Suspense fallback={<p className="text-ink-muted">Loading form…</p>}>
          <ConsultationForm />
        </Suspense>
      </div>
    </div>
  );
}
