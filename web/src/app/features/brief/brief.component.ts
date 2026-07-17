import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BriefApiService, SubmitBriefInput } from '../../shared/api';
import { SeoService } from '../../core/seo.service';

interface BriefLead {
  id: string;
  fullName: string;
  organization?: string | null;
  email: string;
  serviceInterest?: string | null;
  challengeCategories: string[];
  briefStatus: string;
}

interface BriefRecord {
  mission?: string | null;
  vision?: string | null;
  differentiator?: string | null;
  brandStory?: string | null;
  audiences?: string | null;
  brandVoice?: string | null;
  successDefinition?: string | null;
  completedAt?: string | null;
}

interface BriefResponse {
  lead: BriefLead;
  brief: BriefRecord | null;
}

/**
 * Brand Intelligence Brief capture, deep-linked by an opaque token. The token
 * is loaded on init; unknown/expired tokens (404) redirect to `/brief/invalid`.
 * Every field is optional so a lead can submit as much or as little as they like.
 */
@Component({
  selector: 'app-brief',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main data-testid="brief-main">
      <a class="wordmark" routerLink="/" data-testid="brief-wordmark">
        The LeBarre Group
      </a>

      @if (loading()) {
        <p class="muted" aria-busy="true" data-testid="brief-loading">
          Loading your brief…
        </p>
      } @else if (loadError()) {
        <p class="error banner" data-testid="brief-load-error">
          We couldn't load your brief. Please try again shortly.
        </p>
      } @else if (lead()) {
        <header class="intro">
          <p class="eyebrow">brand intelligence brief</p>
          <h1>Tell us your story, {{ lead()!.fullName }}</h1>
          @if (lead()!.organization) {
            <p class="context" data-testid="brief-context">
              Preparing strategy for
              <strong>{{ lead()!.organization }}</strong>.
            </p>
          }
          <p class="lede">
            Share whatever is clear today — nothing here is required. Your answers
            sharpen the thinking we bring to your consultation.
          </p>
        </header>

        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          data-testid="brief-form"
          novalidate
        >
          @for (f of fields; track f.key) {
            <div class="field">
              <label [attr.for]="f.key">{{ f.label }}</label>
              <textarea
                [id]="f.key"
                rows="4"
                [formControlName]="f.key"
                [attr.data-testid]="'brief-' + f.key"
              ></textarea>
            </div>
          }

          @if (submitError()) {
            <p class="error banner" data-testid="brief-submit-error">
              Something went wrong saving your brief. Please try again.
            </p>
          }

          <div class="actions">
            <button
              type="submit"
              class="btn primary"
              [disabled]="submitting()"
              data-testid="brief-submit"
            >
              {{ submitting() ? 'Saving…' : 'Submit brief' }}
            </button>
          </div>
        </form>
      }
    </main>
  `,
  styles: [
    `
      main {
        max-width: 760px;
        margin: 0 auto;
        padding: 2rem 1.25rem 4rem;
        color: #14181f;
      }
      .wordmark {
        display: inline-block;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-decoration: none;
        color: #14181f;
        margin-bottom: 2rem;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.8rem;
        color: #6b7280;
        margin: 0 0 0.5rem;
      }
      h1 {
        font-size: clamp(1.6rem, 4vw, 2.5rem);
        line-height: 1.15;
        margin: 0 0 0.75rem;
      }
      .context {
        color: #374151;
        margin: 0 0 0.5rem;
      }
      .lede {
        color: #374151;
        margin: 0 0 2rem;
      }
      .field {
        margin-bottom: 1.25rem;
      }
      label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.35rem;
      }
      textarea {
        width: 100%;
        box-sizing: border-box;
        min-height: 44px;
        padding: 0.6rem 0.75rem;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        font: inherit;
        color: #14181f;
        resize: vertical;
      }
      .muted {
        color: #6b7280;
      }
      .error {
        color: #b91c1c;
        font-size: 0.9rem;
      }
      .error.banner {
        padding: 0.75rem;
        border: 1px solid #fecaca;
        background: #fef2f2;
        border-radius: 6px;
        margin: 1rem 0;
      }
      .actions {
        margin-top: 1.75rem;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0.7rem 1.4rem;
        border-radius: 6px;
        font-weight: 600;
        font: inherit;
        cursor: pointer;
        border: 1px solid #14181f;
      }
      .btn.primary {
        background: #14181f;
        color: #fff;
      }
      .btn.primary[disabled] {
        opacity: 0.6;
        cursor: default;
      }
    `,
  ],
})
export class BriefComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly briefApi = inject(BriefApiService);
  private readonly seo = inject(SeoService);

  readonly briefToken = signal('');
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly submitting = signal(false);
  readonly submitError = signal(false);
  readonly lead = signal<BriefLead | null>(null);

  readonly fields: { key: keyof SubmitBriefInput; label: string }[] = [
    { key: 'mission', label: 'Mission — why you exist' },
    { key: 'vision', label: 'Vision — where you are headed' },
    {
      key: 'differentiator',
      label: 'Differentiator — what makes you the obvious choice',
    },
    { key: 'brandStory', label: 'Brand story — how you got here' },
    { key: 'audiences', label: 'Audiences — who you serve' },
    { key: 'brandVoice', label: 'Brand voice — how you sound' },
    {
      key: 'successDefinition',
      label: 'Success — how you will know this worked',
    },
  ];

  readonly form = this.fb.group({
    mission: [''],
    vision: [''],
    differentiator: [''],
    brandStory: [''],
    audiences: [''],
    brandVoice: [''],
    successDefinition: [''],
  });

  @Input() set token(v: string) {
    this.briefToken.set(v ?? '');
    if (v) this.load(v);
  }

  private load(token: string): void {
    this.seo.apply(
      {
        title: 'Your Brand Intelligence Brief',
        description:
          'Complete your Brand Intelligence Brief for The LeBarre Group.',
      },
      undefined,
    );
    this.loading.set(true);
    this.loadError.set(false);
    this.briefApi.getByToken<BriefResponse>(token).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.lead.set(res.lead);
        if (res.brief) this.prefill(res.brief);
      },
      error: (err: { status?: number }) => {
        this.loading.set(false);
        if (err?.status === 404) {
          this.router.navigate(['/brief/invalid']);
        } else {
          this.loadError.set(true);
        }
      },
    });
  }

  private prefill(brief: BriefRecord): void {
    this.form.patchValue({
      mission: brief.mission ?? '',
      vision: brief.vision ?? '',
      differentiator: brief.differentiator ?? '',
      brandStory: brief.brandStory ?? '',
      audiences: brief.audiences ?? '',
      brandVoice: brief.brandVoice ?? '',
      successDefinition: brief.successDefinition ?? '',
    });
  }

  onSubmit(): void {
    const token = this.briefToken();
    if (!token) return;
    this.submitError.set(false);

    const raw = this.form.getRawValue();
    const input: SubmitBriefInput = {};
    (Object.keys(raw) as (keyof SubmitBriefInput)[]).forEach((k) => {
      const value = raw[k];
      if (value) input[k] = value;
    });

    this.submitting.set(true);
    this.briefApi.submit(token, input).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/brief', token, 'complete']);
      },
      error: () => {
        this.submitting.set(false);
        this.submitError.set(true);
      },
    });
  }
}
