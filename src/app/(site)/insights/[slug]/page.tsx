import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { getPublishedPost, excerpt, readingMinutes } from '@/lib/content';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { articleJsonLd } from '@/lib/jsonld';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPublishedPost(params.slug);
  if (!post) return {};
  return { title: post.title, description: excerpt(post.body, 30) };
}

export default async function InsightPage({ params }: { params: { slug: string } }) {
  const post = await getPublishedPost(params.slug);
  if (!post) notFound();

  const url = `/insights/${post.slug}`;
  const paragraphs = post.body.split(/\n{2,}/).filter((p) => p.trim());

  return (
    <article className="container-page py-16">
      <JsonLd
        data={articleJsonLd({
          headline: post.title,
          description: excerpt(post.body, 30),
          url,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          authorName: post.author.email,
        })}
      />
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Insights', path: '/insights' },
          { name: post.title, path: url },
        ]}
      />

      <header className="mx-auto mt-8 max-w-3xl">
        <div className="text-xs text-ink-muted">
          {post.publishedAt ? format(new Date(post.publishedAt), 'MMMM d, yyyy') : ''} ·{' '}
          {readingMinutes(post.body)} min read
        </div>
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
          {post.title}
        </h1>
      </header>

      <div className="prose-content mx-auto mt-10 max-w-prose">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="mx-auto mt-14 max-w-prose border-t border-ink/10 pt-8">
        <Link href="/insights" className="text-sm font-semibold text-gold-deep">
          ← All insights
        </Link>
      </div>
    </article>
  );
}
