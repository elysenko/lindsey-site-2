import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { SITE } from '@/content/site';
import { organizationJsonLd, SITE_URL } from '@/lib/jsonld';
import JsonLd from '@/components/JsonLd';

// next/font self-hosts fonts and sets font-display: swap to hold CLS < 0.1.
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Fraunces({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE_URL,
    siteName: SITE.name,
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const org = organizationJsonLd({
    name: SITE.name,
    url: '/',
    logo: SITE.logoPath,
    description: SITE.description,
    email: SITE.email,
    telephone: SITE.phone,
    sameAs: [...SITE.sameAs],
  });

  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        {/* Readiness landmark for the post-deploy render gate. */}
        <div data-testid="app-ready">{children}</div>
        <JsonLd data={org} />
      </body>
    </html>
  );
}
