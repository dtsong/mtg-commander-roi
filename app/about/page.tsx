import Link from 'next/link';
import { ArrowLeft, BarChart3, Database, Zap } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - MTG Commander ROI',
  description: 'Learn about MTG Commander ROI, a free tool for analyzing Magic: The Gathering Commander preconstructed deck values.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
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
        <h1 className="text-3xl font-bold text-white mb-8">About MTG Commander ROI</h1>

        <div className="prose prose-invert prose-slate max-w-none space-y-8">
          <section className="space-y-4">
            <p className="text-slate-300 text-lg">
              MTG Commander ROI is a free tool designed to help Magic: The Gathering players make informed purchasing
              decisions about Commander preconstructed decks by analyzing their return on investment.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">What We Do</h2>
            <p className="text-slate-300">
              We analyze Commander preconstructed decks by comparing the total market value of all cards
              in a deck against its retail price (MSRP). This helps you understand which decks offer the
              best value for your money.
            </p>
            <div className="grid gap-4 mt-6">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 flex gap-4">
                <div className="bg-purple-600/20 p-3 rounded-lg h-fit">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">ROI Analysis</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Calculate the percentage return on investment for any Commander precon deck.
                  </p>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 flex gap-4">
                <div className="bg-purple-600/20 p-3 rounded-lg h-fit">
                  <Database className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Real-Time Prices</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Card prices are fetched from Scryfall&apos;s API to provide up-to-date valuations.
                  </p>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 flex gap-4">
                <div className="bg-purple-600/20 p-3 rounded-lg h-fit">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Deck Comparison</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Compare multiple decks side-by-side to find the best value options.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Data Sources</h2>
            <p className="text-slate-300">
              All card data and pricing information is provided by{' '}
              <a
                href="https://scryfall.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                Scryfall
              </a>
              , a comprehensive Magic: The Gathering database. We use their public API to fetch:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>Card names and images</li>
              <li>Current market prices (USD)</li>
              <li>Deck lists for preconstructed products</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Disclaimer</h2>
            <p className="text-slate-300">
              MTG Commander ROI is an unofficial fan project and is not affiliated with, endorsed by,
              or sponsored by Wizards of the Coast LLC. Magic: The Gathering and all associated names
              and logos are trademarks of Wizards of the Coast LLC.
            </p>
            <p className="text-slate-300">
              Card prices can fluctuate significantly over time. The values displayed should be used
              as a general guide and may not reflect actual prices at any given retailer.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Contact Us</h2>
            <p className="text-slate-300">
              Have questions, feedback, or suggestions? We&apos;d love to hear from you!
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get in Touch
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
