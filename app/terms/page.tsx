import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - MTG Commander ROI',
  description: 'Terms of service for MTG Commander ROI precon value analyzer',
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>

        <div className="prose prose-invert prose-slate max-w-none space-y-6">
          <p className="text-slate-300">
            Last updated: January 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p className="text-slate-300">
              By accessing and using MTG Commander ROI (&quot;the Service&quot;), you accept and agree to be bound
              by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Description of Service</h2>
            <p className="text-slate-300">
              MTG Commander ROI is a free tool that provides analysis of Magic: The Gathering Commander
              preconstructed deck values by comparing card market prices against retail prices. The Service
              is provided for informational purposes only.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Use License</h2>
            <p className="text-slate-300">
              Permission is granted to temporarily access the Service for personal, non-commercial use only.
              This license does not include:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>Modifying or copying the Service&apos;s content</li>
              <li>Using the Service for any commercial purpose</li>
              <li>Attempting to reverse engineer any software contained in the Service</li>
              <li>Removing any copyright or proprietary notations</li>
              <li>Using automated systems or software to extract data from the Service</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Disclaimer</h2>
            <p className="text-slate-300">
              The information provided by MTG Commander ROI is for general informational purposes only.
              All information on the Service is provided in good faith, however we make no representation
              or warranty of any kind, express or implied, regarding:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>The accuracy or reliability of card prices</li>
              <li>The availability of any cards at displayed prices</li>
              <li>The completeness of deck lists or card data</li>
              <li>The suitability of the information for any particular purpose</li>
            </ul>
            <p className="text-slate-300 mt-3">
              Card prices fluctuate constantly and may differ significantly from actual market conditions.
              Always verify prices with retailers before making purchasing decisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Limitations</h2>
            <p className="text-slate-300">
              In no event shall MTG Commander ROI or its operators be liable for any damages (including,
              without limitation, damages for loss of data or profit, or due to business interruption)
              arising out of the use or inability to use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Third-Party Services</h2>
            <p className="text-slate-300">
              The Service uses data from third-party sources, including{' '}
              <a
                href="https://scryfall.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                Scryfall
              </a>
              . Your use of this data is subject to the respective third-party terms of service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. Intellectual Property</h2>
            <p className="text-slate-300">
              Magic: The Gathering is a trademark of Wizards of the Coast LLC. MTG Commander ROI is not
              affiliated with, endorsed by, or sponsored by Wizards of the Coast LLC. Card images and
              data are provided by Scryfall under their usage guidelines.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">8. Modifications</h2>
            <p className="text-slate-300">
              We reserve the right to revise these terms at any time without notice. By using this
              Service, you agree to be bound by the current version of these Terms of Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">9. Governing Law</h2>
            <p className="text-slate-300">
              These terms and conditions are governed by and construed in accordance with applicable law,
              and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">10. Contact</h2>
            <p className="text-slate-300">
              If you have any questions about these Terms of Service, please{' '}
              <Link href="/contact" className="text-purple-400 hover:text-purple-300">
                contact us
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
