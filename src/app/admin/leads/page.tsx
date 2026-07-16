import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { format } from 'date-fns';
import { db } from '@/lib/db';
import { LEAD_STATUSES, leadStatusEnum } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

const CHALLENGE_FILTERS = [
  'Unclear or inconsistent positioning',
  'Outdated brand identity',
  'Losing to competitors on story',
  'Low market visibility / discoverability',
  'Executive / founder visibility',
  'Launching a new product or venture',
  'Rebrand or merger integration',
];

interface SP {
  status?: string;
  challenge?: string;
  sort?: string;
  page?: string;
}

export default async function AdminLeadsPage({ searchParams }: { searchParams: SP }) {
  const sort = searchParams.sort === 'oldest' ? 'asc' : 'desc';
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);

  const where: Prisma.LeadWhereInput = {};
  const parsedStatus = leadStatusEnum.safeParse(searchParams.status);
  if (parsedStatus.success) where.leadStatus = parsedStatus.data;
  if (searchParams.challenge) where.challengeCategories = { has: searchParams.challenge };

  const [total, leads] = await Promise.all([
    db.lead.count({ where }),
    db.lead.findMany({
      where,
      orderBy: { createdAt: sort },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { brief: { select: { completedAt: true } } },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageUrl(p: number): string {
    const sp = new URLSearchParams();
    if (searchParams.status) sp.set('status', searchParams.status);
    if (searchParams.challenge) sp.set('challenge', searchParams.challenge);
    if (searchParams.sort) sp.set('sort', searchParams.sort);
    sp.set('page', String(p));
    return `/admin/leads?${sp.toString()}`;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Leads</h1>
      <p className="mt-1 text-ink-muted">{total} total</p>

      {/* Filters — GET form keeps state in the URL */}
      <form method="get" className="mt-6 grid gap-4 rounded-xl border border-ink/10 bg-white p-5 sm:grid-cols-4">
        <div>
          <label htmlFor="status" className="field-label">Status</label>
          <select id="status" name="status" defaultValue={searchParams.status || ''} className="field-input">
            <option value="">All</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="challenge" className="field-label">Challenge</label>
          <select id="challenge" name="challenge" defaultValue={searchParams.challenge || ''} className="field-input">
            <option value="">All</option>
            {CHALLENGE_FILTERS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="field-label">Sort</label>
          <select id="sort" name="sort" defaultValue={searchParams.sort || 'newest'} className="field-input">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary py-2.5">Apply</button>
          <Link href="/admin/leads" className="btn-secondary py-2.5">Reset</Link>
        </div>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-parchment-deep text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Organization</th>
              <th className="px-4 py-3">Challenges</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Brief</th>
              <th className="px-4 py-3">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">No leads match these filters.</td>
              </tr>
            ) : (
              leads.map((l) => (
                <tr key={l.id} className="hover:bg-parchment/50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/leads/${l.id}`} className="hover:text-gold-deep">{l.fullName}</Link>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{l.organization || '—'}</td>
                  <td className="px-4 py-3 text-ink-muted">{l.challengeCategories.length}</td>
                  <td className="px-4 py-3">{l.leadStatus}</td>
                  <td className="px-4 py-3">{l.briefStatus}</td>
                  <td className="px-4 py-3 text-ink-muted">{format(new Date(l.createdAt), 'MMM d, yyyy')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3">
          {page > 1 && <Link href={pageUrl(page - 1)} className="btn-secondary py-2">Previous</Link>}
          <span className="text-sm text-ink-muted">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={pageUrl(page + 1)} className="btn-secondary py-2">Next</Link>}
        </nav>
      )}
    </div>
  );
}
