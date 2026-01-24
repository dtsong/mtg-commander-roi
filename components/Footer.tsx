import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t px-4 sm:px-6 py-8 mt-auto border-[var(--surface-border)]" style={{ backgroundColor: 'var(--header-bg)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-[var(--text-secondary)] hover:text-brand-purple-light transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-[var(--text-secondary)] hover:text-brand-purple-light transition-colors">
                  Compare Decks
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-[var(--text-secondary)] hover:text-brand-purple-light transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[var(--text-primary)] font-semibold mb-3">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-[var(--text-secondary)] hover:text-brand-purple-light transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[var(--text-secondary)] hover:text-brand-purple-light transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[var(--text-primary)] font-semibold mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-[var(--text-secondary)] hover:text-brand-purple-light transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[var(--text-secondary)] hover:text-brand-purple-light transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[var(--surface-border)]">
          <p className="text-[var(--text-secondary)] text-sm text-center">
            Card data provided by{' '}
            <a
              href="https://scryfall.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-purple-light hover:text-brand-purple"
            >
              Scryfall
            </a>
            . MTG Commander ROI is not affiliated with Wizards of the Coast.
          </p>
          <p className="text-[var(--text-muted)] text-sm text-center mt-2">
            © {currentYear} MTG Commander ROI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
