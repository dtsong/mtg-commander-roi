import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - MTG Commander ROI',
  description: 'Privacy policy for MTG Commander ROI precon value analyzer',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="prose prose-invert prose-slate max-w-none space-y-6">
          <p className="text-slate-300">
            Last updated: January 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">Overview</h2>
            <p className="text-slate-300">
              MTG Commander ROI is a free tool for analyzing Magic: The Gathering Commander preconstructed deck values.
              We respect your privacy and are committed to transparency about data collection.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">Data We Collect</h2>
            <h3 className="text-lg font-medium text-slate-200">Analytics</h3>
            <p className="text-slate-300">
              We use Vercel Analytics to understand how visitors use our site. This service collects:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>Page views and navigation patterns</li>
              <li>Device type and browser information</li>
              <li>Geographic region (country level)</li>
              <li>Referral sources</li>
            </ul>
            <p className="text-slate-300">
              Vercel Analytics is privacy-friendly and does not use cookies for tracking.
            </p>

            <h3 className="text-lg font-medium text-slate-200 mt-4">Local Storage</h3>
            <p className="text-slate-300">
              We store price cache data in your browser&apos;s local storage to improve performance.
              This data never leaves your device and can be cleared through your browser settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">Advertising</h2>
            <p className="text-slate-300">
              We use Google AdSense to display advertisements. Google may use cookies to serve ads based on
              your prior visits to this or other websites. You can opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                Google Ads Settings
              </a>.
            </p>
            <p className="text-slate-300">
              For users in the European Economic Area, we request consent before showing personalized ads.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">Third-Party Services</h2>
            <p className="text-slate-300">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li><strong>Scryfall API:</strong> Card pricing and images (no personal data shared)</li>
              <li><strong>Vercel:</strong> Hosting and analytics</li>
              <li><strong>Google AdSense:</strong> Advertising</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">Your Rights</h2>
            <p className="text-slate-300">
              You can clear locally stored data through your browser settings. For questions about this policy,
              please{' '}
              <Link href="/contact" className="text-purple-400 hover:text-purple-300">
                contact us
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">Changes to This Policy</h2>
            <p className="text-slate-300">
              We may update this privacy policy from time to time. Any changes will be reflected on this page
              with an updated revision date.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
