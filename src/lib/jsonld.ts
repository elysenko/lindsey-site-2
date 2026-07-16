// JSON-LD (schema.org) builders. Pure functions returning plain objects that
// callers render inside a <script type="application/ld+json"> tag.

type Json = Record<string, unknown>;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lebarregroup.com';

function abs(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
}

export interface OrganizationInput {
  name: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  email?: string;
  telephone?: string;
}

export function organizationJsonLd(input: OrganizationInput): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.name,
    url: input.url ? abs(input.url) : SITE_URL,
    ...(input.logo ? { logo: abs(input.logo) } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.email ? { email: input.email } : {}),
    ...(input.telephone ? { telephone: input.telephone } : {}),
    ...(input.sameAs && input.sameAs.length ? { sameAs: input.sameAs } : {}),
  };
}

export interface PersonInput {
  name: string;
  honorificPrefix?: string | null;
  jobTitle?: string | null;
  description?: string | null;
  image?: string | null;
  url?: string;
  sameAs?: string[];
  knowsAbout?: string[];
  alumniOf?: string | null;
}

export function personJsonLd(input: PersonInput): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name,
    ...(input.honorificPrefix ? { honorificPrefix: input.honorificPrefix } : {}),
    ...(input.jobTitle ? { jobTitle: input.jobTitle } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: abs(input.image) } : {}),
    ...(input.url ? { url: abs(input.url) } : {}),
    ...(input.sameAs && input.sameAs.length ? { sameAs: input.sameAs } : {}),
    ...(input.knowsAbout && input.knowsAbout.length ? { knowsAbout: input.knowsAbout } : {}),
    ...(input.alumniOf ? { alumniOf: input.alumniOf } : {}),
  };
}

export interface ServiceInput {
  name: string;
  description: string;
  url?: string;
  providerName: string;
  offers?: { name: string; description?: string }[];
}

export function serviceJsonLd(input: ServiceInput): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    ...(input.url ? { url: abs(input.url) } : {}),
    provider: { '@type': 'Organization', name: input.providerName },
    ...(input.offers && input.offers.length
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: input.name,
            itemListElement: input.offers.map((o) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: o.name,
                ...(o.description ? { description: o.description } : {}),
              },
            })),
          },
        }
      : {}),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqPageJsonLd(items: FaqItem[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  };
}

export interface ArticleInput {
  headline: string;
  description?: string;
  url: string;
  datePublished?: string | Date | null;
  dateModified?: string | Date | null;
  authorName?: string;
  image?: string;
}

function iso(d: string | Date | null | undefined): string | undefined {
  if (!d) return undefined;
  return d instanceof Date ? d.toISOString() : d;
}

export function articleJsonLd(input: ArticleInput): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    ...(input.description ? { description: input.description } : {}),
    url: abs(input.url),
    ...(iso(input.datePublished) ? { datePublished: iso(input.datePublished) } : {}),
    ...(iso(input.dateModified) ? { dateModified: iso(input.dateModified) } : {}),
    ...(input.authorName ? { author: { '@type': 'Person', name: input.authorName } } : {}),
    ...(input.image ? { image: abs(input.image) } : {}),
  };
}

export interface Breadcrumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: Breadcrumb[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}
