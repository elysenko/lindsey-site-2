import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ConsultationApiService,
  ContentApiService,
  CreateConsultationInput,
  ServiceOffering,
} from '../../shared/api';
import { SeoService } from '../../core/seo.service';

/**
 * Distraction-free 2-step consultation request. Step 1 captures contact +
 * service interest; step 2 captures the challenge categories + situation.
 * The active step is reflected in the `?step=` query param so a reload or
 * back-button lands on the same step.
 */
@Component({
  selector: 'app-consult',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main data-testid="consult-main">
      <a class="wordmark" routerLink="/" data-testid="consult-wordmark">
        The LeBarre Group
      </a>

      <header class="intro">
        <p class="eyebrow">consultation request</p>
        <h1>Let's find your defensible position</h1>
        <p class="lede">
          Tell us who you are and what you're wrestling with. We'll follow up
          with a tailored path forward.
        </p>
        <p class="progress" data-testid="consult-progress">
          Step {{ activeStep() }} of 2
        </p>
      </header>

      <form
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        data-testid="consult-form"
        novalidate
      >
        @if (activeStep() === '1') {
          <fieldset class="step" data-testid="consult-step-1">
            <legend>Your details</legend>

            <div class="field">
              <label for="fullName">Full name</label>
              <input
                id="fullName"
                type="text"
                formControlName="fullName"
                data-testid="consult-fullName"
                autocomplete="name"
              />
              @if (showError('fullName')) {
                <p class="error" data-testid="consult-fullName-error">
                  Please tell us your name.
                </p>
              }
            </div>

            <div class="field">
              <label for="organization">Organization <span class="opt">(optional)</span></label>
              <input
                id="organization"
                type="text"
                formControlName="organization"
                data-testid="consult-organization"
                autocomplete="organization"
              />
            </div>

            <div class="field">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                data-testid="consult-email"
                autocomplete="email"
              />
              @if (showError('email')) {
                <p class="error" data-testid="consult-email-error">
                  Please enter a valid email address.
                </p>
              }
            </div>

            <div class="field">
              <label for="phone">Phone <span class="opt">(optional)</span></label>
              <input
                id="phone"
                type="tel"
                formControlName="phone"
                data-testid="consult-phone"
                autocomplete="tel"
              />
            </div>

            <div class="field">
              <label for="serviceInterest">Service interest <span class="opt">(optional)</span></label>
              <select
                id="serviceInterest"
                formControlName="serviceInterest"
                data-testid="consult-serviceInterest"
              >
                <option value="">No preference yet</option>
                @for (svc of services(); track svc.slug) {
                  <option [value]="svc.slug">{{ svc.name }}</option>
                }
              </select>
            </div>

            <div class="actions">
              <button
                type="button"
                class="btn primary"
                (click)="continue()"
                data-testid="consult-continue"
              >
                Continue
              </button>
            </div>
          </fieldset>
        } @else {
          <fieldset class="step" data-testid="consult-step-2">
            <legend>What are you working through?</legend>

            <div class="field">
              <span class="group-label" id="challenges-label">
                Challenge areas <span class="opt">(select at least one)</span>
              </span>
              <div
                class="checks"
                role="group"
                aria-labelledby="challenges-label"
                data-testid="consult-challenges"
              >
                @for (opt of challengeOptions; track opt.value) {
                  <label class="check">
                    <input
                      type="checkbox"
                      [value]="opt.value"
                      [checked]="isChecked(opt.value)"
                      (change)="toggleChallenge(opt.value, $event)"
                      [attr.data-testid]="'consult-challenge-' + opt.value"
                    />
                    <span>{{ opt.label }}</span>
                  </label>
                }
              </div>
              @if (showChallengeError()) {
                <p class="error" data-testid="consult-challenges-error">
                  Please select at least one challenge area.
                </p>
              }
            </div>

            <div class="field">
              <label for="situationDescription">
                Describe your situation <span class="opt">(optional)</span>
              </label>
              <textarea
                id="situationDescription"
                rows="5"
                maxlength="5000"
                formControlName="situationDescription"
                data-testid="consult-situationDescription"
              ></textarea>
            </div>

            @if (rateLimited()) {
              <p class="error banner" data-testid="consult-rate-limited">
                You've reached the request limit — please try again in a little
                while.
              </p>
            }
            @if (submitError()) {
              <p class="error banner" data-testid="consult-error">
                Something went wrong submitting your request. Please try again.
              </p>
            }

            <div class="actions">
              <button
                type="button"
                class="btn ghost"
                (click)="back()"
                data-testid="consult-back"
              >
                Back
              </button>
              <button
                type="submit"
                class="btn primary"
                [disabled]="submitting()"
                data-testid="consult-submit"
              >
                {{ submitting() ? 'Submitting…' : 'Submit request' }}
              </button>
            </div>
          </fieldset>
        }
      </form>
    </main>
  `,
  styles: [
    `
      main {
        max-width: 640px;
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
        font-size: clamp(1.6rem, 4vw, 2.25rem);
        line-height: 1.15;
        margin: 0 0 0.75rem;
      }
      .lede {
        color: #374151;
        margin: 0 0 0.75rem;
      }
      .progress {
        color: #6b7280;
        font-size: 0.9rem;
        margin: 0 0 1.5rem;
      }
      fieldset.step {
        border: none;
        padding: 0;
        margin: 0;
      }
      legend {
        font-size: 1.15rem;
        font-weight: 600;
        margin-bottom: 1rem;
        padding: 0;
      }
      .field {
        margin-bottom: 1.25rem;
      }
      label,
      .group-label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.35rem;
      }
      .opt {
        color: #6b7280;
        font-weight: 400;
        font-size: 0.85rem;
      }
      input[type='text'],
      input[type='email'],
      input[type='tel'],
      select,
      textarea {
        width: 100%;
        box-sizing: border-box;
        min-height: 44px;
        padding: 0.6rem 0.75rem;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        font: inherit;
        color: #14181f;
      }
      textarea {
        resize: vertical;
      }
      .checks {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
      .check {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-height: 44px;
        font-weight: 400;
        margin: 0;
        cursor: pointer;
      }
      .check input {
        width: 20px;
        height: 20px;
      }
      .error {
        color: #b91c1c;
        font-size: 0.85rem;
        margin: 0.4rem 0 0;
      }
      .error.banner {
        margin: 1rem 0 0;
        padding: 0.75rem;
        border: 1px solid #fecaca;
        background: #fef2f2;
        border-radius: 6px;
      }
      .actions {
        display: flex;
        gap: 0.75rem;
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
      }
      .btn.primary {
        background: #14181f;
        color: #fff;
        border: 1px solid #14181f;
      }
      .btn.primary[disabled] {
        opacity: 0.6;
        cursor: default;
      }
      .btn.ghost {
        background: #fff;
        color: #14181f;
        border: 1px solid #d1d5db;
      }
    `,
  ],
})
export class ConsultComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly consultationApi = inject(ConsultationApiService);
  private readonly content = inject(ContentApiService);
  private readonly seo = inject(SeoService);

  readonly activeStep = signal<'1' | '2'>('1');
  readonly services = signal<ServiceOffering[]>([]);
  readonly submitting = signal(false);
  readonly submitError = signal(false);
  readonly rateLimited = signal(false);
  readonly challengeTouched = signal(false);

  readonly challengeOptions = [
    { value: 'positioning', label: 'Positioning' },
    { value: 'messaging', label: 'Messaging' },
    { value: 'audience', label: 'Audience' },
    { value: 'competitive-landscape', label: 'Competitive landscape' },
    { value: 'identity', label: 'Identity' },
    { value: 'go-to-market', label: 'Go-to-market' },
  ];

  readonly form = this.fb.group({
    fullName: ['', [Validators.required]],
    organization: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    serviceInterest: [''],
    challengeCategories: this.fb.control<string[]>([], { nonNullable: true }),
    situationDescription: ['', [Validators.maxLength(5000)]],
  });

  /** Restore the active step from the `?step=` query param. */
  @Input() set step(v: string) {
    this.activeStep.set(v === '2' ? '2' : '1');
  }

  ngOnInit(): void {
    this.seo.apply(
      {
        title: 'Request a consultation',
        description:
          'Request an intelligence-led brand strategy consultation with The LeBarre Group.',
      },
      undefined,
    );
    this.content.listServices().subscribe({
      next: (services) => this.services.set(services),
      error: () => this.services.set([]),
    });
  }

  showError(name: 'fullName' | 'email'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  isChecked(value: string): boolean {
    return this.form.controls.challengeCategories.value.includes(value);
  }

  toggleChallenge(value: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const control = this.form.controls.challengeCategories;
    const current = new Set(control.value);
    if (checked) current.add(value);
    else current.delete(value);
    control.setValue([...current]);
    this.challengeTouched.set(true);
  }

  showChallengeError(): boolean {
    return (
      this.challengeTouched() &&
      this.form.controls.challengeCategories.value.length === 0
    );
  }

  continue(): void {
    this.form.controls.fullName.markAsTouched();
    this.form.controls.email.markAsTouched();
    if (this.form.controls.fullName.invalid || this.form.controls.email.invalid) {
      return;
    }
    this.activeStep.set('2');
    this.router.navigate([], {
      queryParams: { step: 2 },
      queryParamsHandling: 'merge',
    });
  }

  back(): void {
    this.activeStep.set('1');
    this.router.navigate([], {
      queryParams: { step: 1 },
      queryParamsHandling: 'merge',
    });
  }

  onSubmit(): void {
    this.submitError.set(false);
    this.rateLimited.set(false);
    this.challengeTouched.set(true);

    if (this.form.controls.challengeCategories.value.length === 0) {
      return;
    }
    if (this.form.controls.fullName.invalid || this.form.controls.email.invalid) {
      this.activeStep.set('1');
      return;
    }

    const raw = this.form.getRawValue();
    const input: CreateConsultationInput = {
      fullName: raw.fullName ?? '',
      email: raw.email ?? '',
      challengeCategories: raw.challengeCategories,
    };
    if (raw.organization) input.organization = raw.organization;
    if (raw.phone) input.phone = raw.phone;
    if (raw.serviceInterest) input.serviceInterest = raw.serviceInterest;
    if (raw.situationDescription)
      input.situationDescription = raw.situationDescription;

    this.submitting.set(true);
    this.consultationApi.submit(input).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.router.navigate(['/consult/confirmation'], {
          queryParams: { token: res.briefToken },
        });
      },
      error: (err: { status?: number }) => {
        this.submitting.set(false);
        if (err?.status === 429) this.rateLimited.set(true);
        else this.submitError.set(true);
      },
    });
  }
}
