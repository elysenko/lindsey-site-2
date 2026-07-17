import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingEntry, SettingsApiService } from '../shared/api';
import { SeoService } from '../core/seo.service';

/**
 * Integration settings. Values are masked/opaque server-side; each entry
 * carries a `configured` flag. Unconfigured integrations surface a banner so an
 * operator knows the console is only partially wired. Inside AdminLayout.
 */
@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section data-testid="admin-settings">
      <h1>Settings</h1>

      @if (hasUnconfigured()) {
        <p class="banner" data-testid="settings-placeholder-banner">
          Some integrations are not yet configured.
        </p>
      }

      @if (error()) {
        <p class="muted" data-testid="settings-error">
          Settings are momentarily unavailable — please retry.
        </p>
      } @else if (!loaded()) {
        <p class="muted" aria-busy="true" data-testid="settings-loading">
          Loading settings…
        </p>
      } @else if (entries().length === 0) {
        <p class="muted" data-testid="settings-empty">
          No configurable integrations.
        </p>
      } @else {
        <ul class="settings-list">
          @for (entry of entries(); track entry.key) {
            <li>
              <div class="key-row">
                <label [attr.for]="'setting-' + entry.key">{{ entry.key }}</label>
                @if (entry.configured) {
                  <span
                    class="badge configured"
                    [attr.data-testid]="'badge-' + entry.key"
                  >
                    Configured
                  </span>
                } @else {
                  <span
                    class="badge missing"
                    [attr.data-testid]="'badge-' + entry.key"
                  >
                    Not configured
                  </span>
                }
              </div>
              <input
                type="text"
                [id]="'setting-' + entry.key"
                [attr.data-testid]="'setting-' + entry.key"
                [placeholder]="entry.configured ? '•••••••• (set)' : 'Enter value'"
                [ngModel]="drafts()[entry.key]"
                (ngModelChange)="setDraft(entry.key, $event)"
              />
            </li>
          }
        </ul>

        <button
          type="button"
          data-testid="settings-save"
          [disabled]="saving()"
          (click)="save()"
        >
          {{ saving() ? 'Saving…' : 'Save' }}
        </button>
      }
    </section>
  `,
  styles: [
    `
      h1 {
        margin: 0 0 1rem;
      }
      .banner {
        background: #fef3c7;
        border: 1px solid #fde68a;
        color: #92400e;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        margin: 0 0 1.25rem;
      }
      .settings-list {
        list-style: none;
        padding: 0;
        margin: 0 0 1.25rem;
        display: grid;
        gap: 1rem;
      }
      .key-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.35rem;
      }
      label {
        font-weight: 600;
        font-family: monospace;
      }
      .badge {
        display: inline-block;
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .badge.configured {
        background: #dcfce7;
        color: #166534;
      }
      .badge.missing {
        background: #fee2e2;
        color: #991b1b;
      }
      input {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 0.6rem 0.7rem;
        font-size: 1rem;
        min-height: 44px;
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
      .muted {
        color: #6b7280;
      }
    `,
  ],
})
export class AdminSettingsComponent implements OnInit {
  private readonly settingsApi = inject(SettingsApiService);
  private readonly seo = inject(SeoService);

  readonly entries = signal<SettingEntry[]>([]);
  readonly drafts = signal<Record<string, string>>({});
  readonly loaded = signal(false);
  readonly error = signal(false);
  readonly saving = signal(false);

  readonly hasUnconfigured = computed(() =>
    this.entries().some((e) => !e.configured),
  );

  ngOnInit(): void {
    this.seo.apply({ title: 'Settings' });
    this.load();
  }

  setDraft(key: string, value: string): void {
    this.drafts.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const drafts = this.drafts();
    const settings = Object.keys(drafts)
      .filter((key) => drafts[key]?.trim().length)
      .map((key) => ({ key, value: drafts[key] }));
    if (settings.length === 0) return;
    this.saving.set(true);
    this.settingsApi.update({ settings }).subscribe({
      next: () => {
        this.saving.set(false);
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  private load(): void {
    this.error.set(false);
    this.settingsApi.list().subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.drafts.set({});
        this.loaded.set(true);
      },
      error: () => {
        this.error.set(true);
        this.loaded.set(true);
      },
    });
  }
}
