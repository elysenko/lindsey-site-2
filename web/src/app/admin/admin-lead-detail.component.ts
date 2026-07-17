import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LeadsApiService, LeadStatus, UpdateLeadInput } from '../shared/api';
import { SeoService } from '../core/seo.service';

type BriefField =
  | 'mission'
  | 'vision'
  | 'differentiator'
  | 'brandStory'
  | 'audiences'
  | 'brandVoice'
  | 'successDefinition';

interface LeadBrief {
  mission: string | null;
  vision: string | null;
  differentiator: string | null;
  brandStory: string | null;
  audiences: string | null;
  brandVoice: string | null;
  successDefinition: string | null;
  completedAt: string | null;
}

interface LeadNote {
  id: string;
  body: string;
  createdAt: string;
  author: { email: string };
}

interface LeadAudit {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  editedAt: string;
  adminId: string;
}

interface LeadDetail {
  id: string;
  fullName: string;
  organization: string | null;
  email: string;
  phone: string | null;
  serviceInterest: string | null;
  challengeCategories: string[];
  situationDescription: string | null;
  leadStatus: LeadStatus;
  createdAt: string;
  brief: LeadBrief | null;
  notes: LeadNote[];
  audits: LeadAudit[];
}

const STATUS_OPTIONS: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'WON',
  'LOST',
];

const BRIEF_FIELDS: { key: BriefField; label: string }[] = [
  { key: 'mission', label: 'Mission' },
  { key: 'vision', label: 'Vision' },
  { key: 'differentiator', label: 'Differentiator' },
  { key: 'brandStory', label: 'Brand story' },
  { key: 'audiences', label: 'Audiences' },
  { key: 'brandVoice', label: 'Brand voice' },
  { key: 'successDefinition', label: 'Definition of success' },
];

/**
 * Single lead workspace: status triage, notes, and audited brief edits. Every
 * mutation re-fetches so the audit trail and notes stay authoritative. Inside
 * AdminLayout.
 */
