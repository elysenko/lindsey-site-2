import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AdminInsight,
  InsightsApiService,
  PostStatus,
} from '../shared/api';
import { SeoService } from '../core/seo.service';

/**
 * CMS insight editor — shared by the "new" and "edit" routes. On the edit route
 * `id` is bound and the post is prefilled; on /new it stays blank. The
 * publish-word-count rule is enforced server-side; a 400 surfaces its message.
 * Inside AdminLayout.
 */
@Component({
  selector: 'app-admin-insight-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section data-testid="admin-insight-edit">
      <a class="back" routerLink="/admin/insights">← All insights</a>
      <h1>{{ editing() ? 'Edit insight' : 'New insight' }}</h1>

      <form
        [formGroup]="form"
        (ngSubmit)="save()"
        data-testid="insight-form"
        novalidate
      >
        <label>
          <span>Title</span>
          <input type="text" formControlName="title" data-testid="insight-title" />
        </label>

        <label>
          <span>Body</span>
          <textarea
            rows="14"
            formControlName="body"
            data-testid="insight-body"
          ></textarea>
        </label>

        <p class="wordcount" data-testid="insight-wordcount">
          {{ wordCount() }} words — Publishing requires at least 1500 words.
        </p>

        <label>
          <span>Status</span>
          <select formControlName="status" data-testid="insight-status">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </label>

        @if (errorMessage()) {
          <p class="error" data-testid="insight-error">{{ errorMessage() }}</p>
        }

        <button
          type="submit"
          data-testid="insight-save"
          [disabled]="saving() || form.invalid"
        >
          {{ saving() ? 'Saving…' : 'Save' }}
        </button>
      </form>
    </section>
  `,
  styles: [
    `
      .back {
        display: inline-block;
        margin-bottom: 0.75rem;
        color: #4b5563;
      }
      h1 {
        margin: 0 0 1.25rem;
      }
      label {
        display: block;
        margin-bottom: 1rem;
      }
      label span {
        display: block;
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 0.35rem;
      }
      input,
      textarea,
      select {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 0.6rem 0.7rem;
        font-size: 1rem;
        font-family: inherit;
        min-height: 44px;
      }
      textarea {
        resize: vertical;
      }
      .wordcount {
        color: #6b7280;
        font-size: 0.9rem;
        margin: 0 0 1rem;
      }
      .error {
        color: #b91c1c;
        margin: 0 0 1rem;
      }
      button {
        min-height: 44px;
        padding: 0.6rem 1.4rem;
        background: #14181f;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
      }
      button:disabled {
        opacity: 0.5;
        cursor: default;
      }
    `,
  ],
})
export class AdminInsightEditComponent {
  private readonly fb = inject(FormBuilder);
  private readonly insightsApi = inject(InsightsApiService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    body: ['', [Validators.required]],
    status: ['DRAFT' as PostStatus],
  });

  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private readonly bodyValue = signal('');
  readonly wordCount = computed(() => {
    const words = this.bodyValue().trim().split(/\s+/).filter(Boolean);
    return words.length;
  });

  private postId: string | null = null;

  constructor() {
    this.seo.apply({ title: 'New insight' });
    this.form.controls.body.valueChanges.subscribe((v) =>
      this.bodyValue.set(v ?? ''),
    );
  }

  @Input() set id(value: string | undefined) {
    if (!value) return;
    this.postId = value;
    this.editing.set(true);
    this.seo.apply({ title: 'Edit insight' });
    this.insightsApi.adminGet(value).subscribe({
      next: (post: AdminInsight) => {
        this.form.patchValue({
          title: post.title,
          body: post.body,
          status: post.status,
        });
        this.bodyValue.set(post.body);
      },
      error: () => this.errorMessage.set('This insight could not be loaded.'),
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set(null);
    this.saving.set(true);
    const values = this.form.getRawValue();
    const request$ = this.postId
      ? this.insightsApi.update(this.postId, values)
      : this.insightsApi.create(values);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigateByUrl('/admin/insights');
      },
      error: (err: { status?: number; error?: { message?: string } }) => {
        this.saving.set(false);
        this.errorMessage.set(
          err?.error?.message ?? 'Could not save this insight.',
        );
      },
    });
  }
}
