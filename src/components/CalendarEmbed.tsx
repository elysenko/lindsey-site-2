'use client';

import Cal, { getCalApi } from '@calcom/embed-react';
import { useEffect } from 'react';

// Cal.com booking embed. Degrades gracefully to a plain link (or a helpful
// message) when no booking link is configured (integration unconfigured).
export default function CalendarEmbed({ calLink }: { calLink: string | null }) {
  useEffect(() => {
    if (!calLink) return;
    (async () => {
      try {
        const cal = await getCalApi();
        cal('ui', { hideEventTypeDetails: false, layout: 'month_view' });
      } catch {
        // Non-fatal: embed simply will not initialize.
      }
    })();
  }, [calLink]);

  if (!calLink) {
    return (
      <div
        data-testid="calendar-unconfigured"
        className="rounded-lg border border-dashed border-ink/25 bg-white/60 p-6 text-center text-sm text-ink-muted"
      >
        Online booking is being set up. In the meantime, we will email you to arrange a time —
        or reach us directly at{' '}
        <a href="mailto:hello@lebarregroup.com" className="font-semibold text-gold-deep">
          hello@lebarregroup.com
        </a>
        .
      </div>
    );
  }

  return (
    <div data-testid="calendar-embed" className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <Cal calLink={calLink} style={{ width: '100%', height: '100%', minHeight: 560 }} />
    </div>
  );
}
