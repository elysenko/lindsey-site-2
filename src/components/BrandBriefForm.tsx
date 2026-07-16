'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { brandBriefSchema, type BrandBriefInput } from '@/lib/validation';

const FIELDS: { name: keyof BrandBriefInput; label: string; help: string }[] = [
  { name: 'mission', label: 'Mission', help: 'Why does your organization exist? What change do you seek to create?' },
  { name: 'vision', label: 'Vision', help: 'Where are you headed? What does success look like in five years?' },
  { name: 'differentiator', label: 'Differentiator', help: 'What can you claim that competitors genuinely cannot?' },
  { name: 'brandStory', label: 'Brand story', help: 'The origin and narrative that make your brand memorable.' },
  { name: 'audiences', label: 'Key audiences', help: 'Who must believe in you — customers, talent, investors, partners?' },
  { name: 'brandVoice', label: 'Brand voice', help: 'How should your brand sound — authoritative, warm, provocative?' },
  { name: 'successDefinition', label: 'Definition of success', help: 'How will you measure whether this engagement worked?' },
];

// Brand Intelligence Brief form. Submits to POST /api/brief/[token].
export default function BrandBriefForm({ token }: { token: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandBriefInput>({ resolver: zodResolver(brandBriefSchema), mode: 'onBlur' });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/brief/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.status === 404) {
        router.push('/brief/invalid');
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setServerError(body.error || 'Something went wrong. Please try again.');
        return;
      }
      router.push(`/brief/${encodeURIComponent(token)}/complete`);
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate data-testid="brief-form" className="space-y-6">
      {serverError && (
        <div role="alert" className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {FIELDS.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="field-label">{f.label} *</label>
          <p className="mb-2 text-sm text-ink-muted">{f.help}</p>
          <textarea id={f.name} rows={4} className="field-input" {...register(f.name)} />
          {errors[f.name] && <p className="field-error">{errors[f.name]?.message}</p>}
        </div>
      ))}

      <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
        {submitting ? 'Submitting…' : 'Submit Brief'}
      </button>
    </form>
  );
}
