import { TRUST_LOGOS } from '@/content/testimonials';

// Wordmark-style trust row (placeholder client names). Server component.
export default function TrustLogos() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
      {TRUST_LOGOS.map((name) => (
        <span
          key={name}
          className="font-serif text-lg font-medium tracking-tight text-ink-muted/70"
        >
          {name}
        </span>
      ))}
    </div>
  );
}
