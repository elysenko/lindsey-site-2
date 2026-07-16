import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { db } from '@/lib/db';
import { BRIEF_FIELDS, type BriefField } from '@/lib/validation';
import LeadEditor from '@/components/admin/LeadEditor';

export const dynamic = 'force-dynamic';

export default async function AdminLeadDetail({ params }: { params: { id: string } }) {
  const lead = await db.lead.findUnique({
    where: { id: params.id },
    include: {
      brief: true,
      notes: { orderBy: { createdAt: 'desc' }, include: { author: { select: { email: true } } } },
      audits: { orderBy: { editedAt: 'desc' }, include: { admin: { select: { email: true } } } },
    },
  });

  if (!lead) notFound();

  const briefValues: Partial<Record<BriefField, string | null>> = {};
  for (const f of BRIEF_FIELDS) {
    briefValues[f] = (lead.brief as Record<string, string | null> | null)?.[f] ?? '';
  }

  return (
    <div>
      <Link href="/admin/leads" className="text-sm font-semibold text-gold-deep">← All leads</Link>
      <h1 className="mt-3 text-2xl font-semibold">{lead.fullName}</h1>
      <p className="mt-1 text-ink-muted">
        Received {format(new Date(lead.createdAt), 'MMMM d, yyyy · h:mm a')}
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <LeadEditor
            leadId={lead.id}
            currentStatus={lead.leadStatus}
            brief={briefValues}
          />

          {/* Notes history */}
          {lead.notes.length > 0 && (
            <section className="mt-8 rounded-xl border border-ink/10 bg-white p-6">
              <h2 className="text-lg font-semibold">Notes</h2>
              <ul className="mt-4 space-y-4">
                {lead.notes.map((n) => (
                  <li key={n.id} className="border-l-2 border-gold/40 pl-4">
                    <p className="text-sm text-ink-soft">{n.body}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {n.author?.email} · {format(new Date(n.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Audit trail */}
          {lead.audits.length > 0 && (
            <section className="mt-8 rounded-xl border border-ink/10 bg-white p-6">
              <h2 className="text-lg font-semibold">Brief edit history</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {lead.audits.map((a) => (
                  <li key={a.id} className="text-ink-muted">
                    <span className="font-medium text-ink">{a.field}</span> changed by{' '}
                    {a.admin?.email} on {format(new Date(a.editedAt), 'MMM d, yyyy h:mm a')}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Contact + submission sidebar */}
        <aside className="space-y-6">
          <section className="rounded-xl border border-ink/10 bg-white p-6">
            <h2 className="text-lg font-semibold">Contact</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-ink-muted">Email</dt>
                <dd><a href={`mailto:${lead.email}`} className="text-gold-deep">{lead.email}</a></dd>
              </div>
              {lead.phone && (
                <div><dt className="text-ink-muted">Phone</dt><dd>{lead.phone}</dd></div>
              )}
              {lead.organization && (
                <div><dt className="text-ink-muted">Organization</dt><dd>{lead.organization}</dd></div>
              )}
              {lead.serviceInterest && (
                <div><dt className="text-ink-muted">Service interest</dt><dd>{lead.serviceInterest}</dd></div>
              )}
              <div>
                <dt className="text-ink-muted">Brief status</dt>
                <dd>{lead.briefStatus}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-ink/10 bg-white p-6">
            <h2 className="text-lg font-semibold">Challenges</h2>
            {lead.challengeCategories.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">None specified.</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {lead.challengeCategories.map((c) => (
                  <li key={c} className="rounded-full bg-parchment-deep px-3 py-1 text-xs text-ink-soft">{c}</li>
                ))}
              </ul>
            )}
            {lead.situationDescription && (
              <>
                <h3 className="mt-5 text-sm font-semibold text-ink-muted">Situation</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-ink-soft">{lead.situationDescription}</p>
              </>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
