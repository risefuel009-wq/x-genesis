import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import './globals.css';

const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'X-Genesis · Where Talent Meets Opportunity',
  description: 'منصة التوظيف الأذكى في مصر. بيانات لحظية، عمولات شفافة، وفرص حقيقية.',
  keywords: ['recruitment', 'egypt', 'jobs', 'call center', 'telesales'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ibmPlex.variable} ${inter.variable}`}
    >
      <body className={ibmPlex.className}>{children}</body>
    </html>
  );
}
