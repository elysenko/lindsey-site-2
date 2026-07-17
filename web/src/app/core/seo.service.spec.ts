import {
  organizationLd,
  breadcrumbLd,
  serviceLd,
  personLd,
  faqPageLd,
  articleLd,
} from './seo.service';

describe('JSON-LD builders', () => {
  describe('organizationLd', () => {
    it('produces a valid schema.org Organization', () => {
      const json = organizationLd('https://lebarregroup.com');
      expect(json['@context']).toBe('https://schema.org');
      expect(json['@type']).toBe('Organization');
      expect(json['name']).toBe('LeBarre Group');
      expect(json['url']).toBe('https://lebarregroup.com');
    });
  });

  describe('breadcrumbLd', () => {
    it('numbers positions from 1 and absolutizes item URLs against origin', () => {
      const json = breadcrumbLd(
        [
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ],
        'https://lebarregroup.com',
      ) as any;
      expect(json['@type']).toBe('BreadcrumbList');
      expect(json.itemListElement[0].position).toBe(1);
      expect(json.itemListElement[1].position).toBe(2);
      expect(json.itemListElement[1].item).toBe('https://lebarregroup.com/about');
    });
  });

  describe('serviceLd', () => {
    it('nests an OfferCatalog when offerings are present', () => {
      const json = serviceLd('Brand Strategy', 'desc', ['Positioning']) as any;
      expect(json['@type']).toBe('Service');
      expect(json.provider['@type']).toBe('Organization');
      expect(json.hasOfferCatalog['@type']).toBe('OfferCatalog');
      expect(json.hasOfferCatalog.itemListElement[0].itemOffered.name).toBe(
        'Positioning',
      );
    });

    it('omits the OfferCatalog when there are no offerings', () => {
      const json = serviceLd('Brand Strategy', 'desc', []) as any;
      expect(json.hasOfferCatalog).toBeUndefined();
    });
  });

  describe('personLd', () => {
    it('emits a Person and omits nullish honorific/links', () => {
      const json = personLd({
        fullName: 'Aiko Tanaka',
        title: 'Creative Director',
        bio: 'Bio.',
        honorificPrefix: null,
        linkedinUrl: null,
        headshotUrl: null,
      }) as any;
      expect(json['@type']).toBe('Person');
      expect(json.jobTitle).toBe('Creative Director');
      expect(json.honorificPrefix).toBeUndefined();
      expect(json.sameAs).toBeUndefined();
    });
  });

  describe('faqPageLd', () => {
    it('maps items to Question/Answer entities', () => {
      const json = faqPageLd([{ question: 'Q?', answer: 'A.' }]) as any;
      expect(json['@type']).toBe('FAQPage');
      expect(json.mainEntity[0]['@type']).toBe('Question');
      expect(json.mainEntity[0].acceptedAnswer.text).toBe('A.');
    });
  });

  describe('articleLd', () => {
    it('serializes an Article with published/modified dates', () => {
      const json = articleLd({
        title: 'Title',
        body: 'body',
        publishedAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      }) as any;
      expect(json['@type']).toBe('Article');
      expect(json.headline).toBe('Title');
      expect(json.datePublished).toBe('2026-01-01T00:00:00.000Z');
      expect(json.dateModified).toBe('2026-02-01T00:00:00.000Z');
    });
  });
});
