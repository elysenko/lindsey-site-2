import Link from 'next/link';
import Image from 'next/image';
import { NAV_LINKS, SITE } from '@/content/site';
import MobileNav from './MobileNav';

// Global site header with desktop nav + mobile hamburger. Server component.
export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-parchment/90 backdrop-blur">
      <div className="container-page relative flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" data-testid="site-logo" aria-label={SITE.name}>
          <Image
            src={SITE.logoPath}
            alt={SITE.name}
            width={160}
            height={40}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-gold-deep"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/consult" className="btn-primary py-2.5">
            Request a Consultation
          </Link>
        </nav>

        <MobileNav />
      </div>
    </header>
  );
}
