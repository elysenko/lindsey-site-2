export interface ServiceOffering {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  outcomes: string[];
  deliverables: string[];
}

/**
 * Static service catalog. Powers /api/services, the /services cards, and the
 * Service + OfferCatalog JSON-LD on the frontend.
 */
export const SERVICES: ServiceOffering[] = [
  {
    slug: 'brand-positioning',
    name: 'Brand Positioning',
    tagline: 'Choose what to be famous for — and defend it.',
    summary:
      'We help you find the single, defensible idea that makes your brand the obvious choice in its category, grounded in evidence rather than adjectives.',
    outcomes: [
      'A clear, differentiated position the whole organization can rally behind',
      'A category frame that puts competitors on your terms',
      'Decision-grade rationale leadership can defend to the board',
    ],
    deliverables: [
      'Positioning statement and strategic rationale',
      'Competitive category map',
      'Messaging hierarchy and proof architecture',
    ],
  },
  {
    slug: 'narrative-strategy',
    name: 'Narrative & Messaging',
    tagline: 'One story, told with discipline everywhere.',
    summary:
      'We translate strategy into a narrative and message architecture your teams can apply consistently across every channel and audience.',
    outcomes: [
      'A coherent brand narrative that scales across teams',
      'Audience-specific messaging that never drifts off-strategy',
      'Faster, more confident content and campaign decisions',
    ],
    deliverables: [
      'Master brand narrative',
      'Audience messaging matrix',
      'Voice and tone guidelines',
    ],
  },
  {
    slug: 'brand-identity',
    name: 'Identity & Design',
    tagline: 'A distinctive system built to endure.',
    summary:
      'We express your strategy as a disciplined visual and verbal identity — distinctive, coherent, and built to last rather than to trend.',
    outcomes: [
      'A recognizable, ownable identity system',
      'Consistent application across every touchpoint',
      'Design guidelines teams can use with confidence',
    ],
    deliverables: [
      'Logo, color, and typography system',
      'Brand guidelines',
      'Core template and asset library',
    ],
  },
  {
    slug: 'market-intelligence',
    name: 'Market Intelligence',
    tagline: 'Decision-grade insight, not raw data.',
    summary:
      'We design the competitive and audience research that grounds every engagement, turning signal into the strategic decisions brand depends on.',
    outcomes: [
      'A rigorous read of your category and competitors',
      'Validated audience segments and needs',
      'Evidence that de-risks the positioning decision',
    ],
    deliverables: [
      'Competitive landscape analysis',
      'Audience research and segmentation',
      'Insight briefing and recommendations',
    ],
  },
];

export function findService(slug: string): ServiceOffering | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