@Component({
  selector: 'app-admin-lead-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (error()) {
      <p class="muted" data-testid="lead-not-found">
        This lead could not be found.
        <a routerLink="/admin/leads">Back to leads</a>
      </p>
    } @else if (!lead()) {
      <p class="muted" aria-busy="true" data-testid="lead-loading">
        Loading lead…
      </p>
    } @else {
      <section data-testid="lead-detail">
        <a class="back" routerLink="/admin/leads">← All leads</a>
        <h1>{{ lead()!.fullName }}</h1>
        <dl class="contact">
          <div><dt>Organization</dt><dd>{{ lead()!.organization || '—' }}</dd></div>
          <div><dt>Email</dt><dd>{{ lead()!.email }}</dd></div>
          <div><dt>Phone</dt><dd>{{ lead()!.phone || '—' }}</dd></div>
          <div><dt>Service interest</dt><dd>{{ lead()!.serviceInterest || '—' }}</dd></div>
          <div>
            <dt>Challenges</dt>
            <dd>{{ lead()!.challengeCategories.join(', ') || '—' }}</dd>
          </div>
        </dl>
        <p class="situation">{{ lead()!.situationDescription || 'No situation provided.' }}</p>

        <div class="row">
          <h2>Status</h2>
          <div class="status-controls">
            <select
              data-testid="lead-status-select"
              [(ngModel)]="statusDraft"
            >
              @for (opt of statusOptions; track opt) {
                <option [value]="opt">{{ opt }}</option>
              }
            </select>
            <button
              type="button"
              data-testid="lead-status-save"
              [disabled]="saving()"
              (click)="saveStatus()"
            >
              Save status
            </button>
          </div>
        </div>

        <div class="row">
          <h2>Notes</h2>
          <textarea
            data-testid="lead-note-input"
            rows="3"
            placeholder="Add an internal note…"
            [(ngModel)]="noteDraft"
          ></textarea>
          <button
            type="button"
            data-testid="lead-note-save"
            [disabled]="saving() || !noteDraft().trim()"
            (click)="saveNote()"
          >
            Add note
          </button>

          @if (lead()!.notes.length === 0) {
            <p class="muted" data-testid="lead-notes-empty">No notes yet.</p>
          } @else {
            <ul class="notes" data-testid="lead-notes">
              @for (note of lead()!.notes; track note.id) {
                <li>
                  <p>{{ note.body }}</p>
                  <span class="meta">
                    {{ note.author.email }} · {{ note.createdAt | date: 'short' }}
                  </span>
                </li>
              }
            </ul>
          }
        </div>

        <div class="row">
          <h2>Brand brief</h2>
          @for (field of briefFields; track field.key) {
            <label class="brief-field">
              <span>{{ field.label }}</span>
              <textarea
                rows="2"
                [attr.data-testid]="'brief-' + field.key"
                [ngModel]="briefDraft()[field.key]"
                (ngModelChange)="setBriefField(field.key, $event)"
              ></textarea>
            </label>
          }
          <button
            type="button"
            data-testid="brief-edit-save"
            [disabled]="saving()"
            (click)="saveBrief()"
          >
            Save brief
          </button>
        </div>

        <div class="row">
          <h2>Audit trail</h2>
          @if (lead()!.audits.length === 0) {
            <p class="muted" data-testid="lead-audits-empty">No edits recorded.</p>
          } @else {
            <ul class="audits" data-testid="lead-audits">
              @for (audit of lead()!.audits; track audit.id) {
                <li>
                  <strong>{{ audit.field }}</strong>:
                  <span class="old">{{ audit.oldValue || '∅' }}</span>
                  →
                  <span class="new">{{ audit.newValue || '∅' }}</span>
                  <span class="meta">{{ audit.editedAt | date: 'short' }}</span>
                </li>
              }
            </ul>
          }
        </div>
      </section>
    }
  `,
  styles: [
    `
      .back {
        display: inline-block;
        margin-bottom: 0.75rem;
        color: #4b5563;
      }
      h1 {
        margin: 0 0 1rem;
      }
      h2 {
        font-size: 1.15rem;
        margin: 0 0 0.75rem;
      }
      .contact {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.5rem 1.5rem;
        margin: 0 0 1rem;
      }
      .contact dt {
        font-size: 0.8rem;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .contact dd {
        margin: 0.1rem 0 0;
      }
      .situation {
        color: #374151;
        margin-bottom: 1.5rem;
      }
      .row {
        border-top: 1px solid #e5e7eb;
        padding: 1.25rem 0;
      }
      .status-controls {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      select,
      textarea {
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 0.5rem 0.6rem;
        font-size: 1rem;
        font-family: inherit;
      }
      select {
        min-height: 44px;
      }
      textarea {
        width: 100%;
        box-sizing: border-box;
        display: block;
        margin-bottom: 0.5rem;
      }
      button {
        min-height: 44px;
        padding: 0.55rem 1.1rem;
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
      .brief-field {
        display: block;
        margin-bottom: 0.75rem;
      }
      .brief-field span {
        display: block;
        font-weight: 600;
        font-size: 0.85rem;
        margin-bottom: 0.3rem;
      }
      .notes,
      .audits {
        list-style: none;
        padding: 0;
        margin: 1rem 0 0;
        display: grid;
        gap: 0.75rem;
      }
      .notes li,
      .audits li {
        padding: 0.6rem 0.75rem;
        background: #f9fafb;
        border-radius: 6px;
      }
      .notes p {
        margin: 0 0 0.25rem;
      }
      .meta {
        color: #6b7280;
        font-size: 0.8rem;
        margin-left: 0.5rem;
      }
      .muted {
        color: #6b7280;
      }
    `,
  ],
})
export class AdminLeadDetailComponent {
  private readonly leadsApi = inject(LeadsApiService);
  private readonly seo = inject(SeoService);

  readonly statusOptions = STATUS_OPTIONS;
  readonly briefFields = BRIEF_FIELDS;

  readonly lead = signal<LeadDetail | null>(null);
  readonly error = signal(false);
  readonly saving = signal(false);

  readonly statusDraft = signal<LeadStatus>('NEW');
  readonly noteDraft = signal('');
  readonly briefDraft = signal<Record<BriefField, string>>(this.emptyBrief());

  private leadId = '';

  @Input() set id(value: string) {
    this.leadId = value;
    this.load();
  }

  setBriefField(key: BriefField, value: string): void {
    this.briefDraft.update((draft) => ({ ...draft, [key]: value }));
  }

  saveStatus(): void {
    this.mutate({ leadStatus: this.statusDraft() });
  }

  saveNote(): void {
    const note = this.noteDraft().trim();
    if (!note) return;
    this.mutate({ note }, () => this.noteDraft.set(''));
  }

  saveBrief(): void {
    const current = this.lead()?.brief;
    const draft = this.briefDraft();
    const edits: Record<string, string> = {};
    for (const { key } of BRIEF_FIELDS) {
      const original = (current?.[key] ?? '') as string;
      if (draft[key] !== original) edits[key] = draft[key];
    }
    if (Object.keys(edits).length === 0) return;
    this.mutate({ briefEdits: edits });
  }

  private mutate(input: UpdateLeadInput, onSuccess?: () => void): void {
    if (!this.leadId) return;
    this.saving.set(true);
    this.leadsApi.update<LeadDetail>(this.leadId, input).subscribe({
      next: () => {
        this.saving.set(false);
        onSuccess?.();
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  private load(): void {
    if (!this.leadId) return;
    this.error.set(false);
    this.leadsApi.get<LeadDetail>(this.leadId).subscribe({
      next: (lead) => {
        this.lead.set(lead);
        this.statusDraft.set(lead.leadStatus);
        this.briefDraft.set(this.briefToDraft(lead.brief));
        this.seo.apply({ title: `Lead · ${lead.fullName}` });
      },
      error: () => this.error.set(true),
    });
  }

  private briefToDraft(brief: LeadBrief | null): Record<BriefField, string> {
    const draft = this.emptyBrief();
    if (!brief) return draft;
    for (const { key } of BRIEF_FIELDS) {
      draft[key] = (brief[key] ?? '') as string;
    }
    return draft;
  }

  private emptyBrief(): Record<BriefField, string> {
    return {
      mission: '',
      vision: '',
      differentiator: '',
      brandStory: '',
      audiences: '',
      brandVoice: '',
      successDefinition: '',
    };
  }
}
