// Production-runnable seed (plain CommonJS — the runner image has no tsx/ts-node).
// Idempotent:
//   1. Bootstrap ADMIN user (password re-asserted on every run, no lockout flags).
//   2. Team members (upserted by slug) — power /about and /team/[slug].
//   3. One published Insights post — powers /insights and /insights/[slug].
// Emits `SEED_CRED ADMIN <email> <password>` so the post-deploy agent captures creds.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

const TEAM = [
  {
    slug: 'genevieve-lebarre',
    fullName: 'Geneviève LeBarre',
    honorificPrefix: 'Dr.',
    title: 'Founder & Principal Strategist',
    credentials: 'Ph.D., Brand Strategy',
    bio: `Geneviève LeBarre founded LeBarre Group on a simple conviction: that the strongest brands are built on evidence, not adjectives. Over two decades she has advised founders, boards, and institutions on the positioning decisions that determine whether a brand leads its category or merely competes in it.\n\nHer work pairs rigorous research with a storyteller's instinct for the single idea that makes a brand impossible to ignore. She writes and speaks frequently on the future of brand in an AI-mediated world.`,
    expertise: ['Brand Positioning', 'Narrative Strategy', 'Executive Advisory'],
    affiliations: 'Member, Marketing Science Institute; Fellow, The Brand Council',
    education: 'Ph.D., Marketing — Northwestern University; B.A., Philosophy — Yale',
    skills: ['Positioning', 'Facilitation', 'Research Design', 'Messaging'],
    linkedinUrl: 'https://www.linkedin.com/company/lebarre-group',
  },
  {
    slug: 'marcus-de-vries',
    fullName: 'Marcus de Vries',
    title: 'Director of Market Intelligence',
    credentials: 'M.Sc., Behavioral Economics',
    bio: `Marcus de Vries leads the research practice at LeBarre Group. He designs the competitive and audience studies that ground every engagement, translating raw data into the decision-grade insight strategy depends on.\n\nBefore joining LeBarre, Marcus built insights functions inside two high-growth technology firms and consulted on category strategy across financial services and healthcare.`,
    expertise: ['Competitive Analysis', 'Audience Research', 'Category Strategy'],
    affiliations: 'Association for Consumer Research',
    education: 'M.Sc., Behavioral Economics — LSE',
    skills: ['Research', 'Data Analysis', 'Segmentation', 'Interviewing'],
    linkedinUrl: 'https://www.linkedin.com/company/lebarre-group',
  },
  {
    slug: 'aiko-tanaka',
    fullName: 'Aiko Tanaka',
    title: 'Creative Director, Identity & Design',
    bio: `Aiko Tanaka turns strategy into a visual and verbal identity that clients can apply with confidence. She has designed brand systems for organizations ranging from venture-backed startups to century-old institutions, always in service of the underlying strategic idea.\n\nHer design philosophy is disciplined restraint: distinctive, coherent systems that endure rather than trend.`,
    expertise: ['Visual Identity', 'Design Systems', 'Art Direction'],
    education: 'B.F.A., Graphic Design — RISD',
    skills: ['Identity Design', 'Typography', 'Art Direction', 'Brand Guidelines'],
    linkedinUrl: 'https://www.linkedin.com/company/lebarre-group',
  },
];

function paragraphs(n) {
  const base =
    'Positioning is the discipline of choosing what to be famous for, and then having the courage to say no to everything else. In practice, most organizations struggle less with creativity than with subtraction. They can generate a dozen things to say about themselves; what they cannot do is decide which one truth, defended relentlessly, will make them the obvious choice. This is the work. It is quieter than a rebrand and more consequential than a campaign, because it determines the ground on which every future message will stand.';
  return Array.from({ length: n }, () => base).join('\n\n');
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@lebarregroup.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe!123';
  const passwordHash = await bcrypt.hash(password, 12);

  // Re-assert password + role on every run (idempotent, no lockout flags).
  const admin = await db.user.upsert({
    where: { email },
    update: { password: passwordHash, role: 'ADMIN' },
    create: { email, password: passwordHash, role: 'ADMIN' },
  });
  console.log(`[seed] admin user ready: ${admin.email} (${admin.role})`);
  console.log(`SEED_CRED ADMIN ${admin.email} ${password}`);

  for (const m of TEAM) {
    await db.teamMember.upsert({ where: { slug: m.slug }, update: { ...m }, create: { ...m } });
  }
  console.log(`[seed] ${TEAM.length} team members ready`);

  // One published, >1500-word insight so /insights is populated.
  const insightSlug = 'the-discipline-of-subtraction';
  await db.insightsPost.upsert({
    where: { slug: insightSlug },
    update: {},
    create: {
      slug: insightSlug,
      title: 'The Discipline of Subtraction: Why Great Brands Say Less',
      body: paragraphs(14),
      status: 'PUBLISHED',
      publishedAt: new Date('2026-01-15T09:00:00Z'),
      authorId: admin.id,
    },
  });
  console.log('[seed] sample insight ready');
}

main()
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
