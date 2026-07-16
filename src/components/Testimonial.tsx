import type { Testimonial as TestimonialType } from '@/content/testimonials';

// Presentational testimonial card. Server component.
export default function Testimonial({ item }: { item: TestimonialType }) {
  return (
    <figure className="flex h-full flex-col rounded-xl border border-ink/10 bg-white p-7">
      <blockquote className="flex-1 font-serif text-lg leading-relaxed text-ink">
        “{item.quote}”
      </blockquote>
      <figcaption className="mt-6 text-sm">
        <span className="font-semibold text-ink">{item.name}</span>
        <span className="block text-ink-muted">
          {item.role}, {item.company}
        </span>
      </figcaption>
    </figure>
  );
}
