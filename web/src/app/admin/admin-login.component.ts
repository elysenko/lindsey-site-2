import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../shared/api';
import { SeoService } from '../core/seo.service';

/**
 * Admin sign-in. Renders its OWN full-page centered card (no admin nav) — it is
 * a top-level bare route. On success the session cookie is set server-side and
 * we route into the guarded admin tree.
 */
@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="login-page">
      <section class="card" data-testid="admin-login">
        <h1>Admin sign in</h1>
        <p class="muted">Access the LeBarre Group console.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label>
            <span>Email</span>
            <input
              type="email"
              formControlName="email"
              autocomplete="username"
              data-testid="login-email"
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              formControlName="password"
              autocomplete="current-password"
              data-testid="login-password"
            />
          </label>

          @if (locked()) {
            <p class="error" data-testid="login-locked">
              Too many attempts — this account is temporarily locked.
            </p>
          } @else if (error()) {
            <p class="error" data-testid="login-error">
              Invalid email or password
            </p>
          }

          <button
            type="submit"
            [disabled]="submitting()"
            data-testid="login-submit"
          >
            {{ submitting() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </section>
    </main>
  `,
  styles: [
    `
      .login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background: #f3f4f6;
        color: #14181f;
      }
      .card {
        width: 100%;
        max-width: 380px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 2rem;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
      }
      h1 {
        margin: 0 0 0.25rem;
        font-size: 1.5rem;
      }
      .muted {
        color: #6b7280;
        margin: 0 0 1.5rem;
      }
      label {
        display: block;
        margin-bottom: 1rem;
      }
      label span {
        display: block;
        font-weight: 600;
        margin-bottom: 0.35rem;
        font-size: 0.9rem;
      }
      input {
        width: 100%;
        box-sizing: border-box;
        padding: 0.7rem 0.75rem;
        min-height: 44px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 1rem;
      }
      button {
        width: 100%;
        min-height: 44px;
        padding: 0.75rem;
        background: #14181f;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
      }
      button:disabled {
        opacity: 0.6;
        cursor: default;
      }
      .error {
        color: #b91c1c;
        margin: 0 0 1rem;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class AdminLoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly submitting = signal(false);
  readonly error = signal(false);
  readonly locked = signal(false);

  ngOnInit(): void {
    this.seo.apply({ title: 'Admin sign in' });
  }

  submit(): void {
    this.error.set(false);
    this.locked.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set(true);
      return;
    }
    this.submitting.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigateByUrl('/admin');
      },
      error: (err: { status?: number }) => {
        this.submitting.set(false);
        if (err?.status === 429) this.locked.set(true);
        else this.error.set(true);
      },
    });
  }
}
