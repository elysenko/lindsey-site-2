import type { Metadata } from 'next';
import './globals.css';

// NOTE: Minimal root layout to keep the app buildable during the backend pass.
// The frontend pass replaces/extends this with the approved marketing design.
export const metadata: Metadata = {
  title: 'LeBarre Group',
  description: 'Brand strategy and consulting.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
