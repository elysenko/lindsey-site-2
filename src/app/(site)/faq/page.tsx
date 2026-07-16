import type { Metadata } from 'next';
import Link from 'next/link';
import { FAQS, FAQ_CATEGORIES, faqsByCategory } from '@/content/faqs';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { faqPageJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers about working with LeBarre Group — engagements, process, brand strategy, design, research, and thought leadership.',
};

export default function FaqPage({ searchParams }: { searchParams: { category?: string } }) {
  const active =
    searchParams.category && (FAQ_CATEGORIES as readonly string[]).includes(searchParams.category)
      ? searchParams.category
      : undefined;

  const visible = faqsByCategory(active);

  return (
    <div className="container-page py-16">
      {/* JSON-LD always describes the full FAQ set for rich results. */}
      <JsonLd data={faqPageJsonLd(FAQS)} />

      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }]} />

      <header className="mt-6 max-w-2xl">
        <span className="eyebrow">FAQ</span>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Questions, answered.</h1>
        <p className="mt-4 text-ink-muted">
          Everything you might want to know before reaching out. Filter by topic or browse the full
          list.
        </p>
      </header>

      {/* Category filter — each option is URL-addressable via ?category= */}
      <nav aria-label="FAQ categories" className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/faq"
          aria-current={!active ? 'true' : undefined}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            !active ? 'bg-ink text-parchment' : 'border border-ink/15 text-ink-soft hover:bg-ink/5'
          }`}
        >
          All
        </Link>
        {FAQ_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/faq?category=${encodeURIComponent(c)}`}
            aria-current={active === c ? 'true' : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              active === c ? 'bg-ink text-parchment' : 'border border-ink/15 text-ink-soft hover:bg-ink/5'
            }`}
          >
            {c}
          </Link>
        ))}
      </nav>

      <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
        {visible.map((f) => (
          <details key={f.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium text-ink marker:content-none">
              <span>{f.question}</span>
              <span aria-hidden="true" className="text-gold transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 max-w-prose text-ink-muted">{f.answer}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-parchment-deep p-8 text-center">
        <h2 className="text-2xl font-semibold">Still have a question?</h2>
        <p className="mt-2 text-ink-muted">We&rsquo;re happy to help. Start a conversation.</p>
        <Link href="/consult" className="btn-primary mt-5">Request a Consultation</Link>
      </div>
    </div>
  );
}
