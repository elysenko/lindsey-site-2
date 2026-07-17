import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TeamApiService, TeamMember } from '../../shared/api';
import { SeoService, breadcrumbLd, personLd } from '../../core/seo.service';

/**
 * Team member detail. Loads one member (`/api/team/:slug`) and renders their
 * full profile — bio, expertise, skills, education, affiliations, LinkedIn.
 * Unknown slugs (404) fall through to a graceful not-found state.
 */
@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main data-testid="team-detail-main">
      @if (error()) {
        <section class="not-found" data-testid="team-not-found">
          <h1>We couldn't find that profile</h1>
          <p class="muted">
            This team member may have moved on, or the link may be out of date.
          </p>
          <a class="btn ghost" routerLink="/about" data-testid="team-back">
            Back to the team
          </a>
        </section>
      } @else if (!member()) {
        <p class="muted" aria-busy="true" data-testid="team-detail-loading">
          Loading this profile…
        </p>
      } @else {
        <article>
          <header class="intro">
            <p class="eyebrow">team</p>
            <h1 data-testid="team-detail-name">
              @if (member()!.honorificPrefix) {
                <span class="honorific">{{ member()!.honorificPrefix }} </span>
              }{{ member()!.fullName }}
            </h1>
            <p class="member-title">{{ member()!.title }}</p>
            @if (member()!.credentials) {
              <p class="credentials" data-testid="team-credentials">
                {{ member()!.credentials }}
              </p>
            }
          </header>

          <section class="bio" data-testid="team-bio">
            @for (para of bioParagraphs(); track $index) {
              <p>{{ para }}</p>
            }
          </section>

          @if (member()!.expertise.length) {
            <section data-testid="team-expertise">
              <h2>Areas of expertise</h2>
              <ul>
                @for (item of member()!.expertise; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </section>
          }

          @if (member()!.skills.length) {
            <section data-testid="team-skills">
              <h2>Skills</h2>
              <ul>
                @for (skill of member()!.skills; track skill) {
                  <li>{{ skill }}</li>
                }
              </ul>
            </section>
          }

          @if (member()!.education) {
            <section data-testid="team-education">
              <h2>Education</h2>
              <p>{{ member()!.education }}</p>
            </section>
          }

          @if (member()!.affiliations) {
            <section data-testid="team-affiliations">
              <h2>Affiliations</h2>
              <p>{{ member()!.affiliations }}</p>
            </section>
          }

          @if (member()!.linkedinUrl) {
            <p>
              <a
                class="btn ghost"
                [href]="member()!.linkedinUrl"
                target="_blank"
                rel="noopener"
                data-testid="team-linkedin"
              >
                Connect on LinkedIn
              </a>
            </p>
          }
        </article>
      }
    </main>
  `,
  styles: [
    `
      main {
        max-width: 1080px;
        margin: 0 auto;
        padding: 2rem 1.25rem 4rem;
        color: #14181f;
      }
      .intro {
        padding: 2rem 0 1rem;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.85rem;
        color: #6b7280;
        margin: 0 0 0.75rem;
      }
      h1 {
        font-size: clamp(2rem, 5vw, 3rem);
        line-height: 1.1;
        margin: 0 0 0.5rem;
      }
      h2 {
        font-size: 1.4rem;
        margin: 2rem 0 1rem;
      }
      .member-title {
        color: #4b5563;
        font-weight: 600;
        margin: 0 0 0.25rem;
        font-size: 1.1rem;
      }
      .credentials {
        color: #6b7280;
        margin: 0;
      }
      .bio p {
        font-size: 1.1rem;
        color: #374151;
        line-height: 1.7;
        max-width: 68ch;
      }
      ul {
        color: #374151;
        line-height: 1.6;
        padding-left: 1.2rem;
      }
      .btn {
        display: inline-block;
        padding: 0.85rem 1.4rem;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
        min-height: 44px;
      }
      .btn.ghost {
        border: 1px solid #d1d5db;
        color: #14181f;
      }
      .not-found {
        padding: 3rem 0;
      }
      .muted {
        color: #6b7280;
      }
    `,
  ],
})
export class TeamDetailComponent {
  private readonly teamApi = inject(TeamApiService);
  private readonly seo = inject(SeoService);

  private readonly _slug = signal('');
  readonly member = signal<TeamMember | null>(null);
  readonly error = signal(false);

  readonly bioParagraphs = computed(() => {
    const bio = this.member()?.bio ?? '';
    return bio.split('\n\n').map((p) => p.trim()).filter((p) => p.length > 0);
  });

  @Input()
  set slug(value: string) {
    this._slug.set(value);
    this.load();
  }

  private load(): void {
    const slug = this._slug();
    if (!slug) return;
    this.member.set(null);
    this.error.set(false);

    this.teamApi.getMember(slug).subscribe({
      next: (member) => {
        this.member.set(member);
        this.applySeo(member);
      },
      error: () => this.error.set(true),
    });
  }

  private applySeo(member: TeamMember): void {
    this.seo.apply(
      {
        title: member.fullName,
        description: `${member.fullName}, ${member.title} at the LeBarre Group.`,
        canonicalPath: `/team/${member.slug}`,
      },
      [
        personLd(member),
        breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
          { name: member.fullName, path: `/team/${member.slug}` },
        ]),
      ],
    );
  }
}
