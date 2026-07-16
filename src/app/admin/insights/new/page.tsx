import Link from 'next/link';
import InsightEditor from '@/components/admin/InsightEditor';

export const dynamic = 'force-dynamic';

export default function NewInsightPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/insights" className="text-sm font-semibold text-gold-deep">← All insights</Link>
      <h1 className="mt-3 text-2xl font-semibold">New insight</h1>
      <p className="mt-1 text-ink-muted">Long-form only — the body must be at least 1,500 words.</p>
      <div className="mt-6">
        <InsightEditor mode="create" />
      </div>
    </div>
  );
}
