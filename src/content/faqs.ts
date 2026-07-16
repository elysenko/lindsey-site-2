// FAQ content grouped by category. ≥15 total Q&A. Each item may be tagged to a
// service slug so service detail pages can embed their relevant subset.

export interface Faq {
  question: string;
  answer: string;
  category: string;
  serviceSlug?: string;
}

export const FAQ_CATEGORIES = [
  'Getting Started',
  'Engagements & Process',
  'Brand Strategy',
  'Design & Identity',
  'Research & Intelligence',
  'Thought Leadership',
] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export const FAQS: Faq[] = [
  {
    category: 'Getting Started',
    question: 'How do I begin working with LeBarre Group?',
    answer:
      'Every engagement starts with a consultation. Share a little about your organization and the challenge you are facing through our consultation form, and we will follow up to schedule a strategy conversation and, where useful, a Brand Intelligence Brief.',
  },
  {
    category: 'Getting Started',
    question: 'What size of organization do you work with?',
    answer:
      'We work with funded startups, growth-stage companies, professional-services firms, and established institutions. The common thread is ambition and a willingness to make deliberate strategic choices — not headcount.',
  },
  {
    category: 'Getting Started',
    question: 'Do you work with organizations outside the United States?',
    answer:
      'Yes. We work with clients internationally and run engagements remotely with periodic in-person workshops where they add value.',
  },
  {
    category: 'Engagements & Process',
    question: 'How long does a typical engagement take?',
    answer:
      'A focused positioning engagement typically runs six to ten weeks. Larger programs that span strategy, identity, and a content engine run three to six months. We scope every engagement to your decision timeline.',
  },
  {
    category: 'Engagements & Process',
    question: 'What is the Brand Intelligence Brief?',
    answer:
      'It is a structured questionnaire we invite you to complete after your consultation. It captures your mission, vision, differentiators, audiences, and definition of success so our first strategy session starts from depth rather than a blank page.',
  },
  {
    category: 'Engagements & Process',
    question: 'How are engagements priced?',
    answer:
      'Engagements are scoped to fixed project fees based on the outcomes and deliverables involved. You will always see the full scope and price before any work begins — no hourly surprises.',
  },
  {
    category: 'Brand Strategy',
    question: 'What is the difference between branding and positioning?',
    answer:
      'Positioning is the strategic decision about what territory you own in your audience’s mind. Branding is how that decision is expressed — in identity, voice, and experience. We start with positioning because design without strategy is decoration.',
    serviceSlug: 'brand-strategy-positioning',
  },
  {
    category: 'Brand Strategy',
    question: 'We already have a logo. Do we still need strategy work?',
    answer:
      'Often, yes. A logo is an asset; a strategy is a decision about what that asset should stand for. Many clients arrive with strong visuals but no shared answer to "what are we famous for?" — that is precisely where we begin.',
    serviceSlug: 'brand-strategy-positioning',
  },
  {
    category: 'Brand Strategy',
    question: 'How do you make positioning defensible?',
    answer:
      'We locate the intersection of what you do best, what your audience values, and what competitors cannot credibly claim. A position built on a genuine, ownable truth is far harder to copy than a clever tagline.',
    serviceSlug: 'brand-strategy-positioning',
  },
  {
    category: 'Design & Identity',
    question: 'Do you design the full visual identity in-house?',
    answer:
      'Yes. Once strategy is set, we design the wordmark, color system, typography, and imagery direction, and document them in a living brand guideline your teams can apply consistently.',
    serviceSlug: 'brand-identity-design',
  },
  {
    category: 'Design & Identity',
    question: 'Will we own the assets you create?',
    answer:
      'Fully. On completion you own all final brand assets, source files, and guidelines outright, with no ongoing license fees.',
    serviceSlug: 'brand-identity-design',
  },
  {
    category: 'Research & Intelligence',
    question: 'What does your market intelligence work involve?',
    answer:
      'We combine stakeholder and customer interviews with structured competitive and category analysis to map the landscape, expose vulnerable competitor claims, and surface where the real white space sits.',
    serviceSlug: 'market-intelligence',
  },
  {
    category: 'Research & Intelligence',
    question: 'How do you gather audience insight?',
    answer:
      'Primarily through primary research — one-to-one interviews and perception analysis — supplemented by category data. We are interested in what audiences actually do and value, not only what they report in surveys.',
    serviceSlug: 'market-intelligence',
  },
  {
    category: 'Thought Leadership',
    question: 'How do you make executives more visible in search and AI answers?',
    answer:
      'We build a clear point-of-view platform for each leader, then produce structured, well-sourced content engineered for both human trust and machine citation — the signals that AI search systems reward.',
    serviceSlug: 'executive-thought-leadership',
  },
  {
    category: 'Thought Leadership',
    question: 'Do you ghostwrite for executives?',
    answer:
      'Yes. We develop the ideas with your leaders and produce the articles, keynotes, and social narratives in their voice, all anchored to the same underlying brand story so the work compounds.',
    serviceSlug: 'executive-thought-leadership',
  },
  {
    category: 'Thought Leadership',
    question: 'How is thought leadership different from regular content marketing?',
    answer:
      'Content marketing fills a calendar; thought leadership stakes a position. We start from a defensible point of view and build a program that makes your leaders the reference in their field rather than one more voice in the feed.',
    serviceSlug: 'executive-thought-leadership',
  },
];

export function faqsForService(slug: string): Faq[] {
  return FAQS.filter((f) => f.serviceSlug === slug);
}

export function faqsByCategory(category?: string): Faq[] {
  if (!category) return FAQS;
  return FAQS.filter((f) => f.category === category);
}
