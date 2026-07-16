import type { Metadata } from 'next';
import { SERVICES } from '@/content/services';
import ServiceCard from '@/components/ServiceCard';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Brand strategy, identity, market intelligence, and executive thought-leadership services from LeBarre Group.',
};

export default function ServicesPage() {
  return (
    <div className="container-page py-16">
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }]} />
      <div className="mt-6 max-w-2xl">
        <span className="eyebrow">Services</span>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
          Strategy, expression, intelligence, and voice.
        </h1>
        <p className="mt-4 text-ink-muted">
          Choose a single discipline or combine them into an integrated program. Each is anchored
          to the same goal: a brand you can defend.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {SERVICES.map((s) => (
          <ServiceCard key={s.slug} service={s} />
        ))}
      </div>
    </div>
  );
}
