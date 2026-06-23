import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Bebas_Neue, Cairo } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdSlot } from '@/components/AdSlot';
import { LanguageProvider } from '@/lib/i18n';
import { Analytics } from '@/components/Analytics';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'ONADA — FIFA World Cup 2026 Live',
  description: 'Watch FIFA World Cup 2026 matches live. Free streaming with multiple server options.',
  keywords: ['World Cup 2026', 'FIFA', 'live stream', 'football', 'soccer'],
  openGraph: {
    title: 'ONADA — FIFA World Cup 2026 Live',
    description: 'Watch FIFA World Cup 2026 matches live.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${bebasNeue.variable} ${cairo.variable}`}>
      <body className="min-h-screen bg-bg font-sans text-fg antialiased">
        <LanguageProvider>
          <Header />

          {/* Mobile / tablet top banner (sidebars are desktop-only) */}
          <div className="flex justify-center px-4 pt-3 lg:hidden">
            <AdSlot type="320x50" />
          </div>

          {/* Full-width row: ads hug the far screen edges, content stays centered */}
          <div className="flex w-full justify-between gap-4 px-4 pb-4 sm:gap-6 sm:px-6 xl:px-10">
            {/* Left sidebar — desktop only */}
            <aside className="hidden lg:flex flex-col items-center pt-2 shrink-0" style={{ width: 160, minWidth: 160 }}>
              <AdSlot type="160x600" />
            </aside>

            {/* Main content — centered with a max width */}
            <main className="mx-auto min-w-0 w-full max-w-[1100px]">
              {children}
            </main>

            {/* Right sidebar — desktop only */}
            <aside className="hidden lg:flex flex-col items-center gap-4 pt-2 shrink-0" style={{ width: 160, minWidth: 160 }}>
              <AdSlot type="160x600" />
            </aside>
          </div>

          <Footer />
        </LanguageProvider>

        {/* Google Analytics 4 (active once NEXT_PUBLIC_GA_ID is set) */}
        <Analytics />

        {/* Adsterra popunder (site-wide, loads once) */}
        <Script
          id="adsterra-popunder"
          src="https://pl29858088.effectivecpmnetwork.com/18/ec/c8/18ecc828e9a7e59955072a5c4de6db1a.js"
          strategy="afterInteractive"
        />

        {/* Adsterra social bar (site-wide, loads once) */}
        <Script
          id="adsterra-social-bar"
          src="https://pl29858089.effectivecpmnetwork.com/05/c3/40/05c340577b4c0ba7762ae84099840395.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
