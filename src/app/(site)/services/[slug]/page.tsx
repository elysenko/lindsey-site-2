import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SERVICES, getService } from '@/content/services';
import { faqsForService } from '@/content/faqs';
import { SITE } from '@/content/site';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { serviceJsonLd, faqPageJsonLd } from '@/lib/jsonld';

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const service = getService(params.slug);
  if (!service) return {};
  return { title: service.name, description: service.summary };
}

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = getService(params.slug);
  if (!service) notFound();

  const faqs = faqsForService(service.slug);
  const url = `/services/${service.slug}`;

  return (
    <div className="container-page py-16">
      <JsonLd
        data={serviceJsonLd({
          name: service.name,
          description: service.summary,
          url,
          providerName: SITE.name,
          offers: service.offers,
        })}
      />
      {faqs.length > 0 && <JsonLd data={faqPageJsonLd(faqs)} />}

      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: service.name, path: url },
        ]}
      />

      <header className="mt-6 max-w-3xl">
        <span className="eyebrow">{service.shortName}</span>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{service.name}</h1>
        <p className="mt-3 text-xl font-medium text-gold-deep">{service.tagline}</p>
        <p className="mt-5 text-lg text-ink-soft">{service.summary}</p>
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="prose-content">
            {service.overview.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-semibold">What&rsquo;s included</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {service.offers.map((o) => (
              <div key={o.name} className="rounded-lg border border-ink/10 bg-white p-5">
                <h3 className="font-semibold text-ink">{o.name}</h3>
                <p className="mt-1 text-sm text-ink-muted">{o.description}</p>
              </div>
            ))}
          </div>

          {faqs.length > 0 && (
            <>
              <h2 className="mt-12 text-2xl font-semibold">Frequently asked</h2>
              <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
                {faqs.map((f) => (
                  <details key={f.question} className="group py-4">
                    <summary className="cursor-pointer list-none font-medium text-ink marker:content-none">
                      {f.question}
                    </summary>
                    <p className="mt-2 text-ink-muted">{f.answer}</p>
                  </details>
                ))}
              </div>
            </>
          )}
        </div>

        <aside>
          <div className="sticky top-24 rounded-xl border border-ink/10 bg-white p-7">
            <h2 className="text-lg font-semibold">Outcomes you can expect</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-soft">
              {service.outcomes.map((o) => (
                <li key={o} className="flex gap-2">
                  <span aria-hidden="true" className="text-gold">✓</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
            <Link href="/consult" className="btn-primary mt-6 w-full">
              Request a Consultation
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
