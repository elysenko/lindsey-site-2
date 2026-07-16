import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import InsightEditor from '@/components/admin/InsightEditor';

export const dynamic = 'force-dynamic';

export default async function EditInsightPage({ params }: { params: { id: string } }) {
  const post = await db.insightsPost.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/insights" className="text-sm font-semibold text-gold-deep">← All insights</Link>
      <h1 className="mt-3 text-2xl font-semibold">Edit insight</h1>
      <p className="mt-1 text-ink-muted">
        Slug: <code>{post.slug}</code>
        {post.status === 'PUBLISHED' && (
          <>
            {' · '}
            <Link href={`/insights/${post.slug}`} className="text-gold-deep" target="_blank">
              View live →
            </Link>
          </>
        )}
      </p>
      <div className="mt-6">
        <InsightEditor
          mode="edit"
          postId={post.id}
          initial={{ title: post.title, slug: post.slug, body: post.body, status: post.status }}
        />
      </div>
    </div>
  );
}
