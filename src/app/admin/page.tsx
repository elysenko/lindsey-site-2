import Link from 'next/link';
import { format } from 'date-fns';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [totalLeads, newLeads, completedBriefs, publishedPosts, draftPosts, recent] =
    await Promise.all([
      db.lead.count(),
      db.lead.count({ where: { leadStatus: 'NEW' } }),
      db.lead.count({ where: { briefStatus: 'COMPLETED' } }),
      db.insightsPost.count({ where: { status: 'PUBLISHED' } }),
      db.insightsPost.count({ where: { status: 'DRAFT' } }),
      db.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

  const stats = [
    { label: 'Total leads', value: totalLeads },
    { label: 'New leads', value: newLeads },
    { label: 'Completed briefs', value: completedBriefs },
    { label: 'Published insights', value: publishedPosts },
    { label: 'Draft insights', value: draftPosts },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-ink-muted">An overview of leads and content.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-ink/10 bg-white p-5">
            <div className="text-3xl font-semibold text-ink">{s.value}</div>
            <div className="mt-1 text-sm text-ink-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent leads</h2>
          <Link href="/admin/leads" className="text-sm font-semibold text-gold-deep">View all →</Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-ink/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-parchment-deep text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ink-muted">No leads yet.</td>
                </tr>
              ) : (
                recent.map((l) => (
                  <tr key={l.id} className="hover:bg-parchment/50">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/admin/leads/${l.id}`} className="hover:text-gold-deep">{l.fullName}</Link>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{l.email}</td>
                    <td className="px-4 py-3">{l.leadStatus}</td>
                    <td className="px-4 py-3 text-ink-muted">{format(new Date(l.createdAt), 'MMM d, yyyy')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
