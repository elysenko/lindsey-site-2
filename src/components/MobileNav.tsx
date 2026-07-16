'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NAV_LINKS } from '@/content/site';

// Hamburger navigation shown at <=768px. Client component: manages open state.
export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        data-testid="mobile-nav-toggle"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-ink/5"
      >
        <span className="sr-only">Menu</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          data-testid="mobile-nav-panel"
          className="absolute inset-x-0 top-full z-40 border-t border-ink/10 bg-parchment shadow-lg"
        >
          <nav className="container-page flex flex-col py-4" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="min-h-[44px] border-b border-ink/5 py-3 text-lg font-medium text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/consult"
              onClick={() => setOpen(false)}
              className="btn-primary mt-4"
            >
              Request a Consultation
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
