import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { listTeamMembers } from '@/lib/content';
import { SITE } from '@/content/site';
import Breadcrumbs from '@/components/Breadcrumbs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
  description:
    'LeBarre Group is a brand-intelligence consultancy. Meet the team and the philosophy behind our work.',
};

const VALUES = [
  { t: 'Evidence over instinct', d: 'We earn the right to an opinion with research. Strategy should survive scrutiny.' },
  { t: 'Clarity is kindness', d: 'A brand that says one thing well beats one that says ten things faintly.' },
  { t: 'Own your position', d: 'We help you claim territory competitors cannot credibly take back.' },
  { t: 'Built to compound', d: 'Every asset, article, and appearance should reinforce the same story.' },
];

export default async function AboutPage() {
  const team = await listTeamMembers();

  return (
    <div>
      <section className="bg-ink text-parchment">
        <div className="container-page py-16">
          <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]} />
          <div className="mt-6 max-w-3xl">
            <span className="eyebrow text-gold-soft">About</span>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
              A consultancy built on intelligence, not intuition.
            </h1>
            <p className="mt-5 text-lg text-parchment/80">
              {SITE.name} exists to help ambitious organizations own a position the market cannot
              ignore. We combine rigorous research, disciplined strategy, and considered design so
              that what you stand for is unmistakable — to customers, to talent, and to the search
              and AI systems that now mediate reputation.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map((v) => (
            <div key={v.t} className="rounded-xl border border-ink/10 bg-white p-7">
              <h2 className="text-lg font-semibold">{v.t}</h2>
              <p className="mt-2 text-ink-muted">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="max-w-2xl">
          <span className="eyebrow">The team</span>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">The people behind the work.</h2>
        </div>

        {team.length === 0 ? (
          <p className="mt-8 text-ink-muted">Team profiles are coming soon.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <Link
                key={m.slug}
                href={`/team/${m.slug}`}
                className="group rounded-xl border border-ink/10 bg-white p-6 transition-shadow hover:shadow-lg"
              >
                <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-lg bg-parchment-deep">
                  <Image
                    src={m.headshotUrl || '/avatar-placeholder.svg'}
                    alt={`Portrait of ${m.fullName}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-ink">
                  {m.honorificPrefix ? `${m.honorificPrefix} ` : ''}
                  {m.fullName}
                </h3>
                <p className="mt-1 text-sm font-medium text-gold-deep">{m.title}</p>
                <p className="mt-3 line-clamp-3 text-sm text-ink-muted">{m.bio}</p>
                <span className="mt-4 inline-block text-sm font-semibold group-hover:text-gold-deep">
                  Read profile →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
