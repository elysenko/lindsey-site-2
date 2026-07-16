import Link from 'next/link';
import { format } from 'date-fns';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminInsightsPage() {
  const posts = await db.insightsPost.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { author: { select: { email: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Insights</h1>
          <p className="mt-1 text-ink-muted">{posts.length} post(s)</p>
        </div>
        <Link href="/admin/insights/new" className="btn-primary py-2.5">New post</Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-parchment-deep text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {posts.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-muted">No posts yet.</td></tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="hover:bg-parchment/50">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3">
                    <span className={p.status === 'PUBLISHED' ? 'text-green-700' : 'text-ink-muted'}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{p.author?.email}</td>
                  <td className="px-4 py-3 text-ink-muted">{format(new Date(p.updatedAt), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/insights/${p.id}/edit`} className="font-semibold text-gold-deep">Edit</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
