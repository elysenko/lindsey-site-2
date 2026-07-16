'use client';

import { useEffect, useState } from 'react';

interface Setting {
  key: string;
  configured: boolean;
  value: string | null;
  source: 'env' | 'db' | null;
  updatedAt: string | null;
}

// Groups of related keys for display. Any key returned by the API but not listed
// here still appears under "Other".
const GROUPS: { heading: string; note?: string; keys: string[] }[] = [
  { heading: 'PostgreSQL', keys: ['DATABASE_URL', 'POSTGRESQL_API_KEY'] },
  { heading: 'Object storage (MinIO)', keys: ['MINIO_ENDPOINT', 'MINIO_ROOT_USER', 'MINIO_ROOT_PASSWORD', 'MINIO_BUCKET'] },
  {
    heading: 'Email (SMTP via Nodemailer)',
    keys: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM', 'SMTP_PROVIDER_VIA_NODEMAILER_API_KEY'],
  },
  { heading: 'Cal.com booking embed', keys: ['NEXT_PUBLIC_CALCOM_LINK', 'CAL_COM_EMBED_CALCOM_EMBED_REACT_API_KEY'] },
];

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const body = await res.json();
        setSettings(body.settings || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const byKey = new Map(settings.map((s) => [s.key, s]));

  async function saveAll(e: React.FormEvent) {
    e.preventDefault();
    const pairs = Object.entries(drafts)
      .filter(([, v]) => v.trim() !== '')
      .map(([key, value]) => ({ key, value }));
    if (pairs.length === 0) {
      setMessage({ kind: 'err', text: 'Enter at least one value to save.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pairs),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setMessage({ kind: 'err', text: b.error || 'Save failed.' });
        return;
      }
      setMessage({ kind: 'ok', text: 'Settings saved.' });
      setDrafts({});
      await load();
    } catch {
      setMessage({ kind: 'err', text: 'Network error.' });
    } finally {
      setSaving(false);
    }
  }

  // Placeholder integrations that still need credentials.
  const unconfiguredIntegrations = [
    { label: 'Cal.com embed', key: 'CAL_COM_EMBED_CALCOM_EMBED_REACT_API_KEY' },
    { label: 'SMTP provider via Nodemailer', key: 'SMTP_PROVIDER_VIA_NODEMAILER_API_KEY' },
    { label: 'PostgreSQL', key: 'POSTGRESQL_API_KEY' },
  ].filter((i) => !byKey.get(i.key)?.configured);

  if (loading) return <p className="text-ink-muted">Loading settings…</p>;

  return (
    <div>
      {unconfiguredIntegrations.length > 0 && (
        <div
          role="alert"
          data-testid="settings-banner"
          className="mb-6 rounded-lg border border-gold/50 bg-gold/10 p-4 text-sm text-ink-soft"
        >
          <strong className="font-semibold">The following need credentials to activate:</strong>{' '}
          {unconfiguredIntegrations.map((i) => i.label).join(', ')}.
        </div>
      )}

      {message && (
        <div
          role="status"
          className={`mb-6 rounded-md p-3 text-sm ${
            message.kind === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={saveAll} className="space-y-8">
        {GROUPS.map((group) => (
          <section key={group.heading} className="rounded-xl border border-ink/10 bg-white p-6">
            <h2 className="text-lg font-semibold">{group.heading}</h2>
            <div className="mt-4 space-y-4">
              {group.keys.map((key) => {
                const s = byKey.get(key);
                return (
                  <div key={key} className="grid gap-2 sm:grid-cols-[1fr_1.4fr] sm:items-center">
                    <div>
                      <label htmlFor={`set-${key}`} className="block font-mono text-sm text-ink">
                        {key}
                      </label>
                      <span
                        data-testid={`badge-${key}`}
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          s?.configured ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s?.configured ? `Configured (${s.source})` : 'Not configured'}
                      </span>
                    </div>
                    <input
                      id={`set-${key}`}
                      type="text"
                      placeholder={s?.configured ? (s.value ?? 'set — enter to replace') : 'Enter value'}
                      value={drafts[key] ?? ''}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="field-input"
                      autoComplete="off"
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </div>
  );
}
