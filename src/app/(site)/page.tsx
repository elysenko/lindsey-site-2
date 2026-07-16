import Link from 'next/link';
import { SITE } from '@/content/site';
import { SERVICES } from '@/content/services';
import { TESTIMONIALS } from '@/content/testimonials';
import ServiceCard from '@/components/ServiceCard';
import Testimonial from '@/components/Testimonial';
import TrustLogos from '@/components/TrustLogos';

export const metadata = {
  description: SITE.description,
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-parchment">
        <div className="container-page grid gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
          <div>
            <span className="eyebrow text-gold-soft">{SITE.tagline}</span>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {SITE.headline}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-parchment/80">{SITE.subhead}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/consult" className="btn-primary">Request a Consultation</Link>
              <Link href="/services" className="btn-ghost-light">Explore our services</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <p className="font-serif text-2xl leading-snug text-parchment">
              “A brand is not what you say it is. It is the position you can defend when a
              competitor, a customer, and a search engine all look at once.”
            </p>
            <p className="mt-6 text-sm text-parchment/60">— The LeBarre point of view</p>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-b border-ink/10 bg-parchment-deep py-12">
        <div className="container-page">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
            Trusted by ambitious organizations
          </p>
          <TrustLogos />
        </div>
      </section>

      {/* Services */}
      <section className="container-page py-20">
        <div className="max-w-2xl">
          <span className="eyebrow">What we do</span>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Four disciplines, one defensible brand.
          </h2>
          <p className="mt-4 text-ink-muted">
            Every engagement is built from the same conviction: strategy first, then the
            expression, intelligence, and voice that make it impossible to ignore.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {SERVICES.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </section>

      {/* Approach */}
      <section className="bg-white py-20">
        <div className="container-page grid gap-12 lg:grid-cols-3">
          {[
            { n: '01', t: 'Intelligence', d: 'We start with evidence — audience research and competitive analysis — so decisions rest on truth, not taste.' },
            { n: '02', t: 'Strategy', d: 'We define the one territory you can own and build the positioning and narrative to claim it.' },
            { n: '03', t: 'Expression', d: 'We translate the strategy into identity, content, and executive visibility that compound over time.' },
          ].map((step) => (
            <div key={step.n}>
              <span className="font-serif text-4xl font-semibold text-gold">{step.n}</span>
              <h3 className="mt-3 text-xl font-semibold">{step.t}</h3>
              <p className="mt-2 text-ink-muted">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-page py-20">
        <div className="max-w-2xl">
          <span className="eyebrow">Proof</span>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Results our clients can name.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Testimonial key={t.name} item={t} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-parchment">
        <div className="container-page flex flex-col items-center gap-6 py-16 text-center">
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
            Ready to own your position?
          </h2>
          <p className="max-w-xl text-parchment/75">
            Tell us about your challenge. We will follow up to schedule a strategy conversation.
          </p>
          <Link href="/consult" className="btn-primary">Request a Consultation</Link>
        </div>
      </section>
    </>
  );
}
