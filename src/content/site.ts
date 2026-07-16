// Brand / organization constants and global site metadata for LeBarre Group.
// Typed static content consumed by layout, JSON-LD builders, and footer.

export const SITE = {
  name: 'LeBarre Group',
  legalName: 'LeBarre Group LLC',
  tagline: 'Intelligence-led brand strategy',
  headline: 'Brand strategy that earns the room before you enter it.',
  subhead:
    'LeBarre Group is a brand-intelligence consultancy for leaders who refuse to blend in. We turn research, positioning, and narrative into a brand that commands trust across every search, screen, and boardroom.',
  description:
    'LeBarre Group is a brand-intelligence consultancy specializing in brand strategy, positioning, market intelligence, and executive thought-leadership for ambitious organizations.',
  email: 'hello@lebarregroup.com',
  phone: '+1 (212) 555-0117',
  addressLocality: 'New York',
  addressRegion: 'NY',
  logoPath: '/logo.svg',
  sameAs: [
    'https://www.linkedin.com/company/lebarre-group',
    'https://twitter.com/lebarregroup',
  ],
} as const;

export const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Insights', href: '/insights' },
  { label: 'FAQ', href: '/faq' },
];

export const FOOTER_LINKS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Insights', href: '/insights' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'Brand Strategy & Positioning', href: '/services/brand-strategy-positioning' },
      { label: 'Brand Identity & Design', href: '/services/brand-identity-design' },
      { label: 'Market & Competitive Intelligence', href: '/services/market-intelligence' },
      { label: 'Executive Thought Leadership', href: '/services/executive-thought-leadership' },
    ],
  },
  {
    heading: 'Get Started',
    links: [
      { label: 'Request a Consultation', href: '/consult' },
      { label: 'Contact', href: '/consult' },
    ],
  },
];
