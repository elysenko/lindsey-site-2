import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TeamApiService, TeamMember } from '../../shared/api';
import {
  SeoService,
  breadcrumbLd,
  organizationLd,
} from '../../core/seo.service';

/**
 * About page. Static firm philosophy (the approved positioning copy) followed by
 * a live team grid loaded from `/api/team`, each member linking to their detail.
 */
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main data-testid="about-main">
      <header class="intro">
        <p class="eyebrow">who we are</p>
        <h1 data-testid="about-title">About the LeBarre Group</h1>
      </header>

      <section class="philosophy" data-testid="about-philosophy">
        <p>
          The LeBarre Group builds intelligence-led brand strategy for
          organizations that need to be the obvious choice. We begin with
          evidence — what the market believes, what your buyers actually do,
          where the category is quietly moving — and we let those findings, not
          our adjectives, decide the position. A brand that earns the room
          before you enter it is never argued into being; it is uncovered.
        </p>
        <p>
          We practice the discipline of subtraction. Most brands fail not
          because they said too little but because they said too much: every
          claim that could be true was made, and so none of them landed. Our
          work is to remove — to strip a story down to the single defensible
          truth a competitor cannot copy and a buyer cannot forget. What
          remains is sharper, quieter, and far harder to dislodge.
        </p>
        <p>
          Intelligence is only useful when it survives contact with a decision.
          So we translate research into positions leaders can actually stand
          behind: a mission that constrains, a differentiator that a rival would
          struggle to claim, and a voice consistent enough that your market
          recognizes you before they read your name. We would rather deliver one
          decision you keep than ten slides you admire.
        </p>
        <p>
          We are a small, senior team by design. The people who diagnose your
          brand are the people who do the work — no hand-offs to juniors, no
          borrowed frameworks dressed up as insight. That is how strategy stays
          honest, and how the recommendation you receive is the one we would
          make if the brand were our own.
        </p>
      </section>

      <section class="team" data-testid="about-team">
        <h2>The team</h2>

        @if (error()) {
          <p class="muted" data-testid="team-error">
            Our team roster is momentarily unavailable — please check back shortly.
          </p>
        } @else if (!loaded()) {
          <p class="muted" aria-busy="true" data-testid="team-loading">
            Loading our team…
          </p>
        } @else if (team().length === 0) {
          <p class="muted" data-testid="team-empty">
            Team profiles are on the way.
          </p>
        } @else {
          <ul class="team-grid" data-testid="team-list">
            @for (member of team(); track member.slug) {
              <li class="team-card">
                <a
                  [routerLink]="['/team', member.slug]"
                  [attr.data-testid]="'team-link-' + member.slug"
                >
                  <h3>{{ member.fullName }}</h3>
                  <p class="member-title">{{ member.title }}</p>
                </a>
              </li>
            }
          </ul>
        }
      </section>
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
        padding: 2rem 0 0.5rem;
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
        margin: 0;
      }
      .philosophy p {
        font-size: 1.1rem;
        color: #374151;
        line-height: 1.7;
        max-width: 68ch;
      }
      h2 {
        font-size: 1.6rem;
        margin: 2.5rem 0 1.25rem;
      }
      .team-grid {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }
      .team-card a {
        display: block;
        height: 100%;
        padding: 1.25rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        text-decoration: none;
        color: inherit;
        min-height: 44px;
      }
      .team-card h3 {
        margin: 0 0 0.35rem;
      }
      .member-title {
        color: #6b7280;
        margin: 0;
      }
      .muted {
        color: #6b7280;
      }
    `,
  ],
})
export class AboutComponent implements OnInit {
  private readonly teamApi = inject(TeamApiService);
  private readonly seo = inject(SeoService);

  readonly team = signal<TeamMember[]>([]);
  readonly error = signal(false);
  readonly loaded = signal(false);

  ngOnInit(): void {
    this.seo.apply(
      {
        title: 'About',
        description:
          'The LeBarre Group builds intelligence-led brand strategy — evidence first, adjectives never.',
        canonicalPath: '/about',
      },
      [
        organizationLd(),
        breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ]),
      ],
    );

    this.teamApi.listTeam().subscribe({
      next: (team) => {
        this.team.set(team);
        this.loaded.set(true);
      },
      error: () => {
        this.error.set(true);
        this.loaded.set(true);
      },
    });
  }
}
