'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  consultationStep1Schema,
  consultationStep2Schema,
  type ConsultationInput,
} from '@/lib/validation';

const CHALLENGE_OPTIONS = [
  'Unclear or inconsistent positioning',
  'Outdated brand identity',
  'Losing to competitors on story',
  'Low market visibility / discoverability',
  'Executive / founder visibility',
  'Launching a new product or venture',
  'Rebrand or merger integration',
];

const SERVICE_OPTIONS = [
  'Brand Strategy & Positioning',
  'Brand Identity & Design',
  'Market & Competitive Intelligence',
  'Executive & Thought-Leadership Communications',
  'Not sure yet',
];

type Step1 = Pick<ConsultationInput, 'fullName' | 'organization' | 'email' | 'phone' | 'serviceInterest'>;
type Step2 = Pick<ConsultationInput, 'challengeCategories' | 'situationDescription'>;

// Two-step consultation form. Step is reflected in ?step= so the state is
// URL-addressable and restorable. Submits to POST /api/consultation.
export default function ConsultationForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialStep = params.get('step') === '2' ? 2 : 1;
  const [step, setStep] = useState<1 | 2>(initialStep);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const step1 = useForm<Step1>({
    resolver: zodResolver(consultationStep1Schema),
    mode: 'onBlur',
  });
  const step2 = useForm<Step2>({
    resolver: zodResolver(consultationStep2Schema),
    mode: 'onBlur',
    defaultValues: { challengeCategories: [] },
  });

  function goToStep(next: 1 | 2) {
    setStep(next);
    const sp = new URLSearchParams(Array.from(params.entries()));
    sp.set('step', String(next));
    router.replace(`/consult?${sp.toString()}`, { scroll: false });
  }

  const onStep1 = step1.handleSubmit(() => {
    setServerError(null);
    goToStep(2);
  });

  const onStep2 = step2.handleSubmit(async (data2) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const payload = { ...step1.getValues(), ...data2 };
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        setServerError(
          body.error || 'You have submitted several requests recently. Please try again later.',
        );
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setServerError(body.error || 'Something went wrong. Please try again.');
        return;
      }

      const { briefToken } = await res.json();
      router.push(`/consult/confirmation?token=${encodeURIComponent(briefToken)}`);
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div>
      {/* Step indicator */}
      <ol className="mb-8 flex items-center gap-4 text-sm" aria-label="Progress">
        <li className={step === 1 ? 'font-semibold text-ink' : 'text-ink-muted'}>1. Your details</li>
        <li aria-hidden="true" className="text-ink-muted">—</li>
        <li className={step === 2 ? 'font-semibold text-ink' : 'text-ink-muted'}>2. Your challenge</li>
      </ol>

      {serverError && (
        <div role="alert" data-testid="consult-error" className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={onStep1} noValidate data-testid="consult-step-1" className="space-y-5">
          <div>
            <label htmlFor="fullName" className="field-label">Full name *</label>
            <input id="fullName" type="text" autoComplete="name" className="field-input" {...step1.register('fullName')} />
            {step1.formState.errors.fullName && (
              <p className="field-error">{step1.formState.errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="organization" className="field-label">Organization</label>
            <input id="organization" type="text" autoComplete="organization" className="field-input" {...step1.register('organization')} />
          </div>

          <div>
            <label htmlFor="email" className="field-label">Email *</label>
            <input id="email" type="email" autoComplete="email" className="field-input" {...step1.register('email')} />
            {step1.formState.errors.email && (
              <p className="field-error">{step1.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="field-label">Phone</label>
            <input id="phone" type="tel" autoComplete="tel" className="field-input" {...step1.register('phone')} />
          </div>

          <div>
            <label htmlFor="serviceInterest" className="field-label">Which service interests you most?</label>
            <select id="serviceInterest" className="field-input" {...step1.register('serviceInterest')}>
              <option value="">Select an option</option>
              {SERVICE_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary w-full sm:w-auto">Continue</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={onStep2} noValidate data-testid="consult-step-2" className="space-y-5">
          <fieldset>
            <legend className="field-label">What challenges are you facing? * (select at least one)</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {CHALLENGE_OPTIONS.map((c) => (
                <label key={c} className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm">
                  <input type="checkbox" value={c} className="h-4 w-4" {...step2.register('challengeCategories')} />
                  <span>{c}</span>
                </label>
              ))}
            </div>
            {step2.formState.errors.challengeCategories && (
              <p className="field-error">{step2.formState.errors.challengeCategories.message as string}</p>
            )}
          </fieldset>

          <div>
            <label htmlFor="situationDescription" className="field-label">Tell us more about your situation</label>
            <textarea id="situationDescription" rows={5} className="field-input" {...step2.register('situationDescription')} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => goToStep(1)} className="btn-secondary">Back</button>
            <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Request Consultation'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
