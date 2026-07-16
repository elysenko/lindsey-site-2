import Link from 'next/link';
import { SITE } from '@/content/site';

// Minimal, distraction-free layout for the Brand Intelligence Brief.
export default function BriefLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-ink/10">
        <div className="container-page flex h-16 items-center">
          <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-ink">
            {SITE.name}
          </Link>
        </div>
      </div>
      <main className="flex-1">{children}</main>
    </div>
  );
}
