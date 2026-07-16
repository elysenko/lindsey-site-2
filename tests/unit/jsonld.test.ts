import { describe, it, expect } from 'vitest';
import {
  organizationJsonLd,
  personJsonLd,
  serviceJsonLd,
  faqPageJsonLd,
  articleJsonLd,
  breadcrumbJsonLd,
} from '@/lib/jsonld';

describe('organizationJsonLd', () => {
  it('produces a valid schema.org Organization', () => {
    const json = organizationJsonLd({
      name: 'LeBarre Group',
      url: '/',
      logo: '/logo.svg',
      sameAs: ['https://linkedin.com/company/x'],
    });
    expect(json['@context']).toBe('https://schema.org');
    expect(json['@type']).toBe('Organization');
    expect(json.name).toBe('LeBarre Group');
    // relative asset paths are absolutized against NEXT_PUBLIC_SITE_URL
    expect(json.logo).toBe('https://lebarregroup.com/logo.svg');
    expect(json.sameAs).toEqual(['https://linkedin.com/company/x']);
  });
});

describe('personJsonLd', () => {
  it('emits a Person and omits nullish fields', () => {
    const json = personJsonLd({
      name: 'Aiko Tanaka',
      jobTitle: 'Creative Director',
      honorificPrefix: null,
      knowsAbout: ['Design'],
    });
    expect(json['@type']).toBe('Person');
    expect(json.jobTitle).toBe('Creative Director');
    expect(json).not.toHaveProperty('honorificPrefix');
    expect(json.knowsAbout).toEqual(['Design']);
  });
});

describe('serviceJsonLd', () => {
  it('nests an OfferCatalog when offers are present', () => {
    const json = serviceJsonLd({
      name: 'Brand Strategy',
      description: 'desc',
      providerName: 'LeBarre Group',
      offers: [{ name: 'Positioning', description: 'p' }],
    }) as Record<string, any>;
    expect(json['@type']).toBe('Service');
    expect(json.provider['@type']).toBe('Organization');
    expect(json.hasOfferCatalog['@type']).toBe('OfferCatalog');
    expect(json.hasOfferCatalog.itemListElement[0].itemOffered.name).toBe('Positioning');
  });
});

describe('faqPageJsonLd', () => {
  it('maps items to Question/Answer entities', () => {
    const json = faqPageJsonLd([{ question: 'Q?', answer: 'A.' }]) as Record<string, any>;
    expect(json['@type']).toBe('FAQPage');
    expect(json.mainEntity[0]['@type']).toBe('Question');
    expect(json.mainEntity[0].acceptedAnswer.text).toBe('A.');
  });
});

describe('articleJsonLd', () => {
  it('serializes dates to ISO strings', () => {
    const json = articleJsonLd({
      headline: 'Title',
      url: '/insights/x',
      datePublished: new Date('2026-01-01T00:00:00Z'),
    }) as Record<string, any>;
    expect(json['@type']).toBe('Article');
    expect(json.url).toBe('https://lebarregroup.com/insights/x');
    expect(json.datePublished).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('breadcrumbJsonLd', () => {
  it('numbers positions from 1 and absolutizes item URLs', () => {
    const json = breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
    ]) as Record<string, any>;
    expect(json['@type']).toBe('BreadcrumbList');
    expect(json.itemListElement[0].position).toBe(1);
    expect(json.itemListElement[1].position).toBe(2);
    expect(json.itemListElement[1].item).toBe('https://lebarregroup.com/about');
  });
});
