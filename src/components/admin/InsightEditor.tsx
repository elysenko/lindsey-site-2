'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MIN_INSIGHT_WORDS, wordCount, POST_STATUSES } from '@/lib/validation';

interface Props {
  mode: 'create' | 'edit';
  postId?: string;
  initial?: { title: string; slug: string; body: string; status: string };
}

// Editor for Insights posts. Create → POST /api/admin/insights.
// Edit → PATCH /api/admin/insights/[id]. Enforces the >=1500 word rule client-side.
export default function InsightEditor({ mode, postId, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'DRAFT');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const words = useMemo(() => wordCount(body), [body]);
  const enough = words >= MIN_INSIGHT_WORDS;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!enough) {
      setError(`Body must be at least ${MIN_INSIGHT_WORDS} words (currently ${words}).`);
      return;
    }
    setBusy(true);
    try {
      const endpoint = mode === 'create' ? '/api/admin/insights' : `/api/admin/insights/${postId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const payload =
        mode === 'create'
          ? { title, slug: slug || undefined, body, status }
          : { title, body, status };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(
          b.error || (b.fieldErrors ? Object.values(b.fieldErrors).flat().join(' ') : 'Save failed.'),
        );
        return;
      }
      router.push('/admin/insights');
      router.refresh();
    } catch {
      setError('Network error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" data-testid="insight-editor">
      {error && (
        <div role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="field-label">Title</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="field-input" />
      </div>

      {mode === 'create' && (
        <div>
          <label htmlFor="slug" className="field-label">Slug (optional)</label>
          <input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated from title"
            className="field-input"
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="body" className="field-label">Body</label>
          <span className={`text-xs ${enough ? 'text-green-700' : 'text-ink-muted'}`}>
            {words} / {MIN_INSIGHT_WORDS} words
          </span>
        </div>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={20}
          required
          className="field-input font-mono text-sm"
          placeholder="Separate paragraphs with a blank line."
        />
      </div>

      <div>
        <label htmlFor="status" className="field-label">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="field-input max-w-xs">
          {POST_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
        {busy ? 'Saving…' : mode === 'create' ? 'Create post' : 'Save changes'}
      </button>
    </form>
  );
}
