// Typed static service content. Four core services, each with detail copy,
// an offer catalog (for Service JSON-LD), and outcomes. FAQ content lives in
// ./faqs.ts and is joined by slug.

export interface ServiceOffer {
  name: string;
  description: string;
}

export interface Service {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  summary: string;
  overview: string[];
  outcomes: string[];
  offers: ServiceOffer[];
}

export const SERVICES: Service[] = [
  {
    slug: 'brand-strategy-positioning',
    name: 'Brand Strategy & Positioning',
    shortName: 'Brand Strategy',
    tagline: 'Own a position competitors cannot copy.',
    summary:
      'We define the strategic territory your brand can credibly own, then translate it into positioning, messaging, and a narrative your whole organization can rally behind.',
    overview: [
      'Strategy is the discipline of choosing what to be famous for. We start with rigorous discovery — interviews, market analysis, and an audit of how you are currently perceived — to locate the intersection of what you do best, what your audience values, and what your competitors cannot claim.',
      'From that intersection we build a positioning platform: a single organizing idea, a messaging hierarchy, proof points, and a narrative arc. The result is a brand that says one thing clearly instead of ten things faintly.',
    ],
    outcomes: [
      'A defensible positioning statement and messaging hierarchy',
      'A core brand narrative your teams can repeat verbatim',
      'Alignment between leadership, sales, and marketing',
    ],
    offers: [
      { name: 'Brand Positioning Platform', description: 'Positioning statement, value proposition, and proof architecture.' },
      { name: 'Messaging Framework', description: 'Audience-mapped messaging hierarchy and narrative guidelines.' },
      { name: 'Brand Architecture', description: 'Portfolio and sub-brand structure for multi-offer organizations.' },
    ],
  },
  {
    slug: 'brand-identity-design',
    name: 'Brand Identity & Design',
    shortName: 'Identity & Design',
    tagline: 'A brand that looks as considered as it is.',
    summary:
      'We express your strategy in a distinctive visual and verbal identity — logo, typography, color, voice, and a system your teams can apply with confidence.',
    overview: [
      'Identity is strategy made visible. Once positioning is set, we design a coherent system: wordmark, color palette, typography, imagery direction, and a verbal tone of voice that carries the same idea across every touchpoint.',
      'We deliver more than assets. You receive a living brand guideline — usage rules, do and do-not examples, and templates — so the brand stays consistent whether it is applied by your designer, your agency, or an intern on deadline.',
    ],
    outcomes: [
      'A distinctive, ownable visual identity system',
      'A documented tone-of-voice and writing guide',
      'Production-ready templates and brand guidelines',
    ],
    offers: [
      { name: 'Visual Identity System', description: 'Logo suite, color, typography, and imagery direction.' },
      { name: 'Verbal Identity & Voice', description: 'Tone-of-voice principles, lexicon, and writing standards.' },
      { name: 'Brand Guidelines', description: 'Comprehensive usage documentation and templates.' },
    ],
  },
  {
    slug: 'market-intelligence',
    name: 'Market & Competitive Intelligence',
    shortName: 'Market Intelligence',
    tagline: 'Decide with evidence, not instinct.',
    summary:
      'We map your category, decode competitor positioning, and surface the audience insight that tells you where the real opportunity lives.',
    overview: [
      'Great strategy is downstream of great intelligence. We combine qualitative research — stakeholder and customer interviews — with structured competitive and category analysis to give you an honest picture of the landscape.',
      'You leave with a decision-grade briefing: where the white space is, which competitor claims are vulnerable, and what your audience actually cares about versus what they say in surveys.',
    ],
    outcomes: [
      'A competitive landscape and white-space map',
      'Audience insight grounded in primary research',
      'A prioritized set of strategic opportunities',
    ],
    offers: [
      { name: 'Category & Competitor Audit', description: 'Structured analysis of positioning across your market.' },
      { name: 'Audience & Perception Research', description: 'Interviews and analysis of how you are truly perceived.' },
      { name: 'Opportunity Briefing', description: 'Prioritized, decision-grade strategic recommendations.' },
    ],
  },
  {
    slug: 'executive-thought-leadership',
    name: 'Executive & Thought-Leadership Communications',
    shortName: 'Thought Leadership',
    tagline: 'Make your leaders the reference in their field.',
    summary:
      'We build the platforms, narratives, and content engine that turn your executives into the voices your market — and its search engines — cite first.',
    overview: [
      'In an era of AI-mediated search, being findable and being credible are the same problem. We craft executive point-of-view platforms, keynote and article narratives, and an editorial program engineered for both human trust and machine citation.',
      'The work is grounded in your positioning so every talk, post, and byline compounds the same story. Over time your leaders stop chasing relevance and start setting the agenda.',
    ],
    outcomes: [
      'A clear executive point-of-view platform',
      'A content engine optimized for search and AI citation',
      'A calendar of talks, articles, and social narratives',
    ],
    offers: [
      { name: 'Executive POV Platform', description: 'The signature ideas each leader will be known for.' },
      { name: 'Editorial & Content Program', description: 'Article, keynote, and social narrative production.' },
      { name: 'Search & AI Visibility', description: 'Structured content engineered for discovery and citation.' },
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
