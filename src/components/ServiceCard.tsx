import Link from 'next/link';
import type { Service } from '@/content/services';

// Presentational service summary card. Server component.
export default function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      data-testid={`service-card-${service.slug}`}
      className="group flex flex-col rounded-xl border border-ink/10 bg-white p-7 transition-shadow hover:shadow-lg"
    >
      <span className="eyebrow">{service.shortName}</span>
      <h3 className="mt-3 text-xl font-semibold text-ink">{service.name}</h3>
      <p className="mt-2 text-sm font-medium text-gold-deep">{service.tagline}</p>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-muted">{service.summary}</p>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ink group-hover:text-gold-deep">
        Explore service
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
