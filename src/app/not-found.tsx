import Link from 'next/link';
import { SITE } from '@/content/site';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-parchment px-5 text-center">
      <span className="font-serif text-6xl font-semibold text-gold">404</span>
      <h1 className="mt-4 text-3xl font-semibold">This page can&rsquo;t be found.</h1>
      <p className="mt-3 max-w-md text-ink-muted">
        The page you&rsquo;re looking for may have moved or never existed. Let&rsquo;s get you back
        on track.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary">Return home</Link>
        <Link href="/services" className="btn-secondary">Explore services</Link>
      </div>
      <p className="mt-10 font-serif text-sm text-ink-muted">{SITE.name}</p>
    </div>
  );
}
