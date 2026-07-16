import Link from 'next/link';
import { SITE, FOOTER_LINKS } from '@/content/site';

// Global footer. Server component.
export default function Footer() {
  const year = 2026;
  return (
    <footer className="mt-24 bg-ink text-parchment">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-serif text-lg font-semibold">{SITE.name}</div>
          <p className="mt-3 max-w-xs text-sm text-parchment/70">{SITE.tagline}.</p>
          <a
            href={`mailto:${SITE.email}`}
            className="mt-4 inline-block text-sm text-gold-soft hover:text-white"
          >
            {SITE.email}
          </a>
        </div>

        {FOOTER_LINKS.map((col) => (
          <div key={col.heading}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-parchment/60">
              {col.heading}
            </h3>
            <ul className="mt-4 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-parchment/80 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-parchment/60 sm:flex-row">
          <span>
            © {year} {SITE.legalName}. All rights reserved.
          </span>
          <div className="flex gap-4">
            {SITE.sameAs.map((url) => (
              <a key={url} href={url} className="hover:text-white" rel="noopener noreferrer" target="_blank">
                {url.includes('linkedin') ? 'LinkedIn' : 'X / Twitter'}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
