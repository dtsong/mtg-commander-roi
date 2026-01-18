import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us - MTG Commander ROI',
  description: 'Get in touch with the MTG Commander ROI team. Send us your questions, feedback, or suggestions.',
};

export default function ContactPage() {
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
        <h1 className="text-3xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-slate-300 mb-8">
          Have a question, found a bug, or want to suggest a feature? We&apos;d love to hear from you.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <ContactForm />
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Other Ways to Reach Us</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-slate-300 font-medium">Email</p>
                    <a
                      href="mailto:support@auratcg.com"
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      support@auratcg.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Response Time</h2>
              <p className="text-slate-300">
                We typically respond to messages within 24-48 hours. For urgent matters,
                please email us directly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
