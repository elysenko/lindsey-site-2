// Static testimonial + trust-logo content for the homepage and service pages.

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'LeBarre Group gave us language for what we had always struggled to explain. Within a quarter our sales team was closing on story, not discounts.',
    name: 'Mariel Ostrander',
    role: 'Chief Executive Officer',
    company: 'Northwind Capital Partners',
  },
  {
    quote:
      'The competitive intelligence work alone paid for the engagement. They found white space three of our competitors had left wide open.',
    name: 'David Osei',
    role: 'VP, Marketing',
    company: 'Halden Health',
  },
  {
    quote:
      'Our founder went from invisible to invited-to-keynote in under a year. The point-of-view platform they built is the reason.',
    name: 'Priya Nakamura',
    role: 'Head of Communications',
    company: 'Verdant Robotics',
  },
];

export interface TrustLogo {
  name: string;
  /** Path to a static SVG wordmark asset under /public, rendered via next/image. */
  src: string;
}

export const TRUST_LOGOS: TrustLogo[] = [
  { name: 'Northwind Capital', src: '/logos/northwind-capital.svg' },
  { name: 'Halden Health', src: '/logos/halden-health.svg' },
  { name: 'Verdant Robotics', src: '/logos/verdant-robotics.svg' },
  { name: 'Aperture Labs', src: '/logos/aperture-labs.svg' },
  { name: 'Callister & Roe', src: '/logos/callister-roe.svg' },
  { name: 'Meridian Institute', src: '/logos/meridian-institute.svg' },
];
