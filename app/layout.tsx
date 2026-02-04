import './globals.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import CookieConsent from '@/components/CookieConsent';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { ThemeProvider } from '@/hooks/useTheme';

export const metadata: Metadata = {
  metadataBase: new URL('https://mtg-commander-roi.vercel.app'),
  title: 'MTG Commander ROI - Precon Value Analyzer',
  description: 'Analyze the return on investment of Magic: The Gathering Commander preconstructed decks. Compare card values against MSRP to find the best deals.',
  keywords: ['MTG', 'Magic: The Gathering', 'Commander', 'EDH', 'precon', 'preconstructed deck', 'ROI', 'value', 'price'],
  authors: [{ name: 'MTG Commander ROI' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mtg-commander-roi.vercel.app',
    siteName: 'MTG Commander ROI',
    title: 'MTG Commander ROI - Precon Value Analyzer',
    description: 'Analyze the return on investment of Magic: The Gathering Commander preconstructed decks. Compare card values against MSRP to find the best deals.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MTG Commander ROI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MTG Commander ROI - Precon Value Analyzer',
    description: 'Analyze the return on investment of Magic: The Gathering Commander preconstructed decks.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? undefined;
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f8fafc" media="(prefers-color-scheme: light)" />
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
            nonce={nonce}
          />
        )}
        <Script id="google-consent-init" strategy="beforeInteractive" nonce={nonce}>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied'
            });
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(to bottom right, var(--bg-gradient-from), var(--bg-gradient-via), var(--bg-gradient-to))' }}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-purple focus:text-white focus:rounded-lg"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <ToastProvider>
            <div className="flex-1" id="main-content">{children}</div>
            <Footer />
            <CookieConsent />
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
