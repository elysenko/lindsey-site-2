import Link from 'next/link';
import { getSession } from '@/lib/session';
import { SITE } from '@/content/site';
import LogoutButton from '@/components/admin/LogoutButton';

export const dynamic = 'force-dynamic';

const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Leads', href: '/admin/leads' },
  { label: 'Insights', href: '/admin/insights' },
  { label: 'Settings', href: '/admin/settings' },
];

// Admin shell. Middleware already enforces an ADMIN session for every /admin/*
// page except /admin/login. When there is no session (login screen), we render
// the child bare so the login page controls its own layout.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-parchment">
      <header className="bg-ink text-parchment">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-serif text-lg font-semibold">
              {SITE.name} <span className="text-gold-soft">Admin</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex" aria-label="Admin">
              {ADMIN_NAV.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm text-parchment/80 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-parchment/60 sm:inline">{session.email}</span>
            <LogoutButton />
          </div>
        </div>
        <nav className="container-page flex gap-4 overflow-x-auto pb-3 md:hidden" aria-label="Admin mobile">
          {ADMIN_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap text-sm text-parchment/80">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="container-page py-8">{children}</div>
    </div>
  );
}
