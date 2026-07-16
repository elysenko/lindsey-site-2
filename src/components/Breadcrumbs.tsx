import Link from 'next/link';
import JsonLd from './JsonLd';
import { breadcrumbJsonLd, type Breadcrumb } from '@/lib/jsonld';

// Visual breadcrumb trail + BreadcrumbList JSON-LD. Server component.
export default function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="font-medium text-ink">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="hover:text-gold-deep">
                    {item.name}
                  </Link>
                )}
                {!last && <span aria-hidden="true">/</span>}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
