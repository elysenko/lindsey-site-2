import type { Metadata } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';
import { listPublishedPosts, excerpt, readingMinutes } from '@/lib/content';
import Breadcrumbs from '@/components/Breadcrumbs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Insights',
  description:
    'Perspectives on brand strategy, positioning, market intelligence, and thought leadership from LeBarre Group.',
};

export default async function InsightsPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const { posts, totalPages } = await listPublishedPosts(page);

  return (
    <div className="container-page py-16">
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Insights', path: '/insights' }]} />

      <header className="mt-6 max-w-2xl">
        <span className="eyebrow">Insights</span>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Ideas worth positioning around.</h1>
        <p className="mt-4 text-ink-muted">
          Long-form thinking on strategy, brand intelligence, and the discipline of being
          impossible to ignore.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="mt-12 text-ink-muted">New articles are on the way. Check back soon.</p>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/insights/${p.slug}`}
              className="group flex flex-col rounded-xl border border-ink/10 bg-white p-7 transition-shadow hover:shadow-lg"
            >
              <div className="text-xs text-ink-muted">
                {p.publishedAt ? format(new Date(p.publishedAt), 'MMMM d, yyyy') : 'Draft'} ·{' '}
                {readingMinutes(p.body)} min read
              </div>
              <h2 className="mt-3 text-xl font-semibold text-ink group-hover:text-gold-deep">
                {p.title}
              </h2>
              <p className="mt-3 flex-1 text-sm text-ink-muted">{excerpt(p.body)}</p>
              <span className="mt-5 text-sm font-semibold">Read article →</span>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link href={`/insights?page=${page - 1}`} className="btn-secondary">Previous</Link>
          )}
          <span className="text-sm text-ink-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/insights?page=${page + 1}`} className="btn-secondary">Next</Link>
          )}
        </nav>
      )}
    </div>
  );
}
