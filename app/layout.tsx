import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import CookieConsent from '@/components/CookieConsent';
import Footer from '@/components/Footer';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="en">
      <head>
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
        <Script id="google-consent-init" strategy="beforeInteractive">
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
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex-1">{children}</div>
        <Footer />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
