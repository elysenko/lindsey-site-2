import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Marketing shell: global header + footer around all public content pages.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
