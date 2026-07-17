import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoMeta {
  title: string;
  description?: string;
  /** Absolute or path-based canonical URL for this route. */
  canonicalPath?: string;
}

const JSONLD_ID = 'route-jsonld';
const SITE_NAME = 'LeBarre Group';

/**
 * Centralises per-route SEO: document <title>, description/OG meta, canonical
 * link, and a single JSON-LD structured-data block injected into <head>.
 *
 * On an Angular SPA the crawler executes JS, so injecting structured data at
 * render time is indexed by Google. Every page component calls `apply()` in its
 * init with the route's metadata + JSON-LD graph.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  /** Set title + description + canonical + (optional) JSON-LD in one call. */
  apply(meta: SeoMeta, jsonLd?: unknown | unknown[]): void {
    const fullTitle = meta.title.includes(SITE_NAME)
      ? meta.title
      : `${meta.title} · ${SITE_NAME}`;
    this.title.setTitle(fullTitle);

    if (meta.description) {
      this.meta.updateTag({ name: 'description', content: meta.description });
      this.meta.updateTag({ property: 'og:description', content: meta.description });
    }
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });

    this.setCanonical(meta.canonicalPath);
    if (jsonLd !== undefined) this.setJsonLd(jsonLd);
    else this.clearJsonLd();
  }

  private setCanonical(path?: string): void {
    const head = this.doc.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!path) {
      if (link) link.remove();
      return;
    }
    const origin = this.doc.location?.origin ?? '';
    const href = path.startsWith('http') ? path : `${origin}${path}`;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  /** Replace the single JSON-LD script for the current route. */
  setJsonLd(graph: unknown | unknown[]): void {
    this.clearJsonLd();
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = JSONLD_ID;
    script.text = JSON.stringify(graph);
    this.doc.head.appendChild(script);
  }

  clearJsonLd(): void {
    const existing = this.doc.getElementById(JSONLD_ID);
    if (existing) existing.remove();
  }
}

// ── JSON-LD builders ─────────────────────────────────────────────────────────
// Small, dependency-free helpers so page components stay declarative.

export function organizationLd(origin = ''): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: origin || undefined,
    description:
      'Intelligence-led brand strategy for organizations that need to be the obvious choice.',
  };
}

export function breadcrumbLd(
  items: { name: string; path: string }[],
  origin = '',
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: origin ? `${origin}${it.path}` : it.path,
    })),
  };
}

export function serviceLd(
  name: string,
  description: string,
  offerings: string[] = [],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: { '@type': 'Organization', name: SITE_NAME },
    hasOfferCatalog: offerings.length
      ? {
          '@type': 'OfferCatalog',
          name,
          itemListElement: offerings.map((o) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: o },
          })),
        }
      : undefined,
  };
}

export function personLd(member: {
  fullName: string;
  title: string;
  bio: string;
  honorificPrefix?: string | null;
  linkedinUrl?: string | null;
  headshotUrl?: string | null;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: member.fullName,
    honorificPrefix: member.honorificPrefix ?? undefined,
    jobTitle: member.title,
    description: member.bio,
    worksFor: { '@type': 'Organization', name: SITE_NAME },
    sameAs: member.linkedinUrl ? [member.linkedinUrl] : undefined,
    image: member.headshotUrl ?? undefined,
  };
}

export function faqPageLd(
  faqs: { question: string; answer: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function articleLd(post: {
  title: string;
  body: string;
  publishedAt: string | null;
  updatedAt: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
  };
}
