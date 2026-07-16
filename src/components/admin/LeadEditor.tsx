'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LEAD_STATUSES, BRIEF_FIELDS, type BriefField } from '@/lib/validation';

const BRIEF_LABELS: Record<BriefField, string> = {
  mission: 'Mission',
  vision: 'Vision',
  differentiator: 'Differentiator',
  brandStory: 'Brand story',
  audiences: 'Audiences',
  brandVoice: 'Brand voice',
  successDefinition: 'Definition of success',
};

interface Props {
  leadId: string;
  currentStatus: string;
  brief: Partial<Record<BriefField, string | null>>;
}

// Client-side editor for a single lead: status, notes, and audited brief edits.
// All writes go through PATCH /api/admin/leads/[id].
export default function LeadEditor({ leadId, currentStatus, brief }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState('');
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of BRIEF_FIELDS) init[f] = brief[f] ?? '';
    return init;
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function patch(payload: Record<string, unknown>, okText: string) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMessage({ kind: 'err', text: body.error || 'Update failed.' });
        return false;
      }
      setMessage({ kind: 'ok', text: okText });
      router.refresh();
      return true;
    } catch {
      setMessage({ kind: 'err', text: 'Network error.' });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveStatus() {
    await patch({ leadStatus: status }, 'Status updated.');
  }

  async function addNote() {
    if (!note.trim()) return;
    if (await patch({ note }, 'Note added.')) setNote('');
  }

  async function saveBrief() {
    const briefFields: Record<string, string> = {};
    for (const f of BRIEF_FIELDS) briefFields[f] = fields[f];
    await patch({ briefFields }, 'Brief updated.');
  }

  return (
    <div className="space-y-8">
      {message && (
        <div
          role="status"
          data-testid="lead-editor-message"
          className={`rounded-md p-3 text-sm ${
            message.kind === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Status */}
      <section className="rounded-xl border border-ink/10 bg-white p-6">
        <h2 className="text-lg font-semibold">Lead status</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="leadStatus" className="field-label">Status</label>
            <select
              id="leadStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="field-input"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button type="button" onClick={saveStatus} disabled={busy} className="btn-primary py-2.5 disabled:opacity-60">
            Save status
          </button>
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-xl border border-ink/10 bg-white p-6">
        <h2 className="text-lg font-semibold">Add an internal note</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="field-input mt-3"
          placeholder="Notes are visible to admins only."
        />
        <button type="button" onClick={addNote} disabled={busy || !note.trim()} className="btn-primary mt-3 py-2.5 disabled:opacity-60">
          Add note
        </button>
      </section>

      {/* Brief edit */}
      <section className="rounded-xl border border-ink/10 bg-white p-6">
        <h2 className="text-lg font-semibold">Brand brief</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Edits are timestamped and the originals are preserved in the audit trail.
        </p>
        <div className="mt-4 space-y-4">
          {BRIEF_FIELDS.map((f) => (
            <div key={f}>
              <label htmlFor={`brief-${f}`} className="field-label">{BRIEF_LABELS[f]}</label>
              <textarea
                id={`brief-${f}`}
                value={fields[f]}
                onChange={(e) => setFields((prev) => ({ ...prev, [f]: e.target.value }))}
                rows={2}
                className="field-input"
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={saveBrief} disabled={busy} className="btn-primary mt-4 py-2.5 disabled:opacity-60">
          Save brief changes
        </button>
      </section>
    </div>
  );
}
