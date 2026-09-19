import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Abdullah | Career Portal',
  description: 'Where Talent Meets Opportunity',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-midnight-950 text-zinc-100">{children}</body>
    </html>
  );
}
