import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTeamMember } from '@/lib/content';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { personJsonLd } from '@/lib/jsonld';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const member = await getTeamMember(params.slug);
  if (!member) return {};
  return {
    title: `${member.fullName} — ${member.title}`,
    description: member.bio.slice(0, 155),
  };
}

export default async function TeamMemberPage({ params }: { params: { slug: string } }) {
  const member = await getTeamMember(params.slug);
  if (!member) notFound();

  const url = `/team/${member.slug}`;
  const displayName = `${member.honorificPrefix ? member.honorificPrefix + ' ' : ''}${member.fullName}`;

  return (
    <div className="container-page py-16">
      <JsonLd
        data={personJsonLd({
          name: member.fullName,
          honorificPrefix: member.honorificPrefix,
          jobTitle: member.title,
          description: member.bio,
          image: member.headshotUrl,
          url,
          sameAs: member.linkedinUrl ? [member.linkedinUrl] : [],
          knowsAbout: member.expertise,
          alumniOf: member.education,
        })}
      />
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
          { name: member.fullName, path: url },
        ]}
      />

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_1.8fr]">
        <aside>
          <div className="rounded-xl border border-ink/10 bg-white p-7">
            <h1 className="text-2xl font-semibold">{displayName}</h1>
            {member.credentials && (
              <p className="mt-1 text-sm text-ink-muted">{member.credentials}</p>
            )}
            <p className="mt-2 font-medium text-gold-deep">{member.title}</p>

            {member.expertise.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
                  Expertise
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {member.expertise.map((e) => (
                    <li key={e} className="rounded-full bg-parchment-deep px-3 py-1 text-xs text-ink-soft">
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {member.linkedinUrl && (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-6 w-full"
              >
                LinkedIn
              </a>
            )}
          </div>
        </aside>

        <div>
          <section className="prose-content max-w-none">
            <h2 className="text-2xl font-semibold">Biography</h2>
            <p className="mt-3 whitespace-pre-line">{member.bio}</p>
          </section>

          {member.education && (
            <section className="mt-8">
              <h2 className="text-2xl font-semibold">Education</h2>
              <p className="mt-2 whitespace-pre-line text-ink-soft">{member.education}</p>
            </section>
          )}

          {member.affiliations && (
            <section className="mt-8">
              <h2 className="text-2xl font-semibold">Affiliations</h2>
              <p className="mt-2 whitespace-pre-line text-ink-soft">{member.affiliations}</p>
            </section>
          )}

          {member.skills.length > 0 && (
            <section className="mt-8">
              <h2 className="text-2xl font-semibold">Skills</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {member.skills.map((s) => (
                  <li key={s} className="rounded-full border border-ink/15 px-3 py-1 text-sm text-ink-soft">
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Link href="/about" className="mt-10 inline-block text-sm font-semibold text-gold-deep">
            ← Back to the team
          </Link>
        </div>
      </div>
    </div>
  );
}
